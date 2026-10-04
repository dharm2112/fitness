import cv2
import mediapipe as mp
import numpy as np
import time
import argparse
import logging
import winsound
import threading
import urllib.request
import json

# Use modules for calculation, pose extraction, visibility
from modules.angle_calculator import calculate_angle
from modules.pose_detector import extract_landmarks
from modules.visibility_checker import check_visibility
from modules.confidence_score import calculate_confidence
from modules.smoother import AngleSmoother
from modules.state_machine import SquatStateMachine, SquatResult

# MediaPipe setup

from modules.ui import get_state_color, get_confidence_color, calculate_depth_progress, draw_side_panel, CONFIDENCE_THRESHOLDS

# CLI and logging
parser = argparse.ArgumentParser(description="Fitness counter (squat + angles)")
parser.add_argument("--camera", type=int, default=0, help="Camera device index")
parser.add_argument("--video", type=str, default=None, help="Path to video file to process instead of webcam")
parser.add_argument("--width", type=int, default=1280, help="Capture width (webcam only)")
parser.add_argument("--height", type=int, default=720, help="Capture height (webcam only)")
parser.add_argument("--proc-scale", type=float, default=1.0, help="Scale factor for pose processing (<=1.0). Use 0.5 to process at half resolution for speed")
parser.add_argument("--min-detect-confidence", type=float, default=0.5)
parser.add_argument("--min-track-confidence", type=float, default=0.5)
parser.add_argument("--buffersize", type=int, default=1)
parser.add_argument("--camera-retries", type=int, default=3, help="Number of times to retry opening the camera")
parser.add_argument("--camera-retry-delay", type=float, default=1.0, help="Initial delay (seconds) between camera open retries; exponential backoff applied")
parser.add_argument("--process-every", type=int, default=1, help="Process every Nth frame (1 = every frame)")
parser.add_argument("--draw-min-fps", type=float, default=10.0, help="Minimum fps to allow drawing landmarks")
parser.add_argument("--debug-confidence", action="store_true", help="Log per-landmark confidence values when confidence is low or missing")
args = parser.parse_args()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("fitness")

mp_pose = mp.solutions.pose
mp_draw = mp.solutions.drawing_utils

# Create pose with tuned confidences
pose = mp_pose.Pose(min_detection_confidence=args.min_detect_confidence, min_tracking_confidence=args.min_track_confidence)

# Open camera or video and validate
if args.video:
    cap = cv2.VideoCapture(args.video)
    if not cap.isOpened():
        log.error("Unable to open video file %s", args.video)
        raise RuntimeError(f"Unable to open video file {args.video}")
    # for video, resolution comes from the file; do not override
else:
    # Try opening the camera with retries and exponential backoff
    cap = None
    delay = float(args.camera_retry_delay)
    for attempt in range(1, args.camera_retries + 1):
        cap = cv2.VideoCapture(args.camera)
        if cap.isOpened():
            break
        log.warning("Camera open attempt %d failed, retrying in %.1fs...", attempt, delay)
        try:
            cap.release()
        except Exception:
            pass
        time.sleep(delay)
        delay *= 2
    if cap is None or not cap.isOpened():
        log.error("Unable to open camera index %s after %d attempts", args.camera, args.camera_retries)
        raise RuntimeError(f"Unable to open camera index {args.camera} after {args.camera_retries} attempts")

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.height)
    try:
        cap.set(cv2.CAP_PROP_BUFFERSIZE, args.buffersize)
    except Exception:
        # Some backends ignore this
        pass

cv2.namedWindow("Squat Counter", cv2.WINDOW_NORMAL)

counter = 0
stage = "STANDING"
last_count_time = 0
cooldown = 0.5
previous_time = 0
fps = 0

app_start_time = time.time()
alarm_triggered = False
alarm_playing = False

# processing and state holders for frame-skipping
frame_count = 0
last_smoothed_angle = None
last_average_angle = None
last_left_angle = None
last_right_angle = None
last_visibility_values = []

smoother = AngleSmoother(window_size=5)
machine = SquatStateMachine()

# API Client State Tracker
last_api_state = None
last_api_reps = None
current_settings = {"target_reps": 10, "active_tune": "alarm.wav", "is_active": False}

