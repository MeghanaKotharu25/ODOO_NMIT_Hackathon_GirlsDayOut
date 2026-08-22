-- Run this in your Supabase SQL Editor to add shift times to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS default_in_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS default_out_time TIME DEFAULT '17:30:00';
