import type { ErrorGeneralResponse } from '@/shared/types/response';

type FetcherOptions = RequestInit & {
  baseUrl?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
};

class FetchError<ErrorResponse = ErrorGeneralResponse> extends Error {
  status: number;
  data: ErrorResponse;

  constructor(message: string, status: number, data: unknown) {
    super(message);

    this.name = 'FetchError';
    this.status = status;
    this.data = data as ErrorResponse;
  }
}

const buildUrl = (path: string, baseUrl?: string, params?: FetcherOptions['params']) => {
  const finalPath = baseUrl + path;
  const url = new URL(finalPath);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
};

export const fetcher = async <SuccessResponse, ErrorResponse = ErrorGeneralResponse>(
  path: string,
  options?: FetcherOptions
) => {
  const { baseUrl = process.env.NEXT_PUBLIC_API_URL, params, headers, body, ...rest } = options || {};

  const response = await fetch(buildUrl(path, baseUrl, params), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body && typeof body !== 'string' ? JSON.stringify(body) : body
  });

  let data: unknown = null;

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new FetchError<ErrorResponse>(response.statusText || 'Request failed', response.status, data);
  }

  return {
    status: response.status,
    data: data as SuccessResponse
  };
};

export { FetchError };
