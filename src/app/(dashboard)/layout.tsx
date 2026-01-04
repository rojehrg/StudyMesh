import { DashboardLayout } from "@/components/dashboard-layout";
import { OrganizationProvider } from "@/contexts/organization-context";
import { ThemeCustomizationProvider } from "@/contexts/theme-customization-context";

// Force dynamic rendering for all dashboard pages (they use Supabase)
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationProvider>
      <ThemeCustomizationProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ThemeCustomizationProvider>
    </OrganizationProvider>
  );
}

