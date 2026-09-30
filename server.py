import cv2
import numpy as np
import base64
import asyncio
import time
import winsound
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import mediapipe as mp

from modules.angle_calculator import calculate_angle
from modules.pose_detector import extract_landmarks
from modules.visibility_checker import check_visibility
from modules.confidence_score import calculate_confidence
from modules.smoother import AngleSmoother
from modules.state_machine import SquatStateMachine

app = FastAPI()

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

smoother = AngleSmoother(window_size=5)
machine = SquatStateMachine()

@app.websocket("/ws/squat")
async def squat_endpoint(websocket: WebSocket):
    await websocket.accept()
    app_start_time = time.time()
    alarm_triggered = False
    alarm_playing = False
    try:
        while True:
            data = await websocket.receive_text()
            
            # Decode base64 image from React Native
            if "," in data:
                data = data.split(",")[1]
            img_bytes = base64.b64decode(data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if frame is None:
                await websocket.send_json({"error": "Invalid frame"})
                continue
                
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb_frame)
            
            warnings = []
            count = machine.counter
            stage = machine.stage
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                confidence, _ = calculate_confidence(landmarks)
                visible = check_visibility(landmarks)
                
                if not visible:
                    warnings.append("Body not fully visible")
                else:
                    try:
                        (l_hip, l_knee, l_ankle, r_hip, r_knee, r_ankle) = extract_landmarks(landmarks)
                        left_angle = calculate_angle(l_hip, l_knee, l_ankle)
                        right_angle = calculate_angle(r_hip, r_knee, r_ankle)
                        
                        angles = [a for a in (left_angle, right_angle) if a is not None]
                        if angles:
                            avg_angle = sum(angles) / len(angles)
                            smoothed = smoother.smooth(avg_angle)
                            count, stage = machine.update(smoothed)
                    except Exception as e:
                        warnings.append("Landmark extraction error")
            else:
                warnings.append("No pose detected")
                
            # --- ALARM LOGIC ---
            if not alarm_triggered and (time.time() - app_start_time) > 10:
                # Play a custom alarm tune in a continuous loop after 10 seconds
                winsound.PlaySound("alarm.wav", winsound.SND_FILENAME | winsound.SND_ASYNC | winsound.SND_LOOP)
                alarm_triggered = True
                alarm_playing = True
                
            if alarm_playing and count >= 10:
                # Stop the alarm once 10 squats are reached
                winsound.PlaySound(None, winsound.SND_PURGE)
                alarm_playing = False
                
            # Send current state back to React Native UI
            await websocket.send_json({
                "count": count,
                "stage": stage,
                "warnings": warnings
            })
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
