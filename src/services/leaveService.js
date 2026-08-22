import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const leaveService = {
  // Get leave balances for an employee (current year)
  getBalances: async (employeeId) => {
    if (!isSupabaseConfigured) return [];
    const year = new Date().getFullYear();
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('year', year);
    if (error) {
      console.error('leaveService.getBalances error:', error);
      throw error;
    }
    // Map to UI format
    return (data || []).map(b => ({
      type: b.leave_type === 'paid' ? 'Paid Time Off' : b.leave_type === 'sick' ? 'Sick Leave' : 'Unpaid Leave',
      total: Number(b.total_days),
      used: Number(b.used_days),
      pending: Number(b.pending_days),
    }));
  },

  // Get pending leave requests (admin: all pending, employee: own)
  getPendingRequests: async (isAdmin = false, employeeId = null) => {
    if (!isSupabaseConfigured) return [];
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employee_id (
          id, employee_code, first_name, last_name, email, avatar_url, department
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!isAdmin && employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('leaveService.getPendingRequests error:', error);
      throw error;
    }
    return (data || []).map(req => ({
      id: req.id,
      employee: req.employee ? {
        id: req.employee.employee_code || req.employee.id,
        uuid: req.employee.id,
        firstName: req.employee.first_name,
        lastName: req.employee.last_name,
        email: req.employee.email,
        avatarUrl: req.employee.avatar_url || `https://i.pravatar.cc/150?u=${req.employee.employee_code}`,
        department: req.employee.department,
      } : null,
      type: req.leave_type === 'paid' ? 'Paid Time Off' : req.leave_type === 'sick' ? 'Sick Leave' : 'Unpaid Leave',
      start: new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: `${Number(req.duration_days)} day${Number(req.duration_days) !== 1 ? 's' : ''}`,
      reason: req.reason,
      rawStartDate: req.start_date,
      rawEndDate: req.end_date,
    }));
  },

  // Get approved/rejected request history
  getRequestHistory: async (isAdmin = false, employeeId = null) => {
    if (!isSupabaseConfigured) return [];
    let query = supabase
      .from('leave_requests')
      .select('*')
      .in('status', ['approved', 'rejected'])
      .order('updated_at', { ascending: false })
      .limit(20);

    if (!isAdmin && employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('leaveService.getRequestHistory error:', error);
      throw error;
    }
    return (data || []).map(req => ({
      id: req.id,
      type: req.leave_type === 'paid' ? 'Paid Leave' : req.leave_type === 'sick' ? 'Sick Leave' : 'Unpaid Leave',
      start: new Date(req.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      end: new Date(req.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: `${Number(req.duration_days)} day${Number(req.duration_days) !== 1 ? 's' : ''}`,
      status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
    }));
  },

  // Submit a new leave request
  submitRequest: async (employeeId, { leaveType, startDate, endDate, reason }) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

    const typeMap = { 'Paid Time Off': 'paid', 'Sick Leave': 'sick', 'Unpaid Leave': 'unpaid' };
    const { data, error } = await supabase.from('leave_requests').insert({
      employee_id: employeeId,
      leave_type: typeMap[leaveType] || 'paid',
      start_date: startDate,
      end_date: endDate,
      duration_days: diffDays,
      reason,
      status: 'pending',
    }).select().single();
    if (error) throw error;
    return data;
  },

  // Approve or reject a leave request (admin)
  updateRequestStatus: async (requestId, status, reviewerId) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
