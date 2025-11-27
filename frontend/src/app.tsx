import { useMemo } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { useAuth } from './lib/auth/context';
import { createAppRouter } from './router';
import { Spinner } from './components/ui/spinner';

export function AppWithRouter() {
  const auth = useAuth();

  const router = useMemo(
    () =>
      createAppRouter({
        auth: {
          isAuthenticated: auth.isAuthenticated,
          isMfaPending: auth.isMfaPending,
        },
      }),
    [auth.isAuthenticated, auth.isMfaPending]
  );

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
