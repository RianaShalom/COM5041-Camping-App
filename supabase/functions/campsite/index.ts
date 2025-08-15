import { App } from '../_shared/App.ts';
import {response, getSupabaseClient, getAccessToken} from '../_shared/utils.ts';
import {CampsiteBasicInfo} from "../_shared/types.ts";

const app = new App();

app.post(  "/campsite", async (req): Promise<Response> => {  
  const { campsite, user_id } = await req.json();
  console.log(`Running POST campsite for user ${user_id}...`);
  console.log(`Adding ${campsite.length} campsites...`);

  if (!campsite.length) {
    console.error('No campsites provided');
    return response(null, 400, 'Campsite array is empty');
  }

  const access_token = getAccessToken(req);
  if (!access_token) {
    return response(null, 401, 'No access token found');
  }

  const { data, error } = await getSupabaseClient(access_token).from(
    "campsites",
  ).insert(campsite.map((cs: CampsiteBasicInfo) => ({
    id: cs.id,
    name: cs.name,
    latitude: cs.latitude,
    longitude: cs.longitude,
    address: cs.address,
  }))).select();

  if (error) {
    console.log("Error inserting campsite", error.message);
    return response(null, 500, error.message);
  }

  const resp = await getSupabaseClient(access_token).from(
    "camper_preferences",
  ).insert(data.map((cs: CampsiteBasicInfo) => ({
    camper_id: user_id,
    campsite_id: cs.id,
    rating: null, // not implemented yet
  })));

  if (resp.error) {
    console.log("Error inserting camper preferences", error.message);
    return response(null, 500, error.message);
  }

  console.log("Campsites added successfully");

  return response({status: "Campsites added successfully"}, 200);
})

Deno.serve((req) => app.handler(req))