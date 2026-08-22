import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const attendanceService = {
  getLocalDate: () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  },

  // Fetch attendance records from Supabase joined with profiles
  getAttendance: async (employeeUuid = null) => {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('attendance')
      .select(`
        id,
        employee_id,
        date,
        check_in,
        check_out,
        status,
        work_hours,
        profiles (
          employee_code,
          first_name,
          last_name,
          department,
          avatar_url
        )
      `)
      .order('date', { ascending: false });

    if (employeeUuid) {
      query = query.eq('employee_id', employeeUuid);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase getAttendance error:', error);
      throw new Error(`Database Error: ${error.message || 'Failed to fetch attendance'}`);
    }

    if (!data) return [];

    return data.map(record => {
      let displayStatus = 'Present';
      const s = (record.status || '').toLowerCase();
      if (s === 'absent') displayStatus = 'Absent';
      else if (s === 'leave' || s === 'on leave') displayStatus = 'On Leave';
      else if (s === 'half_day' || s === 'half-day') displayStatus = 'Half-day';

      const checkInFormatted = record.check_in
        ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '--';

      const checkOutFormatted = record.check_out
        ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '--';

      let durationFormatted = '--';
      if (record.work_hours) {
        const hrs = Math.floor(record.work_hours);
        const mins = Math.round((record.work_hours - hrs) * 60);
        durationFormatted = `${hrs}h ${String(mins).padStart(2, '0')}m`;
      } else if (record.check_in && record.check_out) {
        const diffMs = new Date(record.check_out) - new Date(record.check_in);
        const totalMins = Math.max(0, Math.floor(diffMs / 60000));
        durationFormatted = `${Math.floor(totalMins / 60)}h ${String(totalMins % 60).padStart(2, '0')}m`;
      }

      const profile = record.profiles || {};
      const employeeName = profile.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Employee';

      return {
        id: record.id,
        employeeId: record.employee_id,
        employeeCode: profile.employee_code || 'EMP',
        employeeName,
        department: profile.department || 'General',
        avatarUrl: profile.avatar_url,
        date: record.date,
        checkIn: checkInFormatted,
        checkOut: checkOutFormatted,
        rawCheckIn: record.check_in,
        rawCheckOut: record.check_out,
        status: displayStatus,
        rawStatus: record.status,
        hours: durationFormatted,
        workHours: record.work_hours
      };
    });
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

  // Get attendance history for an employee
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

  getMonthlyHistory: async (employeeId, month) => {
    if (!isSupabaseConfigured) return [];
    const [year, monthNumber] = month.split('-').map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', `${month}-01`)
      .lte('date', `${month}-${String(lastDay).padStart(2, '0')}`)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  calculatePayableDays: (records) => records.reduce((days, record) => {
    if (record.status === 'present') return days + 1;
    if (record.status === 'half_day') return days + 0.5;
    return days;
  }, 0),

  getAdminAttendance: async (date = attendanceService.getLocalDate()) => {
    if (!isSupabaseConfigured) return [];
    
    let profilesPromise = supabase
      .from('profiles')
      .select('id, employee_code, first_name, last_name, email, department, position, default_in_time, default_out_time')
      .order('employee_code', { ascending: true });
      
    let [{ data: profiles, error: profilesError }, { data: attendance, error: attendanceError }] = await Promise.all([
      profilesPromise,
      supabase
        .from('attendance')
        .select('id, employee_id, date, check_in, check_out, status, work_hours')
        .eq('date', date),
    ]);
    
    // Fallback if schema is not migrated
    if (profilesError && profilesError.message && profilesError.message.includes('default_in_time')) {
      console.warn('Database not migrated with default_in_time. Falling back to old schema.');
      const fallbackResult = await supabase
        .from('profiles')
        .select('id, employee_code, first_name, last_name, email, department, position')
        .order('employee_code', { ascending: true });
      profiles = fallbackResult.data;
      profilesError = fallbackResult.error;
    }

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
        workHours: record?.work_hours || 0,
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
    const today = attendanceService.getLocalDate();
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

  // Check in for an employee
  checkIn: async (employeeUuid) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const today = attendanceService.getLocalDate();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        employee_id: employeeUuid,
        date: today,
        check_in: now,
        status: 'present'
      }, { onConflict: 'employee_id,date' })
      .select()
      .single();

    if (error) {
      console.error('Supabase checkIn error:', error);
      throw new Error(`Check-in failed: ${error.message}`);
    }
    return data;
  },

  // Check out for an employee
  checkOut: async (employeeUuid, checkInIsoTime) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const today = attendanceService.getLocalDate();
    const now = new Date();
    const checkOutIso = now.toISOString();

    let workHours = 8.0;
    if (checkInIsoTime) {
      const diffMs = now - new Date(checkInIsoTime);
      workHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out: checkOutIso,
        work_hours: workHours,
        status: 'present'
      })
      .eq('employee_id', employeeUuid)
      .eq('date', today)
      .select()
      .single();

    if (error) {
      console.error('Supabase checkOut error:', error);
      throw new Error(`Check-out failed: ${error.message}`);
    }
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
  }
};
