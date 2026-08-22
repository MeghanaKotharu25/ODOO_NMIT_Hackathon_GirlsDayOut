import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://tdiztowzchvtvfxakgql.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const employees = [
  { employee_code: 'EMP-001', first_name: 'Sarah', last_name: 'Chen', email: 'sarah.chen@dayflow.io', position: 'Senior Frontend Engineer', department: 'Engineering', role: 'employee', status: 'active', join_date: '2023-01-15', avatar_url: 'https://i.pravatar.cc/150?u=EMP-001', attendance_status: 'present' },
  { employee_code: 'EMP-002', first_name: 'Marcus', last_name: 'Johnson', email: 'marcus.j@dayflow.io', position: 'Product Designer', department: 'Design', role: 'employee', status: 'active', join_date: '2023-03-01', avatar_url: 'https://i.pravatar.cc/150?u=EMP-002', attendance_status: 'leave' },
  { employee_code: 'EMP-003', first_name: 'Elena', last_name: 'Rodriguez', email: 'elena.r@dayflow.io', position: 'HR Director', department: 'Human Resources', role: 'admin', status: 'active', join_date: '2022-11-10', avatar_url: 'https://i.pravatar.cc/150?u=EMP-003', attendance_status: 'present' },
  { employee_code: 'EMP-004', first_name: 'David', last_name: 'Kim', email: 'david.kim@dayflow.io', position: 'Backend Engineer', department: 'Engineering', role: 'employee', status: 'active', join_date: '2023-06-20', avatar_url: 'https://i.pravatar.cc/150?u=EMP-004', attendance_status: 'absent' },
  { employee_code: 'EMP-005', first_name: 'Aisha', last_name: 'Patel', email: 'aisha.p@dayflow.io', position: 'Marketing Lead', department: 'Marketing', role: 'employee', status: 'active', join_date: '2024-01-05', avatar_url: 'https://i.pravatar.cc/150?u=EMP-005', attendance_status: 'present' },
  { employee_code: 'EMP-006', first_name: 'James', last_name: 'Wilson', email: 'james.w@dayflow.io', position: 'Sales Representative', department: 'Sales', role: 'employee', status: 'active', join_date: '2024-02-14', avatar_url: 'https://i.pravatar.cc/150?u=EMP-006', attendance_status: 'present' },
  { employee_code: 'EMP-007', first_name: 'Chloe', last_name: 'Martin', email: 'chloe.m@dayflow.io', position: 'Product Manager', department: 'Product', role: 'employee', status: 'active', join_date: '2023-08-11', avatar_url: 'https://i.pravatar.cc/150?u=EMP-007', attendance_status: 'leave' },
  { employee_code: 'EMP-008', first_name: 'Daniel', last_name: 'Garcia', email: 'daniel.g@dayflow.io', position: 'Customer Success', department: 'Support', role: 'employee', status: 'active', join_date: '2023-09-30', avatar_url: 'https://i.pravatar.cc/150?u=EMP-008', attendance_status: 'present' },
  { employee_code: 'EMP-009', first_name: 'Sophia', last_name: 'Lee', email: 'sophia.l@dayflow.io', position: 'UX Researcher', department: 'Design', role: 'employee', status: 'active', join_date: '2024-03-12', avatar_url: 'https://i.pravatar.cc/150?u=EMP-009', attendance_status: 'present' },
  { employee_code: 'EMP-010', first_name: 'Liam', last_name: 'Brown', email: 'liam.b@dayflow.io', position: 'DevOps Engineer', department: 'Engineering', role: 'employee', status: 'active', join_date: '2022-07-22', avatar_url: 'https://i.pravatar.cc/150?u=EMP-010', attendance_status: 'absent' },
  { employee_code: 'EMP-011', first_name: 'Olivia', last_name: 'Taylor', email: 'olivia.t@dayflow.io', position: 'Financial Analyst', department: 'Finance', role: 'employee', status: 'active', join_date: '2023-05-18', avatar_url: 'https://i.pravatar.cc/150?u=EMP-011', attendance_status: 'present' },
  { employee_code: 'EMP-012', first_name: 'Noah', last_name: 'Anderson', email: 'noah.a@dayflow.io', position: 'Legal Counsel', department: 'Legal', role: 'employee', status: 'active', join_date: '2022-09-01', avatar_url: 'https://i.pravatar.cc/150?u=EMP-012', attendance_status: 'present' }
];

async function seedDatabase() {
  console.log('Fetching auth users...');
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  const userMap = new Map(authData.users.map(u => [u.email.toLowerCase(), u.id]));

  for (const emp of employees) {
    const authId = userMap.get(emp.email.toLowerCase());
    if (!authId) {
      console.log(`Skipping ${emp.email} - not found in auth.users`);
      continue;
    }

    const profileData = {
      id: authId,
      employee_code: emp.employee_code,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      position: emp.position,
      department: emp.department,
      role: emp.role,
      status: emp.status,
      join_date: emp.join_date,
      avatar_url: emp.avatar_url
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData);

    if (profileError) {
      console.error(`Error inserting profile for ${emp.email}:`, profileError);
    } else {
      console.log(`Successfully inserted profile for ${emp.email}`);
    }

    const today = new Date().toISOString().split('T')[0];
    const checkInDate = new Date(`${today}T09:00:00Z`).toISOString();
    const checkOutDate = new Date(`${today}T17:30:00Z`).toISOString();

    const attendanceData = {
      employee_id: authId,
      date: today,
      status: emp.attendance_status,
      check_in: emp.attendance_status === 'present' ? checkInDate : null,
      check_out: emp.attendance_status === 'present' ? checkOutDate : null,
      work_hours: emp.attendance_status === 'present' ? 8.5 : 0.0
    };

    const { error: attError } = await supabaseAdmin
      .from('attendance')
      .upsert(attendanceData, { onConflict: 'employee_id, date' });

    if (attError) {
      console.error(`Error inserting attendance for ${emp.email}:`, attError);
    } else {
      console.log(`Successfully inserted attendance for ${emp.email}`);
    }
  }

  console.log('Seeding complete.');
}

seedDatabase().catch(console.error);
