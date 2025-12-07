import { useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ChevronLeft, Loader2, UploadCloud, Home, MoveLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TwoPaneCard,
  TwoPaneCardContent,
  TwoPaneCardHeader,
  TwoPaneCardTitle,
  TwoPaneCardDescription,
  TwoPaneCardBody,
  TwoPaneCardFooter,
} from '@/components/pages/two-pane-card';
import { ErrorPage } from '@/components/pages/error-page';
import { BrandLogo } from '@/components/pages/brand-logo';
import { type Server, type ServerFile, type Module } from '@/types';
import { ApiRoutes, fangiFetch } from '@/lib/api';

import { ServerList } from './components/server-list';
import { FileBrowser } from './components/file-browser';
import { SelectedFilesList } from './components/selected-files-list';

export default function AuthorizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const nonce = searchParams.get('nonce');

  const {
    data: moduleData,
    isLoading: isModuleLoading,
    error: moduleError,
  } = useQuery({
    queryKey: ['module', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID is required');
      return fangiFetch<Module>({
        route: ApiRoutes.MODULES.GET(clientId),
        useCredentials: true,
      });
    },
    enabled: !!clientId,
    retry: false,
  });

  const [step, setStep] = useState<'server' | 'file'>('server');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<ServerFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleServerSelect = (server: Server) => {
    setSelectedServer(server);
  };

  const handleFileToggle = useCallback((file: ServerFile) => {
    setSelectedFiles(prev => {
      const exists = prev.some(f => f.path === file.path);
      let newFiles: ServerFile[];

      if (exists) {
        newFiles = prev.filter(f => f.path !== file.path);
      } else {
        newFiles = [
          ...prev.filter(f => !(file.is_directory && f.path.startsWith(file.path + '/'))),
          file,
        ];
      }

      return newFiles.sort((a, b) => a.path.localeCompare(b.path));
    });
  }, []);

  const handleFileRemove = useCallback((file: ServerFile) => {
    setSelectedFiles(prev => prev.filter(f => f.path !== file.path));
  }, []);

  const handleBatchToggle = useCallback((files: ServerFile[], select: boolean) => {
    setSelectedFiles(prev => {
      if (!select) {
        const pathsToRemove = new Set(files.map(f => f.path));
        return prev
          .filter(f => !pathsToRemove.has(f.path))
          .sort((a, b) => a.path.localeCompare(b.path));
      }

      const existingPaths = new Set(prev.map(f => f.path));
      const newDirs = files.filter(f => f.is_directory);

      let nextFiles = [...prev];
      if (newDirs.length > 0) {
        nextFiles = nextFiles.filter(f => !newDirs.some(dir => f.path.startsWith(dir.path + '/')));
      }

      for (const file of files) {
        if (!existingPaths.has(file.path)) {
          nextFiles.push(file);
        }
      }

      return nextFiles.sort((a, b) => a.path.localeCompare(b.path));
    });
  }, []);

  const handleClearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const handleContinue = () => {
    if (step === 'server' && selectedServer) {
      setStep('file');
    } else if (step === 'file' && selectedFiles.length > 0) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 'file') {
      setStep('server');
      setSelectedFiles([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedServer || selectedFiles.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await fangiFetch({
        route: ApiRoutes.OAUTH.AUTHORIZE,
        method: 'POST',
        params: {
          client_id: clientId || undefined,
          redirect_uri: redirectUri || undefined,
          state: state || undefined,
          nonce: nonce || undefined,
        },
        body: {
          server: selectedServer.id,
          files: selectedFiles.map(f => f.path),
        },
        useCredentials: true,
      });

      toast.success('Authorization successful');

      navigate({ to: '/' });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Authorization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Missing Client ID</h2>
              <p className="text-sm text-muted-foreground">
                The authorization request is missing a client identifier.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (moduleError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Invalid Application</h2>
              <p className="text-sm text-muted-foreground">
                The application requesting authorization could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isModuleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitError) {
    return (
      <ErrorPage code="ERROR" title="Authorization Failed" description={submitError}>
        <Button
          size="lg"
          className="rounded-full px-8 h-12 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all"
          onClick={() => setSubmitError(null)}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button
          asChild
          variant="ghost"
          size="lg"
          className="rounded-full px-8 h-12 text-base font-medium hover:bg-muted"
        >
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </ErrorPage>
    );
  }

  if (step === 'server') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Authorization" className="h-[800px]">
          <TwoPaneCardContent>
            <TwoPaneCardHeader>
              <TwoPaneCardTitle>Authorize Access</TwoPaneCardTitle>
              <TwoPaneCardDescription>Select a server to authorize</TwoPaneCardDescription>
              {moduleData && (
                <div className="flex items-center gap-3 mt-4 p-2 pr-4 border rounded-md bg-muted/30 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={moduleData.image_url || undefined} alt={moduleData.name} />
                    <AvatarFallback>{moduleData.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{moduleData.name}</span>
                    <span className="text-xs text-muted-foreground">{moduleData.urls?.[0]}</span>
                  </div>
                </div>
              )}
            </TwoPaneCardHeader>

            <TwoPaneCardBody className="space-y-6">
              <div className="flex items-center gap-2 w-full">
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                <div className="h-1.5 flex-1 rounded-full bg-muted" />
              </div>
              <div className="space-y-4">
                <ServerList selectedId={selectedServer?.id} onSelect={handleServerSelect} />
              </div>
            </TwoPaneCardBody>

            <TwoPaneCardFooter>
              <Button className="w-full" onClick={handleContinue} disabled={!selectedServer}>
                Continue
              </Button>
            </TwoPaneCardFooter>
          </TwoPaneCardContent>
        </TwoPaneCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <BrandLogo />
      <Card className="w-full max-w-6xl h-[800px] flex flex-col z-10">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 -ml-2 cursor-pointer"
              onClick={handleBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <CardTitle className="text-base shrink-0">Select Files</CardTitle>

              {(moduleData || selectedServer) && <div className="h-8 w-px bg-border shrink-0" />}

              <div className="flex items-center gap-3 min-w-0 overflow-hidden text-sm">
                {moduleData && (
                  <div className="flex items-center gap-2 shrink-0 max-w-[240px]">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={moduleData.image_url || undefined} alt={moduleData.name} />
                      <AvatarFallback className="text-xs">
                        {moduleData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium leading-tight">{moduleData.name}</span>
                      <span className="text-xs text-muted-foreground truncate leading-tight">
                        {moduleData.urls?.[0]}
                      </span>
                    </div>
                  </div>
                )}

                {moduleData && selectedServer && (
                  <span className="text-muted-foreground/40 shrink-0 text-lg font-light">/</span>
                )}

                {selectedServer && (
                  <div className="flex items-center gap-2 shrink-0 max-w-[240px]">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={selectedServer.image_url || undefined}
                        alt={selectedServer.name}
                      />
                      <AvatarFallback className="text-xs">
                        {selectedServer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium leading-tight">
                        {selectedServer.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate leading-tight">
                        {selectedServer.urls?.[0] || selectedServer.url}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full divide-y md:divide-y-0 md:divide-x">
            <div className="md:col-span-2 flex flex-col h-full px-4 overflow-hidden min-w-0">
              <div className="flex-1 min-h-0">
                {selectedServer && (
                  <FileBrowser
                    serverId={selectedServer.id}
                    selectedFiles={selectedFiles}
                    onFileToggle={handleFileToggle}
                    onBatchToggle={handleBatchToggle}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col h-full px-4 overflow-hidden min-w-0">
              <div className="flex-1 min-h-0">
                <SelectedFilesList
                  files={selectedFiles}
                  onRemove={handleFileRemove}
                  onClear={handleClearFiles}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  className="w-full cursor-pointer"
                  onClick={handleSubmit}
                  disabled={selectedFiles.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UploadCloud className="h-4 w-4" />
                      Authorize Selected ({selectedFiles.length})
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back to Servers
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
