import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rjqurerkckurtpontmqt.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcXVyZXJrY2t1cnRwb250bXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NjA1NDcsImV4cCI6MjA3MzIzNjU0N30.m0p6XvrFrwBvD5oHc10MhkU5u1XbPeHXAWl5onP9jCI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
