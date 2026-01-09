/**
 * Audit Logs API
 *
 * GET - Fetch audit logs for the organization (admin/owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, Permission, getUserOrgContext } from '@/lib/rbac';

// GET /api/audit-logs - Fetch audit logs
export async function GET(request: NextRequest) {
  try {
    // Require audit view permission
    const context = await requirePermission(Permission.AUDIT_VIEW);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const action = searchParams.get('action'); // Filter by action type
    const actorId = searchParams.get('actorId'); // Filter by actor
    const resourceType = searchParams.get('resourceType'); // Filter by resource type

    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        actor_id,
        action,
        resource_type,
        resource_id,
        description,
        metadata,
        ip_address,
        user_agent,
        created_at
      `, { count: 'exact' })
      .eq('organization_id', context.organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (action) {
      query = query.eq('action', action);
    }
    if (actorId) {
      query = query.eq('actor_id', actorId);
    }
    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    const { data: logs, count, error } = await query;

    if (error) throw error;

    // Get actor names for display
    const actorIds = [...new Set(logs?.map(l => l.actor_id).filter(Boolean))] as string[];
    let actorMap: Record<string, string> = {};

    if (actorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', actorIds);

      if (profiles) {
        actorMap = profiles.reduce((acc, p) => {
          const name = p.first_name && p.last_name
            ? `${p.first_name} ${p.last_name}`
            : p.email || 'Unknown';
          acc[p.user_id] = name;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // Enrich logs with actor names
    const enrichedLogs = logs?.map(log => ({
      ...log,
      actorName: log.actor_id ? actorMap[log.actor_id] || 'Unknown' : 'System',
    }));

    return NextResponse.json({
      success: true,
      logs: enrichedLogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);

    if (error.message?.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'You do not have permission to view audit logs' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
