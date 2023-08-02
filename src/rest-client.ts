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
  private baseURL: string;
  private customHeaders: Record<string, string>;
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
    await this.ready;
    const toStringParams = params ? `` : '';
    const response = await fetch(`${this.baseURL}/${route}${toStringParams}`, this.getInitObject(HTTP_METHODS.GET));

    return await this.handleResponse<T>(response);
  }

  public async post<T, R>(route: string, body: T): Promise<Either<ProblemDetails, R>> {
    await this.ready;
    const response = await fetch(`${this.baseURL}/${route}`, this.getInitObject(HTTP_METHODS.POST, body));

    return await this.handleResponse<R>(response);
  }

  public async put<T, R>(route: string, body: T): Promise<Either<ProblemDetails, R>> {
    await this.ready;
    const response = await fetch(`${this.baseURL}/${route}`, this.getInitObject(HTTP_METHODS.PUT, body));

    return await this.handleResponse<R>(response);
  }

  public async delete<R>(route: string): Promise<Either<ProblemDetails, R>>
  public async delete<T, R>(route: string, body?: T): Promise<Either<ProblemDetails, R>> {
    await this.ready;
    const response = await fetch(`${this.baseURL}/${route}`, this.getInitObject(HTTP_METHODS.DELETE, body));

    return await this.handleResponse<R>(response);
  }

  public async patch<T, R>(route: string, body: T): Promise<Either<ProblemDetails, R>> {
    await this.ready;
    const response = await fetch(`${this.baseURL}/${route}`, this.getInitObject(HTTP_METHODS.PATCH, body));

    return await this.handleResponse<R>(response);
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
    if (response.status === 204)
      return Either.Right<ProblemDetails, T>(null as unknown as T);

    const result
      = await tryCatchAsync<T>(async () => response.json()) as Either<Error, ProblemDetails | T>;

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