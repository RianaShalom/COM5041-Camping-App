import { AppRoute } from './types.ts';

export class App {
  private _routes: AppRoute[] = []

  public get(path: string, handler: (req: Request) => Promise<Response>): void {
    this._routes.push({ method: 'GET', path, handler })
  }

  public post(path: string, handler: (req: Request) => Promise<Response>): void {
    this._routes.push({ method: 'POST', path, handler })
  }

  public put(path: string, handler: (req: Request) => Promise<Response>): void {
    this._routes.push({ method: 'PUT', path, handler })
  }

  public delete(path: string, handler: (req: Request) => Promise<Response>): void {
    this._routes.push({ method: 'DELETE', path, handler })
  }

  public async handler(req: Request): Promise<Response> {
    const url = new URL(req.url)

    // Handle CORS preflight request early
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': `${req.headers.get('origin')}`,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          // 'Access-Control-Allow-Credentials': 'true',
        },
      })
    }
    
    const route = this._routes.find((r: AppRoute) => r.method === req.method && r.path === url.pathname)

    if (route) {
      const response = await route.handler(req);

      // Set CORS headers on all responses
      response.headers.set('Access-Control-Allow-Origin', `${req.headers.get('origin')}`);
      // response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    return new Response('Not Found', { status: 404 });
  }
}
