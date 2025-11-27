export type MFAType = 'email';

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface MFAMethod {
  method: MFAType;
  recipient: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  image_url: string | null;
  roles: UserRole[];
  is_active: boolean;
  is_banned: boolean;
  is_activated: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface ApiError {
  error: boolean;
  status_code: number;
  error_description: string;
}

export interface AuthResponse {
  token: string;
  mfa_required: boolean;
  priority_mfa_method: MFAMethod | null;
  available_mfa_methods: MFAMethod[] | null;
}

export interface MfaAvailableResponse {
  priority_mfa_method: MFAMethod;
  available_mfa_methods: MFAMethod[];
}

export interface MfaSendRequestResponse {
  sent_at: string;
  next_request_available_in: number;
}

export interface MfaVerifyRequest {
  code: string;
}

export interface RegistrationForm {
  email: string;
  username: string;
  password: string;
  image: File | null;
}

export interface RegistrationResponse {
  error: boolean;
  status_code: number;
  message?: string;
  error_description?: string;
}
