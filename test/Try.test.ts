import {test, expect, describe, beforeEach} from 'vitest';
import {tryCatch, tryCatchAsync} from '../src/try';

describe('tryCatch', () => {

  test('returns Left when there are no errors', () => {
    const result = tryCatch(() => 42);
    expect(result.isRight()).toBe(true);
    const value = result.ifLeft(x => 0);
    expect(value).toBe(42);
  });

  test('returns Right with an Error when there is an error', () => {
    const result = tryCatch(() => { throw new Error("test error"); });
    expect(result.isLeft()).toBe(true);
    const error = result.ifRight(e => new Error());
    expect(error.message).toBe("test error");
  });
});

describe('tryCatchAsync', () => {

  test('returns Left when there are no async errors', async () => {
    const result = await tryCatchAsync(() => Promise.resolve(42));
    expect(result.isRight()).toBe(true);
    expect(result.ifLeft(x => 0)).toBe(42);
  });

  test('returns Right with an Error when there is an async error', async () => {
    const result = await tryCatchAsync(() => Promise.reject("test async error"));
    expect(result.isLeft()).toBe(true);
    expect(result.ifRight(e => new Error()).message).toBe("test async error");
  });
});