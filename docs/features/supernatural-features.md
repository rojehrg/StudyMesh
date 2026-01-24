# Supernatural Features Specification

Features that anticipate user needs before they articulate them. These features reframe the async coordination problem from "people not responding" to "understanding human context."

---

## Tier 1: Must Have (High Impact, Low Effort)

### 1. Timezone Awareness Context

**Status:** Implemented

**Description:**
When viewing a lock, show the owner's current local time to reframe silence as geography, not neglect.

**Display Format:**
- In lock messages: "Sarah (11:47pm their time)"
- Timezone gap: "They are 8 hours ahead of you"

**Acceptance Criteria:**
- [ ] Lock messages display owner's local time
- [ ] Timezone gap shown when requester and owner differ
- [ ] Time updates on message view/refresh
- [ ] Graceful fallback when timezone unknown

**Why It Matters:**
- Reduces anxiety by explaining silence
- Prevents unnecessary follow-ups during off-hours
- Research: "1-hour timezone gap reduces collaboration by 37%"

---

### 2. Proactive Deadline Alert

**Status:** Implemented

**Description:**
At 75% elapsed time, if lock hasn't started, notify requester with a heads-up (not an alarm).

**Trigger Conditions:**
- Lock status is still "active" (not started)
- 75% or more of deadline time has elapsed
- Alert not yet sent for this lock

**Message Format:**
```
*Proactive Update*

Your request to @owner hasn't started yet.
"[required outcome]"

*X hours* until deadline | Their time: 11:47pm (likely sleeping)

This is a heads-up, not an alarm. The owner may be working on something before they update status.

[Escalate Now] [Dismiss]
```

**Acceptance Criteria:**
- [ ] Alert sent at 75% elapsed time
- [ ] Only sent once per lock
- [ ] Includes owner's timezone context
- [ ] Includes sleep/working hours indicator
- [ ] Escalate button triggers manual escalation
- [ ] Dismiss button silences future alerts

**Why It Matters:**
- Prevents surprise at deadline
- Gives requester time to adjust or escalate
- Research: "50% of managers don't trust remote visibility"

---

## Tier 2: Should Have (High Impact, Medium Effort)

### 3. EOD Handoff Summary

**Status:** Planned

