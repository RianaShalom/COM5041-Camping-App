import { App } from '../_shared/App.ts';
import { getSupabaseClient, getUserIdAndToken, response } from '../_shared/utils.ts';
import { CamperPreferences, CampsiteBasicInfo, CampsiteWithWeather, WeatherInfo } from '../_shared/types.ts';
import { getForecast } from '../_shared/openMeteo.ts';

const app = new App();

// add user's campsites
app.post('/campsites', async (req: Request): Promise<Response> => {
	const { userId, accessToken, message } = getUserIdAndToken(req);
	if (!userId || !accessToken) {
		console.error(message);
		return response(null, 401, message || 'Unauthorized');
	}

	const { campsite } = await req.json();
	console.log(`Running POST campsites for user ${userId}...`);
	console.log(`Adding ${campsite.length} campsites...`);

	if (!campsite.length) {
		console.error('No campsites provided');
		return response(null, 400, 'Campsite array is empty');
	}

	const { data, error } = await getSupabaseClient(accessToken).from('campsites')
		.upsert(campsite.map((cs: CampsiteBasicInfo) => ({
			id: cs.id,
			name: cs.name,
			latitude: cs.latitude,
			longitude: cs.longitude,
			address: cs.address,
		}))).select();

	if (error) {
		console.log('Error inserting campsite', error.message);
		return response(null, 500, error.message);
	}

	const resp = await getSupabaseClient(accessToken).from('camper_preferences')
		.upsert(data.map((cs: CampsiteBasicInfo) => ({
			camper_id: userId,
			campsite_id: cs.id,
			rating: null,
		})));

	if (resp.error) {
		console.log('Error inserting camper preferences', error.message);
		return response(null, 500, error.message);
	}

	console.log('Campsites added successfully');
	return response({ status: 'Campsites added successfully' }, 200);
});

// get user's campsites
app.get('/campsites', async (req: Request): Promise<Response> => {
	const { userId, accessToken, message } = getUserIdAndToken(req);
	if (!userId || !accessToken) {
		console.error(message);
		return response(null, 401, message || 'Unauthorized');
	}
	console.log(`Running GET campsites for user ${userId}...`);

	const weather = new URLSearchParams(req.url.split('?')[1]).get('weather');
	console.log(`Weather parameter is set to: ${weather}`);

	const { data, error } = await getSupabaseClient(accessToken).from('camper_preferences').select('*').eq(
		'camper_id',
		userId,
	);
	if (error) {
		console.log('Error getting camper preferences', error.message);
		return response(null, 500, error.message);
	}

	const campsites = await getSupabaseClient(accessToken).from('campsites').select('*').in(
		'id',
		data.map((c: CamperPreferences) => c.campsite_id),
	);
	if (campsites.error) {
		console.log('Error fetching campsites', campsites.error.message);
		return response(null, 500, campsites.error.message);
	}
	if (!campsites.data || campsites.data.length === 0) {
		console.error('No campsites found for user:', userId);
		return response([], 200);
	}

	console.log(`Found ${campsites.data.length} campsites for user ${userId}`);

	const campsitesWeather = await Promise.all(
		campsites.data.map((c: CampsiteBasicInfo) => getForecast(c.id, c.latitude, c.longitude)),
	);

	const campsitesWithWeather: CampsiteWithWeather[] = campsites.data.map((camp: CampsiteBasicInfo) => ({
		...camp,
		rating: data.find((c: CamperPreferences) => c.campsite_id === camp.id)?.rating || null,
		weather: campsitesWeather.find((w: WeatherInfo | null) => w?.id === camp.id) || null,
	}));

	const campsitesByWeather = campsitesWithWeather.filter((c: CampsiteWithWeather) => {
		if (weather === 'sunny') return c.weather?.days[0].weatherCode < 3; // sunny weather codes are 0-2
		if (weather === 'cloudy') return c.weather?.days[0].weatherCode >= 3 && c.weather?.days[0].weatherCode <= 48; // cloudy weather codes are 3-48
		if (weather === 'rainy') return c.weather?.days[0].weatherCode >= 51; // weather codes with precipitation are > 50
		if (!weather) return true;
	});

	console.log('Campsites retrieved successfully');

	return response(campsitesByWeather, 200);
});

// update user's campsites
app.put('/campsites', async (req: Request): Promise<Response> => {
	const { userId, accessToken, message } = getUserIdAndToken(req);
	if (!userId || !accessToken) {
		console.error(message);
		return response(null, 401, message || 'Unauthorized');
	}
	console.log(`Running PUT campsites for user ${userId}...`);

	const campsite = await req.json();
	if (!campsite || !campsite.id || !campsite.rating) {
		console.error('Invalid campsite data provided');
		return response(null, 400, 'Campsite data is invalid');
	}

	console.log(`Running PUT campsite for user ${userId} and campsite ${campsite.id}...`);
	const { error } = await getSupabaseClient(accessToken).from('camper_preferences').update({ rating: campsite.rating })
		.match({
			camper_id: userId,
			campsite_id: campsite.id,
		});
	if (error) {
		console.log('Error updating camper preferences', error.message);
		return response(null, 500, error.message);
	}

	console.log('Campsite updated successfully');

	return response({ status: 'Campsite updated successfully' }, 200);
});

// delete user's campsites
app.delete('/campsites', async (req: Request): Promise<Response> => {
	const { userId, accessToken, message } = getUserIdAndToken(req);
	if (!userId || !accessToken) {
		console.error(message);
		return response(null, 401, message || 'Unauthorized');
	}
	console.log(`Running DELETE campsites for user ${userId}...`);

	const campsiteId = new URLSearchParams(req.url.split('?')[1]).get('id');
	if (!campsiteId) {
		console.error('Invalid campsite data provided');
		return response(null, 400, 'Campsite data is invalid');
	}

	const { error } = await getSupabaseClient(accessToken).from('camper_preferences').delete().match({
		camper_id: userId,
		campsite_id: campsiteId,
	});
	if (error) {
		console.log('Error deleting camper preferences', error.message);
		return response(null, 500, error.message);
	}

	console.log('Campsite deleted successfully');

	return response({ status: 'Campsite deleted successfully' }, 200);
});

export const handler = (req: Request) => app.handler(req);
Deno.serve(handler);
