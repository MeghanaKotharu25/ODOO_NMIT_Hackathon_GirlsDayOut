/**
 * Shared utility functions for calculating attendance hours and tardiness.
 */

/**
 * Calculates work hours between a check-in and check-out time.
 * @param {string|Date} checkIn - The check-in ISO string or Date object.
 * @param {string|Date} checkOut - The check-out ISO string or Date object.
 * @returns {number} The hours worked. Returns 0 if invalid or missing.
 */
export function calculateWorkHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  
  const cin = new Date(checkIn);
  const cout = new Date(checkOut);
  
  if (isNaN(cin) || isNaN(cout)) return 0;
  
  return (cout - cin) / 3600000;
}

/**
 * Calculates scheduled hours from default shift times.
 * @param {string} defaultInTime - e.g. "09:00:00"
 * @param {string} defaultOutTime - e.g. "17:30:00"
 * @param {number} fallbackHours - The fallback if times are invalid/missing.
 * @returns {number} The expected hours of work for the shift.
 */
export function calculateScheduledHours(defaultInTime, defaultOutTime, fallbackHours = 8.5) {
  if (!defaultInTime || !defaultOutTime) return fallbackHours;
  
  try {
    const [inH, inM] = defaultInTime.split(':').map(Number);
    const [outH, outM] = defaultOutTime.split(':').map(Number);
    
    if (isNaN(inH) || isNaN(outH)) return fallbackHours;
    
    return (outH + outM / 60) - (inH + inM / 60);
  } catch (e) {
    return fallbackHours;
  }
}

/**
 * Checks if an actual check-in time is considered "late" based on the scheduled start time.
 * Allowing a grace period of 5 minutes.
 * @param {string|Date} actualCheckIn - The ISO string or Date object.
 * @param {string} defaultInTime - e.g. "09:00:00"
 * @param {number} gracePeriodMinutes - Minutes allowed after start time before being flagged late.
 * @returns {boolean} True if late, false otherwise.
 */
export function isLateCheckIn(actualCheckIn, defaultInTime, gracePeriodMinutes = 5) {
  if (!actualCheckIn || !defaultInTime) return false;
  
  const cin = new Date(actualCheckIn);
  if (isNaN(cin)) return false;
  
  try {
    const [inH, inM] = defaultInTime.split(':').map(Number);
    if (isNaN(inH) || isNaN(inM)) return false;
    
    const expectedTime = new Date(cin);
    expectedTime.setHours(inH, inM + gracePeriodMinutes, 0, 0);
    
    return cin > expectedTime;
  } catch (e) {
    return false;
  }
}
