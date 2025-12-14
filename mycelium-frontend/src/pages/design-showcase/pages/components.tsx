import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Code } from '@/components/ui/code';
import { ContentTypeIcon } from '@/components/ui/content-type-icon';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { FileUpload, FileUploadDropzone, FileUploadList } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { ModuleCard } from '@/components/ui/module-card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ServerCard } from '@/components/ui/server-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Bell,
  CloudUpload,
  Home,
  Loader2,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { toast } from 'sonner';

export default function ComponentsPage() {
  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="columns-1 md:columns-2 gap-6 space-y-6">
        <Card className="break-inside-avoid">
          <CardHeader>
            <CardTitle>Actions & Controls</CardTitle>
            <CardDescription>Interactive buttons and navigation controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button disabled>Disabled</Button>
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </Button>
              </div>
            </div>

            <Separator />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">
                    <Home className="h-4 w-4" />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumbs</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>

        <Card className="break-inside-avoid">
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input controls, form components, and file handling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" placeholder="Email" />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us about yourself" />
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>Theme</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label>One-Time Password</Label>
              <InputOTP maxLength={6}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="with-button">With Button</Label>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input type="email" placeholder="Email" />
                <Button type="submit">Subscribe</Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Checkboxes</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="newsletter" defaultChecked />
                <Label htmlFor="newsletter">Subscribe to newsletter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="disabled" disabled />
                <Label htmlFor="disabled" className="text-muted-foreground">
                  Disabled checkbox
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>File Upload</Label>
              <FileUpload>
                <FileUploadDropzone className="h-24">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <CloudUpload className="h-6 w-6" />
                    <p className="text-xs">Drag & drop files here</p>
                  </div>
                </FileUploadDropzone>
                <FileUploadList />
              </FileUpload>
            </div>
          </CardContent>
        </Card>

        <Card className="break-inside-avoid">
          <CardHeader>
            <CardTitle>Data Display</CardTitle>
            <CardDescription>Tables, cards, avatars, and content visualization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Badge Variants</Label>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Avatar Types</Label>
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="text-sm text-muted-foreground">
                Avatar with image, avatar with fallback initials, avatar with icon fallback.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Code Blocks</Label>
              <div className="flex flex-wrap gap-2">
                <Code>npm install</Code>
                <Code variant="destructive">yarn add</Code>
                <Code copy>const example = "copy me"</Code>
              </div>
              <p className="text-sm text-muted-foreground">
                Click copy-enabled code to copy to clipboard.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Content Type Icons</Label>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="flex flex-col items-center gap-2">
                  <ContentTypeIcon contentType="text/plain" />
                  <span className="text-xs">Text</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ContentTypeIcon contentType="image/jpeg" />
                  <span className="text-xs">Image</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ContentTypeIcon contentType="video/mp4" />
                  <span className="text-xs">Video</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ContentTypeIcon contentType="directory" />
                  <span className="text-xs">Folder</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ContentTypeIcon contentType="application/zip" />
                  <span className="text-xs">Archive</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ContentTypeIcon contentType="text/javascript" />
                  <span className="text-xs">Code</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ContentTypeIcon contentType="application/pdf" />
                  <span className="text-xs">PDF</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ContentTypeIcon />
                  <span className="text-xs">Default</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Loading Skeletons</Label>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Data Cards</Label>
              <div className="flex flex-wrap gap-4">
                <ServerCard
                  server={{
                    id: 1,
                    name: 'Production Server',
                    url: 'https://prod.example.com',
                    urls: ['https://prod.example.com'],
                    image_url: null,
                    client_id: 'client_1',
                    is_active: true,
                    is_banned: false,
                    created_by: 'user_1',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }}
                  variant="outline"
                />
                <ModuleCard
                  module={{
                    id: 1,
                    name: 'Authentication',
                    description: 'Handles user auth',
                    urls: ['/auth'],
                    image_url: null,
                    client_id: 'client_1',
                    is_active: true,
                    is_banned: false,
                    created_by: 'user_1',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }}
                  variant="outline"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Server card and module card components for displaying structured data.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="break-inside-avoid">
          <CardHeader>
            <CardTitle>Tables</CardTitle>
            <CardDescription>Data tables with search and pagination.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <div className="w-72">
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search table..." />
                </InputGroup>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">INV001</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV002</TableCell>
                    <TableCell>Pending</TableCell>
                    <TableCell className="text-right">$150.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>

        <Card className="break-inside-avoid">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <CardDescription>Alerts, notifications, and user feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You can add components to your app using the cli.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Your session has expired. Please sign in again.</AlertDescription>
              </Alert>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Toasts</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  onClick={() => toast.success('Success! Your action was completed.')}
                >
                  Success
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => toast.error('Error! Something went wrong.')}
                >
                  Error
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.info('Info: This is an informational message.')}
                >
                  Info
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toast.warning('Warning: Please check your input.')}
                >
                  Warning
                </Button>
                <Button variant="ghost" onClick={() => toast.loading('Loading... Please wait.')}>
                  Loading
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Click buttons to see toast notifications.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="break-inside-avoid">
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Application branding and identity components.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
              <BrandLogo className="fixed top-6 left-6 z-0 flex items-center gap-2 static" />
            </div>
          </CardContent>
        </Card>

        <Card className="break-inside-avoid">
          <CardHeader>
            <CardTitle>Empty States</CardTitle>
            <CardDescription>Components for empty or no-data scenarios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Empty>
              <EmptyMedia variant="icon">
                <Search className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No results found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your search to find what you're looking for.
              </EmptyDescription>
            </Empty>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
