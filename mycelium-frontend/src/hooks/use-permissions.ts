import { useAuth } from '@/lib/auth/context';
import type { UserRole } from '@/types';

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user?.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  const hasAllRoles = (roles: UserRole[]): boolean => {
    if (!user?.roles) return false;
    return roles.every(role => user.roles.includes(role));
  };

  const isAdmin = hasRole('ROLE_ADMIN');

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    user,
  };
}
