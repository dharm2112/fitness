from utils.constants import *


def check_visibility(landmarks):
    """Return True if required lower-body keypoints appear sufficiently visible.

    If landmarks are missing or values cannot be read, return False so callers
    treat the body as not visible rather than raising.
    """
    try:
        left_visibility = min(
            getattr(landmarks[LEFT_HIP], 'visibility', 0.0),
            getattr(landmarks[LEFT_KNEE], 'visibility', 0.0),
            getattr(landmarks[LEFT_ANKLE], 'visibility', 0.0),
        )

        right_visibility = min(
            getattr(landmarks[RIGHT_HIP], 'visibility', 0.0),
            getattr(landmarks[RIGHT_KNEE], 'visibility', 0.0),
            getattr(landmarks[RIGHT_ANKLE], 'visibility', 0.0),
        )
    except Exception:
        return False

    if (
        left_visibility > VISIBILITY_THRESHOLD
        and right_visibility > VISIBILITY_THRESHOLD
    ):
        return True

    return False