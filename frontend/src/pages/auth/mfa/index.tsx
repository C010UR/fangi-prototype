import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useAuth } from '@/lib/auth/context';

const MFA_CODE_LENGTH = 6;

const mfaSchema = z.object({
  code: z.string().length(MFA_CODE_LENGTH, `Please enter all ${MFA_CODE_LENGTH} digits`),
});

type MfaFormValues = z.infer<typeof mfaSchema>;

function MfaPage() {
  const navigate = useNavigate();
  const { verifyMfa, sendMfaRequest, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<MfaFormValues>({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      code: '',
    },
  });

  async function onSubmit(values: MfaFormValues) {
    setError(null);
    setIsLoading(true);

    try {
      const response = await verifyMfa({ code: values.code });

      if (!response.mfa_required) {
        navigate({ to: '/' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      form.reset();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setIsResending(true);

    try {
      await sendMfaRequest('email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  }

  async function handleBackToLogin() {
    await logout();
    navigate({ to: '/login' });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Mycelium artwork">
        <TwoPaneCardContent>
          <TwoPaneCardHeader>
            <TwoPaneCardTitle>Check your email</TwoPaneCardTitle>
            <TwoPaneCardDescription>
              We've sent a {MFA_CODE_LENGTH}-digit verification code to your email address. Enter
              the code below to continue.
            </TwoPaneCardDescription>
          </TwoPaneCardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TwoPaneCardBody className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <InputOTP
                          maxLength={MFA_CODE_LENGTH}
                          pattern={REGEXP_ONLY_DIGITS}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        >
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSeparator />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify code'}
                </Button>
              </TwoPaneCardBody>
            </form>
          </Form>

          <TwoPaneCardFooter>
            <p className="text-center text-sm text-muted-foreground">
              Didn't receive a code?{' '}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 font-medium"
                onClick={handleResendCode}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend code'}
              </Button>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              <Button variant="link" className="h-auto p-0 font-medium" onClick={handleBackToLogin}>
                Back to login
              </Button>
            </p>
          </TwoPaneCardFooter>
        </TwoPaneCardContent>
      </TwoPaneCard>
    </div>
  );
}

export default MfaPage;
