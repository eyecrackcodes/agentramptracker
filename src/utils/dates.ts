/**
 * Calculates a start date based on tenure in months, backtracking from March 10, 2025
 * @param tenureMonths Tenure in months (can include decimal points for partial months)
 * @returns Calculated start date
 */
export function calculateStartDateFromTenure(tenureMonths: number): Date {
  // The reference date from the data set (March 10, 2025)
  const referenceDate = new Date(2025, 2, 10); // Month is 0-indexed

  // Calculate months to subtract
  const totalMonths = Math.floor(tenureMonths);
  const extraDays = Math.round((tenureMonths - totalMonths) * 30); // Approximate days for partial months

  // Create new date by subtracting months
  const startDate = new Date(referenceDate);
  startDate.setMonth(startDate.getMonth() - totalMonths);
  startDate.setDate(startDate.getDate() - extraDays);

  return startDate;
}

/**
 * Calculates tenure in months based on a start date, measured from March 10, 2025
 * @param startDate The agent's start date
 * @returns Tenure in months (with decimal precision)
 */
export function calculateTenureFromStartDate(startDate: Date): number {
  // The reference date from the data set (March 10, 2025)
  const referenceDate = new Date(2025, 2, 10); // Month is 0-indexed

  // Calculate difference in milliseconds
  const diffMs = referenceDate.getTime() - startDate.getTime();

  // Convert to days
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Convert to months (approximate)
  const diffMonths = diffDays / 30;

  // Round to 1 decimal place
  return Math.round(diffMonths * 10) / 10;
}

/**
 * Format a date as MM/DD/YYYY
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}
