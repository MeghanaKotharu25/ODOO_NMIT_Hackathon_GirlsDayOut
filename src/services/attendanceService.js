import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const attendanceService = {
  getLocalDate: () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  },

  // Get today's attendance record for a specific employee
  getTodayRecord: async (employeeId) => {
    if (!isSupabaseConfigured) return null;
    const today = attendanceService.getLocalDate();
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .maybeSingle();
    if (error) {
      console.error('attendanceService.getTodayRecord error:', error);
      throw error;
    }
    return data;
  },

  // Get attendance history for an employee (last N days)
  getHistory: async (employeeId, limit = 30) => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('attendanceService.getHistory error:', error);
      throw error;
    }
    return data || [];
  },

  getAdminAttendance: async (date = attendanceService.getLocalDate()) => {
    if (!isSupabaseConfigured) return [];
    const [{ data: profiles, error: profilesError }, { data: attendance, error: attendanceError }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, employee_code, first_name, last_name, email, department, position')
        .order('employee_code', { ascending: true }),
      supabase
        .from('attendance')
        .select('id, employee_id, date, check_in, check_out, status')
        .eq('date', date),
    ]);
    if (profilesError) throw profilesError;
    if (attendanceError) throw attendanceError;

    const attendanceByEmployee = new Map((attendance || []).map((record) => [record.employee_id, record]));
    return (profiles || []).map((profile) => {
      const record = attendanceByEmployee.get(profile.id);
      return {
        profile,
        record,
        status: record?.status || 'absent',
        checkIn: record?.check_in || '',
        checkOut: record?.check_out || '',
      };
    });
  },

  saveAdminRecord: async (row, date, draft) => {
    const payload = {
      employee_id: row.profile.id,
      date,
      status: draft.status,
      check_in: draft.checkIn ? new Date(`${date}T${draft.checkIn}:00`).toISOString() : null,
      check_out: draft.checkOut ? new Date(`${date}T${draft.checkOut}:00`).toISOString() : null,
    };
    return row.record
      ? supabase.from('attendance').update(payload).eq('id', row.record.id)
      : supabase.from('attendance').insert(payload);
  },

  // Get all attendance records for today (admin view)
  getAllTodayAttendance: async () => {
    if (!isSupabaseConfigured) return [];
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        profiles:employee_id (
          id, employee_code, first_name, last_name, email, department, position, avatar_url
        )
      `)
      .eq('date', today)
      .order('check_in', { ascending: true });
    if (error) {
      console.error('attendanceService.getAllTodayAttendance error:', error);
      throw error;
    }
    return data || [];
  },

  // Check in
  checkIn: async (employeeId) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase.from('attendance').insert({
      employee_id: employeeId,
      date: new Date().toISOString().split('T')[0],
      check_in: new Date().toISOString(),
      status: 'present',
    }).select().single();
    if (error) throw error;
    return data;
  },

  // Check out
  checkOut: async (employeeId) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toISOString();
    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: checkOutTime })
      .eq('employee_id', employeeId)
      .eq('date', today)
      .is('check_out', null)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Get attendance summary stats for dashboard
  getAttendanceSummary: async () => {
    if (!isSupabaseConfigured) return { present: 0, absent: 0, leave: 0, total: 0 };
    const today = new Date().toISOString().split('T')[0];

    const { count: totalProfiles } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: attendanceToday } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today);

    const total = totalProfiles ?? 0;
    let present = 0, absent = 0, leave = 0;
    if (attendanceToday) {
      attendanceToday.forEach(a => {
        if (a.status === 'present' || a.status === 'half_day') present++;
        else if (a.status === 'absent') absent++;
        else if (a.status === 'leave') leave++;
      });
    }
    return { present, absent, leave, total };
  },
};
