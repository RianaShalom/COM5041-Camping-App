import { PlaceWeather, WeatherInfo } from './types.ts';

export const getForecast = async (lat: number, lon: number): Promise<WeatherInfo | null> => {
  const resp = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min`,
  );
  if (!resp.ok) {
    console.error(`Error fetching place weather: ${resp.statusText}`);
    return null;
  }
  
  const placeWeather: PlaceWeather = await resp.json();
  return  {
    elevation: placeWeather.elevation,
    days: placeWeather.daily.time.map((time, index) => ({
      date: time,
      weather_code: placeWeather.daily.weather_code[index],
      temperature_2m_max: placeWeather.daily.temperature_2m_max[index],
      temperature_2m_min: placeWeather.daily.temperature_2m_min[index],
    })),
  };
};
