<!-- # Developer Execution Guide & Bug Fix Specification

## Project Overview
This repository is a React Native (iOS & Android) mobile application. This specification details critical bug fixes and layout adjustments across several key components:
1. Date picker validation & quarter boundary enforcement.
2. Responsive action-button styling in `AssessmentDetailsModal`.
3. Persistent scroll-freeze bug resolution in `ChapterDetailsModal`.

---

## Technical Stack & Environment Rules
* **Framework:** React Native / TypeScript
* **Package Manager:** `yarn` (DO NOT use `npm` under any circumstances)
* **Target Platforms:** iOS & Android

---

## Core Requirements & Specifications

### 1. Quarter Date Validation & Bounds Enforcement
Centralize all date logic using the shared helper (`utils/dateValidation.ts`).

* **Discussion Settings Modal (Extend Dates):**
  - Even when extending dates, selected dates **MUST** remain strictly within the active quarter range (`quarterStartDate` to `quarterEndDate`).
  - Do not allow date picker extensions beyond the quarter end date.
* **Edit Assessment Modal (Due Date Selection):**
  - Due dates must be strictly bounded within the active quarter's start and end dates.
  - Disable past dates (`< today`) and dates outside the active quarter.
* **Codebase Audit:**
  - Search for all remaining `DatePicker` / date selection components across the app and enforce active quarter boundaries.

---

### 2. Assessment Details Modal — Responsive 1-Row Button Layout
When viewing chapter assessments inside `AssessmentDetailsModal`, fix the action button row (**Edit**, **Remind Now**, **Set Reminder**, **Settings**).

* **Single Row Enforcement:** All 4 buttons **MUST** remain on a single horizontal row across all screen sizes. No wrapping onto a second line.
* **Content-Aware Sizing:**
  - **DO NOT** assign a uniform fixed width to all buttons.
  - Calculate width based on content: icon-only buttons (e.g., **Edit**) should take minimal width, while text-heavy buttons take more space.
* **Responsive Scaling Algorithm:**
  - Dynamically read screen width via `useWindowDimensions()`.
  - Calculate required total width: `sum(buttonContentWidths) + sum(horizontalGaps) + containerPadding`.
  - On smaller devices where available width is constrained:
    - Scale down horizontal padding, icon sizes (e.g., `20px` $\rightarrow$ `14px–16px`), and text font sizes (e.g., `14px` $\rightarrow$ `11px–12px`).
    - Adjust widths dynamically so all button text and icons remain **100% visible** without truncation or hidden text.

---

### 3. Chapter Details Modal — Android Scroll Freeze Investigation & Fix

#### Problem Statement:
Initial scrolling in `ChapterDetailsModal` works as expected. However, after pressing the `+` button container (to add a page, lesson, discussion, or assessment) and navigating back to `ChapterDetailsModal`, the screen completely freezes and becomes unscrollable. The only way it scrolls is if the user opens the `+` dropdown and drags inside that small dropdown region.

#### Instructions for Claude:
Do **NOT** guess or apply trial-and-error fixes. Perform a root-cause trace of state lifecycle and pointer events:
1. **Pointer-Event Overlay Inspection:** Check if an invisible backdrop/overlay or active dropdown container with `pointerEvents="auto"` fails to unmount or reset state when navigating away, remaining active and trapping touch gestures.
2. **Focus Lifecycle Audit:** Check screen focus hooks (`useFocusEffect` / navigation state). Ensure touch responders, `GestureHandler` states, or `nestedScrollEnabled` configurations are fully re-initialized when returning to `ChapterDetailsModal`.
3. **Z-Index & Elevation Cleanup:** Ensure conditional `elevation` or `zIndex` flags (like `plusButtonContainerActive`) are explicitly cleared when navigating away so they do not block touches upon returning.

---

## Instructions for Execution
1. Verify type-checking with TypeScript (`tsc --noEmit`) for modified files.
2. Test both iOS and Android layouts for visual consistency. -->