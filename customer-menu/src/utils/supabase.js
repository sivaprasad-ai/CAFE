import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://ojmvchlpqcjanyololom.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbXZjaGxwcWNqYW55b2xvbG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODYzOTksImV4cCI6MjEwODI2MjM5OX0.mLsI46_BB5LsHhCHPNVExORFVdkWgdYDk9LyceQsxws";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
