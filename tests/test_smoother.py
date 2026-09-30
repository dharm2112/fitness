import pytest
from modules.smoother import AngleSmoother


def test_smoothing_simple_sequence():
    s = AngleSmoother(window_size=3)
    assert s.smooth(10) == 10
    assert s.smooth(20) == 15
    assert s.smooth(40) == pytest.approx((10+20+40)/3)


def test_smoother_skip_none_when_empty():
    s = AngleSmoother(window_size=3)
    assert s.smooth(None) is None


def test_smoother_skip_none_returns_previous_average():
    s = AngleSmoother(window_size=3)
    assert s.smooth(10) == 10
    assert s.smooth(20) == 15
    # now pass None — should return current average without raising and without changing buffer
    avg_before = s.smooth(None)
    assert avg_before == pytest.approx((10+20)/2)
    # adding more values still works
    assert s.smooth(40) == pytest.approx((10+20+40)/3)
