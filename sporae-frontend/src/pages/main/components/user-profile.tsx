import { memo } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfileProps {
  userProfile: {
    username: string;
    email: string;
    image_url?: string | null;
  };
  onLogout: () => void;
}

export const UserProfile = memo(function UserProfile({ userProfile, onLogout }: UserProfileProps) {
  return (
    <div className="fixed top-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full cursor-pointer border bg-card/80 backdrop-blur-md hover:bg-card p-0"
          >
            <Avatar className="h-full w-full">
              <AvatarImage src={userProfile.image_url || undefined} alt={userProfile.username} />
              <AvatarFallback className="bg-primary/5 text-primary font-medium">
                {userProfile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none">{userProfile.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{userProfile.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
