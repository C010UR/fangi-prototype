import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sporaeClient } from '@/lib/sporae';

export const SPORAE_KEYS = {
  all: ['sporae'] as const,
  profile: () => [...SPORAE_KEYS.all, 'profile'] as const,
  files: (path: string) => [...SPORAE_KEYS.all, 'files', path] as const,
};

export function useSporaeProfile() {
  return useQuery({
    queryKey: SPORAE_KEYS.profile(),
    queryFn: async () => {
      // If profile is already in memory, return it? 
      // Or always ensure initialization.
      if (!sporaeClient.profile) {
        await sporaeClient.initialize();
      }
      return sporaeClient.profile;
    },
    // Don't retry indefinitely if auth fails
    retry: 1,
  });
}

export function useSporaeFiles(path: string, enabled: boolean = true) {
  const { data: profile } = useSporaeProfile();
  
  return useQuery({
    queryKey: SPORAE_KEYS.files(path),
    queryFn: async () => {
      return sporaeClient.ls(path);
    },
    enabled: enabled && !!profile && !!sporaeClient.serverUri,
  });
}

export function useSporaeAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, serverUri }: { code: string; serverUri: string }) => {
      await sporaeClient.authenticate(code, serverUri);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPORAE_KEYS.all });
    },
  });
}

export function useSporaeLogout() {
  const queryClient = useQueryClient();

  return () => {
    sporaeClient.logout();
    queryClient.removeQueries({ queryKey: SPORAE_KEYS.all });
    window.location.reload();
  };
}

