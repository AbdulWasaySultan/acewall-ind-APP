# Phase 5 — Per-student Assessment Analytics drill-down (teacher)

## Web reference

`web-frondend/src/Page/teacher/TeacherStudentAnalytics.jsx`. Route: `/teacher/analytics/:courseId/:studentId` (declared as a top-level absolute route in `App.jsx`, not nested under the teacher layout wrapper).

**Entry point**: `Page/teacher/studentCourseGrades.jsx` (route `teacher/courseGrades/:studentId/:courseId`) — inside the course header card, an outline "Analytics" button (`BarChart2` icon) linking to `/teacher/analytics/${courseId}/${studentId}`. Mobile should add the equivalent entry point on whatever screen shows a teacher a single student's course grades (`GradebookPage.tsx`/`StudentProfilePage.tsx` per the earlier roadmap note — confirm exact screen once Phase 2's teacher-gradebook work lands, since that's the natural place for this).

## Backend contract (confirmed complete, correctly implemented — safe to consume as-is)

`GET /api/gradebook/getTeacherStudentAnalytics/:courseId/:studentId` (auth). Unlike Enrollment Stats, this endpoint has no response-shape bug — the response is consumed directly (`setData(res.data)`, no `.data.data` unwrapping).

### Exact backend algorithm (`backend/src/Contollers/gradebookUpdated.controller.js:680-774`)

```js
// 1. Overall average (all graded items, all-time)
const currentOverallAvg = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

// 2. Trend: last 5 submissions vs overall average
const recentWindow = 5;
const trendItems = allItems.slice(-recentWindow);
const recentAvg = average of (studentPoints / (maxPoints || 1) * 100) over trendItems;
const trendDiff = recentAvg - currentOverallAvg;
const projectedScore = min(100, recentAvg * 0.6 + currentOverallAvg * 0.4);

// 3. Category mastery — sorted DESCENDING by average (best first, worst last)
categoryPerformance = categories.map(...).sort((a, b) => b.average - a.average);
weakest = categoryPerformance[last];  // lowest average
best = categoryPerformance[0];        // highest average
```

If the student has no graded items at all, the response degrades to `{ summary: { currentPercentage: 0 }, charts: { lineChart: [], categoryPerformance: [] }, message: "No graded items found." }` with **no `insights` key at all** — mobile must treat `insights` as optional/nullable and skip the trend banner, projected-final tile default, and intervention alert in that case (matches web, which conditionally renders each of those sections only `if (insights)`/`if (insights?.weakestCategory)`).

### Response shape — note the mixed string/number types (replicate the parsing, don't "fix" it silently in a way that breaks comparisons)

```
{
  studentId, courseName,
  summary: {
    currentPercentage: "72.3"   // STRING, already .toFixed(1)
    totalAssessments, pointsEarned, pointsPossible   // numbers
  },
  insights: {                    // may be entirely absent — check truthiness first
    trendStatus: "increasing" | "decreasing",
    percentageChange: "4.2",     // STRING, abs diff, 1 decimal
    recentAverage: "76.5",       // STRING
    overallAverage: "72.3",      // STRING
    projectedFinalScore: "74.0", // STRING, capped at 100
    sampleSize: 5,                // number, up to 5
    weakestCategory: { name, average, gap } | null   // gap = best.average - weakest.average, values are toFixed(1) strings except name
  },
  charts: {
    lineChart: [{ name: "Quiz 1", score: "85.0" }, ...],       // STRING scores, original item order (not date-sorted)
    categoryPerformance: [{ category, average: 82.4, count }, ...]  // average is a raw NUMBER here, sorted desc
  }
}
```
Recommend normalizing everything to numbers once at the mobile service layer (`services/gradebook.ts`) so downstream UI code doesn't have to remember which fields are strings — that's an implementation detail, not a deviation from the ported *behavior*.

## Steps

1. Add `getTeacherStudentAnalytics(courseId, studentId)` to `services/gradebook.ts`, alongside the existing `getCourseAnalytics`.

