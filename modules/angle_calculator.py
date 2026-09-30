import numpy as np


def calculate_angle(a, b, c):
    """Calculate angle ABC in degrees. Returns None if any point is missing or invalid."""

    if a is None or b is None or c is None:
        return None

    try:
        a = np.array(a, dtype=float)
        b = np.array(b, dtype=float)
        c = np.array(c, dtype=float)
    except Exception:
        return None

    if a.size < 2 or b.size < 2 or c.size < 2:
        return None

    radians = (
        np.arctan2(c[1] - b[1], c[0] - b[0])
        - np.arctan2(a[1] - b[1], a[0] - b[0])
    )

    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180:
        angle = 360 - angle

    return float(angle)