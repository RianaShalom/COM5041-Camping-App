export interface AppRoute {
	method: string;
	path: string;
	handler: (req: Request) => Promise<Response>;
}

export interface PlaceInfo {
	type: 'Feature';
	properties: {
		datasource: {
			sourcename: string;
			attribution: string;
			license: string;
			url: string;
		};
		country: string;
		country_code: string;
		state: string;
		county: string;
		state_district: string;
		city: string;
		iso3166_2: string;
		iso3166_2_sublevel: string;
		lon: number;
		lat: number;
		state_code: string;
		result_type: string;
		county_code: string;
		formatted: string;
		address_line1: string;
		address_line2: string;
		category: string;
		timezone: {
			name: string;
			offset_STD: string;
			offset_STD_seconds: number;
			offset_DST: string;
			offset_DST_seconds: number;
			abbreviation_STD: string;
			abbreviation_DST: string;
		};
		plus_code: string;
		plus_code_short: string;
		rank: {
			importance: number;
			popularity: number;
			confidence: number;
			match_type: string;
		};
		place_id: string;
	};
	geometry: { type: 'Point'; coordinates: [number, number] };
	bbox: [number, number, number, number];
}

export interface Campsite {
	type: 'Feature';
	properties: {
		name: string;
		country: string;
		country_code: string;
		state: string;
		county: string;
		state_district: string;
		city: string;
		postcode: string;
		suburb: string;
		street: string;
		iso3166_2: string;
		iso3166_2_sublevel: string;
		lon: number;
		lat: number;
		state_code: string;
		formatted: string;
		address_line1: string;
		address_line2: string;
		categories: string[];
		details: string[];
		datasource: {
			sourcename: string;
			attribution: string;
			license: string;
			url: string;
			raw: {
				'addr:postcode': string;
				'addr:street': string;
				caravans: string;
				'fhrs:id': number;
				name: string;
				osm_id: number;
				osm_type: string;
				tents: string;
				tourism: string;
				website: string;
			};
		};
		website: string;
		distance: number;
		place_id: string;
	};
	geometry: {
		type: string;
		coordinates: [number, number];
	};
}

export interface CampsiteBasicInfo {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	address: string;
}

export interface CamperPreferences {
	camper_id: string;
	campsite_id: string;
	created_at: string;
}

export interface PlaceWeather {
	latitude: number;
	longitude: number;
	generationtime_ms: number;
	utc_offset_seconds: number;
	timezone: string;
	timezone_abbreviation: string;
	elevation: number;
	daily_units: {
		time: 'iso8601';
		weather_code: 'wmo code';
		temperature_2m_max: '°C';
		temperature_2m_min: '°C';
	};
	daily: {
		time: [string, string, string, string, string, string, string]; // 1 week
		weather_code: [number, number, number, number, number, number, number];
		temperature_2m_max: [number, number, number, number, number, number, number];
		temperature_2m_min: [number, number, number, number, number, number, number];
	};
}

export interface WeatherInfo {
	id: string;
	elevation: number;
	days: {
		date: string;
		weatherCode: number;
		tempMax: string;
		tempMin: string;
	}[];
}
