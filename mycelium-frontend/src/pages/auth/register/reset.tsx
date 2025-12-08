import { Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RegisterConfirmResponse {
  error: boolean;
  status_code: number;
  message?: string;
  error_description?: string;
}

function AccountRegistrationPage() {
  const { token } = useParams({ from: '/account-registration/$token' });

  const registerConfirmQuery = useQuery({
    queryKey: ['register-confirm', token],
    queryFn: () =>
      fangiFetch<RegisterConfirmResponse, never>({
        route: ApiRoutes.REGISTER.CONFIRM(token),
        method: 'POST',
      }),
    retry: false,
  });

  const errorMessages =
    registerConfirmQuery.error instanceof FetchError
      ? registerConfirmQuery.error.errors
      : [registerConfirmQuery.error?.message ?? 'Failed to register account'];

  if (registerConfirmQuery.isSuccess && registerConfirmQuery.data) {
    const response = registerConfirmQuery.data;
    const isSuccess = !response.error;

    return (
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
            <Button asChild className="w-full">
              <Link to="/login">Sign in</Link>
            </Button>
          </TwoPaneCardFooter>
        </TwoPaneCardContent>
      </TwoPaneCard>
    );
  }

  return (
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
            {registerConfirmQuery.isError && (
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

            {registerConfirmQuery.isPending && (
              <div className="flex items-center justify-center space-x-2">
                <Spinner className="text-primary" />
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
  );
}

export default AccountRegistrationPage;
