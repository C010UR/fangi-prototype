import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/pages/design-showcase/theming/theme-context';
import FileExplorerPage from '@/pages/design-showcase/pages/file-explorer';
import ColorsPage from '@/pages/design-showcase/pages/colors';
import ComponentsPage from '@/pages/design-showcase/pages/components';
import TwoPaneCardPage from '@/pages/design-showcase/pages/two-pane-card';
import ErrorPageDemo from '@/pages/design-showcase/pages/error-page';
import SidePanelPage from '@/pages/design-showcase/pages/side-panel';
import ThemesPage from '@/pages/design-showcase/pages/themes';

function DesignShowcaseContent() {
  const [tabsVisible, setTabsVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setTabsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Tabs defaultValue="colors" className="w-full min-h-screen">
      {tabsVisible && (
        <div className="fixed top-4 right-24 z-50">
          <TabsList className="shadow-md bg-background/80 backdrop-blur-sm border">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="page-two-pane-card">Two Pane Card</TabsTrigger>
            <TabsTrigger value="page-error-page">Error Page</TabsTrigger>
            <TabsTrigger value="page-side-panel">Side Panel</TabsTrigger>
            <TabsTrigger value="page-file-explorer">File Explorer</TabsTrigger>
          </TabsList>
        </div>
      )}

      <TabsContent value="themes">
        <ThemesPage />
      </TabsContent>

      <TabsContent value="colors">
        <ColorsPage />
      </TabsContent>

      <TabsContent value="components">
        <ComponentsPage />
      </TabsContent>

      <TabsContent value="page-two-pane-card">
        <TwoPaneCardPage />
      </TabsContent>

      <TabsContent value="page-error-page">
        <ErrorPageDemo />
      </TabsContent>

      <TabsContent value="page-side-panel">
        <SidePanelPage />
      </TabsContent>

      <TabsContent value="page-file-explorer" className="h-screen w-full">
        <FileExplorerPage />
      </TabsContent>
    </Tabs>
  );
}

export default function DesignShowcasePage() {
  return (
    <ThemeProvider>
      <DesignShowcaseContent />
    </ThemeProvider>
  );
}
