import { it, expect, describe } from 'vitest'

import { App } from '../_shared/App.ts'

describe('App', () => {
  it('handles GET requests for registered routes', async () => {
    // arrange
    const app = new App();
    app.get('/test', async () => new Response('GET response'));
    const req = new Request('http://localhost/test', { method: 'GET' });
    // act
    const res = await app.handler(req);
    // assert
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('GET response');
  });

  it('returns 404 for unregistered routes', async () => {
    // arrange
    const app = new App();
    const req = new Request('http://localhost/unregistered', { method: 'GET' });
    // act
    const res = await app.handler(req);
    // assert
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('Not Found');
  });

  it('handles CORS preflight requests', async () => {
    // arrange
    const app = new App();
    const req = new Request('http://localhost/test', { method: 'OPTIONS', headers: { origin: 'http://example.com' } });
    // act
    const res = await app.handler(req);
    // assert
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://example.com');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS, PUT, DELETE');
  });

  it('sets CORS headers on all responses', async () => {
    // arrange
    const app = new App();
    app.get('/test', async () => new Response('GET response'));
    const req = new Request('http://localhost/test', { method: 'GET', headers: { origin: 'http://example.com' } });
    // act
    const res = await app.handler(req);
    // assert
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://example.com');
  });

  it('handles POST requests for registered routes', async () => {
    // arrange
    const app = new App();
    app.post('/submit', async () => new Response('POST response'));
    const req = new Request('http://localhost/submit', { method: 'POST' });
    // act
    const res = await app.handler(req);
    // assert
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('POST response');
  });

  it('handles DELETE requests for registered routes', async () => {
    // arrange
    const app = new App();
    app.delete('/remove', async () => new Response('DELETE response'));
    const req = new Request('http://localhost/remove', { method: 'DELETE' });
    // act
    const res = await app.handler(req);
    // assert
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('DELETE response');
  });

  it('handles PUT requests for registered routes', async () => {
    // arrange
    const app = new App();
    app.put('/update', async () => new Response('PUT response'));
    const req = new Request('http://localhost/update', { method: 'PUT' });
    // act
    const res = await app.handler(req);
    // assert
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('PUT response');
  });
});