2. New screen `pages/TeacherStudentAnalyticsPage.tsx`. Sections top to bottom, replicating web exactly:

   **a. Header** — back button, title "Student Performance Report", subtitle `Student ID: {studentId} | Course: {courseName}`. Skip the "Download Report" button (`window.print()` — a browser-only affordance with no mobile equivalent) or replace with a native share action if useful; this is a judgment call, not a strict port requirement since there's no mobile analog.

   **b. Trend insight banner** (render only if `insights` is present):
   - `isImproving = insights.trendStatus === "increasing"`.
   - Styling: green/emerald tint + up-trend icon + "Positive Momentum" heading if improving; red tint + down-trend icon + "Performance Decline" heading if not. Binary only — no "neutral" state exists in web's logic (even a `trendDiff` of exactly 0 counts as "increasing" per `trendDiff >= 0`).
   - Body text template (exact): `In the last {sampleSize} submissions, the student's average is {recentAverage}%. This is a {percentageChange}% {trendStatus} compared to their overall average of {overallAverage}%.`

   **c. Stats grid** — 4 tiles, always rendered (no conditional, unlike the banner):
   - "Current Grade" → `summary.currentPercentage}%`
   - "Projected Final" → `insights?.projectedFinalScore}%`, amber-tinted background, caption "ESTIMATED RESULT" — render blank/dash if `insights` absent.
   - "Points" → `summary.pointsEarned / summary.pointsPossible`
   - "Total Work" → `summary.totalAssessments} items`

   **d. Intervention alert** (render only if `insights?.weakestCategory` is truthy — note: this fires even when there's only one category and the gap is 0, which is a slightly misleading web quirk; replicate as-is for parity, it's a minor cosmetic nuance not worth diverging over): red/destructive styled alert, title `Intervention Needed: {weakestCategory.name}`, body: `The student is struggling most with {name}. There is a {gap}% proficiency gap between this and their best category.`

   **e. Charts row** (two charts, stacked on mobile instead of side-by-side grid):
   - **"Submission History"** line chart: x-axis = item order (labels hidden, matching web's `hide` on XAxis — don't show item names on the axis itself), y-axis fixed domain 0-100, single line, color `#2563eb` (blue-600), data points from `charts.lineChart[].score`. Reuse/extend the existing `LineChartSVG` from `CourseAnalyticsPage.tsx`.
   - **"Competency Breakdown"** horizontal bar chart: one bar per `charts.categoryPerformance` entry, already sorted best→worst by the backend — render in that same order (best category's bar at top). **Exact color threshold** (only one cutoff, not a multi-tier scale): `average >= 80` → emerald `#10b981`, `average < 80` → blue `#3b82f6`. Label each bar with its value formatted to **0 decimals** (`${value.toFixed(0)}%`) — note this differs from other places in the app that use 1 decimal, replicate the 0-decimal formatting here specifically. Reuse/extend `CategoryBarChart` from `CourseAnalyticsPage.tsx`, but override its color logic for this screen since it's a different (simpler, binary) threshold than whatever `CategoryBarChart` might currently use elsewhere.

3. **Loading state**: full-screen centered spinner.

4. **Error state**: centered text showing the error message (or "No data found" fallback) + a "Go Back" action. Triggered both on fetch failure and when the response itself is falsy (not on the "no graded items" branch, which still returns a valid-but-sparse object and should render normally with empty charts).

5. Navigate here with `{courseId, studentId}` params from wherever the teacher views an individual student in a course context.

## Verify

- As a teacher, open per-student analytics for a student with several graded assessments across multiple categories; confirm the trend banner direction/color, the 4 stat tiles, the intervention alert (if a weakest category exists), and both charts match what the equivalent web page shows for the same student/course (cross-check by opening the web URL `/teacher/analytics/:courseId/:studentId` side-by-side if web access is available).
- Test a student with zero graded items — confirm the page doesn't crash, shows `currentPercentage: 0`, empty charts, and skips the trend banner/intervention alert gracefully (no `insights` key).
- Confirm the competency bar color threshold is exactly ≥80 green / <80 blue, not a multi-tier scheme.
