# Spec 007: Meshflow Revamp - Availability-First Coordination Platform

**Status**: In Progress
**Author**: Meshflow Team
**Created**: 2025-12-19
**Last Updated**: 2025-12-19

---

## 📋 Overview

Complete revamp of Meshflow to focus on its core value proposition: **coordinating help across time zones for remote teams**. This is not a skill-matching platform or an expertise database—it's a lightweight coordination layer that answers: "Who on my team can help me right now (or when are they free)?"

**The Problem We're Solving:**
1. **Time zone coordination hell** - Remote teams across different time zones can't easily find overlapping availability
2. **"Who do I ask?"** - Deep product knowledge that's not googleable, but teammates have
3. **Slack chaos** - DMs flying everywhere, no context, hard to coordinate quick calls

**What We're NOT:**
- ❌ LinkedIn for teams
- ❌ Complex expertise database with proficiency levels
- ❌ Dating-app-style matching with compatibility scores
- ❌ Stack Overflow clone

**What We ARE:**
- ✅ Visual availability coordination across time zones
- ✅ Quick "who knows what" tagging (informal, searchable)
- ✅ Contextual nudges that connect to Slack
- ✅ Manager-controlled team pods (no chaos)

---

## 🎯 Goals

1. **Simplify the product** - Remove complexity that doesn't serve the core use case
2. **Build best-in-class availability grid** - Time zone aware, visual, "who's free now"
3. **Make nudges contextual** - Add meeting length, topics, time suggestions
4. **Manager-friendly pods** - One manager creates pod per team, prevents chaos
5. **Lightweight knowledge tagging** - Not skills, just "I know X" tags
6. **Update positioning** - SEO and landing page reflect new vision

---

## 🎭 Target Users

### Primary Markets

1. **Remote Startups (5-20 people)**
   - Distributed time zones
   - Can't afford Calendly ($100/month)
   - Need quick coordination
   - Example: Friends with team in Turkey, Arizona, California

2. **Customer Support Teams**
   - Knowledge gaps on product-specific issues
   - Remote, different shifts
   - "Who handled this tax reconciliation issue before?"
   - Need fast answers during customer calls

3. **Open Source Communities**
   - Global contributors
   - No formal Slack organization
   - Need to coordinate reviews/help across time zones

4. **Consulting/Agency Teams**
   - Multiple projects, siloed knowledge
   - Need to borrow expertise across projects
   - Billable hours = fast answers critical

---

## 🗂️ Database Schema Changes

### Remove Complexity

**REMOVE from `profiles`:**
```typescript
- expertiseLevels: jsonb // Too complex, feels like LinkedIn
- growthLevels: jsonb
- strengths: text[] // Redundant with expertise_skills
- studyStyle: text // Not used
- studyTimePreference: text // Replaced by availability grid
- academicGoal: text // Not relevant for B2B
- locationPreference: text // Not critical
- collaborationPreference: text // Simplify
- currentProjects: text[] // Not core
- reliability: integer // Remove gamification
```

**KEEP and ENHANCE:**
```typescript
profiles {
  id: uuid (PK)
  userId: uuid (FK to Supabase Auth)

  // Basic info
  department: text
  major: text (job title)
  bio: text

  // Lightweight knowledge tags (NOT skills)
  knowledgeAreas: text[] // ["Rippling tax recon", "SQL debugging", "Salesforce setup"]

  // Availability
  availability: jsonb // Enhanced: { timezone: string, grid: { Mon: ["9-10", "14-15"], ... } }
  currentlyAvailable: boolean // Live status indicator

  // Collaboration
  preferredGroupSize: integer
  lookingToHelp: boolean
  slackHandle: text

  // Timestamps
  createdAt: timestamp
  updatedAt: timestamp
}
```

**ADD Manager Role to `pods`:**
```typescript
pods {
  id: uuid (PK)
  podCode: text (unique, 6 chars)
  podName: text
  businessUnit: text
  initiativeOwner: text // Manager's name
  managerId: uuid (NEW - user who controls pod)
  term: text
  allowCrossPodHelp: boolean (NEW - default false)
  createdBy: uuid
  createdAt: timestamp
}
```

**REMOVE Tables:**
```typescript
- compatibilityScores // No more complex matching
- openRequests // Simplify to just knowledge tags
```

**ENHANCE Notifications:**
```typescript
notifications {
  id: uuid (PK)
  recipientId: uuid
  senderId: uuid
  type: text // 'nudge', 'system'
  content: text
  metadata: jsonb {
    topic: string (NEW - what is this about?)
    meetingLength: string (NEW - "15min", "30min", "1hr", "async")
    suggestedTimes: string[] (NEW - based on availability)
    podId: uuid
    nudgeType: string // 'ask' or 'offer'
  }
  read: boolean
  createdAt: timestamp
}
```

