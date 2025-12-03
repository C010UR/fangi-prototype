import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FormDialog } from '@/components/ui/form-dialog';
import { ServerForm } from '@/components/servers/server-form';
import { AlertCircleIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import type { Server } from '@/types';

interface ServerActionDialogsProps {
  editingServer: Server | null;
  activateDialog: { open: boolean; server: Server | null };
  deactivateDialog: { open: boolean; server: Server | null };
  generateSecretDialog: { open: boolean; server: Server | null };
  onEditClose: () => void;
  onActivateClose: () => void;
  onDeactivateClose: () => void;
  onGenerateSecretClose: () => void;
  onActivateConfirm: (serverId: string) => void;
  onDeactivateConfirm: (serverId: string) => void;
  onGenerateSecretConfirm: (serverId: string) => void;
  onEditSuccess: () => void;
}

export function ServerActionDialogs({
  editingServer,
  activateDialog,
  deactivateDialog,
  generateSecretDialog,
  onEditClose,
  onActivateClose,
  onDeactivateClose,
  onGenerateSecretClose,
  onActivateConfirm,
  onDeactivateConfirm,
  onGenerateSecretConfirm,
  onEditSuccess,
}: ServerActionDialogsProps) {
  return (
    <>
      <FormDialog
        open={!!editingServer}
        onOpenChange={open => !open && onEditClose()}
        title="Update Server"
        description="Update server details."
      >
        {({ close }) =>
          editingServer && (
            <ServerForm
              initialData={editingServer}
              onSuccess={() => {
                close();
                onEditSuccess();
              }}
            />
          )
        }
      </FormDialog>

      <AlertDialog open={activateDialog.open} onOpenChange={open => !open && onActivateClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate <strong>{activateDialog.server?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>Server will be activated</AlertTitle>
            <AlertDescription>
              This server will be able to authenticate and access your application.
            </AlertDescription>
          </Alert>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (activateDialog.server) {
                  onActivateConfirm(String(activateDialog.server.id));
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deactivateDialog.open} onOpenChange={open => !open && onDeactivateClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Server</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{deactivateDialog.server?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Alert variant="destructive">
            <XCircleIcon />
            <AlertTitle>Server access will be revoked</AlertTitle>
            <AlertDescription>Users will no longer be able to access the server.</AlertDescription>
          </Alert>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deactivateDialog.server) {
                  onDeactivateConfirm(String(deactivateDialog.server.id));
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={generateSecretDialog.open}
        onOpenChange={open => !open && onGenerateSecretClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate New Secret</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to generate a new secret for{' '}
              <strong>{generateSecretDialog.server?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>This action will invalidate the current secret</AlertTitle>
            <AlertDescription>
              <p>The current server configuration will no longer work with the old secret.</p>
              <ul className="mt-2 list-inside list-disc text-sm">
                <li>Your server will lose access immediately</li>
                <li>A new secret will be sent to your email</li>
                <li>You must update your server configuration with the new secret</li>
              </ul>
            </AlertDescription>
          </Alert>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (generateSecretDialog.server) {
                  onGenerateSecretConfirm(String(generateSecretDialog.server.id));
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Generate Secret
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
