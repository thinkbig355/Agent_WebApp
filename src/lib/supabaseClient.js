// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjolfjjirgkwdbtqrqxs.supabase.co';
// USE THE SERVICE ROLE KEY HERE.  IMPORTANT!
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqb2xmamppcmdrd2RidHFycXhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMxOTAzOCwiZXhwIjoyMDU1ODk1MDM4fQ.YzFHO55cjzu9ruUkuW3SoYpyHauhIYsxf4ulXaRdjbc'; // Replace with your actual service_role key

export const supabase = createClient(supabaseUrl, supabaseKey);