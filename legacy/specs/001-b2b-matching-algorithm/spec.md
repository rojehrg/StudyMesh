# Feature Specification: B2B Enablement Matching Algorithm

**Feature Branch**: `001-b2b-matching-algorithm`  
**Created**: 2025-01-XX  
**Status**: Draft  
**Input**: User description: "Build a matching algorithm that pairs employees based on skill gaps, mentorship availability, department diversity, and collaboration preferences for B2B enablement purposes."

## User Scenarios & Testing

### User Story 1 - Mentor-Mentee Pairing (Priority: P1)

An employee with expertise in "Revenue Operations" wants to help others, and another employee needs help with "Revenue Operations". The system should identify this match and surface it in the "Offer Support" queue for the mentor and "Request Support" queue for the mentee.

**Why this priority**: This is the core value proposition - connecting people who can help with people who need help. Without this, the platform has no purpose.

**Independent Test**: Can be fully tested by creating two employee profiles: one with "Revenue Operations" as expertise, another with "Revenue Operations" as a growth area. Run matching algorithm and verify the pair appears in both queues with a high compatibility score.

**Acceptance Scenarios**:

1. **Given** Employee A has "Revenue Operations" in their expertise skills, **When** Employee B has "Revenue Operations" in their growth skills, **Then** the system calculates a skill gap match score of 30 points and surfaces the match in both queues.

2. **Given** Employee A has multiple expertise skills, **When** Employee B needs help with one of those skills, **Then** the system matches them based on the intersecting skill.

3. **Given** Employee A has "Revenue Operations" expertise, **When** Employee B needs help with "RevOps" (synonym), **Then** the system recognizes the match (requires skill normalization).

---

### User Story 2 - Working Circle Suggestions (Priority: P2)

A pod lead wants to form a working circle for a specific initiative. The system should suggest 3-4 employees who have complementary skills, overlapping availability, and alignment with the pod's KPI focus.

**Why this priority**: Working circles enable collaborative enablement beyond 1-on-1 mentorship. This scales the value of the platform.

**Independent Test**: Can be tested by creating a pod with a KPI focus, adding 10+ employees with varied skills and availability, then requesting working circle suggestions. Verify suggestions include employees with complementary skills and common availability windows.

**Acceptance Scenarios**:

1. **Given** A pod with KPI focus "Customer Onboarding", **When** requesting working circle suggestions, **Then** the system suggests 3-4 employees who have skills relevant to customer onboarding and overlapping availability.

2. **Given** Multiple potential circles exist, **When** requesting suggestions, **Then** the system prioritizes circles with highest average compatibility scores.

3. **Given** An employee is already in a working circle, **When** generating suggestions, **Then** the system can optionally include them in new suggestions (configurable).

---

### User Story 3 - Department Cross-Pollination (Priority: P3)

An organization wants to encourage knowledge sharing across departments. The system should give bonus points to matches between employees from different departments, while still allowing same-department matches.

**Why this priority**: Cross-department collaboration is valuable but not critical for MVP. This is an enhancement that adds organizational value.

**Independent Test**: Can be tested by creating employees from different departments (e.g., Sales and Engineering) with matching skills. Verify the compatibility score includes a department diversity bonus.

**Acceptance Scenarios**:

1. **Given** Employee A (Sales) and Employee B (Engineering) have matching skills, **When** calculating compatibility, **Then** the system adds a 10-point department diversity bonus.

2. **Given** Employee A and Employee B are in the same department, **When** calculating compatibility, **Then** the system does not add a diversity bonus, but still calculates other match factors.

---

### Edge Cases

