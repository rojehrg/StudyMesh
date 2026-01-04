"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loading, SearchMagnifyingGlass, UsersGroup, CheckBig } from "react-coolicons";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  organization_id: string | null;
  organization_name: string | null;
  timezone: string | null;
  slack_connected: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          email,
          first_name,
          last_name,
          organization_id,
          timezone,
          slack_connected,
          onboarding_completed,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get organization names
      const orgIds = [...new Set((profiles || []).map((p) => p.organization_id).filter(Boolean))];

      let orgMap: Record<string, string> = {};
      if (orgIds.length > 0) {
        const { data: orgs } = await supabase
          .from("organizations")
          .select("id, name")
          .in("id", orgIds);

        orgMap = (orgs || []).reduce((acc, org) => {
          acc[org.id] = org.name;
          return acc;
        }, {} as Record<string, string>);
      }

      const enrichedUsers = (profiles || []).map((profile) => ({
        ...profile,
        organization_name: profile.organization_id ? orgMap[profile.organization_id] || null : null,
      }));

      setUsers(enrichedUsers);
    } catch (err: any) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.first_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.last_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.organization_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-gray-500">{users.length} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or organization..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Timezone</th>
                <th className="px-4 py-3 font-medium">Slack</th>
                <th className="px-4 py-3 font-medium">Onboarded</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-sm hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="text-violet-600 font-medium text-sm">
                          {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.first_name || "No name"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email || "—"}</td>
                  <td className="px-4 py-3">
                    {user.organization_name ? (
                      <span className="text-gray-900">{user.organization_name}</span>
                    ) : (
                      <span className="text-gray-400">No org</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {user.timezone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {user.slack_connected ? (
                      <CheckBig className="w-4 h-4 text-green-600" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.onboarding_completed ? (
                      <CheckBig className="w-4 h-4 text-green-600" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersGroup className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
