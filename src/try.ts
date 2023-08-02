import {Either} from './either';

/***
 * Executes the given function and returns an Either in the Left state if the function succeeds, or an Either in the Right state if the function throws an error.
 * @param fn
 */
export function tryCatch<T>(fn: () => T): Either<Error, T>  {
  try {
    const result = fn();
    return Either.Right<Error, T>(result);
  }
  catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    return Either.Left<Error, T>(error);
  }
}

/***
 * Executes the given async function and returns a Promise of an Either in the Left state if the function succeeds, or an Either in the Right state if the function throws an error.
 * @param fn
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Either<Error, T>>  {
  try {
    const result = await fn();
    return Either.Right<Error, T>(result);
  }
  catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    return Either.Left<Error, T>(error);
  }
}