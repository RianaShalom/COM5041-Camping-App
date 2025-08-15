import { createClient, SupabaseClient } from 'supabase';

export const response = (data: unknown, status: number, statusText?: string): Response => {
  if (!data) {
    new Response(null, { status, statusText });
  }
  return new Response(JSON.stringify(data, null, 2), { status });
};

export const getSupabaseClient = (token?: string): SupabaseClient => {
  const db = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_ANON_KEY');
  if (!token) return createClient(db, key);
  return createClient(db, key, {
    global: { headers: { Authorization: token } },
  });
};