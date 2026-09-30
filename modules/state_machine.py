class SquatStateMachine:

    def __init__(self):

        self.counter = 0
        self.stage = "STANDING"
        self.lock = False

    def update(self, angle):
        """Update state machine with a new angle value.

        If angle is None, do not change the state — missing detection should not
        cause the state machine to raise. This keeps counting resilient to
        intermittent missed frames.
        """
        if angle is None:
            # no reliable input; keep current state
            return self.counter, self.stage

        if self.stage == "STANDING":
            if angle < 150:
                self.stage = "DESCENDING"

        elif self.stage == "DESCENDING":
            if angle <= 85:  # Strict depth validation
                self.stage = "BOTTOM"
            elif angle >= 160:  # Half-squat rejection (user stood back up early)
                self.stage = "STANDING"

        elif self.stage == "BOTTOM":
            if angle > 110:
                self.stage = "ASCENDING"

        elif self.stage == "ASCENDING":
            if angle >= 160:
                self.stage = "STANDING"
                if not self.lock:
                    self.counter += 1
                    self.lock = True
            elif angle <= 85:  # Failed to stand up completely, went back down
                self.stage = "BOTTOM"

        if self.stage == "DESCENDING":
            self.lock = False

        return self.counter, self.stage
