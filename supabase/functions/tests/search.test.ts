import { it, expect, describe, vi } from 'vitest'

import { handler } from '../search/index.ts'
import * as campsite from '../_shared/geoapify.ts'

describe('Search route handler', () => {
  it('should return expected result for valid input on GET /search', async () => {
    // Arrange
    vi.spyOn(campsite, 'getCampsites').mockResolvedValue([
      {
        id: 'campsite-1',
        name: 'Campsite One',
        latitude: 34.0522,
        longitude: -118.2437,
        address: '123 Camp St, Bath, GB',
      },
    ])
    const event = new Request('http://my-url/search?place=bath');

    // Act
    const result = await handler(event);

    // Assert
    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(200);
    const json = await result.json();
    expect(json).toEqual([
      {
        "address": "123 Camp St, Bath, GB",
        "id": "campsite-1",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "name": "Campsite One",
      },
    ]);
  });
});