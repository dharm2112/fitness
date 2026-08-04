def calculate_confidence(landmarks):

    important_points = [
        23,  # left hip
        25,  # left knee
        27,  # left ankle
        24,  # right hip
        26,  # right knee
        28,  # right ankle
    ]

    visibility_values = []

    for point in important_points:
        visibility_values.append(
            landmarks[point].visibility
        )

    confidence = (
        sum(visibility_values)
        / len(visibility_values)
    )

    return confidence