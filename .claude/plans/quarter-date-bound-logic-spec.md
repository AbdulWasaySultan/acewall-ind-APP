# Spec: Quarter/Semester-Bounded Due Date Selection

Extracted from the `acewall-ind` mobile app's working implementation, for porting into a sibling app (`acewallschool`). Hand this whole file to Claude Code in that project.

## 0. Verify against THIS app's own backend before implementing

`acewallschool` has its own separate backend — it is not guaranteed to be identical to `acewall-ind`'s. Everything below (the data model in §2, the API endpoint in §4.1 step 1, the field names, the "backend doesn't validate this" finding in §5) was extracted from `acewall-ind`'s backend and may not hold here. **Before wiring any of this up, Claude Code must first check `acewallschool`'s own backend**, specifically:

- Does its Quarter/Semester model actually have `startDate`/`endDate` fields with these exact names? Confirm the schema directly instead of assuming this doc's field names are correct.
- Is there an equivalent "get quarter dates" endpoint, and does it return the same shape (`{ startDate, endDate }`), or a different one (e.g. nested under a `quarter` object, or including extra fields like a semester range or an "isCurrent" flag)?
- Does `acewallschool`'s backend already validate due dates against quarter bounds on create/edit/override? If it already does, don't just bolt the client-side rule in §3/§4 on top blindly — check whether the server's rule actually matches this doc's rule (today-floor on create/extend, no floor on edit, hard quarter bound always) and reconcile any difference. The server is the source of truth for what's actually enforced; the client-side logic in this doc must match it, not the other way around.
- Are assessments/discussions in `acewallschool` even organized by quarter the same way, or could there be a different scoping concept (e.g. semester-only, term-only, no quarter at all)? Adapt the `QuarterDateRange` bounds to whatever the real scoping entity is.

Treat §2–§6 below as the *pattern* to replicate (the shape of the logic, the today-floor/no-floor distinction between create and edit, the need for both client and server validation), not as literal ground truth for `acewallschool`'s schema or endpoints — those must be confirmed against its own backend first.

## 1. Business rule

For any due-date field a **teacher** sets on an **assessment** or **discussion** (create, edit, or per-student extension), the selectable date range is bounded by the item's **active quarter**:

- A date **before the quarter's `startDate`** is never allowed.
- A date **after the quarter's `endDate`** is never allowed.
- On **create** flows and **extend/override** flows, a date **before today** is also never allowed (you can't create or grant a due date that's already passed).
- On **edit** flows, past dates ARE allowed, deliberately — see §4.2 for why.
- If the quarter itself has already fully ended (`endDate < today`), **no date is selectable at all** for create/extend flows — the picker should be disabled with an explanatory message, not just have a broken min/max range.

A Quarter always belongs to exactly one Semester, and a quarter's own `startDate`/`endDate` are already constrained to fall inside its parent semester's range at quarter-creation/edit time. So bounding a due date to the **active quarter** automatically respects the semester too — there's no separate semester-level check needed as long as quarter integrity holds. (If your sibling app has courses/items that aren't quarter-scoped and only have a semester, apply the exact same functions below using the semester's `{startDate, endDate}` in place of the quarter's — the helpers are written generically against `{startDate, endDate}`, not quarter-specific.)

## 2. Data model

```ts
interface QuarterDateRange {
  startDate: string | Date;
  endDate: string | Date;
}
```

Backend Quarter schema (Mongoose, for reference):
```js
{
  title: String,
  startDate: Date,
  endDate: Date,
  isArchived: Boolean,
  semester: ObjectId, // ref Semester
}
```
Semester schema has the same `startDate`/`endDate` shape, scoped to a course.

There's no "isCurrent"/"active" flag on the model — "active quarter" is inferred purely by comparing `today` against `startDate`/`endDate` client-side (or should be, server-side — see §6).

## 3. Core reusable utility (`utils/dateValidation.ts`)

