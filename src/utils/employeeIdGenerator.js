/**
 * Utility for generating standardized Employee Login IDs
 * Formula: OI + first2(first name) + first2(last name) + YYYY + 4-digit serial
 * Example: John Doe joining in 2022 -> OIJODO20220001
 */
export function generateEmployeeLoginId(firstName = '', lastName = '', year = new Date().getFullYear(), serial = 1, companyPrefix = 'OI') {
  const prefix = (companyPrefix || 'OI').replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase().padEnd(2, 'O');
  const first2 = (firstName || '').replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase().padEnd(2, 'X');
  const last2 = (lastName || '').replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase().padEnd(2, 'X');
  const formattedSerial = String(serial || 1).padStart(4, '0');

  return `${prefix}${first2}${last2}${year}${formattedSerial}`;
}

export default generateEmployeeLoginId;
