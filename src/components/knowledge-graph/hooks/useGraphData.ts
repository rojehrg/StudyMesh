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

const fetcher = async (url: string): Promise<GraphData> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch graph data');
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
