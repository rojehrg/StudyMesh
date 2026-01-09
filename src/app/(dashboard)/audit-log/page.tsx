"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LottieLoader, PageLoader } from "@/components/loading-states";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/lib/rbac/permissions";
import { AuditAction } from "@/lib/db/schema";
import {
  Users,
  Settings,
  Slack,
  Calendar,
  CreditCard,
  Download,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Shield,
  FileText,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actorName: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  description: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Action categories for filtering
const actionCategories: Record<string, { label: string; actions: string[] }> = {
  all: { label: "All Actions", actions: [] },
  team: {
    label: "Team",
    actions: [
      AuditAction.MEMBER_INVITED,
      AuditAction.MEMBER_JOINED,
      AuditAction.MEMBER_REMOVED,
      AuditAction.MEMBER_ROLE_CHANGED,
    ],
  },
  auth: {
    label: "Authentication",
    actions: [
      AuditAction.USER_LOGIN,
      AuditAction.USER_LOGOUT,
      AuditAction.USER_PASSWORD_CHANGE,
    ],
  },
  integrations: {
    label: "Integrations",
    actions: [
      AuditAction.SLACK_CONNECTED,
      AuditAction.SLACK_DISCONNECTED,
      AuditAction.CALENDAR_CONNECTED,
      AuditAction.CALENDAR_DISCONNECTED,
      AuditAction.ZOOM_CONNECTED,
      AuditAction.ZOOM_DISCONNECTED,
    ],
  },
  billing: {
    label: "Billing",
    actions: [
      AuditAction.SUBSCRIPTION_CREATED,
      AuditAction.SUBSCRIPTION_UPDATED,
      AuditAction.SUBSCRIPTION_CANCELLED,
      AuditAction.TRIAL_STARTED,
    ],
  },
  data: {
    label: "Data & Privacy",
    actions: [
      AuditAction.DATA_EXPORTED,
      AuditAction.ACCOUNT_DELETED,
    ],
  },
};

// Get icon for action
function getActionIcon(action: string) {
  if (action.startsWith('member.')) {
    switch (action) {
      case AuditAction.MEMBER_INVITED:
        return <UserPlus className="w-4 h-4" />;
      case AuditAction.MEMBER_REMOVED:
        return <UserMinus className="w-4 h-4" />;
      case AuditAction.MEMBER_ROLE_CHANGED:
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  }
  if (action.startsWith('user.')) {
    return action === AuditAction.USER_LOGIN
      ? <LogIn className="w-4 h-4" />
      : <LogOut className="w-4 h-4" />;
  }
  if (action.startsWith('integration.')) {
    if (action.includes('slack')) return <Slack className="w-4 h-4" />;
    if (action.includes('calendar')) return <Calendar className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  }
  if (action.startsWith('billing.')) return <CreditCard className="w-4 h-4" />;
  if (action.startsWith('data.')) return <Download className="w-4 h-4" />;
  if (action.startsWith('org.')) return <Settings className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

// Get badge color for action category
function getActionBadgeClass(action: string) {
  if (action.startsWith('member.')) return "bg-blue-100 text-blue-700";
  if (action.startsWith('user.')) return "bg-purple-100 text-purple-700";
  if (action.startsWith('integration.')) return "bg-emerald-100 text-emerald-700";
  if (action.startsWith('billing.')) return "bg-amber-100 text-amber-700";
  if (action.startsWith('data.') || action.startsWith('account.')) return "bg-red-100 text-red-700";
  if (action.startsWith('org.')) return "bg-coffee-cream text-coffee-mocha";
  return "bg-gray-100 text-gray-700";
}

// Format action name for display
function formatActionName(action: string): string {
  return action
    .split('.')
    .pop()!
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function AuditLogPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const { can, loading: permLoading } = usePermissions();

  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      // Note: client-side filtering is applied after fetch

      const response = await fetch(`/api/audit-logs?${params}`);
      const data = await response.json();

      if (data.success) {
        // Client-side filtering by category
        let filteredLogs = data.logs;
        if (categoryFilter !== "all") {
          const category = actionCategories[categoryFilter];
          if (category && category.actions.length > 0) {
            filteredLogs = data.logs.filter((log: AuditLogEntry) =>
              category.actions.includes(log.action)
            );
          }
        }
        setLogs(filteredLogs);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to load audit logs");
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryFilter, pagination.limit]);

  useEffect(() => {
    if (!permLoading && can(Permission.AUDIT_VIEW)) {
      loadLogs();
    } else if (!permLoading) {
      setLoading(false);
    }
  }, [permLoading, loadLogs]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs(pagination.page);
  };

  const handlePageChange = (newPage: number) => {
    loadLogs(newPage);
  };

  if (permLoading || loading) {
    return <PageLoader />;
  }

  // Check if user has permission to view audit logs
  if (!can(Permission.AUDIT_VIEW)) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ShieldAlert className="w-12 h-12 text-coffee-latte mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-coffee-espresso mb-2">
          Access Restricted
        </h1>
        <p className="text-coffee-cortado">
          You don't have permission to view audit logs.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 py-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-espresso flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Audit Log
          </h1>
          <p className="text-coffee-cortado mt-1">
            Track all admin and security-related actions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <LottieLoader size="sm" className="w-4 h-4" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-coffee-cortado">Filter:</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(actionCategories).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-coffee-latte">
          {pagination.total} event{pagination.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl border border-coffee-foam overflow-hidden">
        <AnimatePresence mode="popLayout">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-coffee-cortado">
              <FileText className="w-10 h-10 mx-auto mb-3 text-coffee-latte" />
              <p>No audit logs found</p>
              <p className="text-sm text-coffee-latte mt-1">
                Actions will appear here as they happen
              </p>
            </div>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02 }}
                className={`p-4 flex items-start gap-4 ${
                  index < logs.length - 1 ? "border-b border-coffee-foam/50" : ""
                }`}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-coffee-cream/60 flex items-center justify-center shrink-0 text-coffee-mocha">
                  {getActionIcon(log.action)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${getActionBadgeClass(log.action)}`}>
                      {formatActionName(log.action)}
                    </Badge>
                    <span className="text-sm text-coffee-cortado">
                      by <span className="font-medium text-coffee-espresso">{log.actorName}</span>
                    </span>
                  </div>
                  {log.description && (
                    <p className="text-sm text-coffee-mocha mt-1">
                      {log.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-coffee-latte">
                    <span>{formatRelativeTime(log.created_at)}</span>
                    {log.ip_address && log.ip_address !== "unknown" && (
                      <span>IP: {log.ip_address}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-coffee-cortado">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-coffee-cream/40 rounded-xl border border-coffee-foam/50 p-4">
        <h3 className="text-sm font-medium text-coffee-mocha mb-2">About Audit Logs</h3>
        <ul className="text-sm text-coffee-cortado space-y-1">
          <li>• Logs are retained for 90 days</li>
          <li>• All admin actions are automatically tracked</li>
          <li>• IP addresses are recorded for security</li>
          <li>• Only admins and owners can view audit logs</li>
        </ul>
      </div>
    </motion.div>
  );
}
