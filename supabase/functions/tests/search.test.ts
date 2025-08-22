import { describe, expect, it, vi } from 'vitest';

import { handler } from '../search/index.ts';
import * as campsite from '../_shared/geoapify.ts';

describe('Search route handler', () => {
	it('should return expected result for valid input on GET /search', async () => {
		// missing place parameter
		// Act
		const result1 = await handler(new Request('http://my-url/search'));
		// Assert
		expect(result1.status).toBe(400);
		expect(result1.statusText).toBe('Place parameter is required');

		// campsites not found
		// Arrange
		const event = new Request('http://my-url/search?place=bath');
		vi.spyOn(campsite, 'getCampsites').mockResolvedValue(null);
		// Act
		const result2 = await handler(event);
		// Assert
		expect(result2.status).toBe(404);
		expect(result2.statusText).toBe('Campsites not found');

		// happy path
		// Arrange
		vi.spyOn(campsite, 'getCampsites').mockResolvedValue([
			{
				id: 'campsite-1',
				name: 'Campsite One',
				latitude: 34.0522,
				longitude: -118.2437,
				address: '123 Camp St, Bath, GB',
			},
		]);
		// Act
		const result3 = await handler(event);
		// Assert
		expect(result3).toBeInstanceOf(Response);
		expect(result3.status).toBe(200);
		const json = await result3.json();
		expect(json).toEqual([
			{
				address: '123 Camp St, Bath, GB',
				id: 'campsite-1',
				latitude: 34.0522,
				longitude: -118.2437,
				name: 'Campsite One',
			},
		]);
	});
});
