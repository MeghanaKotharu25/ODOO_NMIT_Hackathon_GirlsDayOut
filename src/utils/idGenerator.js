/**
 * Generates an employee ID based on the company name, employee name, year, and serial number.
 * Format: [CompanyInitials][First2LastName][Year][Serial]
 * Example: Odoo India, John Doe, 2022, 1 -> OIJODO20220001
 * 
 * @param {string} companyName - Full company name (e.g., "Odoo India")
 * @param {string} firstName - Employee's first name
 * @param {string} lastName - Employee's last name
 * @param {number|string} year - Year of joining
 * @param {number} serial - Serial number of joining for that year
 * @returns {string} The generated Employee ID
 */
export function generateEmployeeId(companyName, firstName, lastName, year, serial) {
  // Extract Company Initials (first letter of first two words, or first two letters if one word)
  const companyWords = companyName.trim().split(/\s+/);
  let companyInitials = '';
  if (companyWords.length >= 2) {
    companyInitials = (companyWords[0][0] + companyWords[1][0]).toUpperCase();
  } else {
    companyInitials = companyName.substring(0, 2).toUpperCase();
  }

  // Extract Name Initials (First two letters of first name + First two letters of last name)
  const firstInitials = (firstName.substring(0, 2)).toUpperCase().padEnd(2, 'X');
  const lastInitials = (lastName.substring(0, 2)).toUpperCase().padEnd(2, 'X');
  const nameInitials = `${firstInitials}${lastInitials}`;

  // Format Serial Number (pad with leading zeros to 4 digits)
  const formattedSerial = String(serial).padStart(4, '0');

  return `${companyInitials}${nameInitials}${year}${formattedSerial}`;
}
