def calculate_confidence(landmarks):
    """Compute average visibility for important lower-body landmarks.

    Returns a tuple (mean_confidence, visibility_values) where visibility_values is the
    list of raw visibility scores for diagnostics. If the values cannot be computed,
    returns (None, []).
    """
    important_points = [
        23,  # left hip
        25,  # left knee
        27,  # left ankle
        24,  # right hip
        26,  # right knee
        28,  # right ankle
    ]

    visibility_values = []

    try:
        for point in important_points:
            v = getattr(landmarks[point], 'visibility', None)
            if v is None:
                # cannot compute reliable confidence
                return None, []
            visibility_values.append(float(v))

        confidence = sum(visibility_values) / len(visibility_values)
        return float(confidence), visibility_values
    except Exception:
        return None, []
