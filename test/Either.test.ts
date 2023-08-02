import { Either } from '../src/either';
import {test, expect, describe, beforeEach} from 'vitest';

describe('Either<L, R>', () => {
  let eitherLeft: Either<number, string>;
  let eitherRight: Either<number, string>;

  beforeEach(() => {
    eitherLeft = Either.Left<number, string>(10);
    eitherRight = Either.Right<number, string>("22");
  });

  test('ifLeft should return result of the given function for Left', () => {
    expect(eitherLeft.ifLeft(x => x.toString())).toBe("10");
  });

  test('ifLeft should return right value for Right', () => {
    expect(eitherRight.ifLeft(x => x.toString())).toBe("22");
  });

  test('ifRight should return result of the given function for Right', () => {
    expect(eitherRight.ifRight(s => parseInt(s))).toBe(22);
  });

  test('ifRight should return left value for Left', () => {
    expect(eitherLeft.ifRight(s => parseInt(s))).toBe(10);
  });

  test('isLeft should return true for Left', () => {
    expect(eitherLeft.isLeft()).toBe(true);
  });

  test('isLeft should return false for Right', () => {
    expect(eitherRight.isLeft()).toBe(false);
  });

  test('isRight should return false for Left', () => {
    expect(eitherLeft.isRight()).toBe(false);
  });

  test('isRight should return true for Right', () => {
    expect(eitherRight.isRight()).toBe(true);
  });
});