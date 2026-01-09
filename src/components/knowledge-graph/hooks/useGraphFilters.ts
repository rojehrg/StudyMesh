/**
 * Hook for managing graph filter state
 */

'use client';

import { useState, useMemo } from 'react';
import type { GraphData, GraphNode, GraphEdge } from './useGraphData';

export interface GraphFilters {
  departments: string[];
  expertiseAreas: string[];
}

export interface FilteredGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function useGraphFilters(data: GraphData | undefined) {
  const [filters, setFilters] = useState<GraphFilters>({
    departments: [],
    expertiseAreas: [],
  });

  const filteredData = useMemo<FilteredGraphData>(() => {
    if (!data) {
      return { nodes: [], edges: [] };
    }

    let filteredNodes = data.nodes;

    // Filter by departments
    if (filters.departments.length > 0) {
      filteredNodes = filteredNodes.filter(
        node => node.department && filters.departments.includes(node.department)
      );
    }

    // Filter by expertise areas
    if (filters.expertiseAreas.length > 0) {
      filteredNodes = filteredNodes.filter(
        node => node.knowledgeAreas.some(
          area => filters.expertiseAreas.includes(area)
        )
      );
    }

    // Get IDs of visible nodes
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

    // Filter edges to only include visible nodes
    const filteredEdges = data.edges.filter(
      edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [data, filters]);

  const clearFilters = () => {
    setFilters({
      departments: [],
      expertiseAreas: [],
    });
  };

  const hasActiveFilters = filters.departments.length > 0 || filters.expertiseAreas.length > 0;

  return {
    filters,
    setFilters,
    filteredData,
    clearFilters,
    hasActiveFilters,
  };
}
