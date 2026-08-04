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
// Web's edit-assessment/edit-discussion forms (EditAssessment.jsx,
// EditDiscussion.jsx) deliberately do NOT floor the min date at "today" —
// only `minDate = min(quarterStart, quarterEnd)` / `maxDate = max(...)`.
// This lets a teacher correct/backdate an existing item's due date even
// after it (or its quarter) has already passed, which create flows must
// never allow. Use these instead of the create-flow helpers above when
// editing an existing assessment or discussion.

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
