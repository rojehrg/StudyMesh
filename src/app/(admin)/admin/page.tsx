"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Building01, UsersGroup, BookOpen, Bell, CreditCard01, TrendingUp } from "react-coolicons";
import { LottieLoader } from "@/components/loading-states";
import Link from "next/link";

interface Stats {
  totalOrganizations: number;
  totalUsers: number;
  totalPods: number;
  totalNudges: number;
  subscriptionBreakdown: {
    free: number;
    starter: number;
    pro: number;
    enterprise: number;
  };
  recentOrganizations: Array<{
    id: string;
    name: string;
    owner_email: string;
    subscription_plan: string;
    member_count: number;
    created_at: string;
  }>;
}

function StatCard({ icon: Icon, label, value, subtext, href }: {
  icon: any;
  label: string;
  value: number | string;
  subtext?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
        </div>
        <div className="p-3 bg-coffee-cream rounded-lg">
          <Icon className="w-6 h-6 text-coffee-cortado" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        { count: orgCount },
        { count: userCount },
        { count: podCount },
        { count: nudgeCount },
        { data: orgs },
      ] = await Promise.all([
        supabase.from("organizations").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("pods").select("*", { count: "exact", head: true }),
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("type", "nudge"),
        supabase
          .from("organizations")
          .select(`
            id,
            name,
            subscription_plan,
            created_at,
            owner_id
          `)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      // Count subscriptions by plan
      const { data: planCounts } = await supabase
        .from("organizations")
        .select("subscription_plan");

      const subscriptionBreakdown = {
        free: 0,
        starter: 0,
        pro: 0,
        enterprise: 0,
      };

      planCounts?.forEach((org) => {
        const plan = org.subscription_plan || "free";
        if (plan in subscriptionBreakdown) {
          subscriptionBreakdown[plan as keyof typeof subscriptionBreakdown]++;
        }
      });

      // Get member counts and owner emails for recent orgs
      const recentOrganizations = await Promise.all(
        (orgs || []).map(async (org) => {
          const [{ count: memberCount }, { data: ownerProfile }] = await Promise.all([
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("organization_id", org.id),
            supabase
              .from("profiles")
              .select("email")
              .eq("user_id", org.owner_id)
              .single(),
          ]);

          return {
            id: org.id,
            name: org.name,
            owner_email: ownerProfile?.email || "Unknown",
            subscription_plan: org.subscription_plan || "free",
            member_count: memberCount || 0,
            created_at: org.created_at,
          };
        })
      );

      setStats({
        totalOrganizations: orgCount || 0,
        totalUsers: userCount || 0,
        totalPods: podCount || 0,
        totalNudges: nudgeCount || 0,
        subscriptionBreakdown,
        recentOrganizations,
      });
    } catch (err: any) {
      console.error("Failed to load stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LottieLoader size="lg" className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-coffee-roast/10 border border-coffee-roast/30 rounded-lg p-4">
        <p className="text-coffee-roast">Failed to load stats: {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    starter: "bg-coffee-mocha/20 text-coffee-mocha",
    pro: "bg-coffee-cream text-coffee-espresso",
    enterprise: "bg-coffee-oat/20 text-coffee-oat",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="mt-1 text-gray-500">Monitor your platform metrics and manage organizations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building01}
          label="Organizations"
          value={stats.totalOrganizations}
          href="/admin/organizations"
        />
        <StatCard
          icon={UsersGroup}
          label="Total Users"
          value={stats.totalUsers}
          href="/admin/users"
        />
        <StatCard
          icon={BookOpen}
          label="Pods"
          value={stats.totalPods}
        />
        <StatCard
          icon={Bell}
          label="Nudges Sent"
          value={stats.totalNudges}
        />
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard01 className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Subscription Breakdown</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.subscriptionBreakdown).map(([plan, count]) => (
            <div key={plan} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className={`mt-1 text-sm font-medium capitalize px-2 py-0.5 rounded-full inline-block ${planColors[plan]}`}>
                {plan}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Organizations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Organizations</h2>
          </div>
          <Link href="/admin/organizations" className="text-sm text-coffee-cortado hover:text-coffee-espresso font-medium">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Organization</th>
                <th className="pb-3 font-medium">Owner</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Members</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrganizations.map((org) => (
                <tr key={org.id} className="text-sm">
                  <td className="py-3">
                    <Link href={`/admin/organizations/${org.id}`} className="font-medium text-gray-900 hover:text-coffee-cortado">
                      {org.name}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-500">{org.owner_email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${planColors[org.subscription_plan]}`}>
                      {org.subscription_plan}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{org.member_count}</td>
                  <td className="py-3 text-gray-500">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
