"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SearchMagnifyingGlass, Download } from "react-coolicons";
import { LottieLoader } from "@/components/loading-states";

interface BetaRequest {
  id: string;
  email: string;
  company_size: string;
  role: string;
  blocker: string | null;
  created_at: string;
}

export default function BetaRequestsPage() {
  const [requests, setRequests] = useState<BetaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("beta_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      console.error("Failed to load beta requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      (req.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (req.company_size?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (req.role?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Email", "Company Size", "Role", "Blocker", "Date"];
    const rows = requests.map((req) => [
      req.email,
      req.company_size,
      req.role,
      req.blocker || "",
      new Date(req.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beta-requests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Beta Requests</h1>
          <p className="mt-1 text-gray-500">{requests.length} total requests</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by email, company size, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coffee-oat focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Company Size</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Blocker</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="text-sm hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{req.email}</td>
                  <td className="px-4 py-3 text-gray-500">{req.company_size}</td>
                  <td className="px-4 py-3 text-gray-500">{req.role}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={req.blocker || ""}>
                    {req.blocker || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No beta requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
