/**
 * Knowledge Graph API
 *
 * GET - Fetch graph data (nodes and edges) for the organization
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserOrgContext } from '@/lib/rbac';
import {
  computeEdges,
  calculateExpertiseDepth,
  getDepartmentColor,
  getInitials,
  type GraphMember,
} from '@/lib/logic/graph-similarity';

export interface GraphNode {
  id: string;
  name: string;
  initials: string;
  department: string | null;
  major: string | null;
  expertiseText: string | null;
  knowledgeAreas: string[];
  currentlyAvailable: boolean;
  slackConnected: boolean;
  expertiseDepth: number;
  color: string;
}

// GET /api/graph - Fetch graph data
export async function GET() {
  try {
    const context = await getUserOrgContext();
    if (!context) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Fetch all organization members with expertise data
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        user_id,
        profiles (
          user_id,
          first_name,
          last_name,
          department,
          major,
          expertise_text,
          knowledge_areas,
          currently_available,
          slack_connected
        )
      `)
      .eq('organization_id', context.organizationId);

    if (error) throw error;

    // Fetch embeddings separately (not in Drizzle schema)
    const userIds = members?.map(m => m.user_id) || [];
    let embeddingsMap: Record<string, number[]> = {};

    if (userIds.length > 0) {
      const { data: embeddingsData } = await supabase
        .rpc('get_expertise_embeddings', { user_ids: userIds })
        .single();

      // Note: This RPC may not exist yet - embeddings will be fetched differently
      // For now, we'll compute similarity based on knowledge_areas only
    }

    // Transform to nodes
    const nodes: GraphNode[] = [];
    const graphMembers: GraphMember[] = [];

    for (const member of members || []) {
      const profile = member.profiles as any;
      if (!profile) continue;

      const firstName = profile.first_name || '';
      const lastName = profile.last_name || '';
      const knowledgeAreas = profile.knowledge_areas || [];

      nodes.push({
        id: profile.user_id,
        name: `${firstName} ${lastName}`.trim() || 'Unknown',
        initials: getInitials(firstName, lastName),
        department: profile.department,
        major: profile.major,
        expertiseText: profile.expertise_text,
        knowledgeAreas,
        currentlyAvailable: profile.currently_available || false,
        slackConnected: profile.slack_connected || false,
        expertiseDepth: calculateExpertiseDepth({
          expertise_text: profile.expertise_text,
          knowledge_areas: knowledgeAreas,
        }),
        color: getDepartmentColor(profile.department),
      });

      graphMembers.push({
        user_id: profile.user_id,
        expertise_embedding: embeddingsMap[profile.user_id] || null,
        knowledge_areas: knowledgeAreas,
      });
    }

    // Compute edges based on similarity
    const edges = computeEdges(graphMembers);

    // Extract unique filter values
    const departments = [...new Set(
      nodes.map(n => n.department).filter((d): d is string => d !== null)
    )].sort();

    const expertiseAreas = [...new Set(
      nodes.flatMap(n => n.knowledgeAreas)
    )].sort();

    return NextResponse.json({
      success: true,
      nodes,
      edges,
      filters: {
        departments,
        expertiseAreas,
      },
      meta: {
        totalMembers: nodes.length,
        connectedPairs: edges.length,
      },
    });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch graph data' },
      { status: 500 }
    );
  }
}
