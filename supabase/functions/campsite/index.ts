import { App } from '../_shared/App.ts';
import {response, getSupabaseClient, getAccessToken, getUserId} from '../_shared/utils.ts';
import {CampsiteBasicInfo, CamperPreferences} from "../_shared/types.ts";
import {getForecast} from '../_shared/openMeteo.ts';

const app = new App();

const _getUserIdAndToken = (req: Request): { userId: string | null, accessToken: string | null, message?: string } => {
  const access_token = getAccessToken(req);
  if (!access_token) {
    console.error('No access token found');
    return {userId: null, accessToken: null, message: 'No access token found'};
  }
  const user_id = getUserId(access_token);
  if (!user_id) {
    console.error('No user ID found in access token');
    return {userId: null, accessToken: null, message: 'No user ID found in access token'};
  }
  return {userId: user_id, accessToken: access_token};
}

// add user's campsites
app.post(  "/campsite", async (req: Request): Promise<Response> => {
  const { userId, accessToken, message } = _getUserIdAndToken(req);
  if (!userId || !accessToken) {
    console.error(message);
    return response(null, 401, message || 'Unauthorized');
  }
  
  const { campsite } = await req.json();
  console.log(`Running POST campsite for user ${userId}...`);
  console.log(`Adding ${campsite.length} campsites...`);

  if (!campsite.length) {
    console.error('No campsites provided');
    return response(null, 400, 'Campsite array is empty');
  }

  const { data, error } = await getSupabaseClient(accessToken).from("campsites")
    .upsert(campsite.map((cs: CampsiteBasicInfo) => ({
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

  const resp = await getSupabaseClient(accessToken).from("camper_preferences")
    .upsert(data.map((cs: CampsiteBasicInfo) => ({
      camper_id: userId,
      campsite_id: cs.id,
      rating: null,
  })));

  if (resp.error) {
    console.log("Error inserting camper preferences", error.message);
    return response(null, 500, error.message);
  }

  console.log("Campsites added successfully");

  return response({status: "Campsites added successfully"}, 200);
});

// get user's campsites
app.get(  "/campsite", async (req: Request): Promise<Response> => {
  const { userId, accessToken, message } = _getUserIdAndToken(req);
  if (!userId || !accessToken) {
    console.error(message);
    return response(null, 401, message || 'Unauthorized');
  }
  console.log(`Running GET campsite for user ${userId}...`);

  const { data, error } = await getSupabaseClient(accessToken).from("camper_preferences").select("*").eq("camper_id", userId);
  if (error) {
    console.log("Error inserting camper preferences", error.message);
    return response(null, 500, error.message);
  }

  const campsites = await getSupabaseClient(accessToken).from("campsites").select("*").in("id", data.map((c: CamperPreferences) => c.campsite_id));
  if (campsites.error) {
    console.log("Error fetching campsites", campsites.error.message);
    return response(null, 500, campsites.error.message);
  }
  if (!campsites.data || campsites.data.length === 0) {
    console.error('No campsites found for user:', userId);
    return response(null, 404, 'Campsites not found');
  }
  
  console.log(`Found ${campsites.data.length} campsites for user ${userId}`);
  
  const campsitesWeather = await Promise.all(campsites.data.map((c: CampsiteBasicInfo) => getForecast(c.latitude, c.longitude)));
  
  const campsitesWithWeather = campsites.data.map((camp: CampsiteBasicInfo, i: number) => ({
    ...camp,
    rating: data[i]?.rating,
    weather: campsitesWeather[i],
  }));

  console.log("Campsites retrieved successfully");

  return response(campsitesWithWeather, 200);
});

// update user's campsites
app.put("/campsite", async (req: Request): Promise<Response> => {
  const { userId, accessToken, message } = _getUserIdAndToken(req);
  if (!userId || !accessToken) {
    console.error(message);
    return response(null, 401, message || 'Unauthorized');
  }
  console.log(`Running PUT campsite for user ${userId}...`);

  const campsite = await req.json();
  if (!campsite || !campsite.id || !campsite.rating) {
    console.error('Invalid campsite data provided');
    return response(null, 400, 'Campsite data is invalid');
  }
  
  console.log(`Running PUT campsite for user ${userId} and campsite ${campsite.id}...`);
  const { error } = await getSupabaseClient(accessToken).from("camper_preferences",).update(
    { rating: campsite.rating },
  ).match({
    camper_id: userId,
    campsite_id: campsite.id,
  });
  if (error) {
    console.log("Error updating camper preferences", error.message);
    return response(null, 500, error.message);
  }

  console.log("Campsite updated successfully");

  return response({status: "Campsite updated successfully"}, 200);
});

// delete user's campsites
app.delete("/campsite", async (req): Promise<Response> => {
  const { userId, accessToken, message } = _getUserIdAndToken(req);
  if (!userId || !accessToken) {
    console.error(message);
    return response(null, 401, message || 'Unauthorized');
  }
  console.log(`Running DELETE campsite for user ${userId}...`);

  const campsiteId = new URLSearchParams(req.url.split('?')[1]).get('id');
  if (!campsiteId) {
    console.error('Invalid campsite data provided');
    return response(null, 400, 'Campsite data is invalid');
  }

  const { error } = await getSupabaseClient(accessToken).from("camper_preferences",).delete().match({
    camper_id: userId,
    campsite_id: campsiteId,
  });
  if (error) {
    console.log("Error deleting camper preferences", error.message);
    return response(null, 500, error.message);
  }

  console.log("Campsite deleted successfully");

  return response({status: "Campsite deleted successfully"}, 200);
});

Deno.serve((req) => app.handler(req))