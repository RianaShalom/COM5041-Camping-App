import { PlaceWeather, WeatherInfo } from './types.ts';

export const getForecast = async (id: string, lat: number, lon: number): Promise<WeatherInfo | null> => {
	const resp = await fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min`,
	);
	if (!resp.ok) {
		console.error(`Error fetching place weather: ${resp.statusText}`);
		return null;
	}

	const placeWeather: PlaceWeather = await resp.json();
	return {
		id,
		elevation: placeWeather.elevation,
		days: placeWeather.daily.time.map((time, index) => ({
			date: time,
			weatherCode: placeWeather.daily.weather_code[index],
			tempMax: `${placeWeather.daily.temperature_2m_max[index]} °C`,
			tempMin: `${placeWeather.daily.temperature_2m_min[index]} °C`,
		})),
	};
};
