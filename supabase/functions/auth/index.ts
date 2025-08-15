import { App } from '../_shared/App.ts';
import { response, getSupabaseClient, getAccessToken } from '../_shared/utils.ts';

const app = new App();

app.post(  "/auth/login", async (req): Promise<Response> => {
  const { email, password } = await req.json();
  console.log(`Logging ${email}...`);
  
  const { data, error } =  await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Error logging in:', error.message);
    return response(null, 401, error.message);
  }

  return response({ status: 'Logged in', token: data.session.access_token, id: data.user.id }, 200);
})

app.post(  "/auth/signup", async (req): Promise<Response> => {
  const { email, password } = await req.json();
  console.log(`Signin up ${email}...`);

  const pwdRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  if (!pwdRegex.test(password)) {
    console.error('Password does not meet complexity requirements');
    return response(null, 400, 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
  }
  
  const { data, error } =  await getSupabaseClient().auth.signUp({ email, password });
  if (error) {
    console.error('Error signin in:', error.message);
    return response(null, 401, error.message);
  }

  return response({ status: 'Signed up', email, id: data.user.id  }, 200);
});

app.get(  "/auth/logout", async (req): Promise<Response> => {
  const access_token = getAccessToken(req);
  if (!access_token) {
    return response(null, 401, 'No access token found');
  }

  const { error } =  await getSupabaseClient(access_token).auth.signOut();
  if (error) {
    console.error('Error logging out:', error.message);
    return response(null, 401, error.message);
  }

  return response(null, 200, 'Logged out');
})

Deno.serve((req) => app.handler(req))
