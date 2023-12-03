import {Either} from './either';
import {isProblemDetails, ProblemDetails} from './problem-details';
import {HTTP_METHODS} from './http-methods';
import {tryCatchAsync} from './try';

interface RestClientOptions {
  authorization?: string | Promise<string>;
  baseURL?: string;
  customHeaders?: Record<string, string>;
}

export class RestClient {
  // @ts-ignore
  private authorization: string;
  private readonly baseURL: string;
  private readonly customHeaders: Record<string, string>;
  // @ts-ignore
  private ready: Promise<void>;

  constructor(options: RestClientOptions) {
    const {authorization, baseURL, customHeaders} = options;

    this.baseURL = baseURL || '';
    this.customHeaders = customHeaders || {};

    if (!(authorization instanceof Promise)) {
      this.authorization = authorization || '';

      this.ready = Promise.resolve();
      return;
    }

    authorization.then((token) => {
      this.authorization = token;
      this.ready = Promise.resolve();
    });
  }

  public async get<T>(route: string, params?: Record<string, string>): Promise<Either<ProblemDetails, T>> {
    const toStringParams = params ? `` : '';
    const fullRoute = `${this.baseURL}/${route}${toStringParams}`;

    await this.ready;
    const result = await tryCatchAsync(async () => fetch(fullRoute, this.getInitObject(HTTP_METHODS.GET))) as Either<Error, Response>;
    const response = result.ifLeft(() => new Response());
    const error = result.ifRight(() => new Error());

    return result.isLeft()
      ? Either.Left<ProblemDetails, T>(this.mapErrorResult(error,fullRoute))
      : await this.handleResponse<T>(response);
  }

  private mapErrorResult(error: Error, fullRoute: string) {
    return new ProblemDetails({
      type: error.name,
      title: error.message,
      status: 500,
      detail: error.stack ?? '',
      instance: fullRoute
    });
  }

  public async post<R>(route: string): Promise<Either<ProblemDetails, R>>;
  public async post<T, R>(route: string, body?: T): Promise<Either<ProblemDetails, R>> {
    const fullRoute = `${this.baseURL}/${route}`;
    await this.ready;

    const result = await tryCatchAsync(async () => fetch(fullRoute, this.getInitObject(HTTP_METHODS.POST, body))) as Either<Error, Response>;
    const response = result.ifLeft(() => new Response());
    const error = result.ifRight(() => new Error());

    return result.isLeft()
      ? Either.Left<ProblemDetails, R>(this.mapErrorResult(error,fullRoute))
      : await this.handleResponse<R>(response);
  }

  public async put<R>(route: string): Promise<Either<ProblemDetails, R>>;
  public async put<T, R>(route: string, body?: T): Promise<Either<ProblemDetails, R>> {
    const fullRoute = `${this.baseURL}/${route}`;
    await this.ready;

    const result = await tryCatchAsync(async () => fetch(fullRoute, this.getInitObject(HTTP_METHODS.PUT, body))) as Either<Error, Response>;
    const response = result.ifLeft(() => new Response());
    const error = result.ifRight(() => new Error());

    return result.isLeft()
      ? Either.Left<ProblemDetails, R>(this.mapErrorResult(error,fullRoute))
      : await this.handleResponse<R>(response);
  }

  public async delete<R>(route: string): Promise<Either<ProblemDetails, R>>
  public async delete<T, R>(route: string, body?: T): Promise<Either<ProblemDetails, R>> {
    const fullRoute = `${this.baseURL}/${route}`;
    await this.ready;

    const result = await tryCatchAsync(async () => fetch(fullRoute, this.getInitObject(HTTP_METHODS.DELETE, body))) as Either<Error, Response>;
    const response = result.ifLeft(() => new Response());
    const error = result.ifRight(() => new Error());

    return result.isLeft()
      ? Either.Left<ProblemDetails, R>(this.mapErrorResult(error,fullRoute))
      : await this.handleResponse<R>(response);
  }

  public async patch<R>(route: string): Promise<Either<ProblemDetails, R>>;
  public async patch<T, R>(route: string, body?: T): Promise<Either<ProblemDetails, R>> {
    const fullRoute = `${this.baseURL}/${route}`;
    await this.ready;

    const result = await tryCatchAsync(async () => fetch(fullRoute, this.getInitObject(HTTP_METHODS.PATCH, body))) as Either<Error, Response>;
    const response = result.ifLeft(() => new Response());
    const error = result.ifRight(() => new Error());

    return result.isLeft()
      ? Either.Left<ProblemDetails, R>(this.mapErrorResult(error,fullRoute))
      : await this.handleResponse<R>(response);
  }

  private getInitObject(method: HTTP_METHODS, body?: unknown) {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authorization,
        ...(this.customHeaders ?? {}),
      } as HeadersInit,
      body: JSON.stringify(body),
    };
  }

  private async handleResponse<T>(response: Response): Promise<Either<ProblemDetails, T>> {
    const isJson = response.headers.get('content-type')?.includes('json');

    const result
      = await tryCatchAsync<T>(async () => isJson ? response.json() : response.text()) as Either<Error, ProblemDetails | T>;

    function mapErrorToProblemDetails(r: Error) {
      return new ProblemDetails({
        detail: r.message,
        status: response.status,
        title: response.statusText
      });
    }

    const mappedSuccessResult =
      result.mapLeft<ProblemDetails>(mapErrorToProblemDetails);

    const mappedFailureResult = result.ifLeft(mapErrorToProblemDetails);

    return response.ok
      ? mappedSuccessResult as Either<ProblemDetails, T>
      : isProblemDetails(mappedFailureResult)
        ? Either.Left<ProblemDetails, T>(mappedFailureResult)
        : Either.Left<ProblemDetails, T>(new ProblemDetails()); // todo: unknown error type?
  }
}