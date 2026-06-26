import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const supabase = createClient(
  'https://jsuiofuizkmgpmfwypry.supabase.co',  // ← cambia por tu URL
  'sb_publishable_WSvo8Sqh0Jl20m6EVYO_KQ_jSjEkQG9'                      // ← cambia por tu clave
);
