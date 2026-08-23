const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function endOfLocalDay(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day, 23, 59, 59, 999);
}

/**
 * Deadline is always midnight at the end of the due calendar day.
 * Time on the stored datetime is ignored.
 */
export function getDueInstant(endDate: string): Date | null {
  const trimmed = endDate.trim();
  const dateOnly = DATE_ONLY.exec(trimmed);
  if (dateOnly) {
    return endOfLocalDay(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3])
    );
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;

  return endOfLocalDay(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
}

export function isOverdue(
  endDate: string | null | undefined,
  now = new Date()
) {
  if (!endDate) return false;
  const due = getDueInstant(endDate);
  if (!due) return false;
  return now.getTime() > due.getTime();
}

export function countOverdue(
  dates: Array<string | null | undefined>,
  now = new Date()
) {
  return dates.filter((value) => isOverdue(value, now)).length;
}

export function getOverdueDuration(
  endDate: string,
  now = new Date()
): { value: number; unit: "day" | "days" | "hour" | "hours" } | null {
  const due = getDueInstant(endDate);
  if (!due) return null;

  const ms = Math.max(0, now.getTime() - due.getTime());
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days >= 1) {
    return { value: days, unit: days === 1 ? "day" : "days" };
  }

  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 1) {
    return { value: hours, unit: hours === 1 ? "hour" : "hours" };
  }

  return null;
}