import type { ErrorGeneralResponse } from '@/shared/types/response';
import type ApiAuthProvider from './ApiAuthProvider';
import type { ApiAuthType } from './ApiAuthProvider';

type ApiClientConfig = Pick<RequestInit, 'headers'>;

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
  authType?: ApiAuthType;
};

type ApiClientOptions = {
  baseUrl?: string;
  config?: ApiClientConfig;
  authProvider?: ApiAuthProvider;
  defaultAuthType?: ApiAuthType;
};

type MergeHeadersOptions = {
  authType?: ApiAuthType;
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

export default class ApiClient {
  private baseUrl?: string;
  private config: ApiClientConfig;
  private authProvider?: ApiAuthProvider;
  private defaultAuthType: ApiAuthType;

  constructor(options?: ApiClientOptions) {
    this.baseUrl = options?.baseUrl;
    this.authProvider = options?.authProvider;
    this.defaultAuthType = options?.defaultAuthType || 'none';
    this.config = {
      ...options?.config,
      headers: {
        'Content-Type': 'application/json',
        ...options?.config?.headers
      }
    };
  }

  private buildUrl(path: string, baseUrl?: string, params?: RequestOptions['params']) {
    const finalPath = baseUrl ? `${baseUrl}${path}` : path;
    const url = new URL(finalPath);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private async getHeaders(headers?: HeadersInit, options?: MergeHeadersOptions): Promise<HeadersInit> {
    const mergedHeaders = new Headers(this.config.headers);

    const authType = options?.authType ?? this.defaultAuthType;
    const authProvider = await this.authProvider?.getAuthHeader(authType);

    if (authProvider) {
      authProvider.forEach((value, key) => {
        mergedHeaders.set(key, value);
      });
    }

    if (headers) {
      const newHeaders = new Headers(headers);
      newHeaders.forEach((value, key) => {
        mergedHeaders.set(key, value);
      });
    }

    return mergedHeaders;
  }

  async request<SuccessResponse = unknown, ErrorResponse = ErrorGeneralResponse>(
    path: string,
    options?: RequestOptions
  ) {
    const { params, headers, body, ...rest } = options || {};

    const response = await fetch(this.buildUrl(path, this.baseUrl, params), {
      ...rest,
      headers: await this.getHeaders(headers, { authType: options?.authType }),
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
  }

  async get<SuccessResponse = unknown, ErrorResponse = ErrorGeneralResponse>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return this.request<SuccessResponse, ErrorResponse>(path, { ...options, method: 'GET' });
  }

  async post<SuccessResponse = unknown, ErrorResponse = ErrorGeneralResponse>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return this.request<SuccessResponse, ErrorResponse>(path, { ...options, method: 'POST', body: body as BodyInit });
  }

  async put<SuccessResponse = unknown, ErrorResponse = ErrorGeneralResponse>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return this.request<SuccessResponse, ErrorResponse>(path, { ...options, method: 'PUT', body: body as BodyInit });
  }

  async patch<SuccessResponse = unknown, ErrorResponse = ErrorGeneralResponse>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return this.request<SuccessResponse, ErrorResponse>(path, { ...options, method: 'PATCH', body: body as BodyInit });
  }

  async delete<SuccessResponse = unknown, ErrorResponse = ErrorGeneralResponse>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return this.request<SuccessResponse, ErrorResponse>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

export { FetchError };
