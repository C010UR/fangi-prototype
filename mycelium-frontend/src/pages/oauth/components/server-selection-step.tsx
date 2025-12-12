import { Button } from '@/components/ui/button';
import { ModuleCard } from '@/components/ui/module-card';
import {
  TwoPaneCard,
  TwoPaneCardContent,
  TwoPaneCardHeader,
  TwoPaneCardTitle,
  TwoPaneCardDescription,
  TwoPaneCardBody,
  TwoPaneCardFooter,
} from '@/components/pages/two-pane-card';
import { type Server, type Module } from '@/types';
import { ServerList } from './server-list';

interface ServerSelectionStepProps {
  moduleData: Module | undefined;
  selectedServer: Server | null;
  onServerSelect: (server: Server) => void;
  onContinue: () => void;
}

export function ServerSelectionStep({
  moduleData,
  selectedServer,
  onServerSelect,
  onContinue,
}: ServerSelectionStepProps) {
  return (
    <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Authorization" className="h-[800px]">
      <TwoPaneCardContent>
        <TwoPaneCardHeader>
          <TwoPaneCardTitle>Authorize Access</TwoPaneCardTitle>
          <TwoPaneCardDescription>Select a server to authorize</TwoPaneCardDescription>
          {moduleData && (
            <ModuleCard
              module={moduleData}
              className="w-full max-w-none mt-4 p-2 pr-4 border rounded-md bg-muted/30 gap-3 text-sm"
            />
          )}
        </TwoPaneCardHeader>

        <TwoPaneCardBody className="space-y-6">
          <div className="flex items-center gap-2 w-full">
            <div className="h-1.5 flex-1 rounded-full bg-primary" />
            <div className="h-1.5 flex-1 rounded-full bg-muted" />
          </div>
          <div className="space-y-4">
            <ServerList selectedId={selectedServer?.id} onSelect={onServerSelect} />
          </div>
        </TwoPaneCardBody>

        <TwoPaneCardFooter>
          <Button className="w-full" onClick={onContinue} disabled={!selectedServer}>
            Continue
          </Button>
        </TwoPaneCardFooter>
      </TwoPaneCardContent>
    </TwoPaneCard>
  );
}
