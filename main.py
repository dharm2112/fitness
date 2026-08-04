import cv2
import mediapipe as mp
import numpy as np
import time

# Use modules for calculation, pose extraction, visibility
from modules.angle_calculator import calculate_angle
from modules.pose_detector import extract_landmarks
from modules.visibility_checker import check_visibility
from modules.confidence_score import calculate_confidence
from modules.smoother import AngleSmoother
from modules.state_machine import SquatStateMachine

# MediaPipe setup

STATE_COLORS = {
    "STANDING": (0, 255, 0),
    "SQUAT": (0, 255, 255),
    "ERROR": (0, 0, 255),
}

CONFIDENCE_THRESHOLDS = {
    "high": 0.90,
    "medium": 0.70,
}


def get_state_color(stage):
    if stage == "STANDING":
        return STATE_COLORS["STANDING"]
    if stage == "ERROR":
        return STATE_COLORS["ERROR"]
    return STATE_COLORS["SQUAT"]


def get_confidence_color(confidence):
    if confidence > CONFIDENCE_THRESHOLDS["high"]:
        return (0, 255, 0)
    if confidence > CONFIDENCE_THRESHOLDS["medium"]:
        return (0, 255, 255)
    return (0, 0, 255)


def calculate_depth_progress(angle, min_angle=70, max_angle=170):
    if angle is None:
        return 0.0
    progress = (max_angle - angle) / (max_angle - min_angle)
    return float(np.clip(progress, 0.0, 1.0))


def draw_side_panel(frame, text_lines, warnings, progress_factor):
    panel_width = 240
    panel_color = (18, 18, 18)
    alpha = 0.55

    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (panel_width, frame.shape[0]), panel_color, -1)
    cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
    cv2.rectangle(frame, (0, 0), (panel_width, frame.shape[0]), (210, 210, 210), 1)

    margin = 14
    text_x = margin
    value_x = panel_width - margin
    text_y = 40
    line_height = 30
    font = cv2.FONT_HERSHEY_SIMPLEX

    cv2.putText(frame, "SQUAT COUNTER", (text_x, text_y), font, 0.85, (245, 245, 245), 2, cv2.LINE_AA)
    text_y += line_height
    cv2.line(frame, (text_x, text_y - 12), (panel_width - margin, text_y - 12), (190, 190, 190), 1)
    text_y += int(line_height * 0.8)

    for label, value, color in text_lines:
        cv2.putText(frame, f"{label}", (text_x, text_y), font, 0.56, (200, 200, 200), 1, cv2.LINE_AA)
        text_value = str(value)
        text_size = cv2.getTextSize(text_value, font, 0.62, 1)[0]
        cv2.putText(frame, text_value, (value_x - text_size[0], text_y), font, 0.62, color, 1, cv2.LINE_AA)
        text_y += line_height

    text_y += 6
    warning_color = (255, 180, 40) if warnings else (160, 160, 160)
    cv2.putText(frame, "Warnings:", (text_x, text_y), font, 0.62, warning_color, 1, cv2.LINE_AA)
    text_y += line_height
    cv2.line(frame, (text_x, text_y - 18), (panel_width - margin, text_y - 18), (120, 120, 120), 1)
    text_y += 10

    if warnings:
        for warning in warnings:
            cv2.putText(frame, f"• {warning}", (text_x + 6, text_y), font, 0.58, (245, 200, 40), 1, cv2.LINE_AA)
            text_y += line_height
    else:
        cv2.putText(frame, "• None", (text_x + 6, text_y), font, 0.58, (175, 175, 175), 1, cv2.LINE_AA)
        text_y += line_height

    bar_x = text_x
    bar_y = frame.shape[0] - 70
    bar_width = panel_width - 2 * margin
    bar_height = 16
    cv2.putText(frame, "Squat depth", (bar_x, bar_y - 16), font, 0.58, (230, 230, 230), 1, cv2.LINE_AA)
    cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (100, 100, 100), 1)
    fill_width = int(bar_width * progress_factor)
    if fill_width > 2:
        cv2.rectangle(frame, (bar_x + 2, bar_y + 2), (bar_x + fill_width - 2, bar_y + bar_height - 2), (0, 200, 255), -1)
    progress_text = f"{int(progress_factor * 100)}%"
    text_size = cv2.getTextSize(progress_text, font, 0.5, 1)[0]
    cv2.putText(frame, progress_text, (bar_x + bar_width - text_size[0], bar_y + bar_height + 18), font, 0.5, (245, 245, 245), 1, cv2.LINE_AA)

    return frame

