/**
 * Hook for fetching knowledge graph data
 */

'use client';

import useSWR from 'swr';

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
  avatarUrl: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  similarity: number;
  sharedAreas: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface GraphData {
  success: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  filters: {
    departments: string[];
    expertiseAreas: string[];
  };
  meta: {
    totalMembers: number;
    connectedPairs: number;
  };
}

export class GraphError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const fetcher = async (url: string): Promise<GraphData> => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) {
      throw new GraphError('Not authenticated or not in an organization', 401);
    }
    throw new GraphError('Failed to fetch graph data', res.status);
  }
  return res.json();
};

export function useGraphData() {
  return useSWR<GraphData>('/api/graph', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // 1 minute
  });
}
