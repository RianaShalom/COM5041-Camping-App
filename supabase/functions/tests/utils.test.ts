import { it, expect, describe } from 'vitest'

import {response, getAccessToken, getUserId, getUserIdAndToken} from '../_shared/utils.ts';

describe('Shared Utils Tests', () => {
  it('response should return expected object', async () => {
    // act
    const result = response({data: 'good'}, 200);
    // assert
    expect(result).instanceOf(Response)
    
    // act
    const data = await result.json();
    // assert
    expect(result.status).toBe(200)
    expect(result.ok).toBe(true)
    expect(data.data).toBe("good")
  });

  it('response should return failed response', () => {
    // act
    const result = response(null, 404, 'Not Found');
    // assert
    expect(result).instanceOf(Response)
    expect(result.status).toBe(404)
    expect(result.statusText).toBe('Not Found')
    expect(result.ok).toBe(false)
  });

  it('getAccessToken should return a string token when invoked with a valid Authorization header', () => {
    // assert
    expect(getAccessToken(new Request('http://my-url.com', {headers: { Authorization: 'Bearer my-token'}}))).toEqual('Bearer my-token');
    expect(getAccessToken(new Request('http://my-url.com', {headers: { Authorization: 'Bearer null'}}))).toEqual(null);
    expect(getAccessToken(new Request('http://my-url.com', {headers: { Authorization: 'Bearer undefined'}}))).toEqual(null);
    expect(getAccessToken(new Request('http://my-url.com', {headers: { }}))).toEqual(null);
  });

  it('getUserId should return a string user id when invoked with a valid token', () => {
    // act
    const userId = getUserId('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30');
    // assert
    expect(userId).toEqual('1234567890');

    // act
    const userIdInvalid = getUserId('Bearer fsdgergdfgdgd');
    // assert
    expect(userIdInvalid).toEqual(null);
  });

  it('getUserIdAndToken should return userId and token when valid request', () => {
    // arrange
    const req = new Request('http://my-url.com', {headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30'}})
    // act
    const { userId, accessToken } = getUserIdAndToken(req);
    // assert
    expect(userId).toEqual('1234567890');
    expect(accessToken).toEqual('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30');

    // arrange
    const reqInvalid = new Request('http://my-url.com', {headers: { Authorization: 'Bearer null'}})
    // act
    const invalid = getUserIdAndToken(reqInvalid);
    // assert
    expect(invalid.userId).toEqual(null);
    expect(invalid.accessToken).toEqual(null);
    expect(invalid.message).toEqual('No access token found');
  });
})