
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsjnucljnnqtsjllfufy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzam51Y2xqbm5xdHNqbGxmdWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzQzNTYsImV4cCI6MjA3OTgxMDM1Nn0.DbjToxlF-k5lTG-SS0fYsE3OyL9KD9byFbuBSVzDF6k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};
