/**
 * Calendar utility functions for attendance monitoring
 * 
 * DECISION: Calendar logic placed in frontend
 * RATIONALE: This is lightweight, display-only logic for determining expected attendance cycles.
 * It doesn't affect backend data contracts and can be safely computed on the client without
 * re-validation. If this becomes complex or data-driven in the future, it can be moved to the backend.
 */

import { format, startOfMonth, endOfMonth, differenceInWeeks, eachWeekOfInterval } from 'date-fns'

/**
 * Determine the number of attendance cycles (weeks) in a given month
 * @param date - A date within the month to analyze
 * @returns Number of weeks (4 or 5) in the month
 */
export function getWeeksInMonth(date: Date): number {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  
  // Get all weeks in the month (each week starts on Monday by default in date-fns)
  const weeks = eachWeekOfInterval({
    start: monthStart,
    end: monthEnd,
  })
  
  return weeks.length
}

/**
 * Get the current month and year
 * @returns Object with month name and year
 */
export function getCurrentMonthInfo(): { month: string; year: string } {
  const now = new Date()
  return {
    month: format(now, 'MMMM'), // e.g., "February"
    year: format(now, 'yyyy'), // e.g., "2025"
  }
}

/**
 * Determine the status badge color based on weeks owed
 * Logic:
 * - Red (🔴): No submission for a full month (≥4 weeks owed on a 4-week month, or ≥5 weeks on a 5-week month)
 * - Yellow (🟡): 1 week late (last_filled_week < current_week - 1)
 * - Green (🟢): 2 weeks late (last_filled_week < current_week - 2)
 */
// export function getStatusBadge(status: 'red' | 'yellow' | 'green' | 'orange'): { color: string; label: string; emoji: string } {
//   const statusMap = {
//     red: { color: 'red', label: 'No Submission (1+ Month)', emoji: '' },
//     yellow: { color: 'yellow', label: '1 Week Late', emoji: '' },
//     green: { color: 'green', label: '2 Weeks Late', emoji: '' },
//   }
//   return statusMap[status] || statusMap.green
// }

// In lib/calendar-utils.ts
export function getStatusBadge(status: string) {
    switch(status) {
        case 'red':
            return {
                emoji: '🔴',
                label: 'No Submission',
                color: 'red'
            };
        case 'orange':
            return {
                emoji: '🟠',
                label: '2+ Weeks Late',
                color: 'orange'
            };
        case 'yellow':
            return {
                emoji: '🟡',
                label: '1 Week Late',
                color: 'yellow'
            };
        case 'green':
            return {
                emoji: '🟢',
                label: 'Up to Date',
                color: 'green'
            };
        default:
            return {
                emoji: '⚪',
                label: 'Unknown',
                color: 'gray'
            };
    }
}

/**
 * Calculate weeks owed based on last filled week
 * @param lastFilledWeek - The week number when attendance was last submitted
 * @param currentWeek - The current week number (1-5)
 * @returns Number of weeks owed
 */
export function calculateWeeksOwed(lastFilledWeek: number, currentWeek: number): number {
  return Math.max(0, currentWeek - lastFilledWeek)
}
