import { App } from '../_shared/App.ts';
import { getAccessToken, getSupabaseClient, response } from '../_shared/utils.ts';

const app = new App();

app.post('/auth/login', async (req: Request): Promise<Response> => {
	const { email, password } = await req.json();
	console.log(`Logging ${email}...`);

	const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
	if (error) {
		console.error('Error logging in:', error.message);
		return response(null, 401, error.message);
	}

	return response({ status: 'Logged in', token: data.session.access_token }, 200);
});

app.post('/auth/signup', async (req: Request): Promise<Response> => {
	const { email, password } = await req.json();
	console.log(`Signing up ${email}...`);

	const pwdRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
	if (!pwdRegex.test(password)) {
		console.error('Password does not meet complexity requirements');
		return response(
			null,
			400,
			'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character',
		);
	}

	const { error } = await getSupabaseClient().auth.signUp({ email, password });
	if (error) {
		console.error('Error signing in:', error.message);
		return response(null, 401, error.message);
	}

	return response({ status: 'Signed up', email }, 200);
});

app.get('/auth/logout', async (req: Request): Promise<Response> => {
	const accessToken = getAccessToken(req);
	if (!accessToken) {
		return response(null, 401, 'No access token found');
	}

	const { error } = await getSupabaseClient(accessToken).auth.signOut();
	if (error) {
		console.error('Error logging out:', error.message);
		return response(null, 401, error.message);
	}

	return response({ status: 'Logged out' }, 200);
});

export const handler = (req: Request) => app.handler(req);
Deno.serve(handler);
