import { PlaceWeather } from './types.ts';

export const getForecast = async (lat: number, lon: number): Promise<PlaceWeather | null> => {
  const resp = await fetch(
    `https://api.open-meteo.com/v1/forecast?forecast_days=1&latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min`,
  );
  if (!resp.ok) {
    console.error(`Error fetching place weather: ${resp.statusText}`);
    return null;
  }
  
  return resp.json();
};
