import { useEffect } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  TwoPaneCard,
  TwoPaneCardContent,
  TwoPaneCardHeader,
  TwoPaneCardTitle,
  TwoPaneCardDescription,
  TwoPaneCardBody,
  TwoPaneCardFooter,
} from '@/components/pages/two-pane-card';
import { ApiRoutes, fangiFetch, FetchError } from '@/lib/api';

interface RegisterConfirmResponse {
  error: boolean;
  status_code: number;
  message?: string;
  error_description?: string;
}

function AccountRegistrationPage() {
  const { token } = useParams({ from: '/account-registration/$token' });

  const registerConfirmMutation = useMutation({
    mutationFn: () =>
      fangiFetch<RegisterConfirmResponse, never>({
        route: ApiRoutes.REGISTER.CONFIRM(token),
        method: 'POST',
      }),
  });

  useEffect(() => {
    registerConfirmMutation.mutate();
  }, []);

  const errorMessages =
    registerConfirmMutation.error instanceof FetchError
      ? registerConfirmMutation.error.errors
      : [registerConfirmMutation.error?.message ?? 'Failed to register account'];

  if (registerConfirmMutation.isSuccess) {
    const response = registerConfirmMutation.data;
    const isSuccess = !response.error;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Mycelium artwork">
          <TwoPaneCardContent>
            <TwoPaneCardHeader>
              <TwoPaneCardTitle>
                {isSuccess ? 'Account registration successful' : 'Registration failed'}
              </TwoPaneCardTitle>
              <TwoPaneCardDescription>
                {isSuccess
                  ? 'Your account has been registered'
                  : 'There was an issue with your registration'}
              </TwoPaneCardDescription>
            </TwoPaneCardHeader>

            <TwoPaneCardBody>
              <div className="space-y-4">
                <Alert variant={isSuccess ? 'default' : 'destructive'}>
                  {isSuccess ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {isSuccess
                      ? response.message ||
                        'Account registered successfully. Please check your email for the activation link.'
                      : response.error_description ||
                        'Registration request is invalid. Please send a password reset request.'}
                  </AlertDescription>
                </Alert>
              </div>
            </TwoPaneCardBody>

            <TwoPaneCardFooter>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Sign in
              </Link>
            </TwoPaneCardFooter>
          </TwoPaneCardContent>
        </TwoPaneCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Mycelium artwork">
        <TwoPaneCardContent>
          <TwoPaneCardHeader>
            <TwoPaneCardTitle>Confirming your account registration</TwoPaneCardTitle>
            <TwoPaneCardDescription>
              Please wait while we process your registration request
            </TwoPaneCardDescription>
          </TwoPaneCardHeader>

          <TwoPaneCardBody>
            <div className="space-y-4">
              {registerConfirmMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errorMessages.length === 1 ? (
                      errorMessages[0]
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {errorMessages.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {registerConfirmMutation.isPending && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Processing registration...</span>
                </div>
              )}
            </div>
          </TwoPaneCardBody>

          <TwoPaneCardFooter>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </TwoPaneCardFooter>
        </TwoPaneCardContent>
      </TwoPaneCard>
    </div>
  );
}

export default AccountRegistrationPage;