def poll_settings():
    while True:
        try:
            req = urllib.request.Request("http://localhost:8080/alarm/settings")
            with urllib.request.urlopen(req, timeout=1.0) as response:
                data = json.loads(response.read().decode())
                global current_settings
                current_settings = data
        except Exception:
            pass
        time.sleep(2.0)

threading.Thread(target=poll_settings, daemon=True).start()

def send_result_async(res: SquatResult):
    def _send():
        try:
            payload = json.dumps({
                "exercise": res.exercise,
                "state": res.state,
                "reps": res.reps,
                "valid_rep": res.valid_rep,
                "confidence": res.confidence,
                "completed": res.completed
            }).encode('utf-8')
            req = urllib.request.Request(
                "http://localhost:8080/squat/result", 
                data=payload, 
                headers={'Content-Type': 'application/json'}
            )
            urllib.request.urlopen(req, timeout=1.0)
        except Exception as e:
            log.debug("Failed to send API result: %s", e)
    
    threading.Thread(target=_send, daemon=True).start()

# Main loop with robust handling and optional downscale for processing
try:
    while True:
        success, frame = cap.read()
        if not success or frame is None:
            # For webcam: camera may be warming up - retry briefly
            if args.video:
                # video ended or cannot read — stop processing
                log.info("End of video or cannot read frame; exiting")
                break
            else:
                time.sleep(0.01)
                continue

        # optionally downscale for faster processing
        proc_frame = frame
        scale = float(args.proc_scale) if args.proc_scale > 0 else 1.0
        if scale < 1.0:
            proc_frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)

        rgb_frame = cv2.cvtColor(proc_frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        height, width, _ = frame.shape  # use original for drawing
        confidence = None
        left_angle = None
        right_angle = None
        average_angle = None
        warnings = []
        result = None

        # frame skipping: process only every Nth frame
        frame_count = frame_count + 1
        process_frame = (args.process_every <= 1) or (frame_count % args.process_every == 0)

        if process_frame:
            if results.pose_landmarks:
                # When downscaling, landmark coordinates are relative to proc_frame
                landmarks = results.pose_landmarks.landmark
                confidence, visibility_values = calculate_confidence(landmarks)
                visible = check_visibility(landmarks)

                if confidence is None:
                    warnings.append("Unknown confidence")
                elif confidence <= CONFIDENCE_THRESHOLDS["medium"]:
                    warnings.append("Low confidence detected")

                if not visible:
                    warnings.append("Body not visible")
                else:
                    # extract_landmarks expects normalized coordinates; when proc_scale != 1.0, the landmarks are still normalized
                    (
                        left_hip_point,
                        left_knee_point,
                        left_ankle_point,
                        right_hip_point,
                        right_knee_point,
                        right_ankle_point,
                        *_,
                    ) = extract_landmarks(landmarks)

                    left_angle = calculate_angle(left_hip_point, left_knee_point, left_ankle_point)
                    right_angle = calculate_angle(right_hip_point, right_knee_point, right_ankle_point)

                    # safe average
                    angles = [a for a in (left_angle, right_angle) if a is not None]
                    if angles:
                        average_angle = sum(angles) / len(angles)
                        smoothed_angle = smoother.smooth(average_angle)
                        last_smoothed_angle = smoothed_angle
                        last_average_angle = average_angle
                        last_left_angle = left_angle
                        last_right_angle = right_angle
                        last_visibility_values = visibility_values if visibility_values else []
                        # update state machine only if numeric
                        try:
                            result: SquatResult = machine.update(smoothed_angle, confidence)
                            stage = result.state
                        except Exception:
                            log.debug("State machine update failed with smoothed_angle=%s", smoothed_angle)
                            result = None
                    else:
                        average_angle = None
                        result = None

                    # counting with cooldown
                    current_time = time.time()
                    if result is not None and result.reps > counter and current_time - last_count_time > cooldown:
                        counter = result.reps
                        last_count_time = current_time

                    # Fire off an API request if state or rep changed
                    if result is not None:
                        if result.state != last_api_state or result.reps != last_api_reps or result.valid_rep:
                            send_result_async(result)
                            last_api_state = result.state
                            last_api_reps = result.reps

                    # draw angle at left knee if available
                    if left_knee_point is not None and average_angle is not None:
                        x = int(left_knee_point[0] * width)
                        y = int(left_knee_point[1] * height)
                        cv2.putText(frame, str(int(average_angle)), (x, y), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

                    torso_distance = None
                    try:
                        if right_hip_point is not None and left_hip_point is not None:
                            torso_distance = abs(right_hip_point[0] - left_hip_point[0]) * width
                    except Exception:
                        torso_distance = None

                    if torso_distance is not None and torso_distance < width * 0.22:
                        warnings.append("Move farther from the camera")

                    # draw landmarks on original frame if allowed by fps
                    if fps >= args.draw_min_fps:
                        mp_draw.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                    else:
                        warnings.append("Low FPS - drawing disabled")

                # diagnostic logging
                if args.debug_confidence and (confidence is None or (confidence is not None and confidence < CONFIDENCE_THRESHOLDS['medium'])):
                    log.debug("Visibility values: %s, mean=%s", last_visibility_values, confidence)
            else:
                warnings.append("No pose detected")
        else:
            # skipped processing this frame — reuse previous values if any
            average_angle = last_average_angle
            smoothed_angle = last_smoothed_angle
            left_angle = last_left_angle
            right_angle = last_right_angle
            # drawing: if we have recent pose_landmarks, we can draw them conditionally
            if fps >= args.draw_min_fps and results.pose_landmarks:
                mp_draw.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            else:
                if fps < args.draw_min_fps:
                    warnings.append("Low FPS - drawing disabled")


        confidence_color = get_confidence_color(confidence)
        state_color = get_state_color(stage)
        display_state = stage if stage in ("STANDING", "ERROR") else stage

        current_time = time.time()
        time_difference = current_time - previous_time if previous_time else 0
        if time_difference > 0:
            fps = 1 / time_difference
        previous_time = current_time

        # --- ALARM LOGIC ---
        is_active = current_settings.get("is_active", False)
        target_reps = current_settings.get("target_reps", 10)
        active_tune = current_settings.get("active_tune", "alarm.wav")
        tune_path = f"tunes/{active_tune}"
        
        # We start playing the alarm if the API says it's active and we haven't started yet.
        if is_active and not alarm_playing:
            try:
                winsound.PlaySound(tune_path, winsound.SND_FILENAME | winsound.SND_ASYNC | winsound.SND_LOOP)
            except Exception:
                pass
            alarm_playing = True
            
        # Stop playing if the API says it's inactive OR if the user hits the target reps.
        if alarm_playing and (not is_active or counter >= target_reps):
            winsound.PlaySound(None, winsound.SND_PURGE)
            alarm_playing = False
            
            if counter >= target_reps:
                # Also auto-update the API so the phone knows we finished
                current_settings["is_active"] = False
                cv2.waitKey(2000)
                log.info("%d squats completed! Shutting down.", target_reps)
                break

        text_lines = [
            ("Squat count", counter, (0, 255, 0)),
            ("Current state", display_state, state_color),
            ("Left angle", int(left_angle) if left_angle is not None else "N/A", (255, 255, 255)),
            ("Right angle", int(right_angle) if right_angle is not None else "N/A", (255, 255, 255)),
            ("Average angle", int(average_angle) if average_angle is not None else "N/A", (255, 255, 255)),
            ("FPS", int(fps), (255, 255, 255)),
            ("Confidence", f"{confidence:.2f}" if confidence is not None else "N/A", confidence_color),
        ]

        progress_factor = calculate_depth_progress(average_angle)
        frame = draw_side_panel(frame, text_lines, warnings, progress_factor)

        cv2.imshow("Squat Counter", frame)

        # exit keys
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
except KeyboardInterrupt:
    log.info("Interrupted by user")
finally:
    try:
        if cap is not None:
            cap.release()
    except Exception:
        log.exception("Failed to release camera")
    try:
        if pose is not None:
            pose.close()
    except Exception:
        log.exception("Failed to close MediaPipe pose")
    cv2.destroyAllWindows()