import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { mockEmployees, mockCurrentUser } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import './EmployeeDetails.css';

export function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use mockCurrentUser if id is undefined (i.e. 'My Profile' route) or if fetching employee
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('Private Info');

  useEffect(() => {
    if (id) {
      setEmployee(mockEmployees.find(emp => emp.id === id));
    } else {
      setEmployee(mockCurrentUser);
    }
  }, [id]);

  // Salary Calculator State
  const [monthWage, setMonthWage] = useState(50000);
  
  if (!employee) return <div className="text-white p-8">Loading...</div>;

  const isAdmin = mockCurrentUser?.role === 'ADMIN' || mockCurrentUser?.role === 'HR';
  
  // Salary Calculations
  const yearlyWage = monthWage * 12;
  const baseSalary = monthWage * 0.5; // 50% of basic
  const standardAllowance = baseSalary * 0.15; // Assuming 15%
  const performanceBonus = baseSalary * 0.0833; // 8.33%
  const leaveTravelAllowance = baseSalary * 0.0833; // 8.33%
  const fixedAllowance = baseSalary * 0.1834; // Remaining to balance
  const pfContribution = baseSalary * 0.12; // 12%
  const professionalTax = 200; // Fixed

  const tabs = ['Resume', 'Private Info'];
  if (isAdmin) tabs.push('Salary Info');

  return (
    <div className="dossier-page bg-[#050505] min-h-screen text-gray-300 p-8 font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-xl font-serif">My Profile</h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-white">Employees</span>
          <span className="cursor-pointer hover:text-white">Attendance</span>
          <span className="cursor-pointer hover:text-white">Time Off</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border border-gray-800 rounded-lg bg-[#0a0a0a] overflow-hidden">
        {/* Header Section */}
        <div className="flex border-b border-gray-800 p-8">
          <div className="relative">
            <img src={employee.avatarUrl} alt={employee.firstName} className="w-32 h-32 rounded-full border border-gray-700" />
            <div className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full border border-gray-700 cursor-pointer hover:bg-gray-700 transition">
              <Edit2 size={16} className="text-pink-500" />
            </div>
          </div>
          
          <div className="ml-8 flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="col-span-2">
              <h2 className="text-2xl font-serif text-white">{employee.firstName} {employee.lastName}</h2>
            </div>
            
            <div className="flex">
              <span className="w-24 text-gray-500 text-sm">Login ID</span>
              <span className="text-blue-400 font-mono text-sm">{employee.id}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500 text-sm">Company</span>
              <span className="text-sm">Odoo India</span>
            </div>
            
            <div className="flex">
              <span className="w-24 text-gray-500 text-sm">Email</span>
              <span className="text-blue-400 font-mono text-sm">{employee.email}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500 text-sm">Department</span>
              <span className="text-sm">{employee.department}</span>
            </div>
            
            <div className="flex">
              <span className="w-24 text-gray-500 text-sm">Mobile</span>
              <span className="text-sm font-mono">{employee.phone}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500 text-sm">Manager</span>
              <span className="text-sm text-blue-400">{employee.manager}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 px-8">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-pink-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          
          {/* PRIVATE INFO TAB */}
          {activeTab === 'Private Info' && (
            <div className="grid grid-cols-2 gap-x-16 gap-y-6">
              <div className="space-y-6">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Date of Birth</span>
                  <span className="font-mono">15/04/1992</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Routing Address</span>
                  <span className="text-right max-w-[200px]">123 Tech Park, Bangalore</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Nationality</span>
                  <span>Indian</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Personal Email</span>
                  <span className="text-blue-400 font-mono">{employee.firstName.toLowerCase()}@personal.com</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Gender</span>
                  <span>Male</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Marital Status</span>
                  <span>Single</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Date of Joining</span>
                  <span className="font-mono">{employee.joinDate}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Bank Details</span>
                  <span className="font-mono text-blue-400 cursor-pointer">HDFC Bank Ltd</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">Account Number</span>
                  <span className="font-mono">XXXX-XXXX-1234</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">IFSC Code</span>
                  <span className="font-mono">HDFC0001234</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">PAN Number</span>
                  <span className="font-mono">ABCDE1234F</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">UAN Number</span>
                  <span className="font-mono">100123456789</span>
                </div>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">PF Code</span>
                  <span className="font-mono">MH/BAN/12345</span>
                </div>
              </div>
            </div>
          )}

          {/* RESUME TAB Placeholder */}
          {activeTab === 'Resume' && (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-blue-400 font-serif mb-2">About</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                </p>
                <h3 className="text-blue-400 font-serif mb-2">What I love about my job</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </p>
                <h3 className="text-blue-400 font-serif mb-2">My interests and hobbies</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </p>
              </div>
              <div className="border-l border-gray-800 pl-8">
                <h3 className="text-blue-400 font-serif mb-4">Skills</h3>
                <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                  <li>React JS</li>
                  <li>Node JS</li>
                  <li>System Architecture</li>
                </ul>
                <h3 className="text-blue-400 font-serif mt-8 mb-4">Certifications</h3>
                <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                  <li>AWS Certified Solutions Architect</li>
                  <li>Certified Kubernetes Administrator</li>
                </ul>
              </div>
            </div>
          )}

          {/* SALARY INFO TAB (ADMIN ONLY) */}
          {activeTab === 'Salary Info' && isAdmin && (
            <div>
              <p className="text-center text-gray-500 text-sm mb-6">Salary Info tab Should only be visible to Admin</p>
              
              <div className="flex gap-12">
                {/* Left Column: Calculator */}
                <div className="flex-1 border border-gray-800 p-6 rounded bg-[#111]">
                  <h3 className="text-center text-blue-400 font-serif mb-6 border-b border-gray-800 pb-2">Salary Info</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm">Month Wage</span>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        value={monthWage} 
                        onChange={(e) => setMonthWage(Number(e.target.value))}
                        className="bg-transparent border-b border-gray-700 w-32 text-right text-white font-mono focus:outline-none focus:border-blue-500 px-2"
                      />
                      <span className="ml-2 text-gray-500 text-xs">/ Month</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm">Yearly Wage</span>
                    <div className="flex items-center">
                      <span className="w-32 text-right text-white font-mono px-2">{yearlyWage.toLocaleString()}</span>
                      <span className="ml-2 text-gray-500 text-xs">/ Yearly</span>
                    </div>
                  </div>

                  <h4 className="text-blue-400 text-sm font-semibold mb-4">Salary Components</h4>
                  
                  <div className="space-y-4 text-xs text-gray-400 border-b border-gray-800 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                      <div className="w-1/2 pr-4">
                        <span className="block text-gray-300 mb-1">Base Salary</span>
                        <span className="text-[10px] leading-tight block">Base (Basic salary) pay category must compute it based on monthly wages</span>
                        <span className="text-[10px] text-blue-400 block mt-1">HR provides to employee 50% of the basic salary.</span>
                      </div>
                      <div className="text-right font-mono text-white pt-1">
                        {baseSalary.toFixed(2)} <span className="text-gray-600">/ month</span>
                      </div>
                      <div className="w-16 text-right pt-1">50.00 %</div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="w-1/2 pr-4">
                        <span className="block text-gray-300 mb-1">Standard Allowance</span>
                        <span className="text-[10px] leading-tight block">A standard allowance is a predetermined, fixed amount provided to employee as part of their salary.</span>
                      </div>
                      <div className="text-right font-mono text-white pt-1">
                        {standardAllowance.toFixed(2)} <span className="text-gray-600">/ month</span>
                      </div>
                      <div className="w-16 text-right pt-1">15.00 %</div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="w-1/2 pr-4">
                        <span className="block text-gray-300 mb-1">Performance Bonus</span>
                        <span className="text-[10px] leading-tight block">Variable payout well-doing period. The value defined by the company and calculated as ~ % of the basic salary.</span>
                      </div>
                      <div className="text-right font-mono text-white pt-1">
                        {performanceBonus.toFixed(2)} <span className="text-gray-600">/ month</span>
                      </div>
                      <div className="w-16 text-right pt-1">8.33 %</div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="w-1/2 pr-4">
                        <span className="block text-gray-300 mb-1">Leave Travel Allowance</span>
                        <span className="text-[10px] leading-tight block">LTA is paid by the company to employee to cover their travel expenses and calculated as ~ % of the basic salary.</span>
                      </div>
                      <div className="text-right font-mono text-white pt-1">
                        {leaveTravelAllowance.toFixed(2)} <span className="text-gray-600">/ month</span>
                      </div>
                      <div className="w-16 text-right pt-1">8.33 %</div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="w-1/2 pr-4">
                        <span className="block text-gray-300 mb-1">Fixed Allowance</span>
                        <span className="text-[10px] leading-tight block">Fixed allowance portion of salary is determined after calculating all salary components.</span>
                      </div>
                      <div className="text-right font-mono text-white pt-1">
                        {fixedAllowance.toFixed(2)} <span className="text-gray-600">/ month</span>
                      </div>
                      <div className="w-16 text-right pt-1">18.34 %</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="w-1/2 pr-4 text-xs text-gray-400">
                      <span className="block text-gray-300 mb-1">Provident Fund (PF) Contribution</span>
                      <span className="text-[10px] block">PF is calculated based on the basic salary.</span>
                      <span className="text-[10px] text-blue-400 block">PF is calculated based on the basic salary.</span>
                    </div>
                    <div className="text-right font-mono text-white text-xs pt-1">
                      {pfContribution.toFixed(2)} <span className="text-gray-600">/ month</span>
                    </div>
                    <div className="w-16 text-right text-xs pt-1 text-gray-400">12.00 %</div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="w-1/2 pr-4 text-xs text-gray-400">
                      <span className="block text-gray-300 mb-1">Tax Deductions</span>
                      <span className="text-[10px] block">Professional Fee</span>
                      <span className="text-[10px] block">Professional Fee deducted from the gross salary.</span>
                    </div>
                    <div className="text-right font-mono text-white text-xs pt-1">
                      {professionalTax.toFixed(2)} <span className="text-gray-600">/ month</span>
                    </div>
                    <div className="w-16 text-right text-xs pt-1"></div>
                  </div>
                </div>

                {/* Right Column: Important Note */}
                <div className="w-80 border border-yellow-900 bg-[#1a1505] p-6 rounded h-fit">
                  <h3 className="text-center text-yellow-500 font-serif mb-4">Important</h3>
                  <div className="text-xs text-yellow-600/80 space-y-4 leading-relaxed">
                    <p>The Salary Information tab allows users to define and manage all salary-related details for an employee, including wage type, working schedule, salary components, benefits. Salary components should be calculated automatically based on the defined Wage.</p>
                    
                    <div>
                      <span className="text-yellow-500 block">- Wage Type:</span>
                      Fixed wage
                    </div>
                    
                    <div>
                      <span className="text-yellow-500 block">- Salary Components</span>
                      Section where users can define salary structure components.
                      Each component should include: Basic, House Rent Allowance, Standard Allowance, Performance Bonus, Leave Travel Allowance, Fixed Allowance
                    </div>
                    
                    <div>
                      <span className="text-yellow-500 block">Computation Type: Fixed Amount or Percentage of Wage</span>
                      Values Percentage field (e.g. 50% for Basic, 40% of Basic for HRA, Standard Allowance 15%, Performance Bonus 8.33%, Leave Travel Allowance 8.33%, Fixed allowance is > wage - Total of all the components)
                      Salary component values should auto-update when the wage amount changes. The total of all components should not exceed the defined wage.
                    </div>
                    
                    <div>
                      <span className="text-yellow-500 block">- Automatic Calculation:</span>
                      The system should calculate each component amount based on the employee's defined Wage.
                      Example:
                      If Wage = ₹50,000 and Basic = 50% of wage, then Basic = ₹25,000.
                      Each fields for configuration (e.g. PF rate 12%, and Professional Tax 200).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
