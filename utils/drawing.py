import cv2


def draw_text(frame, text, position, color):
    cv2.putText(
        frame,
        text,
        position,
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        color,
        2,
    )


def draw_line(frame, start_point, end_point, color):
    cv2.line(frame, start_point, end_point, color, 2)


def draw_circle(frame, center, color):
    cv2.circle(frame, center, 5, color, -1)


def draw_angle(frame, angle, position, color):
    cv2.putText(
        frame,
        str(int(angle)),
        position,
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        color,
        2,
    )