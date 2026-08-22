export const mockEmployees = [
	['Sarah', 'Chen', 'Senior Frontend Engineer', 'Engineering', 'Present'],
	['Marcus', 'Johnson', 'Product Designer', 'Design', 'On Leave'],
	['Elena', 'Rodriguez', 'HR Director', 'Human Resources', 'Present'],
	['David', 'Kim', 'Backend Engineer', 'Engineering', 'Absent'],
	['Aisha', 'Patel', 'Marketing Lead', 'Marketing', 'Present'],
	['James', 'Wilson', 'Sales Representative', 'Sales', 'Present'],
	['Chloe', 'Martin', 'Product Manager', 'Product', 'On Leave'],
	['Daniel', 'Garcia', 'Customer Success', 'Support', 'Present'],
	['Sophia', 'Lee', 'UX Researcher', 'Design', 'Present'],
	['Liam', 'Brown', 'DevOps Engineer', 'Engineering', 'Absent'],
	['Olivia', 'Taylor', 'Financial Analyst', 'Finance', 'Present'],
	['Noah', 'Anderson', 'Legal Counsel', 'Legal', 'Present'],
].map(([firstName, lastName, position, department, status], index) => ({
	id: `EMP-${String(index + 1).padStart(3, '0')}`,
	firstName,
	lastName,
	email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@dayflow.io`,
	position,
	department,
	status,
	joinDate: '2023-01-15',
	avatarUrl: `https://i.pravatar.cc/150?u=EMP-${String(index + 1).padStart(3, '0')}`,
}));

export const mockCurrentUser = mockEmployees[2];

export const mockPayroll = mockEmployees.map((employee, index) => {
	const baseSalary = 5000 + (index * 500);
	const totalDeductions = baseSalary * 0.15;

	return {
		employeeId: employee.id,
		firstName: employee.firstName,
		lastName: employee.lastName,
		department: employee.department,
		baseSalary,
		grossEarnings: baseSalary,
		totalDeductions,
		netPayable: baseSalary - totalDeductions,
		status: index % 3 === 0 ? 'Processed' : 'Paid',
		lastUpdated: new Date().toISOString().split('T')[0],
	};
});

