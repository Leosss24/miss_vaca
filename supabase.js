import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const supabase = createClient(
  'https://rfrcwfbwhknzmhsjbjle.supabase.co',  // ← cambia por tu URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcmN3ZmJ3aGtuem1oc2piamxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTg4NjcsImV4cCI6MjA2NjUzNDg2N30.XBGFUagLFnicFATNR8yU19aoxuEU70KM08cAMryD35w'                      // ← cambia por tu clave
);
