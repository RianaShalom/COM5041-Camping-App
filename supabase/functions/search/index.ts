import { App } from '../_shared/App.ts';
import { getCampsites } from '../_shared/geoapify.ts';
import { response } from '../_shared/utils.ts';
import { CampsiteBasicInfo } from '../_shared/types.ts';

const app = new App();

app.get('/search', async (req): Promise<Response> => {
	const place = new URLSearchParams(req.url.split('?')[1]).get('place');
	if (!place) {
		console.error('No place provided');
		return response(null, 400, 'Place parameter is required');
	}

	console.log(`Searching for ${place}...`);

	const campsites: CampsiteBasicInfo[] | null = await getCampsites(place);
	console.log(`Found ${campsites?.length ?? 'none'} campsites`);
	if (!campsites) {
		console.error('No campsites found for place:', place);
		return response(null, 404, 'Campsites not found');
	}

	return response(campsites, 200);
});

Deno.serve((req) => app.handler(req));
