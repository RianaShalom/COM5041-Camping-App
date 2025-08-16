import {Buffer} from "node:buffer";

import { createClient, SupabaseClient } from 'supabase';

export const response = (data: unknown, status: number, statusText?: string): Response => {
  if (!data) {
    return new Response(null, { status, statusText });
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

export const getAccessToken = (req: Request): string | null => {
  const access_token = req.headers.get('Authorization');
  if (!access_token || access_token === 'Bearer null' || access_token === 'Bearer undefined') {
    console.error('No access token found during logout process');
    return null;
  }
  return access_token;
}

export const getUserId = (access_token: string): string | null => {
  try {
    return JSON.parse(Buffer.from(access_token.split('.')[1], 'base64').toString()).sub;
  } catch {
    console.error('No access token found during logout process');
    return null;
  }
};