-- ==========================================
-- Dayflow HRMS Row Level Security (RLS) Policies
-- Target: PostgreSQL / Supabase
-- ==========================================

-- ------------------------------------------
-- HELPER FUNCTION: SECURITY DEFINER ROLE CHECK
-- Prevents recursive RLS policy loops on public.profiles.
-- Explicitly configures search_path to prevent path hijacking.
-- Checks for active status to prevent inactive admin access.
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'
     FROM public.profiles
     WHERE id = user_id AND status = 'active'),
    FALSE
  );
$$;

-- Revoke execution from PUBLIC and grant strictly to authenticated users
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- ==========================================
-- 1. PROFILES TABLE RLS
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Employees view own profile, Admins view all profiles
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR public.is_admin(auth.uid())
);

-- INSERT: Employees can self-insert ONLY with role='employee' and status='active'. Admins insert any role.
CREATE POLICY "profiles_insert_employee_policy"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid() AND role = 'employee' AND status = 'active'
);

CREATE POLICY "profiles_insert_admin_policy"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
);

-- UPDATE: Employees update own profile (role/status escalation restricted), Admins update any
CREATE POLICY "profiles_update_employee_policy"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND role = 'employee' AND status = 'active'
);

CREATE POLICY "profiles_update_admin_policy"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- DELETE: Admins only
CREATE POLICY "profiles_delete_policy"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));


-- ==========================================
-- 2. EMPLOYEE PRIVATE INFO TABLE RLS
-- ==========================================
ALTER TABLE public.employee_private_info ENABLE ROW LEVEL SECURITY;

-- SELECT: Employee views own info, Admin views all
CREATE POLICY "employee_private_info_select_policy"
ON public.employee_private_info
FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- INSERT: Employee creates own info (employee_id must equal auth.uid()), Admin creates for any
CREATE POLICY "employee_private_info_insert_policy"
ON public.employee_private_info
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- UPDATE: Employee updates own info (cannot transfer employee_id), Admin updates any
CREATE POLICY "employee_private_info_update_policy"
ON public.employee_private_info
FOR UPDATE
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
)
WITH CHECK (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- DELETE: Admins only
CREATE POLICY "employee_private_info_delete_policy"
ON public.employee_private_info
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));


-- ==========================================
-- 3. EMPLOYEE RESUMES TABLE RLS
-- ==========================================
ALTER TABLE public.employee_resumes ENABLE ROW LEVEL SECURITY;

-- SELECT: Employee views own resume, Admin views all
CREATE POLICY "employee_resumes_select_policy"
ON public.employee_resumes
FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- INSERT: Employee creates own resume (employee_id must equal auth.uid()), Admin creates for any
CREATE POLICY "employee_resumes_insert_policy"
ON public.employee_resumes
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- UPDATE: Employee updates own resume (cannot transfer employee_id), Admin updates any
CREATE POLICY "employee_resumes_update_policy"
ON public.employee_resumes
FOR UPDATE
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
)
WITH CHECK (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- DELETE: Admins only
CREATE POLICY "employee_resumes_delete_policy"
ON public.employee_resumes
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));


-- ==========================================
-- 4. ATTENDANCE TABLE RLS
-- ==========================================
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- SELECT: Employee views own attendance, Admin views all
CREATE POLICY "attendance_select_policy"
ON public.attendance
FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- INSERT: Employee creates own attendance check-in (employee_id must match auth.uid()), Admin creates for any
CREATE POLICY "attendance_insert_policy"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  (employee_id = auth.uid() AND status IN ('present', 'absent', 'half_day', 'leave'))
  OR public.is_admin(auth.uid())
);

-- UPDATE: Employee updates own daily check-in/out (cannot mutate employee_id), Admin updates any
CREATE POLICY "attendance_update_policy"
ON public.attendance
FOR UPDATE
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
)
WITH CHECK (
  (employee_id = auth.uid() AND status IN ('present', 'absent', 'half_day', 'leave'))
  OR public.is_admin(auth.uid())
);

-- DELETE: Admins only
CREATE POLICY "attendance_delete_policy"
ON public.attendance
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));


-- ==========================================
-- 5. LEAVE BALANCES TABLE RLS
-- ==========================================
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- SELECT: Employee views own leave balances, Admin views all
CREATE POLICY "leave_balances_select_policy"
ON public.leave_balances
FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- INSERT / UPDATE / DELETE: Admins only
CREATE POLICY "leave_balances_insert_policy"
ON public.leave_balances
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "leave_balances_update_policy"
ON public.leave_balances
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "leave_balances_delete_policy"
ON public.leave_balances
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));


-- ==========================================
-- 6. LEAVE REQUESTS TABLE RLS
-- ==========================================
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- SELECT: Employee views own leave requests, Admin views all
CREATE POLICY "leave_requests_select_policy"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- INSERT: Employees create own request with status='pending', Admins create for any
CREATE POLICY "leave_requests_insert_policy"
ON public.leave_requests
FOR INSERT
TO authenticated
WITH CHECK (
  (employee_id = auth.uid() AND status = 'pending') OR public.is_admin(auth.uid())
);

-- UPDATE: Employees edit pending request (cannot self-approve); Admins approve/reject/edit any
CREATE POLICY "leave_requests_update_policy"
ON public.leave_requests
FOR UPDATE
TO authenticated
USING (
  (employee_id = auth.uid() AND status = 'pending') OR public.is_admin(auth.uid())
)
WITH CHECK (
  (employee_id = auth.uid() AND status = 'pending') OR public.is_admin(auth.uid())
);

-- DELETE: Employees delete own pending request, Admins delete any
CREATE POLICY "leave_requests_delete_policy"
ON public.leave_requests
FOR DELETE
TO authenticated
USING (
  (employee_id = auth.uid() AND status = 'pending') OR public.is_admin(auth.uid())
);


-- ==========================================
-- 7. PAYROLL TABLE RLS
-- ==========================================
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- SELECT: Employee views own payroll slips, Admin views all
CREATE POLICY "payroll_select_policy"
ON public.payroll
FOR SELECT
TO authenticated
USING (
  employee_id = auth.uid() OR public.is_admin(auth.uid())
);

-- INSERT / UPDATE / DELETE: Admins only
CREATE POLICY "payroll_insert_policy"
ON public.payroll
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "payroll_update_policy"
ON public.payroll
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "payroll_delete_policy"
ON public.payroll
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));


-- ==========================================
-- 8. SALARY COMPONENTS TABLE RLS
-- ==========================================
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;

-- SELECT: Employee views salary components of own payroll, Admin views all
CREATE POLICY "salary_components_select_policy"
ON public.salary_components
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.payroll
    WHERE public.payroll.id = public.salary_components.payroll_id
      AND (public.payroll.employee_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

-- INSERT / UPDATE / DELETE: Admins only
CREATE POLICY "salary_components_insert_policy"
ON public.salary_components
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "salary_components_update_policy"
ON public.salary_components
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "salary_components_delete_policy"
ON public.salary_components
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));


-- ==========================================
-- 9. ACTIVITY LOGS TABLE RLS
-- ==========================================
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Admins only (Employees cannot inspect system audit logs)
CREATE POLICY "activity_logs_select_policy"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- INSERT: Admins create direct audit logs.
-- NOTE ON AUDIT TRAIL INTEGRITY: Client-side employees are blocked from inserting arbitrary audit records directly.
-- Employee activity logs should be generated via server-side RPC functions or database triggers.
CREATE POLICY "activity_logs_insert_admin_policy"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
);

-- UPDATE / DELETE: Forbidden for audit trail immutability
