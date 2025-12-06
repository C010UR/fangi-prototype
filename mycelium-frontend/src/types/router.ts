export interface AuthContext {
  isAuthenticated: boolean;
  isMfaPending: boolean;
}

export interface RouterContext {
  auth: AuthContext;
}
