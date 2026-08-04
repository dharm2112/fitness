from collections import deque


class AngleSmoother:

    def __init__(self, window_size=5):

        self.window_size = window_size
        self.angles = deque(maxlen=window_size)

    def smooth(self, angle):

        self.angles.append(angle)

        return sum(self.angles) / len(self.angles)