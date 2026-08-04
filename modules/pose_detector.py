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

    return (
        left_hip,
        left_knee,
        left_ankle,
        right_hip,
        right_knee,
        right_ankle,
    )