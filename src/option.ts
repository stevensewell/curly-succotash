/***
 * Discriminated union type. Can be in one of two states:
 * - Some<A>
 * - None
 */
export class Option<A> {
  private readonly value: A | undefined;

  public toArray(): A[] {
    return this.value === undefined ? [] : [this.value];
  }

  /***
   * Checks if the Option is in the Some state.
   * @returns {boolean}
   */
  public isSome(): boolean {
    return this.value !== undefined;
  }

  /***
   * Returns the value if it exists, otherwise returns the result of the given function.
   * @param fn
   */
  public ifNone(fn: () => A): A {
    return this.value === undefined ? fn() : this.value;
  }

  /***
   * Checks if the Option is in the None state.
   * @returns {boolean}
   */
  public isNone(): boolean {
    return this.value === undefined;
  }

  constructor(value?: A | never) {
    this.value = value;
  }

  /***
   * Creates a new Option in the None state.
   * @constructor
   */
  static None = () => new Option<never>();

  /***
   * Creates a new Option in the Some state.
   * @param a
   * @constructor
   */
  static Some = <A>(a: A) => new Option<A>(a);

  /***
   * Projection from one value to another
   */
  public map<B>(fn: (a: A) => B): Option<B> {
    return this.value === undefined ? Option.None() : Option.Some(fn(this.value));
  }

  /***
   * Match the two states of the Option and return a non-null value.
   * @param someFn
   * @param noneFn
   */
  public match<B>(someFn: (a: A) => B, noneFn: () => B): B {
    return this.value === undefined ? noneFn() : someFn(this.value);
  }
}