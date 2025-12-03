"""
B2B Enablement Matching Algorithm

Calculates compatibility between employees based on:
- Skill Gap Alignment (mentor expertise intersects mentee growth needs)
- Department Diversity (cross-department collaboration bonus)
- Initiative Alignment (same pod KPI focus)
- Availability Overlap (common meeting windows)
- Collaboration Style (async vs live preference)
- Business Unit Proximity (same BU bonus)
- Soft Match Bonus (shared projects/goals)
"""

from app.models import Profile, Class
import difflib


def normalize_skills(skills: list[str]) -> set[str]:
    """Normalize skills to lowercase and stripped for comparison."""
    return {s.strip().lower() for s in skills if s}


def are_skills_similar(skill1: str, skill2: str, threshold: float = 0.8) -> bool:
    """
    Check if two skills are similar using SequenceMatcher.
    Returns True if similarity ratio > threshold.
    """
    s1 = skill1.strip().lower()
    s2 = skill2.strip().lower()
    
    # Exact match check first for performance
    if s1 == s2:
        return True
    
    # Substring check (e.g. "tax recon" in "tax reconciliation")
    if len(s1) > 4 and len(s2) > 4:
        if s1 in s2 or s2 in s1:
            return True
            
    # Fuzzy match
    return difflib.SequenceMatcher(None, s1, s2).ratio() > threshold


def calculate_skill_gap_score(profile_a: Profile, profile_b: Profile) -> tuple[int, dict]:
    """
    Calculate score based on skill gap alignment (0-30 points).
    Returns (score, match_details).
    match_details = {"a_mentors_b": [skills], "b_mentors_a": [skills]}
    """
    # Get expertise and growth skills
    expertise_a = normalize_skills(profile_a.expertise_skills or profile_a.strengths or [])
    growth_a = normalize_skills(profile_a.growth_skills or [])
    expertise_b = normalize_skills(profile_b.expertise_skills or profile_b.strengths or [])
    growth_b = normalize_skills(profile_b.growth_skills or [])
    
    details = {"a_mentors_b": [], "b_mentors_a": []}
    total_matches = 0
    
    # A can mentor B
    for exp_skill in expertise_a:
        for growth_skill in growth_b:
            if are_skills_similar(exp_skill, growth_skill):
                details["a_mentors_b"].append(exp_skill.title())
                total_matches += 1
                break 
    
    # B can mentor A
    for exp_skill in expertise_b:
        for growth_skill in growth_a:
            if are_skills_similar(exp_skill, growth_skill):
                details["b_mentors_a"].append(exp_skill.title())
                total_matches += 1
                break
                
    score = min(30, total_matches * 10)
    return score, details


def calculate_department_diversity_score(profile_a: Profile, profile_b: Profile) -> int:
    dept_a = (profile_a.department or "").strip().lower()
    dept_b = (profile_b.department or "").strip().lower()
    if not dept_a or not dept_b: return 0
    return 10 if dept_a != dept_b else 0


def calculate_initiative_alignment_score(profile_a: Profile, profile_b: Profile, pod: Class | None) -> int:
    if not pod: return 0
    return 20


def calculate_availability_score(avail_a: dict, avail_b: dict) -> int:
    if not avail_a or not avail_b: return 0
    common_slots = 0
    total_unique_slots = 0
    all_days = set(avail_a.keys()) | set(avail_b.keys())
    for day in all_days:
        slots_a = set(avail_a.get(day, []))
        slots_b = set(avail_b.get(day, []))
        common_slots += len(slots_a.intersection(slots_b))
        total_unique_slots += len(slots_a.union(slots_b))
    if total_unique_slots == 0: return 0
    overlap_percent = common_slots / total_unique_slots
    return int(overlap_percent * 15)


def calculate_collaboration_style_score(profile_a: Profile, profile_b: Profile) -> int:
    style_a = (profile_a.collaboration_preference or "hybrid").lower()
    style_b = (profile_b.collaboration_preference or "hybrid").lower()
    if style_a == style_b: return 10
    if "hybrid" in [style_a, style_b]: return 7
    if {style_a, style_b} == {"async", "live"}: return 5
    return 0


def calculate_business_unit_score(profile_a: Profile, profile_b: Profile, pod: Class | None) -> int:
    if not pod: return 0
    return 10


def calculate_soft_match_score(profile_a: Profile, profile_b: Profile) -> tuple[int, list[str]]:
    projects_a = {p.strip().lower() for p in (profile_a.current_projects or []) if p}
    projects_b = {p.strip().lower() for p in (profile_b.current_projects or []) if p}
    matches = []
    if projects_a and projects_b:
        shared = set()
        for pa in projects_a:
            for pb in projects_b:
                if are_skills_similar(pa, pb, threshold=0.85): 
                    shared.add(pa.title())
        if shared:
            matches.append(f"Shared Projects: {', '.join(list(shared))}")
            return 5, matches
    return 0, matches


def calculate_reliability_score(profile_a: Profile, profile_b: Profile) -> int:
    reliability_a = profile_a.reliability or 0
    reliability_b = profile_b.reliability or 0
    avg_reliability = (reliability_a + reliability_b) / 2
    score = int(avg_reliability * 3)
    return min(15, score)


def calculate_compatibility(
    profile_a: Profile, profile_b: Profile, pod: Class | None = None
) -> dict:
    """
    Calculate full B2B compatibility profile.
    Returns scores and structured match details.
    """
    skill_gap, skill_details = calculate_skill_gap_score(profile_a, profile_b)
    dept_diversity = calculate_department_diversity_score(profile_a, profile_b)
    initiative = calculate_initiative_alignment_score(profile_a, profile_b, pod)
    availability = calculate_availability_score(
        profile_a.availability or {}, profile_b.availability or {}
    )
    collaboration = calculate_collaboration_style_score(profile_a, profile_b)
    business_unit = calculate_business_unit_score(profile_a, profile_b, pod)
    soft_match, soft_reasons = calculate_soft_match_score(profile_a, profile_b)
    reliability = calculate_reliability_score(profile_a, profile_b)
    
    total = (
        skill_gap + dept_diversity + initiative + availability + 
        collaboration + business_unit + soft_match + reliability
    )
    
    # Store structured data for dynamic display
    details = {
        "skills": skill_details, # {"a_mentors_b": [], "b_mentors_a": []}
        "projects": soft_reasons,
        "dept_diversity": dept_diversity > 0,
        "high_availability": availability > 10
    }
    
    return {
        "skill_gap": skill_gap,
        "department_diversity": dept_diversity,
        "initiative_alignment": initiative,
        "availability": availability,
        "collaboration_style": collaboration,
        "business_unit": business_unit,
        "soft_match": soft_match,
        "reliability": reliability,
        "final": min(100, total),
        "details": details 
    }