---

## 📄 Pages to Build/Revamp

### 1. **Landing Page** (`/`) - COMPLETE REWRITE
**New Positioning:**
- Hero: "Coordinate help across time zones. No Calendly. No Slack chaos."
- Problem statements: Time zone math, don't know who to ask, Slack DM chaos
- Solution: Visual availability + contextual nudges + Slack integration
- Social proof: Remote startups, support teams, open source
- SEO: Keywords around "remote team coordination", "time zone scheduling", "team availability"

### 2. **Settings** (`/settings`) - SIMPLIFY
**Changes:**
- Remove proficiency rings and sliders
- Replace "Expertise Skills" with "Knowledge Areas" (lightweight tags)
- Remove "Growth Skills" (not needed)
- Enhance availability section:
  - Auto-detect time zone
  - Visual grid builder (drag to select availability)
  - "Currently available" toggle
- Keep Slack handle integration

### 3. **Working Circles** (`/groups`) - SIMPLIFY
**Remove:**
- Match percentage scores
- Complex compatibility breakdowns
- "You can teach them" / "They can teach you" badges

**Keep:**
- List of pod members
- Filter by knowledge area tags
- Availability indicators ("Free now", "Free later today")
- Nudge button

**Add:**
- Time zone display for each person
- "Suggest meeting time" based on overlapping availability

### 4. **Pod Detail** (`/classes/[podCode]`) - ENHANCE
**Add:**
- Manager badge for pod creator
- Team availability heatmap (visual: when is team most available?)
- Knowledge coverage view ("No one tagged SQL - might be a gap")
- Quick filters: "Who's available now?", "Who knows X?"

### 5. **Nudge Dialog** - MAJOR ENHANCEMENT
**Current State:**
- Select topic from expertise skills
- Choose "Ask for help" or "Offer help"

**New Features:**
- Topic input (freeform, not dropdown)
- Meeting length selector:
  - Quick question (15 min)
  - Deep dive (30 min)
  - Extended session (1 hr)
  - Async (Slack thread)
- Suggest times based on availability overlap
  - "You're both free: Tue 2-3pm PT, Wed 10-11am PT"
  - One-click to include in nudge
- Invite multiple people option
- Preview of Slack message before sending

### 6. **Dashboard** (`/dashboard`) - STREAMLINE
**Changes:**
- Remove "Skills Shared" stat (not tracking this)
- Add "Hours saved this week" (estimate based on nudges)
- Add "Team availability right now" widget
- Quick action: "Who's available now?"

---

## 🔧 Core Features to Build

### Feature 1: Enhanced Availability Grid

**Component:** `<AvailabilityGrid />`

**Functionality:**
```typescript
interface AvailabilityGrid {
  timezone: string // Auto-detected, editable
  weeklyGrid: {
    [day: string]: TimeSlot[] // ["09:00-10:00", "14:00-15:00"]
  }
  currentlyAvailable: boolean // Live toggle
}
```

**UI:**
- Visual weekly calendar
- Drag to select time blocks
- Shows local time + converts to other time zones
- Color coding: Available (green), Busy (gray), Currently free (pulsing green)

**Integration:**
- Save to `profiles.availability`
- Display in pod member list
- Use for meeting time suggestions

### Feature 2: Smart Meeting Suggestions

**Algorithm:**
```typescript
function suggestMeetingTimes(
  userA: Profile,
  userB: Profile,
  duration: "15min" | "30min" | "1hr"
): SuggestedTime[] {
  // 1. Parse availability grids
  // 2. Convert to common timezone
  // 3. Find overlapping blocks >= duration
  // 4. Return next 3 available slots

  return [
    { day: "Tuesday", time: "2:00 PM PT", timeB: "5:00 PM ET" },
    { day: "Wednesday", time: "10:00 AM PT", timeB: "1:00 PM ET" }
  ];
}
```

**Display:**
- In nudge dialog: "Suggested times based on your availability"
- One-click to include in nudge
- Creates calendar invite if accepted

### Feature 3: Knowledge Area Tags (Not Skills)

**Difference from Old "Skills":**
- Old: "Python" with 70% proficiency
- New: "Set up Rippling tax reconciliation" (specific, product knowledge)

**UI:**
- Simple tag input (like Slack channels)
- Searchable across pod
- No proficiency levels
- No "growth" vs "expertise" distinction

**Use Cases:**
- "Who knows how to debug Salesforce API issues?"
- Search "Salesforce" → shows 3 people with that tag
- Click person → see availability → send nudge

### Feature 4: Manager Controls

