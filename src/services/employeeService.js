import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const employeeService = {
  // Fetch all employees from Supabase profiles
  getEmployees: async () => {
    if (!isSupabaseConfigured) return [];

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        employee_code,
        first_name,
        last_name,
        email,
        position,
        department,
        status,
        join_date,
        avatar_url,
        role
      `)
      .order('employee_code', { ascending: true });

    if (error) {
      console.error('Supabase getEmployees error:', error);
      throw new Error(`Database Error: ${error.message || 'Failed to fetch profiles'}`);
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // Query latest attendance status for each employee for today if available
    const today = new Date().toISOString().split('T')[0];
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('employee_id, status')
      .eq('date', today);

    const attendanceMap = new Map();
    if (attendanceData) {
      attendanceData.forEach(item => {
        attendanceMap.set(item.employee_id, item.status);
      });
    }

    // Map database rows to UI Employee object model
    return profiles.map(profile => {
      const rawStatus = attendanceMap.get(profile.id) || profile.status || 'present';

      let displayStatus = 'Present';
      if (rawStatus.toLowerCase() === 'absent') displayStatus = 'Absent';
      else if (rawStatus.toLowerCase() === 'leave' || rawStatus.toLowerCase() === 'on leave') displayStatus = 'On Leave';
      else if (rawStatus.toLowerCase() === 'half_day') displayStatus = 'Present';

      return {
        id: profile.employee_code || profile.id,
        uuid: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        position: profile.position || 'Employee',
        department: profile.department || 'General',
        status: displayStatus,
        joinDate: profile.join_date,
        avatarUrl: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.employee_code || profile.id}`,
        role: profile.role ? profile.role.toUpperCase() : 'EMPLOYEE'
      };
    });
  },

  // Fetch single employee by employee code or UUID
  getEmployeeById: async (id) => {
    if (!isSupabaseConfigured) return null;

    const isUuid = id.includes('-') && id.length === 36;
    let query = supabase.from('profiles').select('*');
    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('employee_code', id);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error) {
      console.error('Supabase getEmployeeById error:', error);
      throw new Error(`Database Error: ${error.message || 'Failed to fetch employee details'}`);
    }

    if (!profile) {
      return null;
    }

    return {
      id: profile.employee_code || profile.id,
      uuid: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      position: profile.position || 'Employee',
      department: profile.department || 'General',
      status: profile.status === 'active' ? 'Present' : 'Absent',
      joinDate: profile.join_date,
      avatarUrl: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.employee_code || profile.id}`,
      role: profile.role ? profile.role.toUpperCase() : 'EMPLOYEE'
    };
  }
};
