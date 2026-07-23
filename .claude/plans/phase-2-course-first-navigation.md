# Phase 2 — Course-first navigation pattern

Six features on web gate their content behind a "pick a course first" step. This file specs each one with exact API calls, filters, card content, and click/navigation behavior as implemented on web, so mobile replicates the same logic — not just the same general shape.

**Cross-feature pattern**: every picker fetches courses (either a real course-list endpoint, or derives unique courses client-side from a flat "get everything" response), shows a searchable/filterable grid of course cards, and clicking a card navigates to a per-course detail screen. None of the six use true pagination — all rely on full-list-fetch + client-side filtering, except the shared discussions/messages picker which does server-side debounced search.

---

## 2A. Assessments

### Student picker — mirrors `StdCourseAssignment.jsx`

- **API**: `getAllAssessmentForStudent()` (already exists in `services/course.ts`) — flat array of assessments, each with a nested `course` object.
- **Derive unique courses client-side**: build a map keyed by `course._id`, storing `{ _id, title: course.courseTitle, thumbnail, semesterbased, gradingSystem }`. No per-course item counts.
- **Filters**: search box (matches course `title` substring, case-insensitive), "All Courses" dropdown (exact title match), "Course Type" dropdown (`all` / `semester` / `chapter`, based on the `semesterbased` boolean).
- **Card**: 16:9 thumbnail (fallback placeholder), title, badge "Semester based" (blue) vs "Chapter based" (orange) from `semesterbased`, footer "Manage Assignments" + "Open ›".
- **Empty state**: "No courses match your filters." + "Clear Filters" action.
- **Loading**: full-screen spinner + "Loading your assessments...".
- **On tap**: navigate to the per-course list screen with `{ courseId: course._id, courseTitle: course.title }` (web passes `courseTitle` via router state — pass it as a nav param on mobile so the detail screen doesn't need a second fetch just to get the title).

### Student detail — mirrors `Assignment.jsx`

- Modify `MyAssessmentsPage.tsx` to require a `courseId` param and filter `getAllAssessmentForStudent()` results by `a.course?._id === courseId` (same "get all, filter client-side" data source — no new endpoint).
- Title: "Course Assessment Details" (falls back to using the passed `courseTitle` if available).
- Derive `categories` and `types` filter options from the filtered set (not the full unfiltered set).
- **Motivation banner**: compute `pending = items.filter(a => !a.isSubmitted)`; if any pending, show a banner/toast with pending count + nearest `dueDate`. (Mobile equivalent: an in-page banner rather than a toast, since RN toasts aren't ideal for persistent info — use the app's existing `Toast` utility only for the transient notice, or a dismissible banner if you want it to persist.)
- **Filters**: search (title), Category select, Type select, Status select (`all`/`submitted`/`pending`).
- **List row fields**: name (strikethrough+dim if submitted), course title, "location" info — if `course.semesterbased` show semester+quarter name, else show chapter+lesson title; due date formatted `MMM dd, yyyy 'at' HH:mm` or "No Deadline"; green "extended" pill + tooltip if `isExtended`; status pill (green "Submitted" / amber "Pending"); if the assessment's `lateSubmissionPolicy.enabled`, show a penalty-info affordance: `Late submissions will incur a {value}{% or points} deduction {per day or as a one-time penalty}.`
- **Expand row**: description (fallback "No specific instructions provided."), "Task Source" value, action button "Submit Task"/"View Result" — routes to the existing submission flow already implemented in `AssessmentScreenStudent.tsx` (reuse it, don't rebuild).
- **Empty**: "No assessments match your current filters."

### Teacher picker — mirrors `TeacherAssignment.jsx`

- **API**: `getAllAssessmentsByTeacher()` (exists in `services/course.ts`) — derive unique courses client-side (array-based `.some()` check, not a map — doesn't matter for RN, just note there's no de-dup-order guarantee difference to worry about).
- **Filters**: search, Course-name select, Verification-status select (labels with emoji: "Approved ✅" / "Pending ⏳" / "Rejected ❌"), Course-structure select ("Semester Based" / "Course based").
- **Card**: thumbnail, title, verification badge (green/red/amber + check/x/clock icon), semester/chapter badge (always blue), footer "Grading: {gradingSystem}" + "View Assessments →".
- **Empty**: "No courses match those filters." + "Reset All Filters".
- **On tap**: navigate to teacher per-course assessment list with `{ courseId }` (web passes no router state here, just the id).

### Teacher detail — mirrors `CourseAssessmentList.jsx`

- New teacher-side filtered view (or extend `AssessmentsPage.tsx` to accept a required `courseId` and filter `getAllAssessmentsByTeacher()` results by `assessment.course._id === courseId`).
- Derive `allCategories` from the filtered set.
- **Filters**: Type select (`all` / `chapter-assessment` / `lesson-assessment` — hardcoded options, not derived from data), Category select (`all` + derived names).
- **Card** (2-col grid on web, single column on mobile): title, category badge (green), course title row, chapter/lesson title rows (if present, with icon), 2-line description, "Created: {date}" (`MMM d, yyyy`).
- **On tap**: goes straight to the submissions view for that assessment (`Submissionsmodal.tsx` or equivalent existing screen) — matches web, which skips an intermediate detail page entirely.

---

## 2B. Announcements

### Student picker — mirrors `AllannouncmentCoursesStd.jsx`

- **API**: `getAnnouncementsByStudent(studentId)` (exists in `services/announcement.ts`) — derive unique courses via a map keyed by `ann.course._id`, storing `{ _id, courseTitle, thumbnail }`.
- **Filters**: search (course title substring), "All Enrolled Courses" select (exact `_id` match).
- **Card**: 16:9 thumbnail, title, "Check Updates →" affordance (web reveals this on hover — on mobile just always show it, since there's no hover state).
- **Empty**: Bell icon, "No Announcements" / "There are no updates for your courses right now."
- **On tap**: navigate to per-course detail with `{ courseId, courseTitle }`.

### Student detail — mirrors `StudentCourseAnnouncements.jsx`

- Modify `AnnouncementsPage.tsx` (student mode) to require `courseId`, refetch `getAnnouncementsByStudent(studentId)` and filter by `ann.course._id === courseId`.
- Header: use the passed `courseTitle` (fallback "Course Updates").
- **List**: accordion-style, one expanded at a time. Each row: title, meta (created date + teacher first name pill), expand toggle.
- **Message text**: truncate to 200 chars with independent "Read More"/"Show Less" toggle (separate from the row's own expand/collapse state — both can be open independently, matching web's `ExpandableText` sub-behavior).
- **Expanded content**: split `attachments` into images (extension test: `.jpg/.jpeg/.png/.webp/.avif/.gif`, case-insensitive) shown in a photo grid opening externally, vs other files shown as document rows (Paperclip icon, `filename || "Download File"`); `links[]` shown as external-link rows.
- **Empty**: "No announcements found for this course."

### Teacher picker — mirrors `AllannouncmentCourses.jsx`

- **API**: this one is NOT derived from announcements — it calls the real course list endpoint `GET /course/getVerifiedCourses` directly (add this to `services/course.ts` if not already present under a different name — check first, since the app likely already has a "get my verified courses" call for other screens like `MyCoursesPage.tsx`).
- **Filters**: search, "Quick Filter" select ("All Verified Courses" + per-course).
- **Card**: thumbnail, category pill (`course.category?.title`, green, top of card) if present, title, "View Announcements" affordance.
- **Empty**: "No courses found" / "Try resetting your filters or adjusting your search."
- **On tap**: navigate with `{ courseId, courseTitle }`.

### Teacher detail — mirrors `TeacherAnnoucement.jsx`

- Modify `AnnouncementsPage.tsx` (teacher mode) to require `courseId` and call `getAnnouncementsByTeacher()` **but note web actually calls a server-filtered variant**: `GET /announcements/getbyteacher/${teacherId}?course=${courseId}` — check whether the mobile service already supports a `course` query param on `getAnnouncementsByTeacher`; if not, add it rather than filtering client-side, to match web's actual request shape.
- Header falls back to generic "Course Announcements" text with no thumbnail if there are zero announcements yet (web derives the course thumbnail/title from the *first announcement's* embedded course field, not a separate course fetch — replicate this rather than adding an extra API call, unless the passed-through `courseTitle`/thumbnail from the picker step covers it better on mobile, which is a reasonable simplification).
- **Create/delete**: reuse existing create-announcement flow (should already exist somewhere in the teacher announcements UI) with `defaultCourseId` pre-filled; delete via existing delete flow, confirm dialog first.
- **Empty**: Megaphone icon, "No announcements yet for this course." + "Create your first one now" action.

---

## 2C. Discussions (and the shared course-picker used by Teacher Messages)

### Shared picker component — mirrors `allCoursesPage.jsx` (`AllCoursesFilterPage`)

Web reuses **one component** for three different destinations (student discussions, teacher discussions, teacher "start a conversation" flow), parameterized by a `pagefor` prop and a `link` prefix. Build the mobile equivalent the same way: one reusable `components/common/CourseFilterScreen.tsx` (already suggested in the roadmap) parameterized similarly, rather than three near-duplicate screens.

- **API**: `GET /course/getUserCoursesforFilter?search={text}` — **debounced 800ms** (this is a real, non-obvious detail: don't fire on every keystroke, wait 800ms after the user stops typing, matching web's `DEBOUNCE_DELAY = 800`). Response: `{ courses: [...], totalCourses }` (role-aware server-side — returns teacher-owned or student-enrolled courses automatically based on the authenticated user). Add `getUserCoursesForFilter(search)` to `services/course.ts` if not already present.
- **Card**: thumbnail (BookOpen fallback), "Published"/"Unpublished" pill (green/yellow), title, course code (monospace, Code icon), category/subcategory pills, full-width button whose label is literally `"View {pagefor}"` (so "View Discussions" or "View Students" depending on context — parameterize this string).
- **Loading/Error/Empty**: spinner; red error banner + "Try Again" retry; "No courses found" / "Try adjusting your search."
- **Navigation — exact branching logic to replicate**:
  ```
  if (pagefor === "Discussions" && role === "teacher"):
    navigate to `${link}${course._id}` with query-equivalent params { type: "course", typeId: course._id, course: course._id }
  else:
    navigate to `${link}${course._id}` with no extra params
  ```
  On mobile, "query params" become nav params passed in `navigation.navigate(screen, params)` — so pass `{ type: "course", typeId: courseId, courseId }` only for the teacher-discussions case, and just `{ courseId }` for student-discussions and the messages/student-picker case.

### Student discussion detail — mirrors `StudentDiscussisons.jsx`

- `DiscussionsPage.tsx` (student mode): require `courseId`, call `GET /discussion/studentDiscussion?course=${courseId}` (add a `courseId` param to `getAllDiscussions`/create a scoped variant in `services/discussion.ts` — currently it calls `/api/discussion/${path}` with no course scoping at all, so this is a required service change, not just a UI change).
- **Card fields**: course thumbnail (no fallback in web — decide whether to add one for mobile robustness, reasonable deviation), due date row if present (label + date + `HH:mm` time), type badge (indigo pill), topic title + created date, course title, 2-line description.
- **On tap**: navigate to the discussion chat/thread screen (existing `DiscussionStudent.tsx`/`ChapterDiscussionsPage.tsx` — whichever already handles a single discussion thread).
- **Empty**: "No discussions available."

### Teacher discussion detail — mirrors `TeacherDiscussisons.jsx`

- `DiscussionsPage.tsx` (teacher mode): reads the `{ type, typeId, courseId }` params passed from the picker. Since this flow only ever uses `type: "course"` here, call `GET /discussion/v2/course/${courseId}` (add this scoped call to `services/discussion.ts`).
- Header: "Course Discussions" (capitalized `type`).
- **Empty**: "No Discussion found".
- **On tap**: navigate to the discussion thread, forwarding the same `{type, typeId, courseId}` context (matches web preserving query params across the click for back-navigation context).

---

## 2D. Meetings / Live Classes (student) — entirely new feature, not just a missing gate

### Picker — mirrors `Meetings/CoursesWithMeetings.jsx`

- **APIs** (two independent calls):
  1. `GET /api/course/with-meetings` → `{ success, courses }`. Add `getCoursesWithMeetings()` to `services/course.ts`.
  2. `GET /api/zoom/upcoming` → `{ success, meeting }` (nullable). Add `getUpcomingMeeting()` to a zoom/meeting service if one exists, or `services/course.ts`.
- If an upcoming meeting exists, show a dismissible banner above the course grid (mobile already has `UpcomingMeetingToast.tsx` — check if it can be reused/adapted here instead of building a new banner from scratch).
- **Card**: thumbnail (BookOpen fallback), category pill, title, instructor name row, meeting count row — **use the `meetingCount` field directly from the API response**, don't compute it client-side: `"{course.meetingCount || 0} Scheduled Meetings"`.
- **On tap**: navigate to the per-course meeting list with `{ courseId: course._id }`.
- **Empty**: Video icon, "No active meetings found" / "There are currently no courses with scheduled meetings. Please check back later."

### Per-course meeting list — mirrors `StudentMeetingList.jsx`

- New screen (or extend existing meeting-list logic if any exists for teachers and can be shared). Two calls in parallel: `GET /api/zoom/course/${courseId}` (raw array, no wrapper) and `GET /api/course/get/${courseId}` (for the course title in a breadcrumb).
- **Row per meeting**: colored left accent by status (green=`active` with a highlighted card, gray=`ended`, blue=default/scheduled); title + status pill; date/time via Calendar+Clock icons (show "Invalid Date" in red if unparseable — don't crash); duration pill `"{duration} Minutes Session"`; action button: disabled "Session Ended" if ended, else "Join Now" (green, if active) / "Join Session" (blue, otherwise).
- **Join handler**: `GET /api/zoom/join/${meetingId}` → if `url` present, open externally (`Linking.openURL`, reuse the `openZoomMeeting` pattern already in `utils/linking.ts`); else show an alert "Could not join meeting. It may not have started yet."
- **Empty**: Video icon, "No meetings scheduled" / "The instructor hasn't scheduled any live sessions for this course yet."

---

## 2E. Teacher Gradebook access

Web has **no dedicated picker screen** for this — it's a single "Gradebook" button on the teacher's own course-detail page (`CourseDetail.jsx`), navigating straight to `/teacher/gradebook/:courseId`. Mobile should match this exact IA — do not build a separate course-list picker for gradebook.

- Add a "Gradebook" outline button (BookOpen icon) to `CourseDetailsPage.tsx` (teacher course detail), alongside whatever existing actions live there (Student View / Edit Info / Course Stats).
- Backend: `GET /api/gradebook/getGradebooksOfCourseFormatted/:courseId` → `{ gradebook: [...students], courseType, gradingSystem }`.
- New screen (or reuse/extend `GradebookPage.tsx` for a teacher-scoped mode — currently that screen is student-only per `AppNavigator.tsx`'s role gate): nested expand/collapse table —
  - Top level: one row per student, columns Student / Final Grade / (Letter Grade + GPA if `gradingSystem === "normalGrading"`, else Points + Remarks). If a student has no grade data at all (`semesters?.length > 0` or `chapters?.length > 0` check depending on `courseType`), show "--" instead of blank/zero.
  - Expand a student row → drill into semester → quarter → assessment table (if `courseType === "semester-based"`) or a single assessment table with an overall-grade summary row (if chapter/course-based). Use independent expand-state keys per nesting level (student id; `${studentId}-${semesterId}`; `${studentId}-${semesterId}-${quarterId||"no-quarter"}`) — matches web's non-obvious multi-level toggle-key pattern, needed so expanding one student's semester doesn't affect another's.
  - Leaf assessment table columns: Assessment title, Category (gray pill), Score (`studentPoints/maxPoints`), Percentage (`(studentPoints/maxPoints*100).toFixed(1)%`, or "N/A" if `maxPoints <= 0`), Type pill ("Discussion" purple if `isDiscussion`, else "Assessment" blue).

---

## 2F. Teacher Messages picker (lower priority — confirm before building)

Per the roadmap, this is flagged **lower priority / likely skip** since mobile's current direct-inbox `MessagesPage.tsx` already covers reading/continuing conversations, and web's 2-step picker exists mainly to *start* a new conversation with a specific student. Only build this if there's currently no way to start a new conversation from mobile at all.

If built: reuse the same shared picker component from 2C with `pagefor="Students"` styling (button label "View Students"), then a per-course student list mirroring `StudentList.jsx`:
- **API**: `GET /conversation/getStudentsByOfTeacher/${courseId}` → `{ students, totalStudents, courseTitle }`.
- **Row**: avatar (or initials-fallback), name, email, enrollment date, optional progress bar (only if `student.progress !== undefined`).
- **On tap**: `POST /conversation/create` with `{ memberId: student._id }` → navigate to the chat screen with the returned `conversation._id` (reuse `ChatPage.tsx`).

---

## Verify (whole phase)

- As a student: Assessments, Announcements, Discussions, and Meetings from the drawer all show a course-selection grid first; selecting a course shows only that course's data (confirm by comparing counts against what the "old" all-at-once view used to show, split correctly per course).
- As a teacher: same for Assessments, Announcements, Discussions; confirm the teacher-discussions picker correctly passes `type/typeId/courseId` through to the detail screen and back to the thread screen.
- As a teacher: open a course's detail page, tap "Gradebook", confirm the nested student→semester→quarter→assessment drill-down renders and independent expand/collapse works per level without cross-student interference.
- As a student: open Live Classes, confirm the course list shows accurate `meetingCount`, and the per-course meeting list's Join button works for an active meeting and is disabled for an ended one.
- Confirm the debounced search (800ms) in the shared Discussions/Messages picker doesn't fire a request on every keystroke.
