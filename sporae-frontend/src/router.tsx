import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router';
import NotFoundPage from '@/pages/not-found';
import MainPage from '@/pages/main';
import OAuthCallbackPage from '@/pages/oauth/callback';
import ErrorPage from '@/pages/error';
import LoadingPage from '@/pages/loading';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
  pendingComponent: LoadingPage,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainPage,
});

const oauthCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/oauth/callback',
  component: OAuthCallbackPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  oauthCallbackRoute,
  notFoundRoute,
]);

export const createAppRouter = () =>
  createRouter({
    routeTree,
    defaultPreload: 'intent',
  });

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
