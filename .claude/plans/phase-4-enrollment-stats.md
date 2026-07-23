# Phase 4 — Enrollment Stats (teacher)

## Web reference

`web-frondend/src/CustomComponent/teacher/EnrollmentStats.jsx`. Route: `teacher/courses/course-stats/:id`, reached from `Page/teacher/Courses/CourseDetail.jsx:507` via a button that navigates to `/teacher/courses/course-stats/${id}`.

## ⚠️ Known bug in web — do NOT replicate

Web parses the response as:
```js
if (response.data?.success) {
  setData(Array.isArray(response.data.data) ? response.data.data : []);
} else {
  setData([]);
}
```
But the actual backend response is `{ stats, message }` — **no `success` key, no `data` key**. This means `response.data?.success` is always `undefined`, so **web's chart never renders real data in production** — it always falls into the empty state regardless of range or actual enrollment activity. Mobile must parse `response.data.stats` directly instead. This is the one place in the whole roadmap where following "exact web logic" would mean copying a bug — don't.

## Backend contract (confirmed complete)

`GET /api/course/stats/:courseId?range=7d|30d|6m|all` (no extra auth middleware beyond standard).

Date-window logic (`backend/src/Contollers/CourseControllers/courses.controller.sch.js:1991`), exact cutoffs:
```js
if (range === "7d") startDate = now - 7 days
else if (range === "30d") startDate = now - 1 month     // note: month, not exactly 30 days
else if (range === "6m") startDate = now - 6 months
// "all" -> no startDate filter, all-time
```
Aggregates the `Enrollment` collection grouped by day (`%Y-%m-%d`), sorted ascending by date. Response:
```json
{ "stats": [{ "date": "YYYY-MM-DD", "students": 3 }, ...], "message": "..." }
```

## Steps

1. **New service function** — add `getCourseEnrollmentStats(courseId, range)` to `services/course.ts` (co-locate with other course-stat calls):
   ```ts
   export const getCourseEnrollmentStats = async (courseId: string, range: "7d" | "30d" | "6m" | "all" = "30d") => {
     const api = await getApiInstance();
     const response = await api.get(`/api/course/stats/${courseId}`, { params: { range } });
     return response.data.stats as { date: string; students: number }[]; // parse .stats directly, not .data
   };
   ```

2. **New screen** `pages/EnrollmentStatsPage.tsx`, reached via `navigation.navigate("EnrollmentStats", { courseId })` from the teacher's course-detail screen (`CourseDetailsPage.tsx`), mirroring where web's button lives — add an equivalent "Enrollment Stats"/stats-icon action there.

3. **Header**: "Enrollment Trends" title with a calendar-style icon + subtitle "Overview of student sign-ups" (exact copy).

4. **Range selector**: segmented control with exactly 4 options and these exact values: `"7d"`, `"30d"`, `"6m"`, `"all"`. Default selection: `"30d"`. Changing the selection re-fetches (`useEffect` on `[courseId, range]` equivalent). Selected segment gets a distinct highlighted style (web uses white/panel background + green text).

5. **Chart**: area/line chart, `x = date` (raw `"YYYY-MM-DD"` string, no reformatting — matches web, which does not reformat the date for the axis), `y = students`, fixed height area (web uses 300px — pick an equivalent fixed height in RN). Web's exact color: stroke `#16a34a` (green-600), fill gradient fading from ~30% to 0% opacity of the same green. Y-axis: integers only (no decimals). Use the existing hand-rolled `LineChartSVG`-style approach from `CourseAnalyticsPage.tsx` as the base (extend it to support an area-fill gradient if you want visual parity, or ship as a plain line chart if that's not worth the extra work — the data/interaction logic matters more than the exact fill gradient).

6. **No summary stat tiles** — web does not show "Total enrollments" or "growth %" cards around this chart, just the header + range selector + chart. Don't add them; if useful later, this would be new scope beyond porting web, not part of this phase.

7. **Loading state**: centered spinner + "Fetching analytics..." text inside the chart area.

8. **Error state**: centered warning icon + italic "Could not load enrollment data." text (on any fetch failure).

9. **Empty state**: dashed-border box, "No enrollment data found for this period." (shown whenever the parsed `stats` array is empty for the selected range — with the parsing bug fixed, this should now correctly reflect real data instead of always triggering).

10. Register as a Stack screen (not Drawer) in `AppNavigator.tsx`, same section as `CourseAnalytics`.

## Verify

- As a teacher, open Enrollment Stats for a course with enrollments spread across multiple days.
- Confirm switching between 7d/30d/6m/all actually changes the chart's data (this is the regression test for the parsing-bug fix — on web this never worked, so there's no working reference behavior to visually diff against; validate against raw `GET /api/course/stats/:id?range=X` responses directly instead).
- Confirm a course with zero enrollments in the selected range shows the empty state, not a broken/blank chart.
- Confirm a network failure shows the error state, not a crash.
