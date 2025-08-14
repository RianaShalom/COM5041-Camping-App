import { createClient } from "supabase";

import { App } from '../_shared/App.ts';
import { response } from '../_shared/utils.ts';

const app = new App();

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [key, ...val] = cookie.trim().split('=');
    cookies[key] = decodeURIComponent(val.join('='));
  })

  return cookies;
}

app.post(  "/auth/login", async (req): Promise<Response> => {
  const { email, password } = await req.json();
  console.log(`Logging ${email}...`);
  
  const db = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_ANON_KEY');
  const { data, error } =  await createClient(db, key).auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Error logging in:', error.message);
    return response(null, 401, error.message);
  }

  const jwt = data.session.access_token;
  return new Response('Logged in', {
    status: 200,
    headers: { 'Set-Cookie': `access_token=${jwt}; Path=/; HttpOnly; Secure; SameSite=Strict` },
  });
})

// auth.post(
//   "/signup",
//   async (req: express.Request, res: express.Response): Promise<void> => {
//     const { email, password } = req.body;
//     const { data, error } = await getSupabaseClient().auth.signUp({
//       email,
//       password,
//     });
//
//     if (error) {
//       res.status(401).json({ error: error.message });
//       return;
//     }
//     console.log("User authenticated:", data);
//     res.json(data);
//   },
// );

app.post(  "/auth/logout", async (req): Promise<Response> => {
  const access_token = parseCookies(req.headers.get('cookie'))['access_token'];
  console.log('>>>>>> cookies:', req.headers.get('origin'), req.headers.get('cookie'));
  
  if (!access_token) {
    console.error('No access token found in cookies during logout process');
    return response(null, 401, 'No access token found');
  }

  const db = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_ANON_KEY');
  const { error } =  await createClient(db, key, {global: { headers: { Authorization: `Bearer ${access_token}` } }}).auth.signOut();
  if (error) {
    console.error('Error logging out:', error.message);
    return response(null, 401, error.message);
  }

  return response(null, 200, 'Logged out');
})

Deno.serve((req) => app.handler(req))
