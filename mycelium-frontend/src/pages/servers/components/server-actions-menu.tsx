import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, CheckCircle, Ban, Key } from 'lucide-react';
import type { Server } from '@/types';

interface ServerActionsMenuProps {
  server: Server;
  onEdit: (server: Server) => void;
  onActivate: (server: Server) => void;
  onDeactivate: (server: Server) => void;
  onGenerateSecret: (server: Server) => void;
}

export function ServerActionsMenu({
  server,
  onEdit,
  onActivate,
  onDeactivate,
  onGenerateSecret,
}: ServerActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Server Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(server)}>
          <Pencil className="mr-2 h-4 w-4" />
          Update Server
        </DropdownMenuItem>
        {server.is_active ? (
          <DropdownMenuItem
            onClick={() => onDeactivate(server)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Ban className="mr-2 h-4 w-4" />
            Deactivate Server
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onActivate(server)}
            className="text-green-600 focus:text-green-600 focus:bg-green-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate Server
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onGenerateSecret(server)}>
          <Key className="mr-2 h-4 w-4" />
          Generate Secret
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
