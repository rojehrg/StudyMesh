import { DashboardLayout } from "@/components/dashboard-layout";
import { OrganizationProvider } from "@/contexts/organization-context";

// Force dynamic rendering for all dashboard pages (they use Supabase)
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </OrganizationProvider>
  );
}

