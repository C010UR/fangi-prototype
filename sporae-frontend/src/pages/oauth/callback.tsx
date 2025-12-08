import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSporaeAuth } from '@/lib/hooks/use-sporae';
import ErrorPage from '@/pages/error';
import LoadingPage from '@/pages/loading';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { mutate: authenticate, error } = useSporaeAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const serverUri = searchParams.get('server_uri');

      if (!code) {
        setAuthError('No authorization code provided.');
        return;
      }

      if (!serverUri) {
        setAuthError('No server URI provided.');
        return;
      }

      authenticate(
        { code, serverUri },
        {
          onSuccess: () => {
            navigate({ to: '/' });
          },
          onError: err => {
            console.error('Authentication error:', err);
            setAuthError(err instanceof Error ? err.message : 'Authentication failed');
          },
        }
      );
    };

    handleAuth();
  }, [authenticate, navigate]);

  if (authError || error) {
    const displayError = authError || (error instanceof Error ? error.message : 'Unknown error');
    return (
      <ErrorPage
        title="Authentication Failed"
        message={displayError}
        code={401}
        reset={() => (window.location.href = '/')}
      />
    );
  }

  return <LoadingPage message="Authenticating..." />;
}
