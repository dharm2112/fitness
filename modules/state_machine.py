class SquatStateMachine:

    def __init__(self):

        self.counter = 0
        self.stage = "STANDING"
        self.lock = False

    def update(self, angle):

        if self.stage == "STANDING":

            if angle < 150:
                self.stage = "DESCENDING"

        elif self.stage == "DESCENDING":

            if angle < 100:
                self.stage = "BOTTOM"

        elif self.stage == "BOTTOM":

            if angle > 120:
                self.stage = "ASCENDING"

        elif self.stage == "ASCENDING":

            if angle > 160:

                self.stage = "STANDING"

                if not self.lock:
                    self.counter += 1
                    self.lock = True

        if self.stage == "DESCENDING":
            self.lock = False

        return self.counter, self.stage