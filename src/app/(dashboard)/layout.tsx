import { DashboardLayout } from "@/components/dashboard-layout";

// Force dynamic rendering for all dashboard pages (they use Supabase)
export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

