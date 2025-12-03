# Spec 004: Core Features Implementation

**Status**: In Progress  
**Author**: AI Assistant  
**Created**: 2025-12-03  
**Last Updated**: 2025-12-03

---

## 📋 Overview

Complete implementation of all core Meshflow features: Pods management, Working Circles, Settings, and Notifications system. This spec covers the full user journey from onboarding to daily usage.

---

## 🎯 Goals

1. **Pods System**: Create, join, view, and manage enablement pods
2. **Working Circles**: Intelligent matching algorithm in action with real-time recommendations
3. **Settings Page**: User profile management and preferences
4. **Notifications**: Real-time nudging and matching notifications
5. **Database Integration**: Full Drizzle ORM implementation with Supabase

---

## 🗂️ Database Schema

### Tables (Already Defined in `src/lib/db/schema/index.ts`)

```typescript
profiles {
  id: uuid (PK)
  userId: uuid (FK to Supabase Auth)
  department: text
  major: text (job title)
  bio: text
  expertiseSkills: text[]
  growthSkills: text[]
  availability: jsonb
  preferredGroupSize: integer
  createdAt: timestamp
  updatedAt: timestamp
}

pods {
  id: uuid (PK)
  podCode: text (unique)
  podName: text
  businessUnit: text
  initiativeOwner: text
  term: text
  createdBy: uuid
  createdAt: timestamp
}

podMembers {
  id: uuid (PK)
  podId: uuid (FK to pods)
  userId: uuid (FK to Supabase Auth)
  joinedAt: timestamp
}

compatibilityScores {
  id: uuid (PK)
  podId: uuid (FK to pods)
  userAId: uuid
  userBId: uuid
  score: integer
  scoreBreakdown: jsonb
  createdAt: timestamp
}

notifications {
  id: uuid (PK)
  recipientId: uuid
  senderId: uuid
  type: text ('nudge', 'match', 'system')
  content: text
  metadata: jsonb (NEW - for context data)
  read: boolean
  createdAt: timestamp
}
```

---

## 📄 Pages to Build

### 1. **Pods List** (`/classes`)
- Show all pods user is a member of
- Quick stats: member count, last activity
- Search and filter
- Empty state with CTA

### 2. **Create Pod** (`/classes/create`)
- Form: Pod name, business unit, initiative owner, term
- Auto-generate unique pod code
- Redirect to pod detail after creation

### 3. **Join Pod** (`/classes/join`)
- Input pod code
- Validate and join
- Show pod preview before joining

### 4. **Pod Detail** (`/classes/[podCode]`)
- **Overview Tab**: Pod info, members list
- **Matches Tab**: Compatibility scores with match reasons
- **Team Network Tab**: Visual graph of connections
- **Nudge Action**: Send nudge to matched member

### 5. **Working Circles** (`/groups`)
- Show all potential matches across all pods
- Filter by skill, availability
- Initiate nudges

### 6. **Settings** (`/settings`)
- **Profile Section**: Edit name, bio, department, job title
- **Skills Section**: Manage expertise and growth skills
- **Availability Section**: Set availability windows
- **Preferences Section**: Preferred group size, collaboration style

### 7. **Notifications** (`/notifications`) - Already Created, Now Enhance
- List all notifications (nudges, matches)
- Mark as read
- Click to view context (e.g., go to pod, see profile)

---

## 🔧 Core Logic

### Matching Algorithm (`src/lib/logic/matching.ts` - Already Exists)

**Fuzzy Matching:**
```typescript
import { compareTwoStrings } from 'string-similarity';

function areSkillsSimilar(skill1: string, skill2: string): boolean {
  const similarity = compareTwoStrings(
    skill1.toLowerCase().trim(),
    skill2.toLowerCase().trim()
  );
  return similarity >= 0.7; // 70% similarity threshold
}
```

**Match Calculation:**
1. Compare User A's expertise with User B's growth goals
2. Compare User B's expertise with User A's growth goals
3. Score based on overlap count and fuzzy matching
4. Return structured breakdown: `{ skills: { a_to_b: [], b_to_a: [] }, score: 85 }`

