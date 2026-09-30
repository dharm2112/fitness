from collections import deque


class AngleSmoother:

    def __init__(self, window_size=5):

        self.window_size = window_size
        self.angles = deque(maxlen=window_size)

    def smooth(self, angle):
        """Add a new angle sample and return the moving average.

        If `angle` is None, it is treated as a missed detection and skipped.
        - If no prior samples exist, returns None.
        - If prior samples exist, returns the current average (no change).
        """
        if angle is None:
            if len(self.angles) == 0:
                return None
            # return current average without modifying buffer
            return sum(self.angles) / len(self.angles)

        # coerce to float and allow numeric types
        try:
            val = float(angle)
        except Exception:
            raise TypeError("Angle must be a number or None")

        self.angles.append(val)
        return sum(self.angles) / len(self.angles)