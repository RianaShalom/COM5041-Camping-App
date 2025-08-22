import { describe, expect, it } from 'vitest';

import { getCampsites, getPlaceInfo } from '../_shared/geoapify.ts';

describe('getPlaceInfo', () => {
	it('returns place info for a valid place', async () => {
		// arrange
		globalThis.fetch = async () =>
			({
				ok: true,
				json: async () => ({
					features: [
						{ properties: { country_code: 'gb', place_id: '123' }, geometry: { coordinates: [0, 0] } },
					],
				}),
			}) as Response;

		// act
		const result = await getPlaceInfo('London');

		// assert
		expect(result).not.toBeNull();
		expect(result?.properties.country_code).toBe('gb');
	});

	it('returns null if fetch fails', async () => {
		// arrange
		globalThis.fetch = async () => ({ ok: false, statusText: 'Not Found' }) as Response;

		// act
		const result = await getPlaceInfo('Unknown');

		// assert
		expect(result).toBeNull();
	});

	it('returns null if no GB place found', async () => {
		// arrange
		globalThis.fetch = async () =>
			({
				ok: true,
				json: async () => ({
					features: [
						{ properties: { country_code: 'fr', place_id: '456' }, geometry: { coordinates: [0, 0] } },
					],
				}),
			}) as Response;

		// act
		const result = await getPlaceInfo('Paris');

		// assert
		expect(result).toBeNull();
	});
});

describe('getCampsites', () => {
	it('returns campsites for a valid place', async () => {
		// arrange
		globalThis.fetch = async (url: string) => {
			if (url.includes('geocode')) {
				return {
					ok: true,
					json: async () => ({
						features: [
							{
								properties: { country_code: 'gb', place_id: '123', lat: 51, lon: -0.1 },
								geometry: { coordinates: [-0.1, 51] },
							},
						],
					}),
				} as Response;
			}
			return {
				ok: true,
				json: async () => ({
					features: [
						{ properties: { place_id: 'c1', name: 'Camp 1', lat: 51, lon: -0.1, address_line2: 'Address 1' } },
						{ properties: { place_id: 'c2', name: 'Camp 2', lat: 52, lon: -0.2, address_line2: 'Address 2' } },
					],
				}),
			} as Response;
		};

		// act
		const result = await getCampsites('London');

		// assert
		expect(result).toHaveLength(2);
		expect(result?.[0]?.name).toBe('Camp 1');
	});

	it('returns null if no place info found', async () => {
		// arrange
		globalThis.fetch = async () =>
			({
				ok: true,
				json: async () => ({ features: [] }),
			}) as Response;

		// act
		const result = await getCampsites('Unknown');

		// assert
		expect(result).toBeNull();
	});

	it('filters out incomplete campsite data', async () => {
		// arrange
		globalThis.fetch = async (url: string) => {
			if (url.includes('geocode')) {
				return {
					ok: true,
					json: async () => ({
						features: [
							{
								properties: { country_code: 'gb', place_id: '123', lat: 51, lon: -0.1 },
								geometry: { coordinates: [-0.1, 51] },
							},
						],
					}),
				} as Response;
			}
			return {
				ok: true,
				json: async () => ({
					features: [
						{ properties: { place_id: 'c1', name: 'Camp 1', lat: 51, lon: -0.1, address_line2: 'Address 1' } },
						{ properties: { place_id: null, name: null, lat: null, lon: null, address_line2: 'Address X' } },
					],
				}),
			} as Response;
		};

		// act
		const result = await getCampsites('London');

		// assert
		expect(result).toHaveLength(1);
		expect(result?.[0]?.name).toBe('Camp 1');
	});
});
