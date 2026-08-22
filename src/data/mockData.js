export const mockEmployees = [
  {
    id: "EMP-001",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@dayflow.io",
    position: "Senior Frontend Engineer",
    department: "Engineering",
    status: "Present",
    joinDate: "2023-01-15",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-001"
  },
  {
    id: "EMP-002",
    firstName: "Marcus",
    lastName: "Johnson",
    email: "marcus.j@dayflow.io",
    position: "Product Designer",
    department: "Design",
    status: "On Leave",
    joinDate: "2023-03-01",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-002"
  },
  {
    id: "EMP-003",
    firstName: "Elena",
    lastName: "Rodriguez",
    email: "elena.r@dayflow.io",
    position: "HR Director",
    department: "Human Resources",
    status: "Present",
    joinDate: "2022-11-10",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-003"
  },
  {
    id: "EMP-004",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@dayflow.io",
    position: "Backend Engineer",
    department: "Engineering",
    status: "Absent",
    joinDate: "2023-06-20",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-004"
  },
  {
    id: "EMP-005",
    firstName: "Aisha",
    lastName: "Patel",
    email: "aisha.p@dayflow.io",
    position: "Marketing Lead",
    department: "Marketing",
    status: "Present",
    joinDate: "2024-01-05",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-005"
  },
  {
    id: "EMP-006",
    firstName: "James",
    lastName: "Wilson",
    email: "james.w@dayflow.io",
    position: "Sales Representative",
    department: "Sales",
    status: "Present",
    joinDate: "2024-02-14",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-006"
  },
  {
    id: "EMP-007",
    firstName: "Chloe",
    lastName: "Martin",
    email: "chloe.m@dayflow.io",
    position: "Product Manager",
    department: "Product",
    status: "On Leave",
    joinDate: "2023-08-11",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-007"
  },
  {
    id: "EMP-008",
    firstName: "Daniel",
    lastName: "Garcia",
    email: "daniel.g@dayflow.io",
    position: "Customer Success",
    department: "Support",
    status: "Present",
    joinDate: "2023-09-30",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-008"
  },
  {
    id: "EMP-009",
    firstName: "Sophia",
    lastName: "Lee",
    email: "sophia.l@dayflow.io",
    position: "UX Researcher",
    department: "Design",
    status: "Present",
    joinDate: "2024-03-12",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-009"
  },
  {
    id: "EMP-010",
    firstName: "Liam",
    lastName: "Brown",
    email: "liam.b@dayflow.io",
    position: "DevOps Engineer",
    department: "Engineering",
    status: "Absent",
    joinDate: "2022-07-22",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-010"
  },
  {
    id: "EMP-011",
    firstName: "Olivia",
    lastName: "Taylor",
    email: "olivia.t@dayflow.io",
    position: "Financial Analyst",
    department: "Finance",
    status: "Present",
    joinDate: "2023-05-18",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-011"
  },
  {
    id: "EMP-012",
    firstName: "Noah",
    lastName: "Anderson",
    email: "noah.a@dayflow.io",
    position: "Legal Counsel",
    department: "Legal",
    status: "Present",
    joinDate: "2022-09-01",
    avatarUrl: "https://i.pravatar.cc/150?u=EMP-012"
  }
];

export const mockCurrentUser = mockEmployees[2]; // Elena (HR Director / Admin)

export const mockPayroll = mockEmployees.map((emp, index) => {
  const baseSalary = 5000 + (index * 500);
  const deductions = baseSalary * 0.15; // 15% tax/deductions
  const netPay = baseSalary - deductions;

  return {
    employeeId: emp.id,
    firstName: emp.firstName,
    lastName: emp.lastName,
    department: emp.department,
    baseSalary: baseSalary,
    grossEarnings: baseSalary,
    totalDeductions: deductions,
    netPayable: netPay,
    status: index % 3 === 0 ? "Processed" : "Paid",
    lastUpdated: new Date().toISOString().split('T')[0]
  };
});