mp_pose = mp.solutions.pose
mp_draw = mp.solutions.drawing_utils

pose = mp_pose.Pose()

cap = cv2.VideoCapture(0)
cv2.namedWindow("Squat Counter", cv2.WINDOW_NORMAL)

counter = 0
stage = "STANDING"

last_count_time = 0
cooldown = 0.5

previous_time = 0
current_time = 0
fps = 0

smoother = AngleSmoother(window_size=5)
machine = SquatStateMachine()

# Main loop

while True:

    success, frame = cap.read()

    if not success:
        break

    rgb_frame = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = pose.process(rgb_frame)

    height, width, _ = frame.shape
    confidence = 0.0
    left_angle = None
    right_angle = None
    average_angle = None
    warnings = []

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        confidence = calculate_confidence(landmarks)

        visible = check_visibility(landmarks)

        if not visible:
            warnings.append("Body not visible")
        else:
            (
                left_hip_point,
                left_knee_point,
                left_ankle_point,
                right_hip_point,
                right_knee_point,
                right_ankle_point,
            ) = extract_landmarks(landmarks)

            left_angle = calculate_angle(
                left_hip_point,
                left_knee_point,
                left_ankle_point,
            )

            right_angle = calculate_angle(
                right_hip_point,
                right_knee_point,
                right_ankle_point,
            )

            average_angle = (left_angle + right_angle) / 2
            smoothed_angle = smoother.smooth(average_angle)

            new_counter, stage = machine.update(smoothed_angle)

            current_time = time.time()
            if new_counter > counter and current_time - last_count_time > cooldown:
                counter = new_counter
                last_count_time = current_time

            x = int(left_knee_point[0] * width)
            y = int(left_knee_point[1] * height)
            cv2.putText(
                frame,
                str(int(average_angle)),
                (x, y),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            torso_distance = abs(right_hip_point[0] - left_hip_point[0]) * width
            if torso_distance < width * 0.22:
                warnings.append("Move farther from the camera")

            mp_draw.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
            )

        if confidence <= CONFIDENCE_THRESHOLDS["medium"]:
            warnings.append("Low confidence detected")

    else:
        warnings.append("No pose detected")

    confidence_color = get_confidence_color(confidence)
    state_color = get_state_color(stage)
    display_state = stage if stage in ("STANDING", "ERROR") else "SQUAT"

    current_time = time.time()
    time_difference = current_time - previous_time
    if time_difference > 0:
        fps = 1 / time_difference
    previous_time = current_time

    text_lines = [
        ("Squat count", counter, (0, 255, 0)),
        ("Current state", display_state, state_color),
        ("Left angle", int(left_angle) if left_angle is not None else "N/A", (255, 255, 255)),
        ("Right angle", int(right_angle) if right_angle is not None else "N/A", (255, 255, 255)),
        ("Average angle", int(average_angle) if average_angle is not None else "N/A", (255, 255, 255)),
        ("FPS", int(fps), (255, 255, 255)),
        ("Confidence", f"{confidence:.2f}", confidence_color),
    ]

    progress_factor = calculate_depth_progress(average_angle)
    frame = draw_side_panel(frame, text_lines, warnings, progress_factor)

    cv2.imshow(
        "Squat Counter",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()
cv2.destroyAllWindows()