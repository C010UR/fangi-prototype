export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const setMfaPending = (token: string) => {
  localStorage.setItem('mfa_pending', 'true');
  localStorage.setItem('mfa_token', token);
};

export const clearMfaPending = () => {
  localStorage.removeItem('mfa_pending');
  localStorage.removeItem('mfa_token');
};

export const isMfaPending = () => {
  return localStorage.getItem('mfa_pending') === 'true';
};

export const getMfaToken = () => {
  return localStorage.getItem('mfa_token');
};
