import { redirect, type ParsedLocation } from '@tanstack/react-router';
import { type RouterContext } from '@/types/router';

export interface ParsedUrl {
  to: string;
  search: Record<string, unknown>;
  hash?: string;
}

export function parseRedirectUrl(url: string): ParsedUrl {
  try {
    const validUrl = url.startsWith('http')
      ? url
      : `http://example.com${url.startsWith('/') ? '' : '/'}${url}`;
    const parsed = new URL(validUrl);

    const search: Record<string, unknown> = {};
    parsed.searchParams.forEach((value, key) => {
      search[key] = value;
    });

    return {
      to: parsed.pathname,
      search,
      hash: parsed.hash ? parsed.hash.substring(1) : undefined,
    };
  } catch (e) {
    console.warn('Failed to parse redirect URL:', url, e);
    return {
      to: url,
      search: {},
    };
  }
}

export const getStoredRedirect = (): ParsedUrl | null => {
  const redirectUrl = sessionStorage.getItem('redirect_after_login');
  if (redirectUrl) {
    sessionStorage.removeItem('redirect_after_login');
    return parseRedirectUrl(redirectUrl);
  }
  return null;
};

export const handleRedirectAfterLogin = () => {
  const parsed = getStoredRedirect();
  if (parsed) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw redirect({ ...parsed } as any);
  }
};

export const handleAuthenticatedRedirect = () => {
  handleRedirectAfterLogin();
  throw redirect({ to: '/' });
};

export const beforeLoadAuthenticated = ({
  context,
  location,
}: {
  context: RouterContext;
  location: ParsedLocation;
}) => {
  if (context.auth.isMfaPending) {
    throw redirect({ to: '/mfa' });
  }
  if (!context.auth.isAuthenticated) {
    sessionStorage.setItem('redirect_after_login', location.href);
    throw redirect({ to: '/login' });
  }
};

export const beforeLoadUnauthenticated = ({ context }: { context: RouterContext }) => {
  if (context.auth.isMfaPending) {
    throw redirect({ to: '/mfa' });
  }
  if (context.auth.isAuthenticated) {
    handleAuthenticatedRedirect();
  }
};

export const beforeLoadMfa = ({ context }: { context: RouterContext }) => {
  if (!context.auth.isMfaPending) {
    if (context.auth.isAuthenticated) {
      handleAuthenticatedRedirect();
    }
    throw redirect({ to: '/login' });
  }
};
