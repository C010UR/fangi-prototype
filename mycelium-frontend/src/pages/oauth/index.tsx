import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Spinner } from '@/components/ui/spinner';
import { type Server, type ServerFile, type Module } from '@/types';
import { ApiRoutes, fangiFetch } from '@/lib/api';

import {
  MissingClientIdError,
  InvalidApplicationError,
  AuthorizationFailedError,
} from './components/oauth-error-pages';
import { ServerSelectionStep } from './components/server-selection-step';
import { FileSelectionStep } from './components/file-selection-step';

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
          ...prev.filter(
            f => !(file.is_directory && (f.path.startsWith(`${file.path}/`) || file.path === '/'))
          ),
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
          files: selectedFiles.map(f =>
            f.is_directory && !f.path.endsWith('/') ? `${f.path}/` : f.path
          ),
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
    return <MissingClientIdError />;
  }

  if (moduleError) {
    return <InvalidApplicationError />;
  }

  if (isModuleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (submitError) {
    return <AuthorizationFailedError error={submitError} onRetry={() => setSubmitError(null)} />;
  }

  if (step === 'server') {
    return (
      <ServerSelectionStep
        moduleData={moduleData}
        selectedServer={selectedServer}
        onServerSelect={handleServerSelect}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <FileSelectionStep
      moduleData={moduleData}
      selectedServer={selectedServer}
      selectedFiles={selectedFiles}
      isSubmitting={isSubmitting}
      onBack={handleBack}
      onFileToggle={handleFileToggle}
      onBatchToggle={handleBatchToggle}
      onFileRemove={handleFileRemove}
      onClearFiles={handleClearFiles}
      onSubmit={handleSubmit}
    />
  );
}