**Description:**
At end of day (based on user's timezone), prompt to update status on active locks before signing off.

**Trigger:**
- 30 minutes before configured end of working hours
- User has 1+ locks in "Started" status that haven't been updated

**Message Format:**
```
*Your day is ending*

You have 2 locks in "Started" status:
- "Send API spec to Marcus" (due tomorrow)
- "Review Dana's PR" (due in 3 days)

Update status before you sign off?

[Update All] [Skip Today]
```

**Acceptance Criteria:**
- [ ] Triggers at configurable time (default: 5:30pm local)
- [ ] Only shows locks in Started status
- [ ] Quick-update flow for multiple locks
- [ ] Can snooze/skip
- [ ] Respects user's working hours config

**Why It Matters:**
- Creates closure ritual for async workers
- Prevents overnight anxiety for requesters
- Establishes healthy handoff habits

---

### 4. Context Decay Warning

**Status:** Planned

**Description:**
When a lock has been in "Started" status for 24+ hours without update, gently prompt owner for a status check.

**Trigger:**
- Lock in "Started" status
- 24+ hours since last status update
- No activity in thread

**Message Format:**
```
*Gentle check-in*

This lock has been "Started" for 24 hours:
"[required outcome]"

Still working on it? A quick update helps @requester plan their day.

[Still Working] [I'm Blocked] [Done]
```

**Acceptance Criteria:**
- [ ] 24-hour threshold (configurable)
- [ ] Non-intrusive tone
- [ ] Quick status update options
- [ ] Doesn't spam - max 1 per day

**Why It Matters:**
- Prevents stale confusion
- Maintains trust in the status system
- Research: "35% feel ignored when message read but not responded to"

---

### 5. Pre-Blocker Signal

**Status:** Planned

**Description:**
Allow owner to signal "I'm about to be blocked" before it happens - a gift to overloaded people.

**User Flow:**
1. Owner clicks "Might Be Blocked Soon" on lock
2. Provides optional context
3. Requester gets heads-up
4. Requester can offer help or adjust timeline

**Message to Requester:**
```
*Heads up from @owner*

They might be blocked soon on your request:
"[required outcome]"

Reason: "Waiting on response from legal team"

[Offer to Help] [Extend Deadline] [Acknowledge]
```

**Acceptance Criteria:**
- [ ] Pre-blocker button on lock UI
- [ ] Optional reason field
- [ ] Requester notification
- [ ] Response options for requester
- [ ] Track resolution in event log

**Why It Matters:**
- Proactive beats reactive
- Reduces escalation anxiety
- Builds trust through transparency

---

## Tier 3: Nice to Have (Medium Impact, Higher Effort)

### 6. Working Hours Overlap Calculator

**Status:** Planned

**Description:**
Show overlapping working hours between requester and owner to help set realistic deadlines.

**Display:**
```
Working hours overlap with @sarah:
You: 9am-5pm PT
Sarah: 9am-5pm GMT (5pm-1am your time)
Overlap: 5pm-5pm (0 hours)

Consider async-first communication.
```

**Acceptance Criteria:**
- [ ] Calculate overlap from user timezone settings
- [ ] Show in modal when creating lock
- [ ] Suggest async approach when overlap < 2 hours
- [ ] Factor in weekend/holiday schedules

---

### 7. Smart Deadline Suggestions

**Status:** Planned

**Description:**
Based on owner's timezone and typical response patterns, suggest realistic deadlines.

**Suggestions:**
```
Suggested deadlines for @sarah:
- End of their day (6pm GMT = 10am your time tomorrow)
- Tomorrow morning (9am GMT = 1am your time)
- 48 hours (recommended for complex asks)
```

**Acceptance Criteria:**
- [ ] Learn from historical lock completion times
- [ ] Factor in owner's timezone
- [ ] Consider complexity of request
- [ ] Show in lock creation modal

---

### 8. Attention Heatmap

**Status:** Planned

**Description:**
Dashboard visualization showing when team members are typically active and responsive.

**Display:**
Grid heatmap showing:
- Hours of day (x-axis)
- Team members (y-axis)
- Color intensity = response activity

**Acceptance Criteria:**
- [ ] Privacy-respecting (aggregated, not surveillance)
- [ ] Opt-in per user
- [ ] Historical data (last 30 days)
- [ ] Timezone-normalized view

---

### 9. Silence Explainer

**Status:** Planned

**Description:**
When viewing a lock that hasn't been started, show contextual explanation for the delay.

**Examples:**
- "Sarah typically responds between 9am-10am their time (in 3 hours)"
- "Sarah has 4 other active locks - she may be prioritizing"
- "Sarah's timezone suggests she's currently sleeping"

**Acceptance Criteria:**
- [ ] Non-judgmental tone
- [ ] Based on observable patterns
- [ ] Updates in real-time
- [ ] Privacy-respecting

---

### 10. Handoff Report

**Status:** Planned

**Description:**
Weekly summary showing async coordination health across the team.

**Metrics:**
- Average acknowledgment time
- % of locks completed on time
- Most common blockers
- Timezone gap impact

**Acceptance Criteria:**
- [ ] Weekly email digest
- [ ] Team-level aggregates
- [ ] Trend indicators
- [ ] Actionable recommendations

---

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Timezone Awareness | High | Low | Tier 1 |
| Proactive Deadline Alert | High | Low | Tier 1 |
| EOD Handoff Summary | High | Medium | Tier 2 |
| Context Decay Warning | Medium | Low | Tier 2 |
| Pre-Blocker Signal | High | Medium | Tier 2 |
| Working Hours Overlap | Medium | Medium | Tier 3 |
| Smart Deadline Suggestions | Medium | High | Tier 3 |
| Attention Heatmap | Low | High | Tier 3 |
| Silence Explainer | Medium | Medium | Tier 3 |
| Handoff Report | Medium | Medium | Tier 3 |

---

## Design Principles

1. **Anticipate, don't surveil** - Show context, not surveillance
2. **Explain, don't blame** - Reframe silence as circumstance
3. **Suggest, don't push** - Proactive but not nagging
4. **Calm over clever** - Simple explanations, no complexity

---

*Last updated: January 2026*
