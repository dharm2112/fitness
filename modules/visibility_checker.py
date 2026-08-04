from utils.constants import *


def check_visibility(landmarks):

    left_visibility = min(
        landmarks[LEFT_HIP].visibility,
        landmarks[LEFT_KNEE].visibility,
        landmarks[LEFT_ANKLE].visibility,
    )

    right_visibility = min(
        landmarks[RIGHT_HIP].visibility,
        landmarks[RIGHT_KNEE].visibility,
        landmarks[RIGHT_ANKLE].visibility,
    )

    if (
        left_visibility > VISIBILITY_THRESHOLD
        and right_visibility > VISIBILITY_THRESHOLD
    ):
        return True

    return False