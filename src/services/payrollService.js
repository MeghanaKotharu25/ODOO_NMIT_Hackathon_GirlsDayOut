import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { attendanceService } from './attendanceService';

export const payrollService = {
  getPayableDays: async (employeeId, year, month) => {
    if (!isSupabaseConfigured) return 0;
    const monthValue = `${year}-${String(month).padStart(2, '0')}`;
    const records = await attendanceService.getMonthlyHistory(employeeId, monthValue);
    return attendanceService.calculatePayableDays(records);
  },

  // Get all payroll records (admin) or own payroll (employee)
  getPayrollRecords: async (employeeId = null) => {
    if (!isSupabaseConfigured) return [];
    let query = supabase
      .from('payroll')
      .select(`
        *,
        profiles:employee_id (
          id, employee_code, first_name, last_name, department, position
        )
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('payrollService.getPayrollRecords error:', error);
      throw error;
    }

    return (data || []).map(record => ({
      id: record.id,
      employeeId: record.profiles?.employee_code || record.employee_id,
      uuid: record.employee_id,
      firstName: record.profiles?.first_name || '',
      lastName: record.profiles?.last_name || '',
      department: record.profiles?.department || '',
      position: record.profiles?.position || '',
      month: record.month,
      year: record.year,
      baseSalary: Number(record.base_salary),
      grossEarnings: Number(record.gross_earnings),
      totalDeductions: Number(record.total_deductions),
      netPayable: Number(record.net_payable),
      status: record.status.charAt(0).toUpperCase() + record.status.slice(1),
      lastUpdated: record.updated_at ? new Date(record.updated_at).toISOString().split('T')[0] : '',
    }));
  },

  // Get salary components for a payroll record
  getSalaryComponents: async (payrollId) => {
    if (!isSupabaseConfigured) return { earnings: [], deductions: [] };
    const { data, error } = await supabase
      .from('salary_components')
      .select('*')
      .eq('payroll_id', payrollId)
      .order('type', { ascending: true });

    if (error) {
      console.error('payrollService.getSalaryComponents error:', error);
      throw error;
    }
    const earnings = (data || []).filter(c => c.type === 'earning').map(c => ({ name: c.name, amount: Number(c.amount) }));
    const deductions = (data || []).filter(c => c.type === 'deduction').map(c => ({ name: c.name, amount: Number(c.amount) }));
    return { earnings, deductions };
  },

  // Get latest payroll for a specific employee (for salary page)
  getLatestPayroll: async (employeeId) => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', employeeId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('payrollService.getLatestPayroll error:', error);
      throw error;
    }
    return data;
  },

  // Update payroll salary (admin)
  updatePayroll: async (payrollId, baseSalary) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const deductions = baseSalary * 0.15;
    const { data, error } = await supabase
      .from('payroll')
      .update({
        base_salary: baseSalary,
        gross_earnings: baseSalary,
        total_deductions: deductions,
        net_payable: baseSalary - deductions,
      })
      .eq('id', payrollId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
