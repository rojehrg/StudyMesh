from app.models import Profile


def calculate_study_style_score(style_a: str, style_b: str) -> int:
    """Calculate score based on study style compatibility."""
    if style_a == style_b:
        return 20
    complementary = [{"Visual", "Discussion-based"}, {"Practice-based", "Memorization"}]
    pair = {style_a, style_b}
    if pair in complementary:
        return 12
    return 4


def calculate_study_time_score(time_a: str, time_b: str) -> int:
    """Calculate score based on study time preference."""
    if time_a == time_b:
        return 20
    partials = [
        {"Morning", "Afternoon"},
        {"Afternoon", "Night"},
        {"Night", "Last Minute"},
    ]
    if {time_a, time_b} in partials:
        return 10
    return 0


def calculate_strengths_score(strengths_a: list[str], strengths_b: list[str]) -> int:
    """Calculate score based on complementary strengths."""
    set_a = set(strengths_a)
    set_b = set(strengths_b)
    unique_complementary_count = len(set_a.symmetric_difference(set_b))
    score = unique_complementary_count * 3
    return min(15, score)


def calculate_academic_goal_score(goal_a: str, goal_b: str) -> int:
    """Calculate score based on academic goal alignment."""
    levels = {"A": 4, "B": 3, "Pass": 2, "Survival": 1}
    val_a = levels.get(goal_a, 0)
    val_b = levels.get(goal_b, 0)
    if val_a == 0 or val_b == 0:
        return 0
    diff = abs(val_a - val_b)
    if diff == 0:
        return 15
    if diff == 1:
        return 8
    return 0


def calculate_reliability_score(rel_a: int, rel_b: int) -> int:
    """Calculate score based on reliability similarity."""
    diff = abs(rel_a - rel_b)
    if diff <= 1:
        return 10
    if diff <= 3:
        return 5
    return 0


def calculate_location_score(loc_a: str, loc_b: str) -> int:
    """Calculate score based on location preference."""
    return 10 if loc_a == loc_b else 0


def calculate_availability_score(avail_a: dict, avail_b: dict) -> int:
    """Calculate score based on weekly availability overlap."""
    if not avail_a or not avail_b:
        return 0
    common_slots = 0
    total_unique_slots = 0
    all_days = set(avail_a.keys()) | set(avail_b.keys())
    for day in all_days:
        slots_a = set(avail_a.get(day, []))
        slots_b = set(avail_b.get(day, []))
        common_slots += len(slots_a.intersection(slots_b))
        total_unique_slots += len(slots_a.union(slots_b))
    if total_unique_slots == 0:
        return 0
    overlap_percent = common_slots / total_unique_slots
    return int(overlap_percent * 10)


def calculate_compatibility(profile_a: Profile, profile_b: Profile) -> dict:
    """Calculate full compatibility profile between two users."""
    style_score = calculate_study_style_score(
        profile_a.study_style, profile_b.study_style
    )
    time_score = calculate_study_time_score(
        profile_a.study_time_preference, profile_b.study_time_preference
    )
    strength_score = calculate_strengths_score(profile_a.strengths, profile_b.strengths)
    goal_score = calculate_academic_goal_score(
        profile_a.academic_goal, profile_b.academic_goal
    )
    rel_score = calculate_reliability_score(
        profile_a.reliability, profile_b.reliability
    )
    loc_score = calculate_location_score(
        profile_a.location_preference, profile_b.location_preference
    )
    avail_score = calculate_availability_score(
        profile_a.availability, profile_b.availability
    )
    total = (
        style_score
        + time_score
        + strength_score
        + goal_score
        + rel_score
        + loc_score
        + avail_score
    )
    return {
        "style": style_score,
        "time": time_score,
        "strengths": strength_score,
        "goals": goal_score,
        "reliability": rel_score,
        "location": loc_score,
        "availability": avail_score,
        "final": min(100, total),
    }