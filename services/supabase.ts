
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqktujpwhzqdugmgezkf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxa3R1anB3aHpxZHVnbWdlemtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTg4MjgsImV4cCI6MjA3OTk5NDgyOH0.DgzZyT3w1nDxm-ORYwZQ6cRC16pi6l3ycEXRefwa0IM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};
