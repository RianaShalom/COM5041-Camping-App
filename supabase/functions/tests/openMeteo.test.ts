import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getForecast } from '../_shared/openMeteo.ts';

describe('getForecast', () => {
	const mockResponse = {
		elevation: 100,
		daily: {
			time: ['2024-06-01', '2024-06-02'],
			weather_code: [1, 2],
			temperature_2m_max: [25, 26],
			temperature_2m_min: [15, 16],
		},
	};

	beforeEach(() => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		});
	});

	it('should return weather info for valid response', async () => {
		// Act
		const result = await getForecast('abc', 10, 20);

		// Assert
		expect(result).toEqual({
			id: 'abc',
			elevation: 100,
			days: [
				{
					date: '2024-06-01',
					weatherCode: 1,
					tempMax: '25 °C',
					tempMin: '15 °C',
				},
				{
					date: '2024-06-02',
					weatherCode: 2,
					tempMax: '26 °C',
					tempMin: '16 °C',
				},
			],
		});
	});

	it('should return null if fetch fails', async () => {
		// Arrange
		(globalThis.fetch as any).mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });
		// Act
		const result = await getForecast('abc', 10, 20);
		// Assert
		expect(result).toBeNull();
	});
});
