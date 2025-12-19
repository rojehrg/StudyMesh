# Meshflow Testing Guide - Spec 007 Implementation

This guide covers testing for the new scheduling, availability, and meeting features implemented in Spec 007.

## Prerequisites

Before testing, ensure you have the following environment variables set in `.env.local`:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url

# Optional (for notifications)
SLACK_WEBHOOK_URL=your_slack_webhook_url  # For Slack notifications
RESEND_API_KEY=your_resend_api_key        # For email notifications
RESEND_FROM_EMAIL=notifications@yourdomain.com  # Email sender
NEXT_PUBLIC_APP_URL=http://localhost:3000  # App URL for email links
```

## 1. Database Migration

First, ensure the database schema is up to date:

```bash
# Start the dev server
npm run dev

# Run the migration (in another terminal)
curl -X POST http://localhost:3000/api/admin/migrate
```

Expected response:
```json
{
  "success": true,
  "message": "Migration completed successfully",
  "tables": ["availability_schedules", "scheduled_meetings", "meeting_participants"],
  "profileUpdates": ["timezone", "email", "email_notifications", "removed looking_to_help"]
}
```

## 2. Availability System

### 2.1 Set Your Availability

1. Navigate to **Settings** > **Availability** tab
2. Select your timezone from the dropdown
3. Click "Add Weekday 9-5" for quick setup, or "Add Custom Slot" for granular control
4. For each slot, you can:
   - Select the day of the week
   - Set start and end times
   - Add an optional label (e.g., "Deep work", "Office hours")
5. Verify the "Weekly Overview" grid updates to show your availability
6. Changes auto-save after 1.5 seconds

### 2.2 Verify Persistence

1. Refresh the page
2. Return to Settings > Availability
3. Confirm your saved slots appear correctly

## 3. Group Nudges & Meeting Scheduling

### 3.1 Schedule a Meeting

1. Navigate to **Meetings** page (via sidebar or press `M`)
2. Click "Schedule Meeting"
3. **Step 1 - Select Participants:**
   - Choose a Pod from the dropdown
   - Select one or more participants using checkboxes
   - Click "Next"
4. **Step 2 - Choose Time:**
   - Select meeting duration (15-120 minutes)
   - View available overlapping time slots
   - Click a time slot to select it
   - Click "Next"
5. **Step 3 - Add Details:**
   - Enter meeting title (required)
   - Add description (optional)
   - Add meeting link for Zoom/Google Meet (optional)
   - Review the summary
   - Click "Schedule Meeting"

### 3.2 Verify Notifications

After scheduling a meeting:

1. **In-App:** Check the notifications bell icon - participants should see a meeting invite
2. **Slack (if configured):** Participants with Slack handles should receive a Slack message
3. **Email (if configured):** Participants with email notifications enabled should receive an email

### 3.3 RSVP to Meetings

1. As a participant, go to the Meetings page
2. Find a pending meeting invite
3. Click the checkmark (✓) to accept or X to decline
4. Verify the organizer receives an in-app notification about your RSVP

## 4. Testing Slack Integration

### 4.1 Configure Slack Webhook

1. Go to your Slack workspace settings
2. Create an Incoming Webhook for a channel
3. Copy the webhook URL
4. Add to `.env.local`: `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...`
5. Restart the dev server

### 4.2 Test Slack Notifications

1. Add your Slack handle in Settings > Profile
2. Have someone schedule a meeting with you
3. Verify you receive a Slack message with:
   - Meeting title
   - Organizer name
   - Date/time
   - Duration
   - Meeting link (if provided)

### 4.3 Manual Slack Test

```bash
curl -X POST http://localhost:3000/api/slack/nudge \
  -H "Content-Type: application/json" \
  -d '{
    "recipientSlackHandle": "@your-slack-handle",
    "senderName": "Test User",
    "topic": "Test Meeting",
    "nudgeType": "ask"
  }'
```

## 5. Testing Email Notifications

### 5.1 Configure Resend

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxx
   RESEND_FROM_EMAIL=notifications@yourdomain.com
   ```
4. Restart the dev server

### 5.2 Test Email Notifications

1. Go to Settings > Notifications
2. Add your email address
3. Enable "Email Notifications"
4. Have someone schedule a meeting with you
5. Check your inbox for:
   - Professional HTML email
   - Meeting details
   - "Join Meeting" button (if link provided)
   - Link back to Meshflow

## 6. UI/UX Testing

### 6.1 Dark Mode

1. Click the theme toggle in the header
2. Select "Dark" mode
3. Verify all components render correctly:
   - Cards have proper contrast
   - Text is readable
   - Inputs have appropriate backgrounds
   - No "weird borders" anywhere

### 6.2 Light Mode

1. Switch back to "Light" mode
2. Verify the same components

### 6.3 System Preference

1. Set theme to "System"
2. Toggle your OS dark/light mode
3. Verify Meshflow follows the system preference

### 6.4 Keyboard Shortcuts

Test the following shortcuts:

| Shortcut | Action |
|----------|--------|
| `D` | Go to Dashboard |
| `P` | Go to Pods |
| `M` | Go to Meetings |
| `S` | Go to Settings |
| `N` | Create new Pod |
| `J` | Join a Pod |
| `Shift + ?` | Show shortcuts help |

### 6.5 Mobile Responsiveness

1. Open Chrome DevTools (F12)
2. Toggle device toolbar
3. Test on iPhone SE, iPhone 12, iPad
4. Verify:
   - Text is readable (responsive font sizes)
   - Sidebar collapses on mobile
   - Buttons are tappable
   - Forms are usable

## 7. "Open to Help" Removal Verification

Verify the "Looking to Help" / "Open to Help" toggle has been completely removed:

1. ✅ Not in sidebar
2. ✅ Not in Settings page
3. ✅ Not affecting matching scores
4. ✅ Database column removed

## 8. Availability Overlap API

### Test the overlap endpoint:

```bash
curl -X POST http://localhost:3000/api/availability/overlap \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "userIds": ["user-uuid-1", "user-uuid-2"],
    "durationMinutes": 30
  }'
```

Expected response:
```json
{
  "success": true,
  "userIds": ["..."],
  "durationMinutes": 30,
  "overlap": {
    "1": { "slots": [{ "start": "09:00", "end": "12:00" }] },
    "2": { "slots": [] },
    ...
  }
}
```

## 9. End-to-End Scenario

### Complete Flow Test:

1. **User A** sets availability: Mon-Fri, 9am-5pm
2. **User B** sets availability: Mon-Wed, 10am-3pm
3. **User A** creates a meeting with User B
4. System shows overlapping times: Mon-Wed, 10am-3pm
5. **User A** schedules for Tuesday at 10am, 30 minutes
6. **User B** receives:
   - In-app notification ✓
   - Slack message (if configured) ✓
   - Email (if configured) ✓
7. **User B** accepts the meeting
8. **User A** receives RSVP notification
9. Both see the meeting in their Meetings page

## 10. Troubleshooting

### Notifications not sending?

1. Check environment variables are set
2. Verify user has Slack handle / email configured
3. Check server logs for errors
4. Test webhook/API credentials independently

### Availability not saving?

1. Check browser console for errors
2. Verify RLS policies in Supabase
3. Ensure user is authenticated

### Meetings page empty?

1. Verify migration ran successfully
2. Check database tables exist
3. Verify user authentication

## Environment Variables Summary

```bash
# Core (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=

# Slack (Optional)
SLACK_WEBHOOK_URL=

# Email (Optional)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
