from utils.constants import *


def extract_landmarks(landmarks):

    left_hip = [
        landmarks[LEFT_HIP].x,
        landmarks[LEFT_HIP].y,
    ]

    left_knee = [
        landmarks[LEFT_KNEE].x,
        landmarks[LEFT_KNEE].y,
    ]

    left_ankle = [
        landmarks[LEFT_ANKLE].x,
        landmarks[LEFT_ANKLE].y,
    ]

    right_hip = [
        landmarks[RIGHT_HIP].x,
        landmarks[RIGHT_HIP].y,
    ]

    right_knee = [
        landmarks[RIGHT_KNEE].x,
        landmarks[RIGHT_KNEE].y,
    ]

    right_ankle = [
        landmarks[RIGHT_ANKLE].x,
        landmarks[RIGHT_ANKLE].y,
    ]

    #left arm

    left_shoulder = [
        landmarks[LEFT_SHOULDER].x,
        landmarks[LEFT_SHOULDER].y,
    ]

    left_elbow = [
        landmarks[LEFT_ELBOW].x,
        landmarks[LEFT_ELBOW].y,
    ]

    left_wrist = [
        landmarks[LEFT_WRIST].x,
        landmarks[LEFT_WRIST].y,
    ]

    #right arm
    right_shoulder = [
        landmarks[RIGHT_SHOULDER].x,
        landmarks[RIGHT_SHOULDER].y,
    ]

    right_elbow = [
        landmarks[RIGHT_ELBOW].x,
        landmarks[RIGHT_ELBOW].y,
    ]

    right_wrist = [
        landmarks[RIGHT_WRIST].x,
        landmarks[RIGHT_WRIST].y,
    ]



    return (
        left_hip,
        left_knee,
        left_ankle,
        right_hip,
        right_knee,
        right_ankle,
        left_shoulder,
        left_elbow,
        left_wrist,
        right_shoulder,
        right_elbow,
        right_wrist,
    )