This is the exact, already-proven module from the mobile app. Copy it verbatim — every due-date UI in the app should route through these functions rather than each screen inventing its own min/max math (that inconsistency is exactly what went wrong in this app's web frontend — see §5).

```ts
// Shared due-date restriction logic for assessments and discussions.
//
// Business rules:
//  1. No past dates — anything before today is unselectable.
//  2. Today is only valid if it falls within the active quarter's range.
//  3. Dates outside the quarter's [startDate, endDate] are unselectable.
// A quarter that has already ended (endDate < today) has NO valid dates at
// all — callers should check `isQuarterOpenForSelection` and disable date
// selection entirely in that case, rather than relying solely on min/max.

export interface QuarterDateRange {
  startDate: string | Date;
  endDate: string | Date;
}

export const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const getTodayStart = (): Date => startOfDay(new Date());

/** False means the quarter's date range has already fully elapsed — no date, including today, can be selected. */
export const isQuarterOpenForSelection = (
  quarter?: QuarterDateRange | null
): boolean => {
  if (!quarter?.endDate) return true;
  return startOfDay(new Date(quarter.endDate)) >= getTodayStart();
};

/** minimumDate for a DateTimePicker: max(today, quarterStart). */
export const getQuarterPickerMinDate = (
  quarter?: QuarterDateRange | null
): Date => {
  const today = getTodayStart();
  if (!quarter?.startDate) return today;
  const quarterStart = startOfDay(new Date(quarter.startDate));
  return quarterStart > today ? quarterStart : today;
};

/** maximumDate for a DateTimePicker: the quarter's end date, if any. */
export const getQuarterPickerMaxDate = (
  quarter?: QuarterDateRange | null
): Date | undefined => {
  if (!quarter?.endDate) return undefined;
  return new Date(quarter.endDate);
};

export interface DateSelectionResult {
  valid: boolean;
  reason?: string;
}

/**
 * Authoritative submit-time validation — always run this even when the
 * native picker already has minimumDate/maximumDate set, since some
 * platforms don't reliably clamp an out-of-range default `value`.
 */
export const validateSelectedDate = (
  date: Date | null | undefined,
  quarter?: QuarterDateRange | null
): DateSelectionResult => {
  if (!date) return { valid: false, reason: "Please select a date." };

  if (quarter && !isQuarterOpenForSelection(quarter)) {
    return {
      valid: false,
      reason: "This quarter has already ended, so no date can be selected.",
    };
  }

  const today = getTodayStart();
  if (startOfDay(date) < today) {
    return { valid: false, reason: "Date cannot be in the past." };
  }

  if (quarter?.startDate && quarter?.endDate) {
    const quarterStart = new Date(quarter.startDate);
    const quarterEnd = new Date(quarter.endDate);
    if (
      date.getTime() < quarterStart.getTime() ||
      date.getTime() > quarterEnd.getTime()
    ) {
      return {
        valid: false,
        reason: `Date must be between ${quarterStart.toLocaleDateString()} and ${quarterEnd.toLocaleDateString()}.`,
      };
    }
  }

  return { valid: true };
};

// ── EDIT-flow variants ──────────────────────────────────────────────────
// Editing an EXISTING assessment/discussion deliberately does NOT floor the
// min date at "today" — this lets a teacher correct/backdate an existing
// item's due date even after it (or its quarter) has already passed. Create
// flows and extension flows must never allow this; use the functions above
// for those instead.

/** minDate for editing: the earlier of quarterStart/quarterEnd — no "today" floor. */
export const getQuarterEditMinDate = (
  quarter?: QuarterDateRange | null
): Date | undefined => {
  if (!quarter?.startDate || !quarter?.endDate) return undefined;
  const start = new Date(quarter.startDate);
  const end = new Date(quarter.endDate);
  return start < end ? start : end;
};

/** maxDate for editing: the later of quarterStart/quarterEnd — no "today" floor. */
export const getQuarterEditMaxDate = (
  quarter?: QuarterDateRange | null
): Date | undefined => {
  if (!quarter?.startDate || !quarter?.endDate) return undefined;
  const start = new Date(quarter.startDate);
  const end = new Date(quarter.endDate);
  return end > start ? end : start;
};

/** Submit-time validation for editing: quarter range only, no "today" floor. */
export const validateEditedDate = (
  date: Date | null | undefined,
  quarter?: QuarterDateRange | null
): DateSelectionResult => {
  if (!date) return { valid: false, reason: "Please select a date." };

  const minDate = getQuarterEditMinDate(quarter);
  const maxDate = getQuarterEditMaxDate(quarter);
  if (minDate && maxDate) {
    if (date.getTime() < minDate.getTime() || date.getTime() > maxDate.getTime()) {
      return {
        valid: false,
        reason: `Date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}.`,
      };
    }
  }

  return { valid: true };
};
```

## 4. Which function set to use, per flow

| Flow | Functions to use | Today-floor? | Why |
|---|---|---|---|
| **Create assessment** (new due date) | `getQuarterPickerMinDate` / `getQuarterPickerMaxDate` / `validateSelectedDate` | Yes | New items can't be due in the past. |
| **Create discussion** (new due date) | Same as above | Yes | Same reasoning — keep parity with assessments; don't replicate the web app's inconsistency (§5) where discussion-create skips the today-floor. |
| **Edit assessment** (existing due date) | `getQuarterEditMinDate` / `getQuarterEditMaxDate` / `validateEditedDate` | **No** | A teacher must be able to correct/backdate a due date on an item whose quarter has already passed. |
| **Edit discussion** (existing due date) | Same as edit-assessment | **No** | Same reasoning, for parity. |
| **Extend/override due date for specific students** (assessment or discussion) | `getQuarterPickerMinDate` / `getQuarterPickerMaxDate` / `validateSelectedDate` | Yes | Granting an extension is inherently forward-looking — you can't grant an extension to a date that's already passed. This is a deliberate design choice, not an accident; if your product wants extensions to also allow backdating, swap in the edit-flow functions instead, but be consistent about it everywhere extensions are set. |

