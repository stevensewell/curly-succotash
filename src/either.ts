/***
 * Discrimated Union type representing a value that can hold one of two types.
 */
export class Either<L, R> {
  private readonly left: L | undefined;
  private readonly right: R | undefined;

  private constructor([left, right]: [L | undefined, R | undefined]) {
    this.left = left;
    this.right = right;
  }

  /***
   * Creates a new Either in the Left state.
   */
  static Left = <L, R>(l: L) => new Either<L, R>([l, undefined]);

  /***
   * Creates a new Either in the Right state.
   */
  static Right = <L, R>(r: R) => new Either<L, R>([undefined, r]);

  /***
   * Executes the given function if the Either is in the Left state. Returns the right value if the Either is in the Right state.
   * @param fn
   */
  public ifLeft(fn: (t: L) => R): R {
    return this.left === undefined
      ? this.right as R
      : fn(this.left);
  }

  /***
   * Executes the given function if the Either is in the Right state. Returns the left value if the Either is in the Left state.
   */
  public ifRight(fn: (u: R) => L): L {
    return this.right === undefined
      ? this.left as L
      : fn(this.right);
  }

  /***
   * Checks if the Either is in the Left state.
   */
  public isLeft() {
    return this.left !== undefined;
  }

  /***
   * Checks if the Either is in the Right state.
   */
  public isRight() {
    return this.right !== undefined;
  }

  /***
   * Maps the value in the Either if it's in a Right state
   */
  public map<Ret>(fn: (r: R) => Ret): Either<L, Ret> {
    return this.right === undefined
      ? Either.Left(this.left as L)
      : Either.Right(fn(this.right));
  }

  /***
   * Maps the value in the Either if it's in a Left state
   */
  public mapLeft<Ret>(fn: (l: L) => Ret): Either<Ret, R> {
    return this.left === undefined
      ? Either.Right(this.right as R)
      : Either.Left(fn(this.left));
  }
}
