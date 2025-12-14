import {
  createRouter,
  createRootRouteWithContext,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import {
  beforeLoadAuthenticated,
  beforeLoadMfa,
  beforeLoadUnauthenticated,
  handleRedirectAfterLogin,
} from '@/lib/router-utils';
import { type RouterContext } from '@/types/router';
import LoginPage from '@/pages/auth/login';
import MfaPage from '@/pages/auth/mfa';
import ForgotPasswordPage from '@/pages/auth/forgot-password';
import ResetPasswordPage from '@/pages/auth/forgot-password/reset';
import RegisterPage from '@/pages/auth/register';
import AccountRegistrationPage from '@/pages/auth/register/reset';
import AccountActivatePage from '@/pages/auth/account-activate';
import ServersPage from '@/pages/servers';
import ServerDetailPage from '@/pages/servers/detail';
import ModulesPage from '@/pages/modules';
import UsersPage from '@/pages/users';
import ProfilePage from '@/pages/profile';
import AuthorizePage from '@/pages/oauth';
import NotFoundPage from '@/pages/not-found';
import LoadingPage from '@/pages/loading';
import ErrorPage from '@/pages/error';
import DesignShowcasePage from '@/pages/design-showcase';

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
  pendingComponent: LoadingPage,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: beforeLoadUnauthenticated,
  component: LoginPage,
});

const mfaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mfa',
  beforeLoad: beforeLoadMfa,
  component: MfaPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  beforeLoad: beforeLoadUnauthenticated,
  component: ForgotPasswordPage,
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/password-reset/$token',
  beforeLoad: beforeLoadUnauthenticated,
  component: ResetPasswordPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: beforeLoadUnauthenticated,
  component: RegisterPage,
});

const accountRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account-registration/$token',
  beforeLoad: beforeLoadUnauthenticated,
  component: AccountRegistrationPage,
});

const accountActivateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account-activation/$token',
  beforeLoad: beforeLoadUnauthenticated,
  component: AccountActivatePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    handleRedirectAfterLogin();
    throw redirect({ to: '/servers' });
  },
});

const serversRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/servers',
  beforeLoad: beforeLoadAuthenticated,
  component: ServersPage,
});

const serverDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/servers/$serverId',
  beforeLoad: beforeLoadAuthenticated,
  component: ServerDetailPage,
});

const modulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/modules',
  beforeLoad: beforeLoadAuthenticated,
  component: ModulesPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  beforeLoad: beforeLoadAuthenticated,
  component: UsersPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: beforeLoadAuthenticated,
  component: ProfilePage,
});

const authorizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/oauth/authorize',
  beforeLoad: beforeLoadAuthenticated,
  component: AuthorizePage,
});

const designShowcaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/design',
  component: DesignShowcasePage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  mfaRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  registerRoute,
  accountRegistrationRoute,
  accountActivateRoute,
  dashboardRoute,
  serversRoute,
  serverDetailRoute,
  modulesRoute,
  usersRoute,
  profileRoute,
  authorizeRoute,
  designShowcaseRoute,
  notFoundRoute,
]);

export const createAppRouter = (context: RouterContext) =>
  createRouter({
    routeTree,
    context,
  });

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
