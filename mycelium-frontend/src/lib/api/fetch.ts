import { getAuthToken } from './auth-token';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type ContentType =
  | 'application/json'
  | 'multipart/form-data'
  | 'application/x-www-form-urlencoded'
  | 'text/plain'
  | 'application/xml'
  | 'text/xml'
  | 'application/octet-stream';

type AcceptType =
  | 'application/json'
  | 'text/plain'
  | 'application/xml'
  | 'text/xml'
  | 'application/octet-stream'
  | '*/*';

type TBody = Record<string, unknown>;

export type ParamsType =
  | Record<string, string | number | boolean | (string | number | boolean)[] | undefined>
  | URLSearchParams;

interface FetchOptions<TBody = unknown> {
  route: string;
  method?: HttpMethod;
  params?: ParamsType;
  contentType?: ContentType;
  accept?: AcceptType;
  body?: TBody;
  headers?: Record<string, string>;
  useCredentials?: boolean;
}

interface ApiError {
  error?: string | string[] | boolean;
  error_description?: string | string[];
  message?: string | string[];
}

class FetchError extends Error {
  status: number;
  data: ApiError | unknown;
  errors: string[];

  constructor(message: string, status: number, data: ApiError | unknown, errors: string[]) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.data = data;
    this.errors = errors;
  }
}

function buildUrlWithParams(route: string, params?: ParamsType): string {
  if (!params) return route;

  let queryString = '';

  if (params instanceof URLSearchParams) {
    queryString = params.toString();
  } else {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    });
    queryString = searchParams.toString();
  }

  if (!queryString) return route;

  return `${route}${route.includes('?') ? '&' : '?'}${queryString}`;
}

async function fangiFetch<TResponse, TBody = unknown>(
  options: FetchOptions<TBody>
): Promise<TResponse> {
  const {
    route,
    method = 'GET',
    params,
    contentType = 'application/json',
    accept = 'application/json',
    body,
    headers: additionalHeaders = {},
    useCredentials = false,
  } = options;

  const url = buildUrlWithParams(route, params);

  const headers: HeadersInit = {
    Accept: accept,
    ...additionalHeaders,
  };

  const config: RequestInit = {
    method,
    headers,
    redirect: 'follow',
  };

  if (body) {
    if (contentType === 'multipart/form-data') {
      config.body = processFormDataBody(body);
    } else {
      headers['Content-Type'] = contentType;
      config.body = processBody(body, contentType);
    }
  }

  if (useCredentials) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, config);

  if (response.redirected) {
    window.location.href = response.url;
    return new Promise(() => {}) as Promise<TResponse>;
  }

  let data: unknown;
  const responseContentType = response.headers.get('content-type');
  if (responseContentType && responseContentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
    if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
      try {
        data = JSON.parse(data);
      } catch {
        // ignore
      }
    }
  }

  if (!response.ok) {
    if (data && typeof data === 'object') {
      const errors = extractErrors(data as ApiError);
      throw new FetchError(errors[0], response.status, data as ApiError, errors);
    }
    throw new FetchError(response.statusText, response.status, {}, [response.statusText]);
  }

  return data as TResponse;
}

function parseErrorMessages(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter(v => typeof v === 'string')
      .flatMap(v => v.split('||').map(s => s.trim()))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split('||')
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

function extractErrors(data: ApiError): string[] {
  const errorDescription = parseErrorMessages(data.error_description);
  if (errorDescription.length > 0) return errorDescription;

  const error = parseErrorMessages(data.error);
  if (error.length > 0) return error;

  const message = parseErrorMessages(data.message);
  if (message.length > 0) return message;

  return ['Request failed'];
}

function processFormDataBody(
  body: TBody,
  formData: FormData = new FormData(),
  parentKey: string = ''
): FormData {
  Object.keys(body).forEach(key => {
    const value = body[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value === null || value === undefined) {
      return;
    }

    if (value instanceof File) {
      formData.append(formKey, value, value.name);
    } else if (value instanceof Date) {
      formData.append(formKey, value.toISOString());
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${formKey}[${index}]`;

        if (item === null || item === undefined) {
          return;
        }

        if (item instanceof File) {
          formData.append(arrayKey, item);
        } else if (typeof item === 'object' && !(item instanceof Date)) {
          processFormDataBody({ [index]: item }, formData, formKey);
        } else {
          formData.append(arrayKey, String(item));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      processFormDataBody(value as TBody, formData, formKey);
    } else {
      formData.append(formKey, String(value));
    }
  });

  return formData;
}

function processBody<TBody>(body: TBody, contentType: ContentType): BodyInit {
  if (contentType === 'application/json') {
    return JSON.stringify(body);
  }
  return body as unknown as BodyInit;
}

export { fangiFetch, FetchError };
export type { FetchOptions, HttpMethod, ApiError, ContentType, AcceptType };
