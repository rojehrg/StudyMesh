# Attunly Test Script v2
## Testing All Recent Fixes

Use this script with Claude Chrome extension for dual-account testing.

---

## Prerequisites
- Two test accounts (Alex & Jordan from previous tests, or create new ones)
- Pod code: Use existing or create new pod
- Both accounts should have completed onboarding

---

## Test 1: Meeting Scheduling Overlap Detection (Critical Fix)

### Setup
1. **Alex's Account**: Go to Settings > Availability
   - Use preset dropdown: Select "9-5 Mon-Fri"
   - Save changes

2. **Jordan's Account**: Go to Settings > Availability
   - Use preset dropdown: Select "10-6 Mon-Fri"
   - Save changes

### Test Steps
1. From Alex's account, go to the pod page
2. Click "Schedule Meeting" button
3. Select Jordan as participant
4. Click Next to Step 2

### Expected Results
- Should show overlapping time slots (10:30am-5pm on Mon-Fri)
- Previously showed "No overlapping availability found" - should now work
- Time slots should be clickable buttons

---

## Test 2: Manual Meeting Time Option

### Test A: When Overlap Exists
1. In meeting scheduler Step 2, click "Or pick a different time"
2. Manual time picker should appear
3. Select any day and time manually
4. Should be able to proceed with manual selection

### Test B: When No Overlap Exists
1. Have one user clear their availability (Settings > Availability > Clear All)
2. Try to schedule meeting
3. Should show "No overlapping availability found"
4. Below that, should show manual time picker with Day dropdown and Time input
5. Select day and time, proceed to Step 3

### Expected Results
- Manual time picker works in both scenarios
- Can bypass overlap detection when needed

---

## Test 3: Nudge Accept/Decline Buttons

### Setup
1. From Alex's account, send a nudge to Jordan
   - Go to pod page > Click on Jordan > Send Nudge

### Test Steps (Jordan's Account)
1. Go to Notifications page
2. Find the nudge from Alex

### Expected Results
- Nudge card should show two buttons:
  - "Accept & Schedule" (primary button with calendar icon)
  - "Not Now" (outline button)
- Clicking "Accept & Schedule" should:
  - Mark nudge as accepted
  - Navigate to pod page
  - Send notification to Alex
- Clicking "Not Now" should:
  - Mark nudge as declined
  - Send polite decline notification to Alex
- After responding, nudge should show "Accepted" or "Declined" badge

### Verify Response Notification (Alex's Account)
1. Go to Notifications page
2. Should see "Nudge Accepted!" or "Nudge Response" notification
3. Content should mention Jordan's response

---

## Test 4: Looking to Help Toggle on Dashboard

### Test Steps
1. Go to Dashboard
2. Look at the header area (next to "Welcome back, [Name]!")

### Expected Results
- Should see a toggle switch labeled "Looking to help" or "Not looking to help"
- Toggle should have hand-helping icon
- When ON: Purple/accent colored background
- When OFF: Muted/gray background
- Clicking toggle should:
  - Update instantly
  - Show toast confirmation
  - Persist after page refresh

### Verify Effect
1. Toggle ON for Alex
2. From Jordan's account, check dashboard "Looking to Help" stat
3. Count should include Alex

---

## Test 5: Availability Presets Dropdown

### Test Steps
1. Go to Settings > Availability section
2. Look for "Quick presets..." dropdown

### Expected Results
Dropdown should show these options:
- 9-5 Mon-Fri
- 10-6 Mon-Fri
- 8-4 Mon-Fri
- Mornings (6am-12pm)
- Evenings (6-10pm)
- Weekends only
- Flexible (10am-8pm daily)

### Verify Each Preset
1. Select "10-6 Mon-Fri" - grid should fill Mon-Fri 10am-6pm
2. Select "Evenings" - grid should fill Mon-Fri 6pm-10pm
3. Select "Weekends only" - grid should fill Sat-Sun 10am-6pm
4. Select "Flexible" - grid should fill all days 10am-8pm
5. Click "Clear All" - grid should be empty

---

## Test 6: Member Names in Pod View

### Test Steps
1. Go to any pod page with multiple members
2. Look at the member cards in "Pod Members" section

### Expected Results
- Each member should show their **actual name** (first + last name)
- NOT just their job title/major
- Below the name, should show: "Role • Department" format
- Example:
  - Name: "Alex Johnson"
  - Subtitle: "Sales Lead • Sales"
- If no role: just show department
- If no department: just show role
- If neither: show "Team Member"

### Available Now Section
- Members shown as "Available Now" should also display real names
- Not generic "Team Member" or just role

---

---

## Test 7: Live Realtime Nudge Notifications

### Prerequisites
**IMPORTANT**: Supabase realtime must be enabled for the `notifications` table:
1. Go to Supabase Dashboard > Database > Replication
2. Enable replication for `notifications` table
3. Or run: `ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`

### Test Steps
1. Open TWO browser windows side by side
   - Window 1: Alex logged in, on Dashboard
   - Window 2: Jordan logged in, on Pod page

2. From Jordan's window, send a nudge to Alex
   - Click on Alex's card > Send Nudge

3. Watch Alex's window (DO NOT REFRESH)

### Expected Results
- Toast notification should appear in Alex's window within 1-2 seconds
- Toast should say "Someone needs your help!" or "Someone offered to help!"
- Bell icon in header should update with new count
- No page refresh needed

### If Not Working
Check browser console (F12) for:
- `[Realtime] Subscription status: SUBSCRIBED` - means connection is good
- `[Realtime] New notification received:` - means notification came through
- Any errors about realtime or websocket

### Common Issues
1. **Realtime not enabled**: Enable in Supabase Dashboard
2. **RLS blocking**: Check Row Level Security policies
3. **Not subscribed**: Check console for subscription status

---

## Quick Checklist

| Test | Status |
|------|--------|
| Overlap detection shows times | [ ] |
| Manual time picker works | [ ] |
| Nudge accept button works | [ ] |
| Nudge decline button works | [ ] |
| Response notification sent | [ ] |
| Looking to Help toggle visible on dashboard | [ ] |
| Toggle persists after refresh | [ ] |
| All 7 availability presets work | [ ] |
| Member names shown (not roles) | [ ] |
| Role/dept shown as subtitle | [ ] |
| Realtime nudge toast appears (no refresh) | [ ] |
| Bell icon count updates live | [ ] |

---

## Regression Tests

Also verify these still work:
- [ ] Login/logout flow
- [ ] Onboarding flow (new account)
- [ ] Creating a pod
- [ ] Joining a pod
- [ ] Sending nudges
- [ ] Meeting notifications
- [ ] Currently Available toggle in settings

---

## Notes for Tester

- If any test fails, note the exact error message
- Check browser console for JavaScript errors
- Take screenshots of any issues
- Note which account was being used when issue occurred