**Manager Features:**
```typescript
interface ManagerView {
  podAnalytics: {
    nudgesThisWeek: number
    mostActiveMembers: User[]
    knowledgeGaps: string[] // Tags no one has
    peakAvailability: string // "Team most available Tue-Thu 2-4pm PT"
  }

  controls: {
    inviteMembers: () => void
    removeMember: (userId) => void
    editPodSettings: () => void
    toggleCrossPodHelp: (enabled: boolean) => void
  }
}
```

**Access Control:**
- Only manager (pod.managerId) can:
  - Remove members
  - Edit pod settings
  - See analytics
  - Delete pod

### Feature 5: Cross-Pod Help (Opt-in)

**Feature:**
- By default: Pod is private (members only see each other)
- Manager can enable: "Allow cross-pod help requests"
  - Other pods can see this pod is open for questions
  - Members from other pods can send nudges
  - Manager sees cross-pod activity

**UI:**
```
My Pod: Customer Support (8 people) [Private]
↓
Available for Help:
  Engineering (12 people) [🔓 Open for questions]
  Finance (5 people) [🔒 Private]
```

---

## 🎨 UI/UX Patterns

### Design System

**Colors:**
- Primary: Teal (`#0d9488`)
- Success: Green (`#10b981`)
- Warning: Amber (`#f59e0b`)
- Availability indicator: Pulsing green dot

**Typography:**
- Headers: Bold, larger font
- Body: Clean sans-serif
- Tags: Small, rounded pills

**Components:**
- Use existing Shadcn UI
- Add new: `<AvailabilityGrid>`, `<TimezonePicker>`, `<MeetingSuggestions>`

### Animations
- Keep existing Framer Motion patterns
- Add: Pulsing "available now" indicator
- Add: Smooth timezone conversion animations

---

## 🚀 Implementation Order

### Phase 1: Spec + Landing Page (Current)
- [x] Write comprehensive spec
- [ ] Rewrite landing page with new positioning + SEO
- [ ] Update README and documentation

### Phase 2: Database Simplification
- [ ] Create migration to remove unused fields
- [ ] Add `knowledgeAreas`, `managerId`, `allowCrossPodHelp`
- [ ] Remove `compatibilityScores` and `openRequests` tables
- [ ] Update Drizzle schema

### Phase 3: Availability Grid
- [ ] Build `<AvailabilityGrid>` component
- [ ] Add timezone detection/picker
- [ ] Implement drag-to-select UI
- [ ] Save/load from database
- [ ] Add "currently available" toggle

### Phase 4: Enhanced Nudges
- [ ] Update `<NudgeDialog>` component
- [ ] Add meeting length selector
- [ ] Build meeting time suggestion algorithm
- [ ] Display suggested times in dialog
- [ ] Update Slack webhook payload

### Phase 5: Simplify Pages
- [ ] Update Settings page (remove proficiency, add knowledge tags)
- [ ] Simplify Working Circles (remove match scores)
- [ ] Update Pod Detail (add manager features)
- [ ] Streamline Dashboard

### Phase 6: Manager Features
- [ ] Add manager role to pods
- [ ] Build manager analytics view
- [ ] Add member management controls
- [ ] Implement cross-pod help toggle

---

## ✅ Acceptance Criteria

### Core Functionality
- [ ] User can set availability with timezone awareness
- [ ] Availability grid shows visual weekly schedule
- [ ] "Currently available" status updates in real-time
- [ ] Nudge dialog suggests meeting times based on overlap
- [ ] Knowledge area tags are searchable and lightweight
- [ ] Manager can control pod settings and see analytics
- [ ] Cross-pod help is opt-in and clearly indicated

### User Experience
- [ ] Landing page clearly communicates new value prop
- [ ] No mention of "skills", "proficiency levels", or "match scores"
- [ ] All timezone conversions are automatic and accurate
- [ ] Slack integration works seamlessly
- [ ] Mobile responsive (especially availability grid)

### Technical
- [ ] Database migration runs without data loss
- [ ] All queries optimized (no N+1)
- [ ] SEO meta tags on landing page
- [ ] Timezone handling uses standard library (not manual math)

---

## 📊 SEO Strategy

### Landing Page Keywords
**Primary:**
- Remote team coordination
- Team availability scheduling
- Time zone meeting planner
- Slack team coordination

**Secondary:**
- Who's available now
- Remote work scheduling
- Team knowledge sharing
- Distributed team tools

**Long-tail:**
- "Schedule meetings across time zones for free"
- "See when remote team is available"
- "Coordinate help requests remote team"

