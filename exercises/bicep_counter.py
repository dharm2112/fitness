from exercises.base_exercise import BaseExercise
from utils.constants import LEFT_ARM_UP, LEFT_ARM_DOWN, RIGHT_ARM_UP, RIGHT_ARM_DOWN

class BicepCounter(BaseExercise):

    def __init__(self):
        super().__init__()

        self.left_counter = 0
        self.right_counter = 0

        self.left_stage = "DOWN"
        self.right_stage = "DOWN"

    def process(self, left_angle, right_angle):
        """
        Process both arm angles and count bicep curl repetitions.

        Args:
            left_angle (float): Left elbow angle
            right_angle (float): Right elbow angle

        Returns:
            dict: Current counts and stages
        """
        #left arm landmarks

        if left_angle > LEFT_ARM_DOWN:
            self.left_stage = "DOWN"

        elif (left_angle < LEFT_ARM_UP and self.left_stage == "DOWN"):
            self.left_stage = "UP"
            self.left_counter += 1

        #right arm landmarks

        if right_angle > RIGHT_ARM_DOWN:
            self.right_stage = "DOWN"

        elif (right_angle < RIGHT_ARM_UP and self.right_stage == "DOWN"):
            self.right_stage = "UP"
            self.right_counter += 1

        total_count = self.left_counter + self.right_counter

        return {
            "left_count": self.left_counter,
            "right_count": self.right_counter,
            "total_count": total_count,
            "left_stage": self.left_stage,
            "right_stage": self.right_stage,
        }

    def reset(self):
        """
        Reset the counters and stages for both arms.
        """
        self.left_counter = 0
        self.right_counter = 0
        self.left_stage = "DOWN"
        self.right_stage = "DOWN"