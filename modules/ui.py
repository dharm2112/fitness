import cv2
import numpy as np

STATE_COLORS = {
    "STANDING": (0, 255, 0),
    "SQUAT": (0, 255, 255),
    "ERROR": (0, 0, 255),
}

CONFIDENCE_THRESHOLDS = {
    "high": 0.90,
    "medium": 0.70,
}


def get_state_color(stage):
    if stage == "STANDING":
        return STATE_COLORS["STANDING"]
    if stage == "ERROR":
        return STATE_COLORS["ERROR"]
    return STATE_COLORS["SQUAT"]


def get_confidence_color(confidence):
    if confidence is None:
        return (0, 0, 255)
    if confidence > CONFIDENCE_THRESHOLDS["high"]:
        return (0, 255, 0)
    if confidence > CONFIDENCE_THRESHOLDS["medium"]:
        return (0, 255, 255)
    return (0, 0, 255)


def calculate_depth_progress(angle, min_angle=70, max_angle=170):
    if angle is None:
        return 0.0
    progress = (max_angle - angle) / (max_angle - min_angle)
    return float(np.clip(progress, 0.0, 1.0))


def draw_side_panel(frame, text_lines, warnings, progress_factor):
    panel_width = 240
    panel_color = (18, 18, 18)
    alpha = 0.55

    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (panel_width, frame.shape[0]), panel_color, -1)
    cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
    cv2.rectangle(frame, (0, 0), (panel_width, frame.shape[0]), (210, 210, 210), 1)

    margin = 14
    text_x = margin
    value_x = panel_width - margin
    text_y = 40
    line_height = 30
    font = cv2.FONT_HERSHEY_SIMPLEX

    cv2.putText(frame, "SQUAT COUNTER", (text_x, text_y), font, 0.85, (245, 245, 245), 2, cv2.LINE_AA)
    text_y += line_height
    cv2.line(frame, (text_x, text_y - 12), (panel_width - margin, text_y - 12), (190, 190, 190), 1)
    text_y += int(line_height * 0.8)

    for label, value, color in text_lines:
        cv2.putText(frame, f"{label}", (text_x, text_y), font, 0.56, (200, 200, 200), 1, cv2.LINE_AA)
        text_value = str(value)
        text_size = cv2.getTextSize(text_value, font, 0.62, 1)[0]
        cv2.putText(frame, text_value, (value_x - text_size[0], text_y), font, 0.62, color, 1, cv2.LINE_AA)
        text_y += line_height

    text_y += 6
    warning_color = (255, 180, 40) if warnings else (160, 160, 160)
    cv2.putText(frame, "Warnings:", (text_x, text_y), font, 0.62, warning_color, 1, cv2.LINE_AA)
    text_y += line_height
    cv2.line(frame, (text_x, text_y - 18), (panel_width - margin, text_y - 18), (120, 120, 120), 1)
    text_y += 10

    if warnings:
        for warning in warnings:
            cv2.putText(frame, f"• {warning}", (text_x + 6, text_y), font, 0.58, (245, 200, 40), 1, cv2.LINE_AA)
            text_y += line_height
    else:
        cv2.putText(frame, "• None", (text_x + 6, text_y), font, 0.58, (175, 175, 175), 1, cv2.LINE_AA)
        text_y += line_height

    bar_x = text_x
    bar_y = frame.shape[0] - 70
    bar_width = panel_width - 2 * margin
    bar_height = 16
    cv2.putText(frame, "Squat depth", (bar_x, bar_y - 16), font, 0.58, (230, 230, 230), 1, cv2.LINE_AA)
    cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (100, 100, 100), 1)
    fill_width = int(bar_width * progress_factor)
    if fill_width > 2:
        cv2.rectangle(frame, (bar_x + 2, bar_y + 2), (bar_x + fill_width - 2, bar_y + bar_height - 2), (0, 200, 255), -1)
    progress_text = f"{int(progress_factor * 100)}%"
    text_size = cv2.getTextSize(progress_text, font, 0.5, 1)[0]
    cv2.putText(frame, progress_text, (bar_x + bar_width - text_size[0], bar_y + bar_height + 18), font, 0.5, (245, 245, 245), 1, cv2.LINE_AA)

    return frame
