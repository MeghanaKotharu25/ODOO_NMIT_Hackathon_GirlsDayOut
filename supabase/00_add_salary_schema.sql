-- 1. Add new fields to employee_private_info
ALTER TABLE public.employee_private_info
ADD COLUMN IF NOT EXISTS residing_address TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS pan_no TEXT,
ADD COLUMN IF NOT EXISTS uan_no TEXT;

-- 2. Create employee_salary_info table
CREATE TABLE IF NOT EXISTS public.employee_salary_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    monthly_wage NUMERIC(12, 2) NOT NULL DEFAULT 0,
    yearly_wage NUMERIC(12, 2) NOT NULL DEFAULT 0,
    working_days_per_week NUMERIC(4, 2) DEFAULT 5,
    break_time_hrs NUMERIC(4, 2) DEFAULT 1,
    basic_percentage NUMERIC(5, 2) DEFAULT 50,
    hra_percentage_of_basic NUMERIC(5, 2) DEFAULT 50,
    standard_allowance_percentage NUMERIC(5, 2) DEFAULT 16.67,
    performance_bonus_percentage NUMERIC(5, 2) DEFAULT 8.33,
    lta_percentage NUMERIC(5, 2) DEFAULT 8.33,
    pf_employee_percentage NUMERIC(5, 2) DEFAULT 12,
    pf_employer_percentage NUMERIC(5, 2) DEFAULT 12,
    professional_tax NUMERIC(10, 2) DEFAULT 200,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add Index
CREATE INDEX IF NOT EXISTS idx_employee_salary_info_employee ON public.employee_salary_info(employee_id);

-- 4. Add Modtime Trigger
CREATE TRIGGER update_employee_salary_info_modtime
    BEFORE UPDATE ON public.employee_salary_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Add RLS
ALTER TABLE public.employee_salary_info ENABLE ROW LEVEL SECURITY;

-- 6. Add Policies for Salary Info
CREATE POLICY "Users can view own salary info."
    ON public.employee_salary_info FOR SELECT
    USING (employee_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- 7. Add Missing Policies for Private Info (if they don't exist yet)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'employee_private_info' AND policyname = 'Users can update own private info.'
    ) THEN
        CREATE POLICY "Users can update own private info."
            ON public.employee_private_info FOR UPDATE
            USING (employee_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'employee_private_info' AND policyname = 'Users can insert own private info.'
    ) THEN
        CREATE POLICY "Users can insert own private info."
            ON public.employee_private_info FOR INSERT
            WITH CHECK (employee_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));
    END IF;
END $$;
