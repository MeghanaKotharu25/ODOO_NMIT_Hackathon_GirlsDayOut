-- ==========================================
-- Dayflow HRMS Database Schema
-- Target: PostgreSQL / Supabase
-- ==========================================

-- Enable pgcrypto / uuid-ossp extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. PROFILES
-- Extends Supabase auth.users (1:1 relationship)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    position TEXT,
    department TEXT,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    default_in_time TIME DEFAULT '09:00:00',
    default_out_time TIME DEFAULT '17:30:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- 2. EMPLOYEE PRIVATE INFO
-- Stores sensitive personal and financial info (1:1 with profiles)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_private_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT,
    nationality TEXT,
    personal_email TEXT,
    phone_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_relationship TEXT,
    emergency_contact_phone TEXT,
    bank_name TEXT,
    account_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- 3. EMPLOYEE RESUMES
-- Stores profile resume, bio, skills, and certifications (1:1 with profiles)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    about_summary TEXT,
    what_i_love TEXT,
    interests TEXT[] DEFAULT '{}',
    certifications JSONB DEFAULT '[]'::jsonb,
    resume_file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- 4. ATTENDANCE
-- Tracks daily check-in, check-out, and attendance statuses
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
    work_hours NUMERIC(4, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_daily_attendance UNIQUE (employee_id, date)
);

-- ------------------------------------------
-- 5. LEAVE BALANCES
-- Tracks employee leave allocations per year
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    total_days NUMERIC(5, 2) NOT NULL DEFAULT 0,
    used_days NUMERIC(5, 2) NOT NULL DEFAULT 0,
    pending_days NUMERIC(5, 2) NOT NULL DEFAULT 0,
    year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_leave_type_year UNIQUE (employee_id, leave_type, year)
);

-- ------------------------------------------
-- 6. LEAVE REQUESTS
-- Tracks leave applications, durations, and approval status
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days NUMERIC(5, 2) NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_leave_dates CHECK (end_date >= start_date)
);

-- ------------------------------------------
-- 7. PAYROLL
-- Monthly salary slips and net payout summaries
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2000),
    base_salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
    gross_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_payable NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_monthly_payroll UNIQUE (employee_id, month, year)
);

-- ------------------------------------------
-- 8. SALARY COMPONENTS
-- Granular earnings (HRA, allowances) & deductions (Tax, PF) per payroll
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_id UUID NOT NULL REFERENCES public.payroll(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------
-- 9. ACTIVITY LOGS
-- Audit logging for admin and employee actions
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    description TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_profiles_employee_code ON public.profiles(employee_code);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_year ON public.leave_balances(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_status ON public.leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_reviewed_by ON public.leave_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_period ON public.payroll(employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_salary_components_payroll ON public.salary_components(payroll_id);
CREATE INDEX IF NOT EXISTS idx_employee_private_info_employee ON public.employee_private_info(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_resumes_employee ON public.employee_resumes(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_employee ON public.activity_logs(employee_id);

-- ==========================================
-- AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_private_info_modtime
    BEFORE UPDATE ON public.employee_private_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_resumes_modtime
    BEFORE UPDATE ON public.employee_resumes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_modtime
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_modtime
    BEFORE UPDATE ON public.leave_balances
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_modtime
    BEFORE UPDATE ON public.leave_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_modtime
    BEFORE UPDATE ON public.payroll
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_components_modtime
    BEFORE UPDATE ON public.salary_components
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==========================================
-- Automatically creates a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, employee_code, first_name, last_name, email, role, status)
    VALUES (
        NEW.id,
        'EMP-' || substr(md5(random()::text), 1, 6), -- Temporary code until updated by Admin
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        NEW.email,
        'employee',
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_private_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profiles, but only users themselves (or admin) can update their own
CREATE POLICY "Profiles are viewable by everyone in organization."
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Private Info: Only the user themselves can view/update their own private info
CREATE POLICY "Users can view own private info."
    ON public.employee_private_info FOR SELECT
    USING (employee_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Admins can do everything (Bypassed via Service Role Key usually, but explicit policies can be added here)
-- Example: CREATE POLICY "Admins can view all" ON public.profiles FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
