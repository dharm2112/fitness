import math
import numpy as np
import pytest
from modules.angle_calculator import calculate_angle


def test_right_angle():
    # Points forming a right angle at b: a=(0,1), b=(0,0), c=(1,0)
    a = (0, 1)
    b = (0, 0)
    c = (1, 0)
    angle = calculate_angle(a, b, c)
    assert pytest.approx(angle, rel=1e-3) == 90.0


def test_straight_line():
    # Collinear points: angle should be 180
    a = (0, 0)
    b = (1, 0)
    c = (2, 0)
    angle = calculate_angle(a, b, c)
    assert pytest.approx(angle, rel=1e-3) == 180.0


def test_acute_angle():
    # 45-ish degree angle
    a = (0, 1)
    b = (0, 0)
    c = (1, 1)
    angle = calculate_angle(a, b, c)
    assert 0 < angle < 180
