import { ChevronLeft, UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModuleCard } from '@/components/ui/module-card';
import { ServerCard } from '@/components/ui/server-card';
import { Spinner } from '@/components/ui/spinner';
import { CardLayout } from '@/components/layout/card-layout';
import { type Server, type ServerFile, type Module } from '@/types';

import { FileBrowser } from './file-browser';
import { SelectedFilesList } from './selected-files-list';

interface FileSelectionStepProps {
  moduleData: Module | undefined;
  selectedServer: Server | null;
  selectedFiles: ServerFile[];
  isSubmitting: boolean;
  onBack: () => void;
  onFileToggle: (file: ServerFile) => void;
  onBatchToggle: (files: ServerFile[], select: boolean) => void;
  onFileRemove: (file: ServerFile) => void;
  onClearFiles: () => void;
  onSubmit: () => void;
}

export function FileSelectionStep({
  moduleData,
  selectedServer,
  selectedFiles,
  isSubmitting,
  onBack,
  onFileToggle,
  onBatchToggle,
  onFileRemove,
  onClearFiles,
  onSubmit,
}: FileSelectionStepProps) {
  return (
    <CardLayout>
      <Card className="w-full max-w-6xl h-[800px] flex flex-col z-10">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 -ml-2 cursor-pointer"
              onClick={onBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <CardTitle className="text-base shrink-0">Select Files</CardTitle>

              {(moduleData || selectedServer) && <div className="h-8 w-px bg-border shrink-0" />}

              <div className="flex items-center gap-3 min-w-0 overflow-hidden text-sm">
                {moduleData && <ModuleCard module={moduleData} />}

                {moduleData && selectedServer && (
                  <span className="text-muted-foreground/40 shrink-0 text-lg font-light">/</span>
                )}

                {selectedServer && <ServerCard server={selectedServer} />}
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
                    onFileToggle={onFileToggle}
                    onBatchToggle={onBatchToggle}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col h-full px-4 overflow-hidden min-w-0">
              <div className="flex-1 min-h-0">
                <SelectedFilesList
                  files={selectedFiles}
                  onRemove={onFileRemove}
                  onClear={onClearFiles}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  className="w-full cursor-pointer"
                  onClick={onSubmit}
                  disabled={selectedFiles.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
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
                  onClick={onBack}
                  disabled={isSubmitting}
                >
                  Back to Servers
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </CardLayout>
  );
}
