// This is a mock service worker for testing RestClient
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {beforeAll, test, afterAll, afterEach, expect, Test} from 'vitest';
import {RestClient} from '../src/rest-client';
import {isProblemDetails, ProblemDetails} from '../src/problem-details';


const testProblemDetails = new ProblemDetails({
  type: 'https://example.com/probs/out-of-credit',
  title: 'You do not have enough credit.',
  status: 403,
  detail: 'Your current balance is 30, but that costs 50.',
  instance: '/account/12345/msgs/abc',
  errors: ['error1', 'error2']
});

const server = setupServer(
  rest.get('http://localhost/pass', (req, res, ctx) => {
    return res(ctx.json({data: 'response'}));
  }),
  rest.get('http://localhost/fail', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json(testProblemDetails));
  }),
  rest.post('http://localhost/pass', (req, res, ctx) => {
    return res(ctx.json({data: 'response'}));
  }),
  rest.post('http://localhost/fail', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json(testProblemDetails));
  }),
  rest.put('http://localhost/pass', (req, res, ctx) => {
    return res(ctx.json({data: 'response'}));
  }),
  rest.put('http://localhost/fail', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json(testProblemDetails));
  }),
  rest.delete('http://localhost/pass', (req, res, ctx) => {
    return res(ctx.json({data: 'response'}));
  }),
  rest.delete('http://localhost/fail', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json(testProblemDetails));
  }),
  rest.patch('http://localhost/pass', (req, res, ctx) => {
    return res(ctx.json({data: 'response'}));
  }),
  rest.patch('http://localhost/fail', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json(testProblemDetails));
  }),
  rest.get('http://localhost/auth/pass', (req, res, ctx) => {
    const auth = req.headers.get('Authorization');
    if (auth === 'Bearer 12345')
      return res(ctx.json({data: 'response'}));

    return res(ctx.status(401), ctx.json(testProblemDetails));
  }),
  rest.get('http://localhost/no-content', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
);

type TestBody = { data: string };
type TestResponse = { data: string };

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('RestClient should return data on Get when OK response', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.get<TestResponse>('pass');
  const data = response.ifLeft(x => null);
  expect(data).not.toBeNull();
  expect(data.data).toBe('response');
  expect(response.isRight()).toBe(true);
});

test('RestClient should return ProblemDetails on Get when Error response', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.get<unknown>('fail');
  const error = response.ifRight(e => null);
  expect(error).not.toBeNull();
  expect(isProblemDetails(error)).toBe(true);
  expect(error.title).toBe('You do not have enough credit.');
  expect(response.isLeft()).toBe(true);
});

test('RestClient should return data on Post when OK response', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.post<TestBody, TestResponse>('pass', {data: 'request'});
  const data = response.ifLeft(x => null);
  expect(data).not.toBeNull();
  expect(data.data).toBe('response');
  expect(response.isRight()).toBe(true);
});

test('RestClient should return ProblemDetails on Post when Error response', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.post<TestBody, TestResponse>('fail', {data: 'request'});
  const error = response.ifRight(e => null);
  expect(error).not.toBeNull();
  expect(isProblemDetails(error)).toBe(true);
  expect(error.title).toBe('You do not have enough credit.');
  expect(response.isLeft()).toBe(true);
});

test('RestClient should return data on Put when OK response', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.put<TestBody, TestResponse>('pass', {data: 'request'});
  const data = response.ifLeft(x => null);
  expect(data).not.toBeNull();
  expect(data.data).toBe('response');
  expect(response.isRight()).toBe(true);
});

test('RestClient should return ProblemDetails on Put when Error response', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.put<TestBody, TestResponse>('fail', {data: 'request'});
  const error = response.ifRight(e => null);
  expect(error).not.toBeNull();
  expect(isProblemDetails(error)).toBe(true);
  expect(error.title).toBe('You do not have enough credit.');
  expect(response.isLeft()).toBe(true);
});

test('RestClient should return data on Delete when OK response', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.delete<TestResponse>('pass');
  const data = response.ifLeft(x => null);
  expect(data).not.toBeNull();
  expect(data.data).toBe('response');
  expect(response.isRight()).toBe(true);
});

test('RestClient should return ProblemDetails on Delete when Error response', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.delete<TestResponse>('fail');
  const error = response.ifRight(e => null);
  expect(error).not.toBeNull();
  expect(isProblemDetails(error)).toBe(true);
  expect(error.title).toBe('You do not have enough credit.');
  expect(response.isLeft()).toBe(true);
});

test('RestClient should return data on Get when OK response and correct auth', async () => {
  const client = new RestClient({baseURL: 'http://localhost', authorization: 'Bearer 12345'});
  const response = await client.get<TestResponse>('auth/pass');
  const data = response.ifLeft(x => null);
  expect(data).not.toBeNull();
  expect(data.data).toBe('response');
  expect(response.isRight()).toBe(true);
});

test('RestClient should return ProblemDetails on Get when OK response and incorrect auth', async () => {
  const client = new RestClient({baseURL: 'http://localhost', authorization: 'Bearer 54321'});
  const response = await client.get<TestResponse>('auth/pass');
  const data = response.ifLeft(x => null);
  expect(data).toBeNull();
  const error = response.ifRight(e => null);
  expect(error).not.toBeNull();
  expect(isProblemDetails(error)).toBe(true);
  expect(error.title).toBe('You do not have enough credit.');
  expect(response.isLeft()).toBe(true);
});

test('RestClient should handle 204 No Content', async () => {
  const client = new RestClient({baseURL: 'http://localhost'});
  const response = await client.get('no-content');
  const data = response.ifLeft(x => null);
  expect(data).toBeFalsy();
  expect(response.isRight()).toBe(true);
});