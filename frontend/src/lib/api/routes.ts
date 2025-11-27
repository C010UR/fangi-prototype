import type { MFAType } from '@/lib/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class ApiRoutes {
  private static readonly BASE = API_BASE_URL;

  static readonly AUTH = {
    LOGIN: `${this.BASE}/login`,
    LOGOUT: `${this.BASE}/logout`,
    PROFILE: `${this.BASE}/profile`,
  } as const;

  static readonly MFA = {
    VERIFY: `${this.BASE}/mfa/verify`,
    AVAILABLE: `${this.BASE}/mfa/available`,
    SEND_REQUEST: (method: MFAType) => `${this.BASE}/mfa/send-request/${method}`,
  } as const;

  static readonly PASSWORD_RESET = {
    REQUEST: `${this.BASE}/password-reset`,
    RESET: (token: string) => `${this.BASE}/password-reset/${token}`,
  } as const;

  static readonly REGISTER = {
    POST: `${this.BASE}/register`,
    CONFIRM: (token: string) => `${this.BASE}/register/${token}`,
  } as const;
}

export { ApiRoutes };
