import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';

import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
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
import { PasswordInput } from '@/components/ui/password-input';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from '@/components/ui/file-upload';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ApiRoutes, fangiFetch, FetchError } from '@/lib/api';
import type { ApiSuccess, ApiError } from '@/types';

const registrationSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .max(180, 'Email must be less than 180 characters'),
  image: z.instanceof(File).optional().nullable(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(255, 'Username must be less than 255 characters'),
  password: z
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
    }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

function RegisterPage() {
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      username: '',
      password: {
        password: '',
        confirmPassword: '',
      },
      image: undefined,
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegistrationFormValues) =>
      fangiFetch<
        ApiSuccess | ApiError,
        {
          email: string;
          username: string;
          password: string;
          image: File | null | undefined;
        }
      >({
        route: ApiRoutes.REGISTER.POST,
        method: 'POST',
        contentType: 'multipart/form-data',
        body: {
          email: data.email,
          username: data.username,
          password: data.password.password,
          image: data.image,
        },
      }),
  });

  function onSubmit(values: RegistrationFormValues) {
    registerMutation.mutate(values);
  }

  const errorMessages =
    registerMutation.error instanceof FetchError
      ? registerMutation.error.errors
      : [registerMutation.error?.message ?? 'Failed to register account'];

  if (registerMutation.isSuccess) {
    const response = registerMutation.data;
    const isSuccess = !response.error;

    return (
      <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Mycelium artwork">
        <TwoPaneCardContent>
          <TwoPaneCardHeader>
            <TwoPaneCardTitle>
              {isSuccess ? 'Registration successful' : 'Registration failed'}
            </TwoPaneCardTitle>
            <TwoPaneCardDescription>
              {isSuccess
                ? 'Your account has been created successfully'
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
                    ? (response as ApiSuccess).message ||
                      'Account registered successfully. Please check your email for the activation link.'
                    : (response as ApiError).error_description ||
                      'Registration request is invalid. Please try again.'}
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
    <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Mycelium artwork" className="h-[800px]">
      <TwoPaneCardContent>
        <TwoPaneCardHeader>
          <TwoPaneCardTitle>Create your account</TwoPaneCardTitle>
          <TwoPaneCardDescription>Join us and start your journey with Fangi</TwoPaneCardDescription>
        </TwoPaneCardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TwoPaneCardBody>
              {registerMutation.isError && (
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
                name="image"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <FileUpload
                        accept="image/*"
                        maxSize={8 * 1024 * 1024} // 5MB
                        maxFiles={1}
                        value={value ? [value] : []}
                        onValueChange={files => onChange(files[0] || undefined)}
                        disabled={registerMutation.isPending}
                        {...field}
                      >
                        <FileUploadDropzone className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                              <p className="text-sm font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, GIF up to 8MB
                              </p>
                            </div>
                          </div>
                        </FileUploadDropzone>
                        <FileUploadList>
                          {value && (
                            <FileUploadItem value={value}>
                              <FileUploadItemPreview />
                              <FileUploadItemMetadata />
                              <FileUploadItemDelete>
                                <X className="h-4 w-4" />
                              </FileUploadItemDelete>
                            </FileUploadItem>
                          )}
                        </FileUploadList>
                      </FileUpload>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Upload a profile image (optional, max 8MB)
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Choose a username (3-255 characters)"
                        autoComplete="username"
                        disabled={registerMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        autoComplete="email"
                        disabled={registerMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password.password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Create a password"
                        autoComplete="new-password"
                        disabled={registerMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password.confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        disabled={registerMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Creating account...' : 'Create account'}
              </Button>
            </TwoPaneCardBody>
          </form>
        </Form>

        <TwoPaneCardFooter>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button asChild variant="link" className="p-0 h-auto font-medium">
              <Link to="/login">Sign in</Link>
            </Button>
          </p>
        </TwoPaneCardFooter>
      </TwoPaneCardContent>
    </TwoPaneCard>
  );
}

export default RegisterPage;
