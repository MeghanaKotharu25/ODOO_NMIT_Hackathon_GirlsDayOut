-- ==========================================
-- Dayflow HRMS Application Table Seed Data
-- Target: PostgreSQL / Supabase
-- Populates public.profiles and public.attendance for existing Auth users
-- Note: Does NOT modify auth.users table.
-- ==========================================

-- 1. Populate public.profiles by joining auth.users on matching email
INSERT INTO public.profiles (
    id,
    employee_code,
    first_name,
    last_name,
    email,
    position,
    department,
    role,
    status,
    join_date,
    avatar_url
)
SELECT 
    u.id,
    d.employee_code,
    d.first_name,
    d.last_name,
    d.email,
    d.position,
    d.department,
    d.role,
    d.status,
    d.join_date::date,
    d.avatar_url
FROM (
    VALUES
    ('EMP-001', 'Sarah', 'Chen', 'sarah.chen@dayflow.io', 'Senior Frontend Engineer', 'Engineering', 'employee', 'active', '2023-01-15', 'https://i.pravatar.cc/150?u=EMP-001'),
    ('EMP-002', 'Marcus', 'Johnson', 'marcus.j@dayflow.io', 'Product Designer', 'Design', 'employee', 'active', '2023-03-01', 'https://i.pravatar.cc/150?u=EMP-002'),
    ('EMP-003', 'Elena', 'Rodriguez', 'elena.r@dayflow.io', 'HR Director', 'Human Resources', 'admin', 'active', '2022-11-10', 'https://i.pravatar.cc/150?u=EMP-003'),
    ('EMP-004', 'David', 'Kim', 'david.kim@dayflow.io', 'Backend Engineer', 'Engineering', 'employee', 'active', '2023-06-20', 'https://i.pravatar.cc/150?u=EMP-004'),
    ('EMP-005', 'Aisha', 'Patel', 'aisha.p@dayflow.io', 'Marketing Lead', 'Marketing', 'employee', 'active', '2024-01-05', 'https://i.pravatar.cc/150?u=EMP-005'),
    ('EMP-006', 'James', 'Wilson', 'james.w@dayflow.io', 'Sales Representative', 'Sales', 'employee', 'active', '2024-02-14', 'https://i.pravatar.cc/150?u=EMP-006'),
    ('EMP-007', 'Chloe', 'Martin', 'chloe.m@dayflow.io', 'Product Manager', 'Product', 'employee', 'active', '2023-08-11', 'https://i.pravatar.cc/150?u=EMP-007'),
    ('EMP-008', 'Daniel', 'Garcia', 'daniel.g@dayflow.io', 'Customer Success', 'Support', 'employee', 'active', '2023-09-30', 'https://i.pravatar.cc/150?u=EMP-008'),
    ('EMP-009', 'Sophia', 'Lee', 'sophia.l@dayflow.io', 'UX Researcher', 'Design', 'employee', 'active', '2024-03-12', 'https://i.pravatar.cc/150?u=EMP-009'),
    ('EMP-010', 'Liam', 'Brown', 'liam.b@dayflow.io', 'DevOps Engineer', 'Engineering', 'employee', 'active', '2022-07-22', 'https://i.pravatar.cc/150?u=EMP-010'),
    ('EMP-011', 'Olivia', 'Taylor', 'olivia.t@dayflow.io', 'Financial Analyst', 'Finance', 'employee', 'active', '2023-05-18', 'https://i.pravatar.cc/150?u=EMP-011'),
    ('EMP-012', 'Noah', 'Anderson', 'noah.a@dayflow.io', 'Legal Counsel', 'Legal', 'employee', 'active', '2022-09-01', 'https://i.pravatar.cc/150?u=EMP-012')
) AS d(employee_code, first_name, last_name, email, position, department, role, status, join_date, avatar_url)
JOIN auth.users u ON LOWER(u.email) = LOWER(d.email)
ON CONFLICT (id) DO UPDATE SET
    employee_code = EXCLUDED.employee_code,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    position = EXCLUDED.position,
    department = EXCLUDED.department,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    join_date = EXCLUDED.join_date,
    avatar_url = EXCLUDED.avatar_url;

-- 2. Populate public.attendance table for profiles that exist
INSERT INTO public.attendance (
    employee_id,
    date,
    status,
    check_in,
    check_out,
    work_hours
)
SELECT 
    p.id,
    CURRENT_DATE,
    a.status,
    CASE WHEN a.status = 'present' THEN (CURRENT_DATE + TIME '09:00:00')::timestamptz ELSE NULL END,
    CASE WHEN a.status = 'present' THEN (CURRENT_DATE + TIME '17:30:00')::timestamptz ELSE NULL END,
    CASE WHEN a.status = 'present' THEN 8.5 ELSE 0.0 END
FROM public.profiles p
JOIN (
    VALUES
    ('EMP-001', 'present'),
    ('EMP-002', 'leave'),
    ('EMP-003', 'present'),
    ('EMP-004', 'absent'),
    ('EMP-005', 'present'),
    ('EMP-006', 'present'),
    ('EMP-007', 'leave'),
    ('EMP-008', 'present'),
    ('EMP-009', 'present'),
    ('EMP-010', 'absent'),
    ('EMP-011', 'present'),
    ('EMP-012', 'present')
) AS a(employee_code, status) ON p.employee_code = a.employee_code
ON CONFLICT (employee_id, date) DO UPDATE SET
    status = EXCLUDED.status,
    check_in = EXCLUDED.check_in,
    check_out = EXCLUDED.check_out,
    work_hours = EXCLUDED.work_hours;
