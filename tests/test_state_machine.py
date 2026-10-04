from modules.state_machine import SquatStateMachine


def test_full_squat_cycle_counts_once():
    sm = SquatStateMachine()
    # Start standing
    assert sm.stage == 'STANDING'
    
    # Descend
    res = sm.update(140)
    assert res.state == 'DESCENDING'
    assert res.exercise == 'squat'
    assert res.reps == 0
    assert res.valid_rep is False
    assert res.completed is False
    
    # Reach bottom (must be <= 100)
    res = sm.update(100, confidence=0.85)
    assert res.state == 'BOTTOM'
    assert res.confidence == 0.85
    
    # Ascend
    res = sm.update(130)
    assert res.state == 'ASCENDING'
    
    # Return to standing and count
    res = sm.update(170, confidence=0.95)
    assert res.state == 'STANDING'
    assert res.reps == 1
    assert res.valid_rep is True
    assert res.confidence == 0.95
    assert res.completed is False
    
    # Next frame should not be a valid rep
    res = sm.update(170)
    assert res.state == 'STANDING'
    assert res.reps == 1
    assert res.valid_rep is False


def test_lock_prevents_double_count_within_cycle():
    sm = SquatStateMachine()
    sm.update(140)  # DESCENDING
    sm.update(100)   # BOTTOM
    sm.update(130)  # ASCENDING
    res1 = sm.update(170)  # should count 1
    res2 = sm.update(170)  # should remain 1 since lock engaged
    assert res1.reps == 1
    assert res1.valid_rep is True
    assert res2.reps == 1
    assert res2.valid_rep is False

def test_update_with_none_maintains_state():
    sm = SquatStateMachine()
    res = sm.update(140)
    assert res.state == 'DESCENDING'
    
    # Lost tracking
    res_none = sm.update(None, confidence=None)
    assert res_none.state == 'DESCENDING'
    assert res_none.reps == 0
    assert res_none.valid_rep is False
    assert res_none.confidence is None

def test_shallow_squat_rejected():
    sm = SquatStateMachine()
    sm.update(140)  # DESCENDING
    
    # User stops at 105 degrees (above the 100-degree threshold)
    res = sm.update(105)
    assert res.state == 'DESCENDING'  # State should NOT advance to BOTTOM
    
    # User goes back up
    res = sm.update(170)
    assert res.state == 'STANDING'
    assert res.reps == 0  # Rep was rejected
    assert res.valid_rep is False
