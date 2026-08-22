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
