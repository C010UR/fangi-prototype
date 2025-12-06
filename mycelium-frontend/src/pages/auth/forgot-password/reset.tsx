import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useParams } from '@tanstack/react-router';
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
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ApiRoutes, fangiFetch, FetchError } from '@/lib/api';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[0-9]/, 'Password must contain at least one digit')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordRequest {
  password: string;
}

interface ResetPasswordResponse {
  message: string;
}

function ResetPasswordPage() {
  const { token } = useParams({ from: '/password-reset/$token' });

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      fangiFetch<ResetPasswordResponse, ResetPasswordRequest>({
        route: ApiRoutes.PASSWORD_RESET.RESET(token),
        method: 'POST',
        body: data,
      }),
  });

  function onSubmit(values: ResetPasswordFormValues) {
    resetPasswordMutation.mutate({ password: values.password });
  }

  const errorMessages =
    resetPasswordMutation.error instanceof FetchError
      ? resetPasswordMutation.error.errors
      : [resetPasswordMutation.error?.message ?? 'Failed to reset password'];

  if (resetPasswordMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Mycelium artwork">
          <TwoPaneCardContent>
            <TwoPaneCardHeader>
              <TwoPaneCardTitle>Password reset successful</TwoPaneCardTitle>
              <TwoPaneCardDescription>Your password has been updated</TwoPaneCardDescription>
            </TwoPaneCardHeader>

            <TwoPaneCardBody>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully reset. You can now sign in with your new
                  password.
                </p>
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
            <TwoPaneCardTitle>Reset your password</TwoPaneCardTitle>
            <TwoPaneCardDescription>Enter your new password below</TwoPaneCardDescription>
          </TwoPaneCardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TwoPaneCardBody>
                {resetPasswordMutation.isError && (
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Enter your new password"
                          autoComplete="new-password"
                          disabled={resetPasswordMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Confirm your new password"
                          autoComplete="new-password"
                          disabled={resetPasswordMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
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

export default ResetPasswordPage;
