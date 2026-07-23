# Phase 6 — In-app Notifications

## Important correction from research

The user's earlier decision was "Socket.io from the start." Research into the actual web frontend found **the web app itself does not listen for `newNotification` over the socket at all** — `NotificationDropdown.jsx` and `NotificationsPage.jsx` are pure polling (`GET /notifications/get` every 30s in the dropdown, once on page load in the full page). The web app does maintain a socket connection app-wide (for chat/online-status), and the backend does emit `"newNotification"` on that socket — it's just that the web frontend never wired a listener for it. So:

- **To match web's exact behavior**: poll only.
- **To do real-time properly** (what the user asked for, going beyond web parity): add a `newNotification` listener on the same socket connection mobile will already need for chat (`MessagesPage.tsx`/`ChatPage.tsx` — check whether that already opens a socket; if not, this phase is the first to introduce one).

This spec builds both: poll as the reliable baseline (matches web, needed regardless since socket delivery isn't guaranteed while backgrounded), plus a live socket listener for instant updates while the app is foregrounded — this is additive, not a deviation from the ported logic.

## Backend contract (confirmed, no changes needed)

- `GET /api/notifications/get` (auth) → `Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(20)`. Returns a raw array, **max 20**, newest first. No pagination beyond that cap.
- `PUT /api/notifications/:id` (auth) → marks one as read. No body needed. **Note**: backend does not verify the notification belongs to the caller — don't rely on ownership being enforced server-side, just call it as web does.
- `PUT /api/notifications/mark-all` (auth) → `Notification.updateMany({ recipient: userId }, { isRead: true })`.
- Socket event server emits: `"newNotification"`, payload is (usually) the full `Notification` document — but note `sendBulkNotifications` (used for announcements/discussions/posts, i.e. anything with many recipients) emits a **partial** payload of only `{ message, type, link }` with no `_id`/`isRead`/`createdAt`. Handle both shapes defensively (if `_id` is missing, treat it as "a new notification exists" and re-fetch the list rather than trying to splice the partial object in directly).

### Notification document shape

```
{
  _id, recipient, sender (optional),
  message: string,
  type: "live-class" | "assignment" | "general" | "announcement" | "referral",
  link: string,        // route path, e.g. "/student/mycourses/:id"
  isRead: boolean,
  isEnded: boolean,     // true = show disabled "Meeting Ended" state instead of an action button
  createdAt: Date       // TTL: auto-deleted after 7 days server-side
}
```

## Socket connection (exact pattern to replicate from `web-frondend/src/App.jsx`)

Registration is **not** a `join`/`register` emit — the userId is passed as a query param at connect time, and the server maps it to `socket.id` purely from that:

```js
// web reference
const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
  query: { userId: user?._id || "" },
});
newSocket.on("getOnlineUsers", (usersIds) => setOnlineUser(usersIds));
newSocket.on("connect_error", (error) => console.error(error));
```

Server side (`backend/src/lib/socket.io.js`) reads `socket.handshake.query.userId`, stores `userSocketMap[userId] = socket.id`, and that's the entire registration — no further client action needed.

Mobile implementation:
1. Confirm whether `socket.io-client` is already a dependency (check `package.json`) and whether `MessagesPage.tsx`/`ChatPage.tsx` already opens a socket connection for chat. If a shared connection already exists, reuse it — don't open a second one.
2. If none exists, create `utils/socket.ts`:
   ```ts
   import { io } from "socket.io-client";
   export const connectSocket = (userId: string, baseUrl: string) =>
     io(baseUrl, { query: { userId } });
   ```
   `baseUrl` should be the same per-school base URL mobile already resolves in `services/apiInstance.ts` (strip any `/api` suffix — socket.io mounts on the raw HTTP server, not under `/api`).
3. Connect once on login/app-start (e.g. in `contexts/AuthContext.tsx`, alongside where the authenticated user becomes available), disconnect on logout — mirror web's lifecycle (`socket.disconnect()` on `logout()`).
4. Add a listener for `"newNotification"`: on receipt, if the payload has `_id`, prepend it to local state; otherwise (partial bulk payload) just increment the unread badge and trigger a background refetch of `GET /notifications/get`.

## Screens/components to build

### 1. Notification bell + dropdown (equivalent of `NotificationDropdown.jsx`)

Find wherever the persistent app header/chrome lives (likely `components/Header.tsx` or inside `Sidebar.tsx`) and add a bell icon there.

- **Fetch**: `GET /notifications/get` on mount, then poll every 30 seconds (`setInterval`, cleared on unmount) — exact interval matches web.
- **Unread count**: `notifications.filter(n => !n.isRead).length`. Show as a red badge on the bell (only if > 0).
- **Icon-per-notification mapping** — replicate exactly (substring match on `type` then `message`, lowercased):
  | Match | Icon concept | Color |
  |---|---|---|
  | `"live"` or `"meeting"` | video/camera icon | green |
  | `"lesson"`, `"course"`, `"material"` | book icon | blue |
  | `"message"`, `"chat"` | chat-bubble icon | purple |
  | `"event"`, `"schedule"` | calendar icon | orange |
  | else | info icon | gray |
  Use `components/SimpleIcon.tsx` (the app's existing emoji/glyph icon component) rather than pulling in a new icon library.
- **Dropdown panel** (open on bell tap): header "Notifications" + "{unreadCount} New" badge, scrollable list (cap the visible height, same as web's 400px max), each row shows icon, message (bold if unread), timestamp, blue dot + light blue background tint if unread. Empty state: "No notifications yet." Footer: "View All Notifications" button navigating to the full `NotificationsPage`.
- **Tap a notification** (dropdown context — matches web's simpler dropdown-click logic, no legacy link patching):
  ```
  1. PUT /notifications/:id  (mark this one read)
  2. close dropdown
  3. navigate(notification.link)   // parse the web route path into an equivalent mobile screen+params — see "Link mapping" below
  4. refetch list
  ```

### 2. Full Notifications screen (equivalent of `NotificationsPage.jsx`)

New screen `pages/NotificationsPage.tsx`, registered as an unconditional Drawer screen for both roles (3-place pattern: `AppNavigator.tsx` import + `RootStackParamList` + `<Drawer.Screen>` + `routeToLabel` map; `Sidebar.tsx` add to both `teacherMenuItems` and `studentMenuItems`).

- **Fetch**: `GET /notifications/get` once on mount (`loading` state while pending) — no polling needed here since it's a full-screen view the user opens deliberately; add pull-to-refresh instead (standard RN pattern) rather than a timer.
- **Header**: "Notification Center" + "Mark All as Read" button, shown only when `notifications.length > 0`. Wire to `PUT /notifications/mark-all`, then refetch.
- **Per-notification card**: icon (same mapping as above) + an `actionText` per type:
  | type/match | actionText |
  |---|---|
  | live-class / "live"/"meeting" | "Join Meeting Now" |
  | lesson/course/material | "View Lesson" |
  | message/chat | "View Message" |
  | event/schedule | "View Event" |
  | else | "View Details" |
  Message text (bold+larger if unread), formatted date (`createdAt`), unread rows get a left accent bar + light blue tint (same visual language as the dropdown, just full-width cards).
- **Action area** — replicate this exact branch:
  - if `notification.isEnded === true` → render a disabled gray "Meeting Ended" badge instead of a tappable action (no navigation).
  - else → render the `actionText` as a tappable action linking via the link-mapping logic below.
- **Tap behavior** (full-page version — matches web's more careful click handler: only PUTs if currently unread, and patches a legacy link substring):
  ```
  1. if !notification.isRead: PUT /notifications/:id, then update local state optimistically (mark isRead true) — don't necessarily refetch the whole list
  2. if notification.link exists:
       correctedLink = link.replace("live-meeting", "live-list")   // legacy path fix-up, replicate verbatim
       navigate using the link-mapping logic below
  ```
- **Empty state**: "You're all caught up!" with a muted icon.
- **Loading state**: "Loading alerts..." text.

### Link mapping (web route path → mobile screen+params)

`notification.link` is a **web route path string** like `/student/mycourses/:id` or a `live-meeting`/`live-list` path. Mobile has no router matching those paths directly, so build a small mapping utility (e.g. `utils/notificationLink.ts`) that pattern-matches known link shapes and returns `{ screen: string, params: object }` for `navigation.navigate(...)`. At minimum cover the `type` values that exist in the schema (`live-class`, `assignment`, `general`, `announcement`, `referral`) by inspecting both `type` and the path segments of `link` (e.g. `/student/mycourses/:courseId` → `navigation.navigate("CourseDetailStudentPageEnrolled", { courseId })`). Treat any link that doesn't match a known pattern as a no-op (log it, don't crash) rather than trying to open it as a raw URL — unlike web, mobile has no URL bar to fall back to.

## Verify

- Trigger a real notification-generating backend action (e.g. teacher posts an announcement, enrolls a student) while logged in as the recipient on mobile.
- Confirm the bell badge count updates within 30s even with the app foregrounded and no manual refresh (polling working), and near-instantly if the socket listener is wired (real-time working).
- Open the dropdown, tap a notification, confirm it's marked read (`PUT` fires) and navigates correctly via the link-mapping.
- Open the full Notifications screen, confirm "Mark All as Read" clears all unread styling and badges.
- Confirm a notification with `isEnded: true` shows the disabled "Meeting Ended" state, not a tappable action.
- Log out and back in, confirm the socket reconnects with the new user's id (no stale listener from the previous session).
