import { it, expect, describe, vi } from 'vitest'

import { handler } from '../auth/index.ts'
import * as utils from '../_shared/utils.ts'

describe('Auth route handler', () => {
  it('should return expected result for valid input on /auth/login', async () => {
    // Arrange
    const spySignInWithPassword = vi.fn().mockResolvedValue({ data: { session: {access_token: 'token'}} });
    vi.spyOn(utils, 'getSupabaseClient').mockImplementation(() => ({auth: {signInWithPassword: spySignInWithPassword}}))
    const event = new Request('http://my-url/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({email: 'my-email', password: 'my-password'}),
    });

    // Act
    const result = await handler(event);

    // Assert
    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(200);
    const json = await result.json();
    expect(json).toEqual({status: 'Logged in', token: 'token'});
  });

  it('should return expected result for valid input on /auth/signup', async () => {
    // Arrange
    const spySignUp = vi.fn().mockResolvedValue({ data: { session: {access_token: 'token'}} });
    vi.spyOn(utils, 'getSupabaseClient').mockImplementation(() => ({auth: {signUp: spySignUp}}))
    const event = new Request('http://my-url/auth/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({email: 'my-email', password: 'my-password'}),
    });

    // Act
    const result = await handler(event);

    // Assert - weak password
    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(400);
    expect(result.statusText).toBe('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');

    // Arrange - strong password
    const event2 = new Request('http://my-url/auth/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify({email: 'my-email', password: 'ABCdefg1!'}),
    });

    // Act
    const result2 = await handler(event2);
    expect(result2.status).toBe(200);
    const json = await result2.json();
    expect(json).toEqual({status: 'Signed up', email: 'my-email'});
  });

  it('should return expected result for valid input on /auth/logout', async () => {
    // Arrange
    vi.spyOn(utils, 'getSupabaseClient').mockImplementation(() => ({auth: {signOut: vi.fn().mockResolvedValue({})}}))
    const event = new Request('http://my-url/auth/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
      },
    });

    // Act
    const result = await handler(event);

    // Assert
    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(200);
    const json = await result.json();
    expect(json).toEqual({status: 'Logged out'});
  });
});