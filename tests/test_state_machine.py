from modules.state_machine import SquatStateMachine


def test_full_squat_cycle_counts_once():
    sm = SquatStateMachine()
    # Start standing
    assert sm.stage == 'STANDING'
    # Descend
    sm.update(140)
    assert sm.stage == 'DESCENDING'
    # Reach bottom
    sm.update(90)
    assert sm.stage == 'BOTTOM'
    # Ascend
    sm.update(130)
    assert sm.stage == 'ASCENDING'
    # Return to standing and count
    counter, stage = sm.update(170)
    assert stage == 'STANDING'
    assert counter == 1


def test_lock_prevents_double_count_within_cycle():
    sm = SquatStateMachine()
    sm.update(140)  # DESCENDING
    sm.update(90)   # BOTTOM
    sm.update(130)  # ASCENDING
    c1, _ = sm.update(170)  # should count 1
    c2, _ = sm.update(170)  # should remain 1 since lock engaged
    assert c1 == 1
    assert c2 == 1
