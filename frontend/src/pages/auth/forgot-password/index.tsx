import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';

import { AlertCircle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ApiRoutes, fangiFetch, FetchError } from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address').min(1, 'Email is required'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      fangiFetch<ForgotPasswordResponse, ForgotPasswordRequest>({
        route: ApiRoutes.PASSWORD_RESET.REQUEST,
        method: 'POST',
        body: data,
      }),
  });

  function onSubmit(values: ForgotPasswordFormValues) {
    forgotPasswordMutation.mutate({ email: values.email });
  }

  const errorMessages =
    forgotPasswordMutation.error instanceof FetchError
      ? forgotPasswordMutation.error.errors
      : [forgotPasswordMutation.error?.message ?? 'Failed to request password reset'];

  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Mycelium artwork">
          <TwoPaneCardContent>
            <TwoPaneCardHeader>
              <TwoPaneCardTitle>Check your email</TwoPaneCardTitle>
              <TwoPaneCardDescription>
                We've sent you instructions to reset your password
              </TwoPaneCardDescription>
            </TwoPaneCardHeader>

            <TwoPaneCardBody>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If an account exists with the email you provided, you'll receive an email with a
                  link to reset your password.
                </p>
              </div>
            </TwoPaneCardBody>

            <TwoPaneCardFooter>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Back to sign in
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
            <TwoPaneCardTitle>Forgot password?</TwoPaneCardTitle>
            <TwoPaneCardDescription>
              Enter your email address and we'll send you a link to reset your password
            </TwoPaneCardDescription>
          </TwoPaneCardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TwoPaneCardBody>
                {forgotPasswordMutation.isError && (
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          autoComplete="email"
                          disabled={forgotPasswordMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset link'}
                </Button>
              </TwoPaneCardBody>
            </form>
          </Form>

          <TwoPaneCardFooter>
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
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

export default ForgotPasswordPage;
