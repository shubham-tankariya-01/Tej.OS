from app.schemas.user import UserInDB

def calculate_points_update(user: UserInDB, status: str, use_freeze: bool = False):
    """
    Core math logic for Phase 3 points engine.
    Calculates the outcome of a check-in (or auto-close).
    
    Args:
        user: The current UserInDB state
        status: "done", "partial", or "missed"
        use_freeze: True if the user is spending a freeze token on a missed day
        
    Returns: dict with updates to be applied to the user doc.
        Includes points_awarded, and user updates (points_total, current_streak, 
        recovery_day, ghost_mode, streak_freeze_count)
    """
    
    # State values
    points_total = user.points_total
    current_streak = user.current_streak
    recovery_day = user.recovery_day
    streak_freeze_count = user.streak_freeze_count
    ghost_mode = user.ghost_mode
    longest_streak = user.longest_streak
    
    points_awarded = 0
    
    # If using freeze on a missed day
    if status == "missed" and use_freeze:
        if streak_freeze_count <= 0:
            raise ValueError("No freeze tokens available")
        # No-op on streak/points, just spend the token
        streak_freeze_count -= 1
        return {
            "points_awarded": 0,
            "user_updates": {
                "streak_freeze_count": streak_freeze_count
            }
        }
        
    # Standard missed day penalty
    if status == "missed":
        # -min(pre_reset_streak, 100)
        penalty = min(current_streak, 100)
        points_awarded = -penalty
        
        # Apply penalty
        was_negative = points_total < 0
        points_total += points_awarded
        
        # Recovery streak reset
        if points_total < 0:
            # If entering recovery for the first time OR already in recovery
            recovery_day = 1
            
        current_streak = 0
        
    elif status == "done":
        if points_total < 0:
            # Comeback Multiplier
            # day 1 = +5, day 2 = +10, day 3 = +20, day 4 = +35, day 5 = +55
            # Hold at +55/day
            recovery_day += 1
            if recovery_day == 1:
                points_awarded = 5
            elif recovery_day == 2:
                points_awarded = 10
            elif recovery_day == 3:
                points_awarded = 20
            elif recovery_day == 4:
                points_awarded = 35
            else:
                points_awarded = 55
        else:
            # Normal Vanguard +10/day cap
            points_awarded = 10
            
        points_total += points_awarded
        current_streak += 1
        
        if points_total >= 0:
            recovery_day = 0 # Out of recovery
            
        if current_streak > longest_streak:
            longest_streak = current_streak
            
        # Freeze token earn rate (1 every 14 days)
        if current_streak > 0 and current_streak % 14 == 0:
            if streak_freeze_count < 3:
                streak_freeze_count += 1
                
    elif status == "partial":
        # Phase 2 rule: flat +5, doesn't break or increment streak
        points_awarded = 5
        points_total += points_awarded
        if points_total >= 0:
            recovery_day = 0
            
    # Ghost mode check
    if points_total <= -400:
        ghost_mode = True

    return {
        "points_awarded": points_awarded,
        "user_updates": {
            "points_total": points_total,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "recovery_day": recovery_day,
            "streak_freeze_count": streak_freeze_count,
            "ghost_mode": ghost_mode
        }
    }
