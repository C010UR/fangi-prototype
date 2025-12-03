import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fangiFetch } from '@/lib/api/fetch';
import { ApiRoutes } from '@/lib/api';

interface UseServerActionsOptions {
  onActivateSuccess?: () => void;
  onDeactivateSuccess?: () => void;
  onGenerateSecretSuccess?: () => void;
}

export function useServerActions(options: UseServerActionsOptions = {}) {
  const queryClient = useQueryClient();

  const activateServer = useMutation({
    mutationFn: (id: string) =>
      fangiFetch({
        route: ApiRoutes.SERVER.ACTIVATE(id),
        method: 'GET',
        useCredentials: true,
      }),
    onSuccess: () => {
      toast.success('Server activated successfully');
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      options.onActivateSuccess?.();
    },
    onError: () => {
      toast.error('Failed to activate server');
    },
  });

  const deactivateServer = useMutation({
    mutationFn: (id: string) =>
      fangiFetch({
        route: ApiRoutes.SERVER.DEACTIVATE(id),
        method: 'GET',
        useCredentials: true,
      }),
    onSuccess: () => {
      toast.success('Server deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      options.onDeactivateSuccess?.();
    },
    onError: () => {
      toast.error('Failed to deactivate server');
    },
  });

  const generateSecret = useMutation({
    mutationFn: (id: string) =>
      fangiFetch({
        route: ApiRoutes.SERVER.GENERATE_SECRET(id),
        method: 'GET',
        useCredentials: true,
      }),
    onSuccess: () => {
      toast.success('Secret was sent to your email inbox');
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      options.onGenerateSecretSuccess?.();
    },
    onError: () => {
      toast.error('Failed to generate secret');
    },
  });

  return {
    activateServer: activateServer.mutate,
    deactivateServer: deactivateServer.mutate,
    generateSecret: generateSecret.mutate,
    isActivating: activateServer.isPending,
    isDeactivating: deactivateServer.isPending,
    isGeneratingSecret: generateSecret.isPending,
  };
}