**Calculate for all members in a pod, store in `compatibilityScores` table**

### Nudge System

**Flow:**
1. User A views their matches in a pod
2. Clicks "Nudge" on User B with topic selection (e.g., "Python")
3. Create notification:
   ```typescript
   {
     recipientId: userB.id,
     senderId: userA.id,
     type: 'nudge',
     content: 'Alice wants your help with Python',
     metadata: { topic: 'Python', podId: 'xyz' },
     read: false
   }
   ```
4. User B sees notification, can respond

---

## 🎨 UI/UX Patterns

### Component Library
- Use existing Shadcn UI components
- Teal color scheme (`bg-teal-600`, `text-teal-700`)
- Framer Motion for page transitions
- Rounded corners (`rounded-xl`, `rounded-2xl`)

### Animations
- **Page Load**: Fade in + slide up
- **List Items**: Stagger children
- **Hover**: Lift effect (`hover-lift` class)
- **Actions**: Scale down on click (`active:scale-95`)

### Loading States
- Skeleton loaders for data fetching
- Spinner for actions
- Optimistic UI updates where possible

---

## 🚀 Implementation Order

### Phase 1: Settings Page
- Profile editing
- Skills management
- Form validation and save

### Phase 2: Pods System
- Create pod flow
- Join pod flow
- Pods list page
- Pod detail page (tabs)

### Phase 3: Matching Engine
- Run matching algorithm on pod join
- Store scores in database
- Display matches in pod detail

### Phase 4: Working Circles
- Cross-pod recommendations
- Global match view
- Filter and search

### Phase 5: Notifications System
- Nudge action
- Real-time notifications (polling for now)
- Mark as read
- Context navigation

---

## 📦 API Routes / Server Actions

All database operations use **Drizzle ORM** with **Supabase Auth** for user context.

### `/api/pods` (or Server Actions)
- `GET` - List user's pods
- `POST` - Create new pod
- `POST /join` - Join pod by code

### `/api/pods/[podId]/members`
- `GET` - List pod members with profiles

### `/api/pods/[podId]/matches`
- `GET` - Get compatibility scores for current user
- `POST /calculate` - Trigger match calculation

### `/api/notifications`
- `GET` - List user's notifications
- `POST` - Create nudge notification
- `PATCH /[id]/read` - Mark as read

### `/api/settings/profile`
- `GET` - Get current user profile
- `PATCH` - Update profile fields

---

## ✅ Acceptance Criteria

- [ ] User can create a pod and get a unique code
- [ ] User can join a pod using a code
- [ ] User sees all their pods on `/classes`
- [ ] Clicking a pod shows members and match recommendations
- [ ] Matching algorithm correctly identifies skill gaps
- [ ] User can nudge a matched member
- [ ] Nudged user receives a notification
- [ ] Notifications are clickable and mark as read
- [ ] Settings page allows full profile editing
- [ ] Working Circles shows cross-pod matches
- [ ] All data persists correctly in Supabase
- [ ] No data leakage between users
- [ ] All pages use teal color scheme
- [ ] All animations are smooth (60fps)

---

## 🧪 Testing Plan

1. **Create Pod**: Generate unique code, save to DB
2. **Join Pod**: Validate code, add user to `podMembers`
3. **Calculate Matches**: Run algorithm, verify scores
4. **Send Nudge**: Create notification, verify recipient sees it
5. **Update Profile**: Save changes, verify no data leakage
6. **Cross-User Test**: Create 2+ accounts, verify isolation

---

## 🔄 Future Enhancements (Out of Scope)

- Real-time notifications (WebSockets / Supabase Realtime)
- Direct messaging between users
- Calendar integration for availability
- Analytics dashboard
- Pod archives and history
- Export data

---

## 📚 References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Fuzzy String Matching](https://github.com/aceakash/string-similarity)

---

## 🔄 Revision History

| Version | Date       | Changes                           |
|---------|------------|-----------------------------------|
| 0.1     | 2025-12-03 | Initial spec for core features   |

