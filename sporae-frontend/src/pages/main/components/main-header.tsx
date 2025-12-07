import { memo } from 'react';

export const MainHeader = memo(function MainHeader() {
  return (
    <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
      <div className="h-10 w-10 bg-card/80 backdrop-blur-md border rounded-xl flex items-center justify-center ">
        <img src="/logo.svg" alt="Fangi logo" className="h-6 w-6" />
      </div>
      <h1 className="text-lg font-medium tracking-tight bg-card/80 backdrop-blur-md px-4 py-2 rounded-xl text-quaternary">
        Fangi Explorer
      </h1>
    </div>
  );
});
