import type { MFAType } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';

class ApiRoutes {
  private static readonly BASE = API_BASE_URL;

  static readonly AUTH = {
    LOGIN: `${this.BASE}/api/v1/login`,
    LOGOUT: `${this.BASE}/api/v1/logout`,
    PROFILE: `${this.BASE}/api/v1/profile`,
    UPDATE_PROFILE: `${this.BASE}/api/v1/profile`,
  } as const;

  static readonly MFA = {
    VERIFY: `${this.BASE}/api/v1/mfa/verify`,
    AVAILABLE: `${this.BASE}/api/v1/mfa/available`,
    SEND_REQUEST: (method: MFAType) => `${this.BASE}/api/v1/mfa/send-request/${method}`,
  } as const;

  static readonly PASSWORD_RESET = {
    REQUEST: `${this.BASE}/api/v1/password-reset`,
    RESET: (token: string) => `${this.BASE}/api/v1/password-reset/${token}`,
  } as const;

  static readonly REGISTER = {
    POST: `${this.BASE}/api/v1/register`,
    CONFIRM: (token: string) => `${this.BASE}/api/v1/register/${token}`,
  } as const;

  static readonly SERVER = {
    LIST: `${this.BASE}/api/v1/servers`,
    LIST_ACTIVE: `${this.BASE}/api/v1/servers/active`,
    CREATE: `${this.BASE}/api/v1/servers/create`,
    GET: (id: string) => `${this.BASE}/api/v1/servers/${id}`,
    UPDATE: (id: string) => `${this.BASE}/api/v1/servers/${id}`,
    ACTIVATE: (id: string) => `${this.BASE}/api/v1/servers/${id}/activate`,
    DEACTIVATE: (id: string) => `${this.BASE}/api/v1/servers/${id}/deactivate`,
    GENERATE_SECRET: (id: string) => `${this.BASE}/api/v1/servers/${id}/generate-secret`,
    LS: (id: string | number, path: string) =>
      `${this.BASE}/api/v1/servers/${id}/ls/${path.startsWith('/') ? path.slice(1) : path}`,
  } as const;

  static readonly SERVER_MODULES = {
    LIST: (serverId: string) => `${this.BASE}/api/v1/servers/${serverId}/modules`,
    CAN_ADD_LIST: (serverId: string) => `${this.BASE}/api/v1/servers/${serverId}/modules/can-add`,
    ADD: (serverId: string) => `${this.BASE}/api/v1/servers/${serverId}/modules/add`,
    REMOVE: (serverId: string, moduleId: string) =>
      `${this.BASE}/api/v1/servers/${serverId}/modules/${moduleId}/remove`,
  } as const;

  static readonly USERS = {
    LIST: `${this.BASE}/api/v1/users`,
    CREATE: `${this.BASE}/api/v1/users/create`,
    GET: (id: string) => `${this.BASE}/api/v1/users/${id}`,
    UPDATE: (id: string) => `${this.BASE}/api/v1/users/${id}`,
    ACTIVATE: (id: string) => `${this.BASE}/api/v1/users/${id}/activate`,
    DEACTIVATE: (id: string) => `${this.BASE}/api/v1/users/${id}/deactivate`,
    RESEND_ACTIVATION_EMAIL: (id: string) =>
      `${this.BASE}/api/v1/users/${id}/resend-activation-email`,
  } as const;

  static readonly MODULES = {
    LIST: `${this.BASE}/api/v1/modules`,
    CREATE: `${this.BASE}/api/v1/modules/create`,
    GET: (id: string) => `${this.BASE}/api/v1/modules/${id}`,
    UPDATE: (id: string) => `${this.BASE}/api/v1/modules/${id}`,
    ACTIVATE: (id: string) => `${this.BASE}/api/v1/modules/${id}/activate`,
    DEACTIVATE: (id: string) => `${this.BASE}/api/v1/modules/${id}/deactivate`,
  } as const;

  static readonly OAUTH = {
    AUTHORIZE: `${this.BASE}/oauth/authorize`,
  };
}

export { ApiRoutes };
