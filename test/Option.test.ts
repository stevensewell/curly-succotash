import {test, expect, describe, beforeEach} from 'vitest';

import {Option} from '../src/option';

describe('Option<A>', () => {
  let optionSome: Option<number>;
  let optionNone: Option<number>;

  beforeEach(() => {
    optionSome = Option.Some(7);
    optionNone = Option.None();
  });

  test('toArray should return an array containing the value for some', () => {
    expect(optionSome.toArray()).toEqual([7]);
  });

  test('toArray should return an empty array for none', () => {
    expect(optionNone.toArray()).toEqual([]);
  });

  test('isSome should return true for some', () => {
    expect(optionSome.isSome()).toBe(true);
  });

  test('isSome should return false for none', () => {
    expect(optionNone.isSome()).toBe(false);
  });

  test('ifNone should return value for some', () => {
    expect(optionSome.ifNone(() => 10)).toBe(7);
  });

  test('ifNone should return result of the given function for none', () => {
    expect(optionNone.ifNone(() => 10)).toBe(10);
  });

  test('isNone should return false for some', () => {
    expect(optionSome.isNone()).toBe(false);
  });

  test('isNone should return true for none', () => {
    expect(optionNone.isNone()).toBe(true);
  });

  test('map function should return mapped value for some', () => {
    const mappedOption = optionSome.map(x => x * 2);
    expect(mappedOption.toArray()).toEqual([14]);
  });

  test('map function should return None for none', () => {
    const mappedOption = optionNone.map(x => x * 2);
    expect(mappedOption.isNone()).toBe(true);
  });

  test('match function should execute someFn for some and return its value', () => {
    const result = optionSome.match(x => x * 2, () => 0);
    expect(result).toBe(14);
  });

  test('match function should execute noneFn for none and return its value', () => {
    const result = optionNone.match(x => x * 2, () => 0);
    expect(result).toBe(0);
  });
});