- What happens when an employee has no skills listed (expertise or growth)?
- How does the system handle employees with identical skill sets (no gap to fill)?
- What if two employees have perfect skill matches but zero availability overlap?
- How does the system handle employees who are already in multiple working circles?
- What happens when a pod has fewer than 3 employees (can't form a circle)?
- How does the system handle timezone mismatches for availability?
- What if an employee's collaboration preference is "async" but the match prefers "live sessions"?

## Requirements

### Functional Requirements

- **FR-001**: System MUST calculate compatibility scores between all employee pairs within a pod
- **FR-002**: System MUST break down compatibility scores into components (skill gap, department diversity, availability, collaboration style, initiative alignment)
- **FR-003**: System MUST surface "Offer Support" queue showing employees who can mentor others
- **FR-004**: System MUST surface "Request Support" queue showing employees who need help
- **FR-005**: System MUST suggest working circles (3-4 employees) based on compatibility scores
- **FR-006**: System MUST respect availability windows when calculating matches
- **FR-007**: System MUST store compatibility scores in the database with JSON breakdown
- **FR-008**: System MUST recalculate compatibility scores when employee profiles are updated
- **FR-009**: System MUST filter matches by collaboration preference (async vs live)
- **FR-010**: System MUST weight skill gap matches higher than other factors (30 points max)

### Key Entities

- **CompatibilityScore**: Represents calculated compatibility between two employees in a pod. Contains: pod_id, user_a_id, user_b_id, score (0-100), score_breakdown (JSON with component scores).
- **Employee Profile**: Contains expertise_skills (list), growth_skills (list), department, availability (JSON), collaboration_preference, current_projects.
- **Pod**: Contains kpi_focus, business_unit, initiative_owner. Used for initiative alignment scoring.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Matching algorithm completes calculation for pods up to 100 employees in under 5 seconds
- **SC-002**: 90% of suggested mentor-mentee pairs have skill gap matches (mentor expertise intersects mentee growth)
- **SC-003**: Working circle suggestions have average compatibility scores above 60%
- **SC-004**: Availability overlap is calculated correctly for 95% of employee pairs
- **SC-005**: Score breakdowns are visible and explainable to users in the UI
- **SC-006**: System handles edge cases (no skills, zero availability, etc.) gracefully without errors

## Technical Implementation Notes

### Algorithm Components

1. **Skill Gap Match (0-30 points)**
   - For each skill in Employee B's growth_skills, check if it exists in Employee A's expertise_skills
   - Count matches, multiply by points per match (e.g., 10 points per match, max 30)
   - Bidirectional: also check if A needs what B has

2. **Department Diversity (0-10 points)**
   - If Employee A and B are in different departments: +10 points
   - If same department: 0 points

3. **Initiative Alignment (0-20 points)**
   - If both employees are in the same pod with a KPI focus: +20 points
   - If in different pods: 0 points
   - If pod has no KPI focus: 0 points

4. **Availability Overlap (0-15 points)**
   - Calculate common time windows from availability JSON
   - Score = (common_windows / total_unique_windows) * 15
   - Handle timezone differences

5. **Collaboration Style (0-10 points)**
   - If both prefer "async": +10 points
   - If both prefer "live": +10 points
   - If one prefers async and other prefers live: +5 points (compromise)
   - If one prefers "hybrid": +7 points with either

6. **Business Unit Proximity (0-10 points)**
   - If both in same business unit: +10 points
   - If different: 0 points
   - Optional: can be disabled if cross-BU collaboration is preferred

7. **Soft Match Bonus (0-5 points)**
   - If employees share common projects (from current_projects field): +5 points
   - If employees have similar role titles: +3 points

### Database Schema Updates

```sql
-- CompatibilityScore table already exists, but breakdown structure:
{
  "skill_gap": 30,
  "department_diversity": 10,
  "initiative_alignment": 20,
  "availability": 12,
  "collaboration_style": 10,
  "business_unit": 10,
  "soft_match": 5,
  "final": 97
}
```

### Performance Considerations

- Batch calculate scores for all pairs in a pod (not on-demand)
- Cache scores until profile updates occur
- Use database indexes on pod_id, user_a_id, user_b_id
- Consider background job for large pods (100+ employees)

