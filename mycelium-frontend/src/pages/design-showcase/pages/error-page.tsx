import { ErrorPage } from '@/components/pages/error-page';

export default function ErrorPageDemo() {
  return (
    <div className="h-screen w-full">
      <ErrorPage
        code="500"
        title="Internal Server Error"
        description="Something went wrong on our end."
        variant="destructive"
      ></ErrorPage>
    </div>
  );
}
