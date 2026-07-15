// src/utils/courseUtils.ts

/**
 * Get ordinal suffix for a day number (e.g., "st", "nd", "rd", "th").
 */
export function getOrdinal(day: number): string {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }
  
  /**
   * Format a date string (ISO) to a human-readable format with ordinal.
   * Example: "2025-01-01T00:00:00.000Z" → "January 1st, 2025"
   */
  export function formatDateWithOrdinal(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();
    return `${month} ${day}${getOrdinal(day)}, ${year}`;
  }
  
  /**
   * Format a Date object to "Month Day, Year".
   * Example: new Date(2025, 0, 1) → "January 1, 2025"
   */
  export function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  /**
   * Format a Date object to "HH:MM AM/PM".
   * Example: new Date(2025, 0, 1, 14, 30) → "2:30 PM"
   */
  export function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  
  /**
   * Convert an ISO date string to "dd/mm/yyyy".
   * Example: "2025-01-01T00:00:00.000Z" → "01/01/2025"
   */
  export function formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }
  
  /**
   * Parse a "dd/mm/yyyy" string into a Date object (UTC).
   * Example: "01/01/2025" → Date(2025-01-01T00:00:00.000Z)
   */
  export function parseDateFromInput(dateString: string): Date {
    const [day, month, year] = dateString.split("/");
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }