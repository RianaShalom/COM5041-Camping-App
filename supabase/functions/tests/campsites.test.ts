import { describe, expect, it, vi } from 'vitest';

import { handler } from '../campsites/index.ts';
import * as utils from '../_shared/utils.ts';
import * as weather from '../_shared/openMeteo.ts';

describe('Campsite route handler', () => {
	it('should return expected result for valid input on POST /campsites', async () => {
		// Arrange
		const event1 = new Request('http://my-url/campsites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
		});
		// Act
		const result1 = await handler(event1);
		// Assert
		expect(result1).toBeInstanceOf(Response);
		expect(result1.status).toBe(401);
		expect(result1.statusText).toBe('No access token found');

		// Arrange
		const spySelect = vi.fn().mockResolvedValue({ data: [{ id: 'campsite-1' }], error: null });
		vi.spyOn(utils, 'getSupabaseClient').mockImplementation(() => ({
			from: () => ({ upsert: () => ({ select: spySelect }) }),
		}));
		const event2 = new Request('http://my-url/campsites', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization':
					'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
			},
			body: JSON.stringify({
				campsite: [
					{
						id: 'campsite-1',
						name: 'Campsite One',
						latitude: 34.0522,
						longitude: -118.2437,
						address: '123 Camp St, Bath, GB',
					},
				],
			}),
		});

		// Act
		const result2 = await handler(event2);

		// Assert
		expect(result2).toBeInstanceOf(Response);
		expect(result2.status).toBe(200);
		const json = await result2.json();
		expect(json).toEqual({ status: 'Campsites added successfully' });
	});

	it('should return expected result for valid input on GET /campsites', async () => {
		// Arrange
		vi.spyOn(weather, 'getForecast').mockResolvedValue({
			id: 'campsite-1',
			elevation: 100,
			days: [{ date: 'today', weatherCode: 13, tempMax: 15, tempMin: 4 }],
		});
		const spySelectEq = vi.fn().mockResolvedValue({ data: [{ campsite_id: 'campsite-1' }], error: null });
		const spySelectIn = vi.fn().mockResolvedValue({
			data: [{
				id: 'campsite-1',
				name: 'Campsite One',
				latitude: 34.0522,
				longitude: -118.2437,
				address: '123 Camp St, Bath, GB',
			}],
		});
		vi.spyOn(utils, 'getSupabaseClient').mockImplementation(() => ({
			from: () => ({
				select: () => ({ eq: spySelectEq, in: spySelectIn }),
			}),
		}));
		const event = new Request('http://my-url/campsites', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization':
					'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
			},
		});

		// Act
		const result = await handler(event);

		// Assert
		expect(result).toBeInstanceOf(Response);
		expect(result.status).toBe(200);
		const json = await result.json();
		expect(json).toEqual([
			{
				'address': '123 Camp St, Bath, GB',
				'id': 'campsite-1',
				'latitude': 34.0522,
				'longitude': -118.2437,
				'name': 'Campsite One',
				'rating': null,
				'weather': {
					'days': [{ 'date': 'today', 'tempMax': 15, 'tempMin': 4, 'weatherCode': 13 }],
					'elevation': 100,
					'id': 'campsite-1',
				},
			},
		]);

		const event2 = new Request('http://my-url/campsites?weather=sunny', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization':
					'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
			},
		});

		// Act
		const result2 = await handler(event2);

		// Assert
		expect(result2).toBeInstanceOf(Response);
		expect(result2.status).toBe(200);
		const json2 = await result2.json();
		expect(json2).toEqual([]);
	});

	it('should return expected result for valid input on PUT /campsites', async () => {
		// Arrange
		const spyUpdateMatch = vi.fn().mockResolvedValue({});
		vi.spyOn(utils, 'getSupabaseClient').mockImplementation(() => ({
			from: () => ({ update: () => ({ match: spyUpdateMatch }) }),
		}));
		const event = new Request('http://my-url/campsites', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization':
					'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
			},
			body: JSON.stringify({ id: 'campsite-1', rating: '3' }),
		});

		// Act
		const result = await handler(event);

		// Assert
		expect(result).toBeInstanceOf(Response);
		expect(result.status).toBe(200);
		const json = await result.json();
		expect(json).toEqual({ status: 'Campsite updated successfully' });
	});

	it('should return expected result for valid input on DELETE /campsites', async () => {
		// Arrange
		const spyDeleteMatch = vi.fn().mockResolvedValue({});
		vi.spyOn(utils, 'getSupabaseClient').mockImplementation(() => ({
			from: () => ({ delete: () => ({ match: spyDeleteMatch }) }),
		}));
		const event = new Request('http://my-url/campsites?id=campsite-1', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization':
					'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
			},
		});

		// Act
		const result = await handler(event);

		// Assert
		expect(result).toBeInstanceOf(Response);
		expect(result.status).toBe(200);
		const json = await result.json();
		expect(json).toEqual({ status: 'Campsite deleted successfully' });
	});
});
