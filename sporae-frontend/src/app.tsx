import { useMemo } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { createAppRouter } from './router';

export function AppWithRouter() {
  const router = useMemo(() => createAppRouter(), []);

  return <RouterProvider router={router} />;
}
