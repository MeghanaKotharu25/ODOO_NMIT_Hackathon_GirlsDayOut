import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const profileService = {
  // Get current user's full profile
  getMyProfile: async (userId) => {
    if (!isSupabaseConfigured || !userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('profileService.getMyProfile error:', error);
      throw error;
    }
    if (!data) return null;
    return {
      id: data.employee_code || data.id,
      uuid: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      position: data.position || 'Employee',
      department: data.department || 'General',
      status: data.status,
      joinDate: data.join_date,
      avatarUrl: data.avatar_url || `https://i.pravatar.cc/150?u=${data.employee_code || data.id}`,
      role: data.role ? data.role.toUpperCase() : 'EMPLOYEE',
    };
  },

  // Get employee private info
  getPrivateInfo: async (employeeId) => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('employee_private_info')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();
    if (error) {
      console.error('profileService.getPrivateInfo error:', error);
      throw error;
    }
    return data;
  },

  // Update employee private info
  updatePrivateInfo: async (employeeId, updates) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    
    // First check if a record exists
    const { data: existing } = await supabase
      .from('employee_private_info')
      .select('id')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('employee_private_info')
        .update(updates)
        .eq('employee_id', employeeId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('employee_private_info')
        .insert({ employee_id: employeeId, ...updates })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // Get employee resume info
  getResumeInfo: async (employeeId) => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('employee_resumes')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();
    if (error) {
      console.error('profileService.getResumeInfo error:', error);
      throw error;
    }
    return data;
  },

  // Get employee salary info
  getSalaryInfo: async (employeeId) => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('employee_salary_info')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();
    if (error) {
      console.error('profileService.getSalaryInfo error:', error);
      throw error;
    }
    return data;
  },

  // Update employee salary info
  updateSalaryInfo: async (employeeId, updates) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    
    // Check if exists
    const { data: existing } = await supabase
      .from('employee_salary_info')
      .select('id')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('employee_salary_info')
        .update(updates)
        .eq('employee_id', employeeId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('employee_salary_info')
        .insert({ employee_id: employeeId, ...updates })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // Update profile fields
  updateProfile: async (userId, updates) => {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
