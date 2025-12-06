import { PageHeader } from '@/components/pages/page-header';
import { SidePanel } from '@/components/pages/side-panel';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

function DashboardPage() {
  return (
    <SidebarProvider>
      <SidePanel />
      <SidebarInset>
        <PageHeader title="Dashboard" />
        <div className="p-6"></div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardPage;
