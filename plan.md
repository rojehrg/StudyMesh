
# Class Companion - Reflex Implementation Plan

## Project Overview
Building a student matching web app that creates social graphs for classes and matches students based on study style, goals, strengths, and schedule compatibility using Reflex (Python full-stack framework).

## Architecture Adaptations
- **Frontend & Backend**: Reflex (Python)
- **Database**: PostgreSQL with SQLAlchemy
- **Graph Visualization**: reflex-enterprise react-flow
- **AI**: OpenAI or Anthropic API (optional - not configured)
- **Authentication**: Custom JWT-based auth

---

## Phase 1: Authentication & Database Foundation ✅
- [x] Set up PostgreSQL database schema (users, profiles, classes, class_members, compatibility_scores, micro_groups, micro_group_members tables)
- [x] Create SQLAlchemy models matching the database schema
- [x] Implement user registration flow (email + password, basic validation)
- [x] Build login system with JWT token generation
- [x] Create authentication state management with session handling
- [x] Build onboarding UI (signup form, login form, email validation)
- [x] Add password hashing with bcrypt
- [x] Create protected route decorator for authenticated pages

---

## Phase 2: Student Profile & Class Management ✅
- [x] Build comprehensive profile creation form with all required fields (study_style dropdown, study_time_preference radio, strengths multi-select checkboxes, academic_goal dropdown, reliability slider 1-5, location_preference toggle, preferred_group_size dropdown)
- [x] Add optional profile fields (timezone, weekly availability grid, personality bio textarea, major input)
- [x] Create "Create Class" form (class_code generator, class_name, professor_name, term, school fields)
- [x] Build "Join Class" flow (code input, validation, auto-create if not exists)
- [x] Implement class_members table CRUD operations
- [x] Create profile edit/update functionality
- [x] Add form validation and error handling for all inputs
- [x] Build profile completion checker (redirect flow based on profile_complete boolean)

---

## Phase 3: Matching Algorithm & Compatibility Engine ✅
- [x] Implement core matching algorithm function with 7 scoring dimensions
- [x] Calculate study_style match (exact: +20, complementary: +12, conflict: +4)
- [x] Calculate study_time_preference match (exact: +20, partial: +10, none: 0)
- [x] Calculate strengths complementarity score (max +15 for complementary pairs)
- [x] Calculate academic_goal alignment (same: +15, 1 level: +8, opposite: 0)
- [x] Calculate reliability compatibility (diff <1: +10, 2-3: +5, >3: 0)
- [x] Calculate location_preference match (same: +10, different: 0)
- [x] Calculate availability overlap percentage score (overlap% * 10)
- [x] Create compatibility_scores batch calculator for all student pairs in a class
- [x] Store compatibility results with JSON breakdown in database
- [x] Build API endpoint to trigger matching calculation
- [x] Add "Recommended Partners" list sorted by compatibility score (top 5-10)

---

## Phase 4: Class Dashboard & Graph Visualization ✅
- [x] Install reflex-enterprise for react-flow graph component
- [x] Design class dashboard layout (left sidebar: class info + recommended matches, main area: interactive graph, right panel: actions)
- [x] Build student list view with compatibility scores displayed
- [x] Create interactive force-directed graph with react-flow (nodes = students, edges = compatibility, edge thickness based on score)
- [x] Add node styling (color by study_style, size by reliability, labels with names)
- [x] Implement hover tooltips on nodes (show student mini-profile)
- [x] Add click handler on nodes to view full student profile modal
- [x] Display compatibility score breakdown on edge hover
- [x] Create graph clustering visualization (group similar students visually)
- [x] Add graph controls (zoom, pan, reset view, filter by score threshold)
- [x] Build "Recommended Micro Groups" section (auto-suggest 3-4 person groups with high average compatibility)

---

## Phase 5: Micro Group Creation & External Messaging ✅
- [x] Build "Create Micro Group" UI (multi-select from classmates, max 4 members, group name input)
- [x] Implement micro_groups and micro_group_members database operations
- [x] Create group invitation system (generate shareable group codes)
- [x] Add auto-generate group feature (picks best matched 3-4 students based on compatibility)
- [x] Build group dashboard view (members, group stats, invite section)
- [x] Create group intro message template generator (Casual, Serious, Exam Prep templates)
- [x] Add external messaging links (WhatsApp, Email share buttons with pre-filled text)
- [x] Implement group member management (remove members, leave group)
- [x] Display group statistics (average compatibility, shared strengths, common availability)
- [x] Build "My Groups" page listing all user's study groups
- [x] Create "Join Group" page with code input

---

## Phase 6: UI Polish & Complete Integration ✅
- [x] Design responsive layout for mobile, tablet, desktop (mobile sidebar, hamburger menu)
- [x] Add loading states for all async operations (matching calculation, graph rendering)
- [x] Implement empty states (no classes joined, no matches yet, no groups)
- [x] Create error boundaries and user-friendly error messages
- [x] Add success notifications (class joined, profile saved, group created)
- [x] Build user settings page (edit profile, change password, notification preferences)
- [x] Add class settings for class creator (edit class info, view member list, delete class)
- [x] Implement profile completeness progress bar in onboarding
- [x] Create help/tutorial tooltips for first-time users
- [x] Add dark mode support (color mode toggle in header)
- [x] Build about/FAQ page explaining matching algorithm

---

## Phase 7: UI Verification & Testing ✅
- [x] Test authentication flow (signup, login, logout, session persistence)
- [x] Test profile creation and editing with various input combinations
- [x] Test class creation and join flow with multiple users
- [x] Test matching algorithm accuracy with sample student data
- [x] Test graph visualization rendering and interactions
- [x] Test micro group creation and invitation system
- [x] Verify responsive design across different screen sizes
- [x] Test error handling and edge cases

---

## Technical Notes

### Database Schema (PostgreSQL)
```
users: id, email, password_hash, name, profile_complete, created_at, updated_at
profiles: id, user_id (FK), study_style, study_time_preference, strengths (ARRAY), academic_goal, reliability, location_preference, preferred_group_size, availability (JSON), major, bio
classes: id, class_code (unique), class_name, school, professor, term, created_by (FK), created_at
class_members: id, class_id (FK), user_id (FK), joined_at
compatibility_scores: id, class_id, user_a_id, user_b_id, score, score_breakdown (JSON)
micro_groups: id, class_id, name, group_code (unique), description, created_by (FK), created_at
micro_group_members: group_id (FK), user_id (FK)
```

### Matching Algorithm Weights
- Study Style: 0-20 points
- Study Time: 0-20 points  
- Strengths: 0-15 points
- Academic Goal: 0-15 points
- Reliability: 0-10 points
- Location: 0-10 points
- Availability: 0-10 points
- **Total**: 0-100 points

---

## Session Target
Complete Phase 7 UI verification and testing.
