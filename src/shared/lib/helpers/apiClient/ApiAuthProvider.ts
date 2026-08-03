interface AuthStrategy {
  getHeaders(): Promise<Headers>;
}

type ApiAuth = {
  bearer?: AuthStrategy;
  basic?: AuthStrategy;
  apiKey?: AuthStrategy;
};

export type ApiAuthType = keyof ApiAuth | 'none';

export default class ApiAuthProvider {
  constructor(private readonly auth: ApiAuth) {}

  async getAuthHeader(type: ApiAuthType): Promise<Headers> {
    if (type === 'none') {
      return new Headers();
    }

    const headers = await this.auth[type]?.getHeaders();

    if (!headers) {
      throw new Error(`Not implemented auth type: ${type}`);
    }

    return headers;
  }
}

export class BearerAuthStrategy implements AuthStrategy {
  constructor(private readonly getToken: () => Promise<string> | string) {}

  async getHeaders(): Promise<Headers> {
    const token = await this.getToken();

    return new Headers({
      Authorization: `Bearer ${token}`
    });
  }
}

export class BasicAuthStrategy implements AuthStrategy {
  constructor(private readonly getCredential: () => Promise<{ username: string; password: string }>) {}

  async getHeaders(): Promise<Headers> {
    const credentials = await this.getCredential();
    const encoded = btoa(`${credentials.username}:${credentials.password}`);

    return new Headers({
      Authorization: `Basic ${encoded}`
    });
  }
}

export class ApiKeyAuthStrategy implements AuthStrategy {
  constructor(
    private readonly getApiKey: () => Promise<string> | string,
    private readonly headerName = 'X-API-Key'
  ) {}

  async getHeaders(): Promise<Headers> {
    const apiKey = await this.getApiKey();

    return new Headers({
      [this.headerName]: apiKey
    });
  }
}
