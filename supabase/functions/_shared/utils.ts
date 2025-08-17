import { Buffer } from 'node:buffer';

import { createClient, SupabaseClient } from 'supabase';

export const response = (data: unknown, status: number, statusText?: string): Response => {
	if (!data) return new Response(null, { status, statusText });
	return new Response(JSON.stringify(data, null, 2), { status });
};

export const getSupabaseClient = (token?: string): SupabaseClient => {
	const db = Deno.env.get('SUPABASE_URL');
	const key = Deno.env.get('SUPABASE_ANON_KEY');
	if (!token) return createClient(db, key);
	return createClient(db, key, { global: { headers: { Authorization: token } } });
};

export const getAccessToken = (req: Request): string | null => {
	const accessToken = req.headers.get('Authorization');
	if (!accessToken || accessToken === 'Bearer null' || accessToken === 'Bearer undefined') {
		console.error('No access token found in request headers');
		return null;
	}
	return accessToken;
};

export const getUserId = (accessToken: string): string | null => {
	try {
		return JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString()).sub;
	} catch {
		console.error('No user ID found in access token');
		return null;
	}
};

export const getUserIdAndToken = (
	req: Request,
): { userId: string | null; accessToken: string | null; message?: string } => {
	const accessToken = getAccessToken(req);
	if (!accessToken) return { userId: null, accessToken: null, message: 'No access token found' };

	const user_id = getUserId(accessToken);
	if (!user_id) return { userId: null, accessToken: null, message: 'No user ID found in access token' };

	return { userId: user_id, accessToken: accessToken };
};
