export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors: string[]; //extension
}

export class ProblemDetails implements ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors: string[]; //extension

  constructor({type, title, status, detail, instance, errors}: Partial<ProblemDetails> = {}) {
    this.type = type ?? 'Error';
    this.title = title ?? 'An unknown error occurred';
    this.status = status ?? 500;
    this.detail = detail ?? '';
    this.instance = instance ?? '';
    this.errors = errors ?? [];
  }
}

export function isProblemDetails(result: unknown): result is ProblemDetails {
  if(result === null || typeof result !== 'object') return false;

  const keys = ['type', 'title', 'status', 'detail', 'instance'];

  //@ts-ignore
  return keys.every((key) => key in result);
}