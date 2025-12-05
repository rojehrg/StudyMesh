# Spec 006 — Slack Integration, Smart Help Requests, Skill Proficiency, Nudge History, Animated Blobs

## Goals
- Add Slack integration for nudges and quick messaging.
- Capture unmet help requests and notify when a matching expert joins.
- Add per-skill proficiency levels with circular progress UI.
- Give users visibility into nudges they sent (nudge history).
- Make landing page blobs subtly animate for a live feel and harmonize spacing.

## Scope & Requirements
### Slack Integration (MVP)
- Store per-user Slack handle/ID in profile.
- Optional outgoing webhook: when a user nudges someone and the recipient has a Slack handle **and** `SLACK_WEBHOOK_URL` is set, post a Slack message.
- Add “Message on Slack” CTA when viewing a member with a Slack handle (opens Slack deep link).
- Do not block core flow if Slack is not configured.

### Unmet Help Requests (“Open Requests”)
- If a user cannot find someone for a skill, allow saving an “open request” (skill, requester).
- When another user with matching expertise sees open requests, they can notify the requester (creates in-app notification and can optionally mark request as notified/closed).
- Store requests in DB so they persist across sessions.

### Skill Proficiency
- Add per-skill proficiency (0–100) for expertise and growth skills.
- UI: circular ring or slider to set proficiency; show ring in skill chips/cards.
- Persist in profile; default mid-range (e.g., 60) when added.

### Nudge History
- In Notifications (renamed “Nudges & Notifications”), show:
  - Received nudges
  - Sent nudges (who you nudged, topic, status/read)
- Keep existing notifications behavior.

### Animated Blobs & Harmony
- Blobs: slow glide/scale animation, subtle, low opacity.
- Keep grid static; ensure spacing/padding harmony across landing sections.

## Data Model Changes
- `profiles`
  - `slack_handle` (text, nullable)
  - `expertise_levels` (jsonb, default `{}`) — map skill -> proficiency (0–100)
  - `growth_levels` (jsonb, default `{}`) — map skill -> proficiency (0–100)
- New table `open_requests`
  - `id` uuid pk
  - `user_id` uuid not null
  - `skill` text not null
  - `status` text default `open` (`open`, `notified`, `closed`)
  - `created_at` timestamp default now

## UX / UI
- Settings > Skills tab:
  - Each expertise/growth skill shows a circular ring with percentage and a slider to adjust.
  - Input to add Slack handle; validate `@` optional.
- Pods / Working Circles member list:
  - If member has Slack handle, show “Message on Slack” (deep link).
  - Nudge dialog unchanged; after send, if Slack is configured and recipient has handle, fire webhook.
- Nudge history:
  - Notifications page: tabs “Received” / “Sent”. Show topic, type, time, read status.
- Open Requests:
  - On Working Circles: if no matches, show “Save help request” (skill input).
  - List of requests you created; list of requests you can help with, with “Notify requester” button.
- Landing page:
  - Blobs animate slowly (translate + scale). Grid can remain static.

## Integration Details
- Slack webhook route: `POST /api/slack/nudge`
  - Env: `SLACK_WEBHOOK_URL`
  - Payload: recipientSlackHandle, senderName, topic, podCode (optional)
  - No-op if env not set.
- Slack deep link:
  - If handle looks like ID (starts with `U`/`W`), link: `https://slack.com/app_redirect?channel={handle}`
  - Else if username (e.g., `@alice`), show copyable handle and instructions.

## Acceptance Criteria
- Users can add Slack handle in Settings; persists.
- Nudge with recipient Slack handle + webhook configured sends Slack message (or gracefully no-ops if not configured).
- Users can save an open request when no match; others with matching expertise can notify requester, creating an in-app notification.
- Skill proficiency ring shows and saves per skill; defaults mid (e.g., 60).
- Notifications page shows both sent and received nudges.
- Landing page blobs visibly move/scale slowly.

## Out of Scope (for now)
- Full Slack OAuth / DM API.
- Automatic background matching on user join (manual notify via UI instead).

## Rollout / Config
- New env (optional): `SLACK_WEBHOOK_URL`
- DB migration required (already generated via drizzle).
- If Slack not configured, all Slack-dependent steps are skipped silently.


