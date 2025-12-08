export interface ServerFile {
  path: string;
  parent: string | null;
  name: string;
  content_type: string;
  is_directory: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  email: string;
  username: string;
  image_url: string | null;
  is_system: boolean;
  formatted_name: string | null;
}

export interface SporaeStorageKeys {
  authState: string;
  authNonce: string;
  serverToken: string;
  serverUri: string;
}

export interface SporaeConfig {
  clientId: string;
  baseUri: string;
  redirectUri: string;
  authServerUri: string;
  storageKeys?: Partial<SporaeStorageKeys>;
}

class Sporae {
  public clientId: string;
  public baseUri: string;
  public redirectUri: string;
  public serverUri: string | null;
  public authServerUri: string;
  public profile: Profile | null;
  public storageKeys: SporaeStorageKeys;

  constructor(config: SporaeConfig) {
    this.clientId = config.clientId;
    this.baseUri = config.baseUri;
    this.redirectUri = config.redirectUri;
    this.serverUri = null;
    this.authServerUri = config.authServerUri;
    this.profile = null;
    this.storageKeys = {
      authState: config.storageKeys?.authState || 'sporae_auth_state',
      authNonce: config.storageKeys?.authNonce || 'sporae_auth_nonce',
      serverToken: config.storageKeys?.serverToken || 'sporae_server_token',
      serverUri: config.storageKeys?.serverUri || 'sporae_server_uri',
    };
  }

  private generateRandomString(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  private validateInitialized(): boolean {
    return this.serverUri !== null && this.profile !== null;
  }

  public redirectToAuth() {
    const state = this.generateRandomString();
    const nonce = this.generateRandomString();

    localStorage.setItem(this.storageKeys.authState, state);
    localStorage.setItem(this.storageKeys.authNonce, nonce);

    const url = new URL(this.authServerUri);
    url.searchParams.append('client_id', this.clientId);
    url.searchParams.append('redirect_uri', this.redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('nonce', nonce);
    url.searchParams.append('response_type', 'code');
    window.location.href = url.toString();
  }

  public async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const token = localStorage.getItem(this.storageKeys.serverToken);
    const headers = new Headers(init?.headers);

    headers.set('Accept', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await window.fetch(input, {
      ...init,
      headers,
    });

    return response;
  }

  public async initialize() {
    const token = localStorage.getItem(this.storageKeys.serverToken);
    const serverUri = localStorage.getItem(this.storageKeys.serverUri);

    if (!token || !serverUri) {
      return;
    }

    this.serverUri = serverUri;

    try {
      const response = await this.fetch(`${serverUri}/api/v1/profile`);
      if (response.ok) {
        this.profile = await response.json();
      }
    } catch (error) {
      console.error('Failed to initialize Sporae:', error);
    }
  }

  public async authenticate(code: string, serverUri: string) {
    const nonce = localStorage.getItem(this.storageKeys.authNonce);
    const response = await window.fetch(
      `${serverUri}/api/v1/login?code=${code}&nonce=${nonce || ''}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error_description || `Authentication failed with status: ${response.status}`
      );
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('Authentication response missing token');
    }

    localStorage.removeItem(this.storageKeys.authNonce);
    localStorage.removeItem(this.storageKeys.authState);

    localStorage.setItem(this.storageKeys.serverToken, data.token);
    localStorage.setItem(this.storageKeys.serverUri, serverUri);
    this.serverUri = serverUri;

    try {
      const profileResponse = await this.fetch(`${serverUri}/api/v1/profile`);
      if (!profileResponse.ok) {
        const error = await profileResponse.json();
        throw new Error(
          error.error_description || `Profile fetch failed with status: ${profileResponse.status}`
        );
      }
      this.profile = await profileResponse.json();
    } catch (error) {
      localStorage.removeItem(this.storageKeys.serverToken);
      localStorage.removeItem(this.storageKeys.serverUri);
      this.serverUri = null;
      this.profile = null;
      throw error;
    }
  }

  public logout() {
    localStorage.removeItem(this.storageKeys.serverToken);
    localStorage.removeItem(this.storageKeys.serverUri);
    this.serverUri = null;
    this.profile = null;
  }

  public async ls(path: string): Promise<ServerFile[]> {
    this.validateInitialized();
    const response = await this.fetch(`${this.serverUri}/api/v1/ls${path}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || `Failed to list files: ${response.status}`);
    }

    return response.json();
  }

  public async head(path: string): Promise<ServerFile> {
    this.validateInitialized();
    const response = await this.fetch(`${this.serverUri}/api/v1/head${path}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || `Failed to get file info: ${response.status}`);
    }

    return response.json();
  }

  public async read(path: string, inline: boolean = false): Promise<Blob> {
    this.validateInitialized();
    const response = await this.fetch(
      `${this.serverUri}/api/v1/read${path}${inline ? '?inline=true' : ''}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || `Failed to read file: ${response.status}`);
    }

    return response.blob();
  }

  public async mkdir(path: string): Promise<ServerFile> {
    this.validateInitialized();
    const response = await this.fetch(`${this.serverUri}/api/v1/mkdir${path}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || `Failed to create directory: ${response.status}`);
    }

    return response.json();
  }

  public async write(path: string, content: Blob | File): Promise<ServerFile> {
    this.validateInitialized();
    const formData = new FormData();
    formData.append('file', content);

    const response = await this.fetch(`${this.serverUri}/api/v1/write${path}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || `Failed to write file: ${response.status}`);
    }

    return response.json();
  }

  public async rm(path: string): Promise<void> {
    this.validateInitialized();
    const response = await this.fetch(`${this.serverUri}/api/v1/rm${path}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || `Failed to delete file: ${response.status}`);
    }
  }

  public async mv(path: string, newPath: string): Promise<ServerFile> {
    this.validateInitialized();
    const response = await this.fetch(`${this.serverUri}/api/v1/mv${path}:${newPath}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || `Failed to move file: ${response.status}`);
    }

    return response.json();
  }

  public async cp(path: string, newPath: string): Promise<ServerFile> {
    this.validateInitialized();
    const response = await this.fetch(`${this.serverUri}/api/v1/cp${path}:${newPath}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || `Failed to copy file: ${response.status}`);
    }

    return response.json();
  }
}

const sporaeClient = new Sporae({
  // import.meta.env.VITE_SPORAE_CLIENT_ID || '',
  // import.meta.env.VITE_SPORAE_BASE_URI || '',
  // import.meta.env.VITE_SPORAE_REDIRECT_URI || '',
  clientId: '711405d9-c9d2-45c4-bb32-8a6ccf7938c0',
  baseUri: 'http://host.docker.internal:10000',
  redirectUri: 'http://host.docker.internal:10000/oauth/callback',
  authServerUri: 'http://localhost:8001/oauth/authorize',
});

export { Sporae, sporaeClient };
