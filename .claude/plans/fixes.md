# Mobile App Feature Parity, UI Fixes & Security Audit Tasks

This document outlines the required refactoring, UI enhancements, feature additions, and security upgrades needed for the React Native mobile application to achieve 1:1 parity with the Web platform (`@web-frontend`).

---

## Table of Contents
1. [Task 1: iOS Input & Picker UX Fixes (Global Standard)](#task-1-ios-input--picker-ux-fixes-global-standard)
2. [Task 2: Assessment Creation Parity & AI Integration](#task-2-assessment-creation-parity--ai-integration)
3. [Task 3: Full Discussion Management & Extension Settings](#task-3-full-discussion-management--extension-settings)
4. [Task 4: Security (v2 APIs) & RBAC Route Guards](#task-4-security-v2-apis--rbac-route-guards)
5. [Task 5: Pricing & Payment Labels](#task-5-pricing--payment-labels)
6. [Acceptance Criteria & Verification Checklist](#acceptance-criteria--verification-checklist)

---

## Task 1: iOS Input & Picker UX Fixes (Global Standard)

### A. Bottom Comment Input Bar (Discussions Page)
* **File Target:** `ChapterDiscussionsPage.tsx` / Comment Input Component.
* **Issue:** On iOS, the bottom container containing the comment text field and send button sits flush against the bottom edge of the screen with zero safe-area padding.
* **Requirements:**
  1. Wrap bottom input containers using `KeyboardAvoidingView` (`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`).
  2. Implement `useSafeAreaInsets()` from `react-native-safe-area-context`.
  3. Set `paddingBottom: insets.bottom || 16` dynamically so the bar floats cleanly above the iOS home indicator.

### B. Animated Dropdowns & Date Pickers (Global Standard)
* **Target:** All picker modals and selection inputs across the app (e.g., inside `AddAssessmentForm`).
* **Issue:** Pickers snap onto the screen instantly at the bottom without animations, offering poor user feedback.
* **Requirements:**
  1. Wrap picker components in an animated bottom sheet or smooth modal transition (`Modal` with slide animation or `react-native-bottom-sheet`).
  2. Include backdrop dimming (`rgba(0,0,0,0.5)`) and smooth slide-up/slide-down transitions when opening or closing.

---

## Task 2: Assessment Creation Parity & AI Integration

* **File Targets:** `CreateAssessmentPage.tsx`, `AddAssessmentForm.tsx`, and child components.

### Requirements:
1. **New Question Types & Attachments:**
   * Extend existing question options (MCQ, True/False, Q&A) to support **File-Upload Questions** and **Google Drive Attachments**.
   * Add a toggle for the **`isFinalAssessment`** boolean flag.
2. **AI-Generated Questions:**
   * Integrate the Gemini AI Question Generator modal/drawer (referencing `AiContentModal` from the Web repository).
3. **AI Title & Description Generator:**
   * Add Gemini AI trigger buttons next to the **Title** and **Description** input fields (reusing the existing AI prompt utility used in Course Creation) to allow teachers to auto-generate title/description content.

---

## Task 3: Full Discussion Management & Extension Settings

* **File Target:** `ChapterDiscussionsPage.tsx`.
* **Web Reference Components:** `DiscussionAllowResubmissionSetting.jsx`, `ResubmissionSetting.jsx`, `EditDiscussionDialog.jsx`.

### Requirements:
1. **Settings Action (Resubmission & Due Date Extensions):**
   * Implement settings modal allowing teachers to grant due date extensions and resubmission permissions for the entire class or specific/multiple individual students.
   * Clean up and uncomment existing dead code inside `ChapterDiscussionsPage.tsx`.
2. **Edit Action (Full Discussion Management):**
   * Allow teachers to update overall discussion parameters: topic name, category, discussion type, standard due date, and individual student extension overrides.

---

## Task 4: Security (v2 APIs) & RBAC Route Guards

### A. API Migration to v2
* **File Targets:** `mobileapp/services/course.ts`, `services/discussion.ts`.
* **Requirements:** Replace all legacy v1 discussion, comment, and enrollment API endpoints with their v2 equivalents that enforce `isEnrolledMiddleware` on the backend.

### B. Client-Side RBAC Navigation Guards
* **File Target:** Navigation Stack / Route Configs.
* **Restricted Routes:** `CreateAssessment`, `TeacherStudentAnalytics`, `EnrollmentStats`, `StandardGradeScaleManagement`, `StudentsByCourse`, `TeacherMessagesByCourse`.
* **Requirements:**
  * Wrap these routes with a higher-order component or route guard checking `userRole === 'teacher'`.
  * If a non-teacher/student attempts to access any restricted route (via direct navigation or deep link), redirect them back to the main dashboard stack.

---

## Task 5: Pricing & Payment Labels

* **File Targets:** `CourseDetailStudentPage.tsx`, `MoreCourses.tsx`, and course cards.
* **Requirements:**
  * Update pricing tags to display the payment type label alongside the raw price value.
  * Display formats: **"$50 / One-time"**, **"$15 / Per month"**, or **"Free"** (matching Web pricing display logic).

---

## Acceptance Criteria & Verification Checklist

- [ ] **iOS Input Padding:** Comment bar on `ChapterDiscussionsPage.tsx` sits above the home indicator bar with correct safe-area spacing on iOS devices.
- [ ] **Picker Animations:** Date pickers and dropdowns slide up smoothly with a dimmed background backdrop.
- [ ] **Assessment Extras:** File-upload questions, Drive attachments, `isFinalAssessment` toggle, and Gemini AI title/description/question tools function inside `AddAssessmentForm`.
- [ ] **Discussion Controls:** Teachers can grant student-specific due date extensions and allow resubmissions via the Settings and Edit modals.
- [ ] **Security:** Discussion comments execute via v2 APIs (`isEnrolledMiddleware`), and student accounts are blocked from accessing `CreateAssessment`.
- [ ] **Pricing Labels:** Course cards explicitly render payment interval terms ("One-time", "Per month", or "Free").