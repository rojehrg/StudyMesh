"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LottieLoader, PageLoader } from "@/components/loading-states";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Permission,
  getRoleDisplayName,
  getRoleDescription,
} from "@/lib/rbac/permissions";
import { OrganizationRole } from "@/lib/db/schema";
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  Crown,
  User,
  Slack,
  Mail,
} from "lucide-react";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    department: string | null;
    major: string | null;
    slack_connected: boolean;
    slack_handle: string | null;
  } | null;
}

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  const { membership, can, canManage, canAssign, loading: permLoading } = usePermissions();
  const supabase = createClient();

  useEffect(() => {
    if (!permLoading && membership) {
      loadTeam();
    }
  }, [permLoading, membership]);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/team");
      const data = await response.json();

      if (data.success) {
        setMembers(data.members || []);
      }

      // Get invite code
      const { data: org } = await supabase
        .from("organizations")
        .select("invite_code")
        .eq("id", membership?.organizationId)
        .single();

      if (org) {
        setInviteCode(org.invite_code);
      }
    } catch (error) {
      console.error("Error loading team:", error);
      toast.error("Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.invited) {
          toast.success("Share the invite code with this user", {
            description: `Invite code: ${data.inviteCode}`,
          });
        } else {
          toast.success("User added to organization");
          loadTeam();
        }
        setInviteEmail("");
      } else {
        toast.error(data.error || "Failed to invite");
      }
    } catch (error) {
      toast.error("Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRoleId(userId);
    try {
      const response = await fetch(`/api/team/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Role updated to ${getRoleDisplayName(newRole as any)}`);
        loadTeam();
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setChangingRoleId(null);
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from the organization? They will lose access to all team features.`)) {
      return;
    }

    setRemovingId(userId);
    try {
      const response = await fetch(`/api/team/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Member removed");
        loadTeam();
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch (error) {
      toast.error("Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3.5 h-3.5" />;
      case "admin":
        return <ShieldAlert className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "admin":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-coffee-cream text-coffee-mocha border-coffee-foam";
    }
  };

  if (permLoading || loading) {
    return <PageLoader />;
  }

  // Check if user has permission to view team
  if (!can(Permission.TEAM_VIEW)) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ShieldAlert className="w-12 h-12 text-coffee-latte mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-coffee-espresso mb-2">
          Access Restricted
        </h1>
        <p className="text-coffee-cortado">
          You don't have permission to view team management.
        </p>
      </div>
    );
  }

  const canInvite = can(Permission.TEAM_INVITE);
  const canChangeRoles = can(Permission.TEAM_CHANGE_ROLE);
  const canRemove = can(Permission.TEAM_REMOVE);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6 py-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-espresso flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team
          </h1>
          <p className="text-coffee-cortado mt-1">
            Manage your organization members ({members.length} member{members.length !== 1 ? "s" : ""})
          </p>
        </div>
      </div>

      {/* Invite Section */}
      {canInvite && (
        <div className="bg-white rounded-xl border border-coffee-foam p-5 space-y-4">
          <h2 className="font-medium text-coffee-espresso flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Members
          </h2>

          {/* Invite Code */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-sm text-coffee-cortado mb-1.5 block">
                Share invite code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-coffee-cream/50 rounded-lg font-mono text-lg tracking-widest text-center border border-coffee-foam text-coffee-espresso">
                  {inviteCode}
                </div>
                <Button
                  onClick={copyInviteCode}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Email Invite */}
          <div>
            <label className="text-sm text-coffee-cortado mb-1.5 block">
              Or invite by email
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1"
              />
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
                className="bg-coffee-espresso hover:bg-coffee-roast text-coffee-paper"
              >
                {inviting ? (
                  <LottieLoader size="sm" className="w-4 h-4" />
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Invite
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white rounded-xl border border-coffee-foam overflow-hidden">
        <div className="p-4 border-b border-coffee-foam">
          <h2 className="font-medium text-coffee-espresso">Members</h2>
        </div>

        <AnimatePresence>
          {members.map((member, index) => {
            const profile = member.profiles;
            const name = profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.email || "Unknown";
            const initials = profile?.first_name?.[0]?.toUpperCase() || "?";
            const isCurrentUser = member.user_id === membership?.userId;
            const memberRole = member.role as "owner" | "admin" | "member";
            const canManageThis = !isCurrentUser && canManage(memberRole);

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 flex items-center gap-4 ${
                  index < members.length - 1 ? "border-b border-coffee-foam/50" : ""
                }`}
              >
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-coffee-cream text-coffee-mocha">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-coffee-espresso truncate">
                      {name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-coffee-latte">(you)</span>
                    )}
                    <Badge
                      className={`text-xs flex items-center gap-1 ${getRoleBadgeClass(
                        member.role
                      )}`}
                    >
                      {getRoleIcon(member.role)}
                      {getRoleDisplayName(memberRole)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {profile?.major && (
                      <span className="text-sm text-coffee-cortado truncate">
                        {profile.major}
                      </span>
                    )}
                    {profile?.slack_connected && (
                      <span className="flex items-center gap-1 text-xs text-coffee-latte">
                        <Slack className="w-3 h-3" />
                        {profile.slack_handle || "Connected"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Role Selector */}
                  {canChangeRoles && canManageThis && (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(member.user_id, value)
                      }
                      disabled={changingRoleId === member.user_id}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-sm">
                        {changingRoleId === member.user_id ? (
                          <LottieLoader size="sm" className="w-4 h-4" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {canAssign(OrganizationRole.ADMIN) && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {/* Remove Button */}
                  {canRemove && canManageThis && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemove(member.user_id, name)}
                      disabled={removingId === member.user_id}
                    >
                      {removingId === member.user_id ? (
                        <LottieLoader size="sm" className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {members.length === 0 && (
          <div className="p-8 text-center text-coffee-cortado">
            No team members yet. Invite someone to get started!
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="bg-coffee-cream/40 rounded-xl border border-coffee-foam/50 p-4">
        <h3 className="text-sm font-medium text-coffee-mocha mb-3">Role Permissions</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Badge className={`${getRoleBadgeClass("owner")} shrink-0`}>
              {getRoleIcon("owner")} Owner
            </Badge>
            <span className="text-coffee-cortado">
              {getRoleDescription(OrganizationRole.OWNER)}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Badge className={`${getRoleBadgeClass("admin")} shrink-0`}>
              {getRoleIcon("admin")} Admin
            </Badge>
            <span className="text-coffee-cortado">
              {getRoleDescription(OrganizationRole.ADMIN)}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Badge className={`${getRoleBadgeClass("member")} shrink-0`}>
              {getRoleIcon("member")} Member
            </Badge>
            <span className="text-coffee-cortado">
              {getRoleDescription(OrganizationRole.MEMBER)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
