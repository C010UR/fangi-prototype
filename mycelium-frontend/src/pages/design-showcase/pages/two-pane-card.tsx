import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@tanstack/react-router';
import {
  TwoPaneCard,
  TwoPaneCardContent,
  TwoPaneCardHeader,
  TwoPaneCardTitle,
  TwoPaneCardDescription,
  TwoPaneCardBody,
  TwoPaneCardFooter,
} from '@/components/pages/two-pane-card';

export default function TwoPaneCardPage() {
  return (
    <div className="h-screen w-full">
      <TwoPaneCard
        imageSrc="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
        imageAlt="Office workspace"
      >
        <TwoPaneCardContent>
          <TwoPaneCardHeader>
            <TwoPaneCardTitle>Welcome back</TwoPaneCardTitle>
            <TwoPaneCardDescription>
              Sign in to your account to continue your journey
            </TwoPaneCardDescription>
          </TwoPaneCardHeader>
          <TwoPaneCardBody>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
            <Button className="w-full">Sign in</Button>
          </TwoPaneCardBody>
          <TwoPaneCardFooter>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button asChild variant="link" className="p-0 h-auto font-medium">
                <Link to="/register">Create an account</Link>
              </Button>
            </p>
          </TwoPaneCardFooter>
        </TwoPaneCardContent>
      </TwoPaneCard>
    </div>
  );
}
