Alterations done:
### B. Client-Side RBAC Navigation Guards
* **File Target:** Navigation Stack / Route Configs.
* **Restricted Routes:** `CreateAssessment`, `TeacherStudentAnalytics`, `EnrollmentStats`, `StandardGradeScaleManagement`, `StudentsByCourse`, `TeacherMessagesByCourse`.
* **Requirements:**
  * Wrap these routes with a higher-order component or route guard checking `userRole === 'teacher'`.
  * If a non-teacher/student attempts to access any restricted route (via direct navigation or deep link), redirect them back to the main dashboard stack.

  using GuardedStandardGradeScaleManagement so any student could not manage the gradescale incase if there is any error in rendering the button while checking the user role


  All tasks from fixes.md are implemented and the project compiles clean. Full summary:

Task 4 — Security
Migrated 7 discussion/comment/enrollment endpoints from v1 to v2 across services/course.ts and services/discussion.ts.
Found and fixed a real blocker before that migration would've worked: isEnrolledMiddleware only checked for a student Enrollment record, so every teacher would've 404'd viewing their own course's discussions. Fixed the middleware to let the course's owning teacher through.
Added components/common/RequireTeacher.tsx, a navigator-level guard now wrapping the six named restricted screens — students are bounced to the dashboard instead of just having the button hidden.
Task 5 — Pricing labels
Added the "Per month / One-time / Free Course" label to CourseDetailStudentPage.tsx, matching web exactly. Confirmed MoreCourses.tsx needs no change — web's own browsing grids don't show price there either.

Task 1 — UX polish
Fixed real safe-area/keyboard bugs in DiscussionStudent.tsx and ChatPage.tsx (the latter had KeyboardAvoidingView imported but never used).
Built components/common/AnimatedBottomSheet.tsx (slide-up + dimmed backdrop) and converted the category/topic/question-type pickers in AddAssessmentForm.tsx plus QuarterPickerModal.tsx/SemesterPickerModal.tsx to use it.
Task 3 — Discussion management
Added a Settings sheet (resubmission toggle, multi-student due-date extension with search) and an Edit sheet (topic/description/category/due date) to DiscussionStudent.tsx, gated to teachers. Traced the exact backend contract from web's dueDate-setting.jsx/EditDiscussion.jsx/discussionResubmission-setting.jsx rather than guessing.

Task 2 — Assessment creation
Per-question file-upload type: added "file" as a real per-question type (backend already fully supported this — createAssessment_updated already validates and stores it), with attach/remove UI.
AI generation: built components/common/AIAssistantSheet.tsx reusing the exact backend endpoint and web's parsing logic (parseMCQFromAI/parseTrueFalseFromAI) for title, description, and per-question (mcq/truefalse/qa) generation.
Two things I deliberately did not build, flagging instead of faking:

isFinalAssessment — checked the backend controller mobile/web both post to (createAssessment_updated): the field isn't read or persisted anywhere, not even on web. Building a toggle for it would be a decorative no-op. This needs a backend change (model + controller) before it's worth a UI.
Google Drive attachments — architecturally simpler than expected (backend already does the whole OAuth dance server-side — mobile would only need a WebView pointing at /api/drive/auth-url, same pattern already used for Stripe checkout redirects). But it's untestable by me without a live Google account and device, so I'd rather build it as its own focused task than ship something I can't verify end-to-end.


{}

Summary
The plan document's assumptions didn't fully match the current codebase, so per its own audit-first instruction, here's what I found and did:

Task 1 — Checkout parity: Mostly a false alarm. The backend's createCheckoutSessionConnectMobile controller already fully handles one-time vs. subscription mode, trial days (course.freeTrialMonths → trial_period_days), and allow_promotion_codes: true — all server-side, driven off course.paymentType. Mobile never needed to send any of that. The one genuine gap: refCode was accepted by the backend but never sent by the mobile client (and never even captured — mobile has no deep-link/referral-capture mechanism at all, unlike web's course/share/:courseId/:refCode route). I wired refCode through:

services/course.ts — createStripeCheckoutSession now accepts and forwards refCode
pages/CourseDetailStudentPage.tsx — reads refCode from route params and passes it to checkout
I deliberately didn't build a full deep-link/referral-capture system (scanning share links, updating navigation linking config) since that's a much larger feature not described in the target files and has no existing precedent in the app — flag if you want that built out.

Task 2 — Assessment settings save: Already fully implemented, contrary to the doc. AssessmentSettingsModal.tsx has working onPress handlers calling updateAssessmentLatePolicy/setAssessmentAllowResubmission, loading spinners, and toast feedback, backed by real endpoints in services/course.ts and live backend routes in Assessment.Routes.js/Assessment.controller.js. No changes needed.

Type-checked both touched files — no errors.