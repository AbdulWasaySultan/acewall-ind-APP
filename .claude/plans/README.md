# Mobile App Feature Parity Roadmap — Index

Goal: bring the mobile app (`mobileapp/`) up to feature parity with the web frontend (`web-frondend/`), replicating web's exact logic/UX per feature, not just matching feature names. Each phase below is its own file with step-by-step implementation detail (exact API calls, filters, UI fields, click/navigation behavior) pulled directly from reading the web source, not summarized from memory.

Sequenced by priority/dependency, not calendar time.

1. [phase-1-support-fix.md](phase-1-support-fix.md) — trivial bug fix: Support screen is wired only for non-students, locking students out.
2. [phase-2-course-first-navigation.md](phase-2-course-first-navigation.md) — the biggest phase: Assessments, Announcements, Discussions, and Meetings all gate behind a "pick a course first" screen on web; mobile currently shows everything mixed together. Also adds a missing teacher Gradebook access point and specs a lower-priority teacher Messages picker.
3. [phase-3-purchase-history.md](phase-3-purchase-history.md) — student purchase/billing history screen, backend-ready.
4. [phase-4-enrollment-stats.md](phase-4-enrollment-stats.md) — teacher-facing enrollment trend chart; includes a real bug found in web's response parsing that mobile should NOT replicate.
5. [phase-5-per-student-analytics.md](phase-5-per-student-analytics.md) — teacher drill-down into one student's performance in a course (trend, category breakdown, intervention alert).
6. [phase-6-notifications.md](phase-6-notifications.md) — in-app notification bell + full notifications screen; includes a correction of an earlier assumption (web actually polls, it does not consume the socket event it emits).
7. [phase-7-payment-stripe-onboarding.md](phase-7-payment-stripe-onboarding.md) — payment success/cancel screens and Stripe Connect onboarding UI; **blocked on a backend change** (redirect URLs are hardcoded to web domains) — build mobile side in degraded mode now, finish once backend adds mobile-aware redirect URLs.

## Key decisions already made (don't re-litigate without reason)

- Admin/cross-teacher course-verification queue is **out of scope** — admin is a separate portal/codebase.
- Notifications: build both polling (matches web's actual behavior) and a live Socket.io listener (goes beyond web parity, since web itself never wired one up despite the backend emitting the event).
- Stripe/payment backend gap is **flagged, not fixed** — this plan is mobile-only scope; backend changes needed for Phase 7 are called out explicitly in that file for whoever owns that side.
- Course-first gating should NOT be added to student Gradebook — web itself shows all courses on one page there, no gate exists.

## Architecture conventions (apply across all phases)

- Screens: flat files in `mobileapp/pages/*.tsx`.
- Services: one file per domain in `mobileapp/services/*.ts`, built on `getApiInstance()` (`services/apiInstance.ts`), consistent try/catch → friendly-error-throw pattern (see `services/wallet.ts`).
- Navigation: `navigation/AppNavigator.tsx` (root Stack → Drawer + sibling full-screen Stack routes) + `components/Sidebar.tsx` (the actual rendered drawer menu, independent arrays per role). Adding any drawer screen touches both files plus the `routeToLabel` map — see phase-1 for a worked example.
- Reusable chart primitives: `LineChartSVG` / `CategoryBarChart`, currently local to `pages/CourseAnalyticsPage.tsx` — worth extracting to `components/common/` once a second screen needs them (Phase 4/5 both do).
