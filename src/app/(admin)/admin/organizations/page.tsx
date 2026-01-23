"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SearchMagnifyingGlass, Building01, CheckBig } from "react-coolicons";
import { LottieLoader } from "@/components/loading-states";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  owner_email: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_seats: number;
  stripe_customer_id: string | null;
  member_count: number;
  pod_count: number;
  created_at: string;
}

const PLANS = ["free", "starter", "pro", "enterprise"];

const planColors: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 border-gray-200",
  starter: "bg-coffee-mocha/20 text-coffee-mocha border-coffee-mocha/30",
  pro: "bg-coffee-cream text-coffee-espresso border-coffee-foam",
  enterprise: "bg-coffee-oat/20 text-coffee-oat border-coffee-oat/30",
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const { data: orgs, error } = await supabase
        .from("organizations")
        .select(`
          id,
          name,
          invite_code,
          owner_id,
          subscription_plan,
          subscription_status,
          subscription_seats,
          stripe_customer_id,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with member counts and owner emails
      const enrichedOrgs = await Promise.all(
        (orgs || []).map(async (org) => {
          const [
            { count: memberCount },
            { count: podCount },
            { data: ownerProfile },
          ] = await Promise.all([
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("organization_id", org.id),
            supabase
              .from("pods")
              .select("*", { count: "exact", head: true })
              .eq("created_by", org.owner_id),
            supabase
              .from("profiles")
              .select("email")
              .eq("user_id", org.owner_id)
              .single(),
          ]);

          return {
            ...org,
            owner_email: ownerProfile?.email || "Unknown",
            member_count: memberCount || 0,
            pod_count: podCount || 0,
          };
        })
      );

      setOrganizations(enrichedOrgs);
    } catch (err: any) {
      console.error("Failed to load organizations:", err);
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (orgId: string, plan: string) => {
    setUpdating(orgId);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          subscription_plan: plan,
          subscription_status: plan === "free" ? "inactive" : "active",
        })
        .eq("id", orgId);

      if (error) throw error;

      // Update local state
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === orgId
            ? { ...org, subscription_plan: plan, subscription_status: plan === "free" ? "inactive" : "active" }
            : org
        )
      );

      toast.success(`Subscription updated to ${plan}`);
    } catch (err: any) {
      console.error("Failed to update subscription:", err);
      toast.error("Failed to update subscription");
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.owner_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.invite_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LottieLoader size="lg" className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-1 text-gray-500">{organizations.length} total organizations</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or invite code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coffee-oat focus:border-transparent"
        />
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Invite Code</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Pods</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="text-sm hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-coffee-cream flex items-center justify-center">
                        <Building01 className="w-4 h-4 text-coffee-cortado" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{org.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(org.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{org.owner_email}</td>
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {org.invite_code}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={org.subscription_plan}
                      onChange={(e) => updateSubscription(org.id, e.target.value)}
                      disabled={updating === org.id}
                      className={`px-2 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                        planColors[org.subscription_plan]
                      } ${updating === org.id ? "opacity-50" : ""}`}
                    >
                      {PLANS.map((plan) => (
                        <option key={plan} value={plan}>
                          {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{org.member_count}</td>
                  <td className="px-4 py-3 text-gray-500">{org.pod_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {org.stripe_customer_id && (
                        <a
                          href={`https://dashboard.stripe.com/customers/${org.stripe_customer_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-coffee-cortado hover:text-coffee-espresso font-medium"
                        >
                          Stripe
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <Building01 className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-gray-500">No organizations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
