import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from '@tanstack/react-router';
import { Bell, Settings, Loader2, CloudUpload } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ServerCard } from '@/components/ui/server-card';
import { ModuleCard } from '@/components/ui/module-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileUpload, FileUploadDropzone, FileUploadList } from '@/components/ui/file-upload';
import { ErrorPage } from '@/components/pages/error-page';
import { SidePanel } from '@/components/pages/side-panel';
import {
  TwoPaneCard,
  TwoPaneCardContent,
  TwoPaneCardHeader,
  TwoPaneCardTitle,
  TwoPaneCardDescription,
  TwoPaneCardBody,
  TwoPaneCardFooter,
} from '@/components/pages/two-pane-card';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { PageHeader } from '@/components/pages/page-header';

const COLOR_VALUES: Record<string, string> = {
  background: 'oklch(1 0.01 110)',
  foreground: 'oklch(0.27 0.02 85)',
  card: 'oklch(1 0.005 110)',
  'card-foreground': 'oklch(0.27 0.02 85)',
  popover: 'oklch(1 0.005 110)',
  'popover-foreground': 'oklch(0.27 0.02 85)',
  primary: 'oklch(0.6562 0.047 110)',
  'primary-foreground': 'oklch(1 0.005 110)',
  secondary: 'oklch(0.91 0.04 120)',
  'secondary-foreground': 'oklch(0.27 0.02 85)',
  muted: 'oklch(0.93 0.015 110)',
  'muted-foreground': 'oklch(0.53 0.03 110)',
  accent: 'oklch(0.97 0.01 110)',
  'accent-foreground': 'oklch(0.27 0.02 85)',
  destructive: 'oklch(0.65 0.22 25)',
  'destructive-foreground': 'oklch(1 0.02 25)',
  border: 'oklch(0.91 0.015 110)',
  input: 'oklch(0.99 0.01 110)',
  ring: 'oklch(0.6562 0.047 110)',
  sidebar: 'oklch(0.93 0.015 110)',
  'sidebar-foreground': 'oklch(0.27 0.02 85)',
  'sidebar-primary': 'oklch(0.6562 0.047 110)',
  'sidebar-primary-foreground': 'oklch(1 0.005 110)',
  'sidebar-accent': 'oklch(0.6562 0.047 110)',
  'sidebar-accent-foreground': 'oklch(1 0.005 110)',
  'sidebar-border': 'oklch(0.85 0.02 110)',
  'sidebar-ring': 'oklch(0.6562 0.047 110)',
};

