# Attunly Product Roadmap

## Vision

Attunly tracks attention, not just tasks. We help distributed teams understand what's happening (not just what's done) by providing visibility into human state: acknowledgment, blocked status, and intent.

**Core Positioning:**
- vs Jira: "Jira tracks issues. Attunly tracks attention."
- vs Linear: "Linear moves fast. Attunly keeps you informed."
- vs Slack: "Slack shows presence. Attunly shows progress."

---

## Current Release

### Momentum Locks Core
- Lock creation from Slack (`/attunly lock`)
- Three-button status system: Start / Blocked / Done
- Timezone-aware wake-up delivery
- Multi-level escalation chains
- Thread context inference

---

## Q1 2026: Supernatural Features

### Now (Implemented)

#### Timezone Awareness Context
- Display owner's local time in lock messages
- Show timezone gap ("8 hours ahead")
- Reframe silence as geography, not neglect

#### Proactive Deadline Alert
- Notify requester at 75% elapsed time if not started
- Include owner's sleep/working context
- Provide escalation option

### Next

#### EOD Handoff Summary
- End-of-day prompt to update lock status
- "Your day is ending. 2 locks in 'Started'—update status?"
- Creates healthy async handoff ritual

#### Context Decay Warning
- Gentle check-in when lock stale for 24+ hours
- Non-intrusive reminder to update status
- Maintains trust in status system

#### Pre-Blocker Signal
- Owner can signal "might be blocked soon"
- Gives requester early warning
- Enables proactive problem-solving

---

## Q2 2026: Coordination Intelligence

### Working Hours Overlap
- Show shared working hours when creating locks
- Suggest async approach when overlap < 2 hours
- Help set realistic expectations

### Smart Deadline Suggestions
- Learn from historical completion patterns
- Suggest deadlines based on owner's timezone
- Factor in request complexity

### Silence Explainer
- Contextual explanation for delays
- "Sarah typically responds at 9am their time"
- Non-judgmental, pattern-based

---

## Q3 2026: Team Insights

### Attention Heatmap
- Visualization of team activity patterns
- Privacy-respecting aggregated view
- Helps with scheduling decisions

### Handoff Report
- Weekly async coordination health digest
- Average acknowledgment times
- Timezone gap impact analysis

### Cross-Team Coordination
- Support for multi-team lock routing
- Department-aware escalation chains
- Lingo translation for cross-functional requests

---

## Feature Tiers

### Tier 1: Must Have (High Impact, Low Effort)
| Feature | Status | Impact |
|---------|--------|--------|
| Timezone Awareness Context | Done | Reduces anxiety, explains silence |
| Proactive Deadline Alert | Done | Prevents surprise at deadline |

### Tier 2: Should Have (High Impact, Medium Effort)
| Feature | Status | Impact |
|---------|--------|--------|
| EOD Handoff Summary | Planned | Creates closure ritual |
| Context Decay Warning | Planned | Prevents stale confusion |
| Pre-Blocker Signal | Planned | Proactive communication |

### Tier 3: Nice to Have (Medium Impact, Higher Effort)
| Feature | Status | Impact |
|---------|--------|--------|
| Working Hours Overlap | Planned | Realistic deadline setting |
| Smart Deadline Suggestions | Planned | Calibrates expectations |
| Attention Heatmap | Planned | Team pattern visibility |
| Silence Explainer | Planned | Context for delays |
| Handoff Report | Planned | Coordination health metrics |

---

## Research Insights

### Key Statistics
- 1-hour timezone gap reduces collaboration by 37%
- 35% feel ignored when message read but not responded to
- 50% of managers don't trust remote visibility

### User Pain Points
1. Silence anxiety across timezones
2. No visibility into "working on it" state
3. Escalation feels aggressive
4. Follow-ups feel like nagging
5. Can't plan when waiting on others

### Design Principles
1. **Anticipate, don't surveil** - Show context, not surveillance
2. **Explain, don't blame** - Reframe silence as circumstance
3. **Suggest, don't push** - Proactive but not nagging
4. **Calm over clever** - Simple explanations, no complexity

---

## Metrics

### North Star
**Send Rate** = Locks Sent / Modals Opened
Measures: Confidence in the system

### Supporting Metrics
- Time to acknowledgment
- % locks completed on time
- Escalation rate
- Follow-up message reduction

---

## Dependencies

### Technical
- Timezone data accuracy
- Slack API rate limits
- Cron job reliability

### Product
- User timezone settings completion
- Escalation chain configuration
- Working hours configuration

---

*Last updated: January 2026*
