import math


def calculate_distance(point1, point2):
    x1, y1 = point1
    x2, y2 = point2

    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def calculate_midpoint(point1, point2):
    x1, y1 = point1
    x2, y2 = point2

    return ((x1 + x2) / 2, (y1 + y2) / 2)


def clamp_value(value, minimum, maximum):
    return max(minimum, min(value, maximum))


def normalize_value(value, minimum, maximum):
    return (value - minimum) / (maximum - minimum)