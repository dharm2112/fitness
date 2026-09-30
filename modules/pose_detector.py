from utils.constants import *


def extract_landmarks(landmarks):
    """Safely extract normalized landmark (x,y) for required keypoints.
    Returns a tuple of points or None for missing points.
    """

    def _get_point(landmarks, idx):
        try:
            lm = landmarks[idx]
            x = getattr(lm, 'x', None)
            y = getattr(lm, 'y', None)
            if x is None or y is None:
                return None
            return [float(x), float(y)]
        except Exception:
            return None

    left_hip = _get_point(landmarks, LEFT_HIP)
    left_knee = _get_point(landmarks, LEFT_KNEE)
    left_ankle = _get_point(landmarks, LEFT_ANKLE)

    right_hip = _get_point(landmarks, RIGHT_HIP)
    right_knee = _get_point(landmarks, RIGHT_KNEE)
    right_ankle = _get_point(landmarks, RIGHT_ANKLE)

    left_shoulder = _get_point(landmarks, LEFT_SHOULDER)
    left_elbow = _get_point(landmarks, LEFT_ELBOW)
    left_wrist = _get_point(landmarks, LEFT_WRIST)

    right_shoulder = _get_point(landmarks, RIGHT_SHOULDER)
    right_elbow = _get_point(landmarks, RIGHT_ELBOW)
    right_wrist = _get_point(landmarks, RIGHT_WRIST)

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