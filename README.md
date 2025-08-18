# COM5041-Camping-App

## API Reference

This document describes the HTTP endpoints, request/response formats, and error models for the service.<br>
Base URL: https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1<br>
Content Type: All POST/PUT request bodies are application/json.<br>
Auth: Endpoints note whether they require authentication via header: Authorization: Bearer <access_token>
<br><br>

### Search Campsites
| APIs    | Method | Parameters | Auth | Description                                            |
|---------|--------|------------|------|--------------------------------------------------------|
| /search | GET    | place      | -    | Search campsites near the location in a range of 50km. |

Possible responses:
- 200 OK - Array of campsites found
- 400 Place parameter is required - Missing or invalid place parameter
- 404 Campsites not found - No campsites found for the given place

Example request (TS/JS):
```ts
await fetch('https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1/search?place=York');
```

Example response:
```json
[
  {
    "address": "123 Camp St, York, GB",
    "id": "campsite-1",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "name": "Campsite One"
  }
]
```
<br><br>

### Authentication
| APIs         | Method | Parameters | Auth     | Description                               |
|--------------|--------|------------|----------|-------------------------------------------|  
| /auth/signup | POST   | -          | -        | Signup a new user with email and password |

Possible responses:
- 200 OK - Successful signup
- 400 Password does not meet complexity requirements - Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
- 401 Signup failed - Supabase signup error

Example request (TS/JS):
```ts
await fetch('https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 'email': 'xxx', 'password': 'xxx' }),
})
```

Example response:

```json
{
  "status": "Signed up",
  "email": "xxx"
}
```
<br>

| APIs        | Method | Parameters | Auth     | Description                                    |
|-------------|--------|------------|----------|------------------------------------------------|   
| /auth/login | POST   | -          | -        | Login an existing user with email and password |

Possible responses:
- 200 OK - Successful login
- 401 Signup failed - Supabase login error

Example request (TS/JS):
```ts
await fetch('https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 'email': 'xxx', 'password': 'xxx' }),
})
```

Example response:

```json
{
  "status": "Logged in",
  "token": "<access_token>"
}
```
<br>

| APIs         | Method | Parameters | Auth     | Description   |
|--------------|--------|------------|----------|---------------|
| /auth/logout | GET    | -          | required | Logout a user |

Possible responses:
- 200 OK - Successful logout
- 401 Logout failed - No access token found or Supabase logout error

Example request (TS/JS):
```ts
await fetch('https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1/auth/logout', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <token>' 
  },
})
```

Example response:

```json
{
  "status": "Logged out"
}
```
<br><br>

### User's Campsites
| APIs      | Method | Parameters | Auth     | Description                                             |
|-----------|--------|------------|----------|---------------------------------------------------------|
| /campsite | GET    | -          | required | Get user's saved campsites with 7 days weather forecast |

Possible responses:
- 200 OK - Array of user's saved campsites with weather forecast
- 401 Unauthorized - No access token provided
- 500 Internal Server Error - Supabase error

Example request (TS/JS):
```ts
await fetch('https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1/campsite', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <token>' 
  },
})
```

Example response:
```json
[
  {
    "address": "123 Camp St, Bath, GB",
    "id": "campsite-1",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "name": "Campsite One",
    "rating": 3, // null until the user rates the campsite
    "weather": {
      "elevation": 100,
      "days": [
        { "date": "2025-08-10", "tempMax": "22.9 °C", "tempMin": "16.7 °C", "weatherCode": 13 }, // today
        { "date": "2025-08-11", "tempMax": "22.9 °C", "tempMin": "16.7 °C", "weatherCode": 13 }, // tomorrow
        { "date": "2025-08-12", "tempMax": "22.9 °C", "tempMin": "16.7 °C", "weatherCode": 13 }, // ...
        { "date": "2025-08-13", "tempMax": "22.9 °C", "tempMin": "16.7 °C", "weatherCode": 13 },
        { "date": "2025-08-14", "tempMax": "22.9 °C", "tempMin": "16.7 °C", "weatherCode": 13 },
        { "date": "2025-08-15", "tempMax": "22.9 °C", "tempMin": "16.7 °C", "weatherCode": 13 },
        { "date": "2025-08-16", "tempMax": "22.9 °C", "tempMin": "16.7 °C", "weatherCode": 13 }
      ]
    }
  }
]
```
<br>

| APIs      | Method | Parameters | Auth     | Description                                  |
|-----------|--------|------------|----------|----------------------------------------------|
| /campsite | POST   | -          | required | Save user's campsites after a search request |

Possible responses:
- 200 OK - Campsites added successfully
- 401 Unauthorized - No access token provided
- 400 Submitted campsite array is empty
- 500 Internal Server Error - Supabase error

Example request (TS/JS):
```ts
await fetch('https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1/campsite', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>',
  },
  body: JSON.stringify({
    campsite: [{
      id: "campsite-1",
      name: "Campsite One",
      latitude: 34.0522,
      longitude: -118.2437,
      address: "123 Camp St, Bath, GB",
    }],
  }),
})
```

Example response:
```json
{
  "status": "Campsites added successfully"
}
```
<br>

| APIs      | Method | Parameters | Auth     | Description                        |
|-----------|--------|------------|----------|------------------------------------|
| /campsite | PUT    | -          | required | Update user's campsite with a rate |

Possible responses:
- 200 OK - Campsite updated successfully
- 401 Unauthorized - No access token provided
- 400 Campsite data is invalid
- 500 Internal Server Error - Supabase error

Example request (TS/JS):
```ts
await fetch('https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1/campsite', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>',
  },
  body: JSON.stringify({
    campsite: [{
      id: "campsite-1",
      rating: 3, // rating from 1 to 5
    }],
  }),
})
```

Example response:
```json
{
  "status": "Campsite updated successfully"
}
```
<br>

| APIs      | Method | Parameters | Auth     | Description                  |
|-----------|--------|------------|----------|------------------------------|
| /campsite | DELETE | id         | required | Delete user's saved campsite |

Possible responses:
- 200 OK - Campsite deleted successfully
- 401 Unauthorized - No access token provided
- 400 Campsite data is invalid
- 500 Internal Server Error - Supabase error

Example request (TS/JS):
```ts
await fetch('https://hnxfgutvgswxxvzctxto.supabase.co/functions/v1/campsite?id=campsite-1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer <token>',
  },
  body: JSON.stringify({
    campsite: [{
      id: "campsite-1",
      rating: 3, // rating from 1 to 5
    }],
  }),
})
```

Example response:
```json
{
  "status": "Campsite deleted successfully"
}
```