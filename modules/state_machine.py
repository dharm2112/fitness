from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SquatResult:
    """Structured output produced each frame by SquatStateMachine.update().

    Fields
    ------
    exercise : str
        Always "squat" for this model. Reserved for the future multi-exercise
        interface so consumers never need to guess which model produced the result.
    state : str
        Current phase of the movement.
        One of: "STANDING" | "DESCENDING" | "BOTTOM" | "ASCENDING"
    reps : int
        Total completed squat repetitions so far in this session.
    valid_rep : bool
        True **only** on the exact frame a valid rep is registered (i.e. the
        counter incremented this update). Consumers can use this as a one-shot
        event signal (e.g. trigger haptic feedback or a sound).
    confidence : Optional[float]
        Landmark visibility confidence in [0, 1] passed in from the caller.
        None when no pose was detected or landmarks were unavailable.
    completed : bool
        True when the user has reached the session target (currently unused /
        always False from within the state machine itself; the caller sets this
        field after construction if it has a target). Provides a clean hook for
        the API layer without adding target logic here.
    """

    exercise: str = "squat"
    state: str = "STANDING"
    reps: int = 0
    valid_rep: bool = False
    confidence: Optional[float] = None
    completed: bool = False


class SquatStateMachine:

    def __init__(self):
        self.counter = 0
        self.stage = "STANDING"
        self.lock = False

    def update(self, angle: Optional[float], confidence: Optional[float] = None) -> SquatResult:
        """Update state machine with a new angle value and return a SquatResult.

        If angle is None, do not change the state — missing detection should not
        cause the state machine to raise. This keeps counting resilient to
        intermittent missed frames.

        Parameters
        ----------
        angle : Optional[float]
            Smoothed knee angle in degrees. Pass None when detection was lost.
        confidence : Optional[float]
            Landmark visibility confidence forwarded from calculate_confidence().
            Stored verbatim in the result; not used for state logic.
        """
        prev_counter = self.counter
        valid_rep = False

        if angle is None:
            # No reliable input; keep current state unchanged.
            return SquatResult(
                exercise="squat",
                state=self.stage,
                reps=self.counter,
                valid_rep=False,
                confidence=confidence,
                completed=False,
            )

        # --- Unchanged state-transition logic ---
        if self.stage == "STANDING":
            if angle < 150:
                self.stage = "DESCENDING"

        elif self.stage == "DESCENDING":
            if angle <= 100:  # Relaxed depth validation (was 85)
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
            elif angle <= 100:  # Failed to stand up completely, went back down
                self.stage = "BOTTOM"

        if self.stage == "DESCENDING":
            self.lock = False
        # --- End of unchanged logic ---

        valid_rep = self.counter > prev_counter

        return SquatResult(
            exercise="squat",
            state=self.stage,
            reps=self.counter,
            valid_rep=valid_rep,
            confidence=confidence,
            completed=False,
        )

