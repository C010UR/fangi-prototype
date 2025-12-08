import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { ErrorPage as ErrorPageView } from '@/components/pages/error-page';
import { sporaeClient } from '@/lib/sporae';

export default function LoginPage() {
  const handleLogin = () => {
    sporaeClient.redirectToAuth();
  };

  return (
    <ErrorPageView
      code="401"
      title="Authentication Required"
      description="Please authenticate with Fangi to access your files."
      variant="default"
    >
      <Button
        onClick={handleLogin}
        size="lg"
        className="rounded-xl px-8 h-12 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Authenticate with Fangi Mycelium
      </Button>
    </ErrorPageView>
  );
}
