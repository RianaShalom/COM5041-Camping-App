import { App } from '../_shared/App.ts';
import { getCampsites } from '../_shared/geoapify.ts';
import { response } from '../_shared/utils.ts';

const app = new App()

app.post('/search', async (req): Promise<Response> => {
  const { place } = await req.json();
  console.log(`Searching for ${place}...`);

  const campsites = await getCampsites(place);
  if (!campsites) {
    console.error('No campsites found for place:', place);
    return response(null, 404, 'Campsites not found');
  }
  return response(campsites, 200);
})

Deno.serve((req) => app.handler(req))