### Meta Tags
```html
<title>Meshflow - Coordinate Help Across Time Zones for Remote Teams</title>
<meta name="description" content="Visual team availability, contextual help requests, and Slack integration. Free alternative to Calendly for small remote teams." />
<meta property="og:title" content="Meshflow - Remote Team Coordination Made Simple" />
<meta property="og:description" content="Know who to ask, when they're free, and coordinate help in seconds. Built for distributed startups and support teams." />
```

### Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Meshflow",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Team coordination platform for remote teams to find availability and share knowledge across time zones"
}
```

---

## 🧪 Testing Plan

### User Flows to Test

1. **New User Onboarding**
   - Sign up → Set availability → Join pod → Send first nudge
   - Expected time: < 5 minutes

2. **Manager Creates Pod**
   - Create pod → Get pod code → Invite members → See analytics
   - Verify only manager can access controls

3. **Cross-Timezone Nudge**
   - User in PT nudges user in CET
   - Verify times are suggested correctly
   - Verify Slack notification received

4. **Knowledge Area Search**
   - Tag self with "Rippling tax setup"
   - Teammate searches "Rippling"
   - Verify match found, can send nudge

### Edge Cases
- Empty availability grid (no times set)
- Conflicting timezones (IANA database edge cases)
- Nudge to offline user
- Manager leaves pod
- Cross-pod help disabled mid-conversation

---

## 🔄 Migration Plan

### Data Preservation
**Keep:**
- All user accounts
- Pod memberships
- Existing nudge notifications
- Basic profile info (department, bio, etc.)

**Transform:**
- `expertise_skills` → `knowledge_areas` (rename, keep data)
- `availability` → enhanced format with timezone

**Delete:**
- `expertise_levels`, `growth_levels` (no longer used)
- `compatibility_scores` table (entire table)
- `open_requests` table (entire table)

### Migration Script
```sql
-- Add new fields
ALTER TABLE profiles ADD COLUMN knowledge_areas text[];
ALTER TABLE profiles ADD COLUMN currently_available boolean DEFAULT false;
ALTER TABLE pods ADD COLUMN manager_id uuid;
ALTER TABLE pods ADD COLUMN allow_cross_pod_help boolean DEFAULT false;

-- Migrate data
UPDATE profiles SET knowledge_areas = expertise_skills WHERE expertise_skills IS NOT NULL;
UPDATE pods SET manager_id = created_by;

-- Remove old fields
ALTER TABLE profiles DROP COLUMN expertise_levels;
ALTER TABLE profiles DROP COLUMN growth_levels;
ALTER TABLE profiles DROP COLUMN strengths;
ALTER TABLE profiles DROP COLUMN study_style;
ALTER TABLE profiles DROP COLUMN study_time_preference;
ALTER TABLE profiles DROP COLUMN academic_goal;
ALTER TABLE profiles DROP COLUMN location_preference;
ALTER TABLE profiles DROP COLUMN collaboration_preference;
ALTER TABLE profiles DROP COLUMN current_projects;
ALTER TABLE profiles DROP COLUMN reliability;

-- Drop tables
DROP TABLE compatibility_scores;
DROP TABLE open_requests;
```

---

## 🔮 Future Enhancements (Post-Launch)

### V2 Features
- **Calendar Integration**: Sync with Google Calendar for auto-availability
- **AI Suggestions**: "Based on your question, ask Sarah or Tom"
- **Analytics Dashboard**: Team health metrics, response times
- **Mobile App**: Native availability updates
- **Zapier Integration**: Connect to other tools

### V3 Features
- **Video Call Integration**: One-click Zoom/Meet links
- **Knowledge Base**: FAQ built from common nudges
- **Team OKRs**: Track how knowledge sharing supports goals

---

## 📚 References

- [IANA Timezone Database](https://www.iana.org/time-zones)
- [Slack Webhook API](https://api.slack.com/messaging/webhooks)
- [Next.js SEO Best Practices](https://nextjs.org/learn/seo/introduction-to-seo)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🔄 Revision History

| Version | Date       | Changes                                    |
|---------|------------|--------------------------------------------|
| 1.0     | 2025-12-19 | Initial spec for Meshflow revamp          |

---

## 💡 Key Principles

1. **Availability First** - Everything starts with "when are people free?"
2. **Lightweight Tags** - Not skills, just "I know X" (informal, searchable)
3. **Manager Controlled** - One pod per team, prevents chaos
4. **Slack Native** - Don't replace, enhance
5. **No Gamification** - No scores, no levels, no competition
6. **Time Zone Aware** - Automatic conversion, visual clarity
7. **Mobile First** - Support teams on phones need this
8. **Fast** - < 5 seconds to send a nudge with context

---

**This spec supersedes all previous specs regarding matching algorithms, skills databases, and compatibility scoring. The new north star is: "Who can help me, and when are they free?"**