### 4.1 Wiring pattern (per flow)

1. On modal/screen open, fetch the item's quarter dates: `GET /api/quarter/getDatesofQuarter/:quarterId` → `{ startDate, endDate }`. Store as `QuarterDateRange` state (`{ startDate, endDate }`). If the fetch fails, fall back to no quarter restriction beyond whatever floor applies (today, for create/extend) rather than blocking the whole form — swallow the fetch error silently and proceed with `quarter = null`.
2. Pass `minimumDate={getQuarterPickerMinDate(quarter)}` / `maximumDate={getQuarterPickerMaxDate(quarter)}` (or the edit-flow equivalents) straight into the native date picker component.
3. Show a small "Quarter range: {min} – {max}" hint text under the picker so the bound is visible, not just enforced silently.
4. **Always** re-run `validateSelectedDate`/`validateEditedDate` at submit time before firing the API call, even though the picker already has min/max set — some platforms don't reliably clamp an out-of-range default `value` (e.g. if `quarter` loads asynchronously after the picker's initial value was already set). On failure, surface `result.reason` as a toast/inline error and block submission.
5. For create/extend flows specifically, also check `isQuarterOpenForSelection(quarter)` up front — if the quarter has already fully ended, disable the date picker entirely (don't just rely on min > max silently producing a broken picker) and show "This quarter has already ended."

### 4.2 Why edit flows don't floor at "today"

This is intentional, not an oversight: if a teacher is fixing a typo'd due date on an assessment that was created for a quarter that's since ended, they need to be able to set it to a date in the past (matching the original intended due date). Create and extend flows don't have this need — there's no existing due date to "correct," so a today-floor is safe and expected.

## 5. Pitfalls found in this app's OTHER codebases — do not replicate these

While extracting this logic, auditing this monorepo's backend and web frontend surfaced real inconsistencies in the *existing* (non-mobile) implementations. Avoid repeating them in the sibling app:

- **The backend does not validate any of this.** `createAssessment`, `editAssessmentInfo`, `setDueDateForStudent` (assessment), `createDiscussion`, `editDiscussionInfo`, and `setDueDateForStudentsDiscussion` all persist whatever `dueDate`/`newDueDate` the client sends, with zero comparison against the quarter's `startDate`/`endDate`. Validation is 100% client-side and thus 100% bypassable (bad client, direct API call, or a future client that just forgets). **Recommendation for the sibling app: re-implement `validateSelectedDate`/`validateEditedDate`'s logic server-side too**, in the corresponding create/edit/override controllers, by fetching the quarter for the given `quarterId` and rejecting out-of-range dates with a 400. Don't ship client-only validation as the sole guard.
- **Web's Create Discussion flow doesn't floor at today** (only Create Assessment does) — an inconsistency between two flows that should behave the same way. Make sure both assessment and discussion create flows use the *same* function set.
- **Web has no submit-time re-validation at all** for: Create Discussion, Edit Discussion's main due date, Edit Discussion's per-student override, and Edit Assessment's per-student override. Only Create Assessment and Edit Assessment's *main* due date re-validate before submit. Every one of these should re-validate — the picker's min/max alone isn't a hard guarantee (see §4.1 step 4).
- **Web has a second, standalone "Extend Due Date for Specific Students" page for discussions** (`dueDate-setting.jsx`) that doesn't fetch quarter dates at all — its `minDate`/`maxDate` props are literally commented out. A teacher using that specific page can set a discussion due-date override to *any* date with zero quarter restriction, client or server side. If the sibling app has more than one UI entry point for the same "extend due date" action, make sure **all** of them go through the same validated code path — don't let a second surface silently skip the rule.

## 6. Summary checklist for the sibling app

- [ ] **First**, verify this doc's assumptions against `acewallschool`'s own backend per §0 — schema field names, the quarter-dates endpoint shape, and whether server-side validation already exists and matches (or conflicts with) this rule. Do not skip this step.
- [ ] Port `utils/dateValidation.ts` (§3) verbatim, adjusted for whatever §0 turns up.
- [ ] Every due-date picker (assessment create/edit, discussion create/edit, extension/override for either) fetches its quarter's `{startDate, endDate}` and wires `minimumDate`/`maximumDate` from the correct function set per §4's table.
- [ ] Every one of those flows re-validates at submit time (§4.1 step 4) — no exceptions, including override/extension flows and every entry point if there's more than one UI for the same action.
- [ ] Create/extend flows check `isQuarterOpenForSelection` up front and disable the picker with a clear message if the quarter's already over.
- [ ] Add the same validation server-side in the corresponding controllers (§5) — don't rely on client-only enforcement.
