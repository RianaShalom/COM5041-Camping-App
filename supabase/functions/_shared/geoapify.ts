import { Campsite, CampsiteBasicInfo, PlaceInfo } from './types.ts';

export const getPlaceInfo = async (place: string): Promise<PlaceInfo | null> => {
	const resp = await fetch(
		`https://api.geoapify.com/v1/geocode/search?name=${place}&apiKey=${Deno.env.get('GEOAPIFY_KEY')}`,
	);
	if (!resp.ok) {
		console.error(`Error fetching place info: ${resp.statusText}`);
		return null;
	}

	const data = await resp.json();
	if (data?.features?.length) {
		return data.features.find((place: PlaceInfo) => place.properties.country_code === 'gb') ?? null;
	}
	return null;
};

export const getCampsites = async (place: string): Promise<CampsiteBasicInfo[] | null> => {
	const placeInfo = await getPlaceInfo(place);
	if (!placeInfo) {
		console.error(`No place info found for: ${place}`);
		return null;
	}

	const placeId = placeInfo.properties.place_id;
	const [lon, lat] = placeInfo.geometry.coordinates;
	const resp = await fetch(
		`https://api.geoapify.com/v2/places?categories=camping&filter=place:${placeId}&bias=proximity:${lon},${lat}&apiKey=${
			Deno.env.get('GEOAPIFY_KEY')
		}`,
	);
	if (!resp.ok) {
		console.error(`Error fetching campsites: ${resp.statusText}`);
		return null;
	}

	const data = await resp.json();
	if (data?.features) {
		return data.features.map((cs: Campsite) => {
			const props = cs.properties;
			if (!props.place_id || !props.name || !props.lat || !props.lon) {
				console.warn('Incomplete campsite data:', props);
				return null;
			}
			return {
				id: props.place_id,
				name: props.name,
				latitude: props.lat,
				longitude: props.lon,
				address: props.address_line2,
			};
		}).filter((cs: CampsiteBasicInfo | null) => cs !== null);
	}
	return null;
};