export default function DesignShowcasePage() {
  const [tabsVisible, setTabsVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setTabsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Tabs defaultValue="colors" className="w-full min-h-screen">
      {tabsVisible && (
        <div className="fixed top-4 right-4 z-50">
          <TabsList className="shadow-md bg-background/80 backdrop-blur-sm border">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="page-two-pane-card">Two Pane Card</TabsTrigger>
            <TabsTrigger value="page-error-page">Error Page</TabsTrigger>
            <TabsTrigger value="page-side-panel">Side Panel</TabsTrigger>
          </TabsList>
        </div>
      )}

      <TabsContent value="colors" className="container mx-auto p-8 space-y-6">
        <Card>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-1">Primary Theme Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Background" variable="bg-background" />
                <ColorSwatch name="Foreground" variable="bg-foreground" text="text-background" />
                <ColorSwatch name="Primary" variable="bg-primary" text="text-primary-foreground" />
                <ColorSwatch
                  name="Primary Foreground"
                  variable="bg-primary-foreground"
                  text="text-primary"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-1">Secondary & Accent Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Secondary"
                  variable="bg-secondary"
                  text="text-secondary-foreground"
                />
                <ColorSwatch
                  name="Secondary Foreground"
                  variable="bg-secondary-foreground"
                  text="text-secondary"
                />
                <ColorSwatch name="Accent" variable="bg-accent" text="text-accent-foreground" />
                <ColorSwatch
                  name="Accent Foreground"
                  variable="bg-accent-foreground"
                  text="text-accent"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-1">UI Component Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Card" variable="bg-card" />
                <ColorSwatch
                  name="Card Foreground"
                  variable="bg-card-foreground"
                  text="text-card"
                />
                <ColorSwatch name="Popover" variable="bg-popover" />
                <ColorSwatch
                  name="Popover Foreground"
                  variable="bg-popover-foreground"
                  text="text-popover"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-1">Utility & Form Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Border" variable="bg-border" />
                <ColorSwatch name="Input" variable="bg-input" />
                <ColorSwatch name="Ring" variable="bg-ring" />
                <ColorSwatch name="Muted" variable="bg-muted" text="text-muted-foreground" />
                <ColorSwatch
                  name="Muted Foreground"
                  variable="bg-muted-foreground"
                  text="text-muted"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-1">Status & Feedback Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Destructive"
                  variable="bg-destructive"
                  text="text-destructive-foreground"
                />
                <ColorSwatch
                  name="Destructive Foreground"
                  variable="bg-destructive-foreground"
                  text="text-destructive"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-1">Sidebar & Navigation Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Sidebar Background"
                  variable="bg-sidebar"
                  text="text-sidebar-foreground"
                />
                <ColorSwatch
                  name="Sidebar Foreground"
                  variable="bg-sidebar-foreground"
                  text="text-sidebar"
                />
                <ColorSwatch
                  name="Sidebar Primary"
                  variable="bg-sidebar-primary"
                  text="text-sidebar-primary-foreground"
                />
                <ColorSwatch
                  name="Sidebar Primary FG"
                  variable="bg-sidebar-primary-foreground"
                  text="text-sidebar-primary"
                />
                <ColorSwatch
                  name="Sidebar Accent"
                  variable="bg-sidebar-accent"
                  text="text-sidebar-accent-foreground"
                />
                <ColorSwatch
                  name="Sidebar Accent FG"
                  variable="bg-sidebar-accent-foreground"
                  text="text-sidebar-accent"
                />
                <ColorSwatch name="Sidebar Border" variable="bg-sidebar-border" />
                <ColorSwatch name="Sidebar Ring" variable="bg-sidebar-ring" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="components" className="container mx-auto p-8 space-y-6">
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Button variants and sizes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <Separator />
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
            </CardContent>
          </Card>

          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Status indicators and labels.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>

          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>Form controls and inputs.</CardDescription>
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
            </CardContent>
          </Card>

          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>Drag and drop file uploader.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload>
                <FileUploadDropzone className="h-32">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <CloudUpload className="h-8 w-8" />
                    <p className="text-sm">Drag & drop files here</p>
                  </div>
                </FileUploadDropzone>
                <FileUploadList />
              </FileUpload>
            </CardContent>
          </Card>

          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Data Display</CardTitle>
              <CardDescription>Tables and cards for displaying data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Table className="border">
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

              <div className="space-y-2">
                <Label>Cards</Label>
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
              </div>
            </CardContent>
          </Card>

          <Card className="break-inside-avoid">
            <CardHeader>
              <CardTitle>Feedback & Navigation</CardTitle>
              <CardDescription>Loaders, tooltips, and pagination.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Skeleton</Label>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tooltip</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add to library</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-2">
                <Label>Pagination</Label>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="page-two-pane-card" className="h-screen w-full">
        <TwoPaneCard
          imageSrc="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
          imageAlt="Office workspace"
        >
          <TwoPaneCardContent>
            <TwoPaneCardHeader>
              <TwoPaneCardTitle>Welcome back</TwoPaneCardTitle>
              <TwoPaneCardDescription>
                Sign in to your account to continue your journey
              </TwoPaneCardDescription>
            </TwoPaneCardHeader>
            <TwoPaneCardBody>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" />
              </div>
              <Button className="w-full">Sign in</Button>
            </TwoPaneCardBody>
            <TwoPaneCardFooter>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button asChild variant="link" className="p-0 h-auto font-medium">
                  <Link to="/register">Create an account</Link>
                </Button>
              </p>
            </TwoPaneCardFooter>
          </TwoPaneCardContent>
        </TwoPaneCard>
      </TabsContent>

      <TabsContent value="page-error-page" className="h-screen w-full">
        <ErrorPage
          code="500"
          title="Internal Server Error"
          description="Something went wrong on our end."
          variant="destructive"
        >
          <Button variant="outline">Retry</Button>
        </ErrorPage>
      </TabsContent>

      <TabsContent value="page-side-panel" className="h-screen w-full">
        <SidebarProvider>
          <SidePanel activeItem="servers" />
          <SidebarInset>
            <PageHeader title="Dashboard" />
            <div className="flex-1 p-4 space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="3" rx="2" />
                      <line x1="8" x2="16" y1="21" y2="21" />
                      <line x1="12" x2="12" y1="17" y2="21" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">+12 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">99.9%</div>
                    <p className="text-xs text-muted-foreground">+0.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" x2="12" y1="9" y2="13" />
                      <line x1="12" x2="12.01" y1="17" y2="17" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">-2 from last month</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Activity Table */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest server and module updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Server deployment</TableCell>
                          <TableCell>
                            <Badge variant="default">Success</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            2m ago
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Module update</TableCell>
                          <TableCell>
                            <Badge variant="secondary">In Progress</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            5m ago
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Backup completed</TableCell>
                          <TableCell>
                            <Badge variant="default">Success</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            15m ago
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Security scan</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Failed</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            1h ago
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Database migration</TableCell>
                          <TableCell>
                            <Badge variant="default">Success</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            2h ago
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Button className="justify-start" variant="outline">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                        Deploy New Server
                      </Button>
                      <Button className="justify-start" variant="outline">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Send Notification
                      </Button>
                      <Button className="justify-start" variant="outline">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        Generate Report
                      </Button>
                      <Button className="justify-start" variant="outline">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                        Update Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TabsContent>
    </Tabs>
  );
}

function ColorSwatch({ name, variable, text }: { name: string; variable: string; text?: string }) {
  const colorKey = variable.replace('bg-', '');
  const colorValue = COLOR_VALUES[colorKey];

  return (
    <div
      className={`h-24 w-full rounded-md border shadow-sm p-2 flex flex-col justify-between ${variable} ${text || 'text-foreground'}`}
    >
      <span className="text-sm font-medium leading-none self-start">{name}</span>
      <div className="flex flex-col items-end gap-1 self-end">
        <span className="text-xs font-mono opacity-90">{colorKey}</span>
        {colorValue && <span className="text-[10px] font-mono opacity-75">{colorValue}</span>}
      </div>
    </div>
  );
}
