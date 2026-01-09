/**
 * KnowledgeGraph - Main container component for the interactive knowledge graph
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Users } from 'lucide-react';
import { useGraphData, type GraphNode } from './hooks/useGraphData';
import { useGraphFilters } from './hooks/useGraphFilters';
import { GraphCanvas } from './GraphCanvas';
import { GraphFilters } from './GraphFilters';
import { GraphLegend } from './GraphLegend';
import { NodeDetailModal } from './NodeDetailModal';
import { PageLoader } from '@/components/loading-states';

export function KnowledgeGraph() {
  const { data, isLoading, error } = useGraphData();
  const { filters, setFilters, filteredData, clearFilters, hasActiveFilters } = useGraphFilters(data);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Network className="w-12 h-12 text-coffee-latte mb-4" />
        <h2 className="text-lg font-medium text-coffee-espresso mb-2">
          Could not load knowledge graph
        </h2>
        <p className="text-coffee-cortado">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Users className="w-12 h-12 text-coffee-latte mb-4" />
        <h2 className="text-lg font-medium text-coffee-espresso mb-2">
          No team members yet
        </h2>
        <p className="text-coffee-cortado">
          Invite teammates to see the knowledge graph
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-8rem)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-coffee-espresso flex items-center gap-2">
            <Network className="w-6 h-6" />
            Knowledge Graph
          </h1>
          <p className="text-coffee-cortado mt-1">
            {filteredData.nodes.length} {filteredData.nodes.length === 1 ? 'person' : 'people'}
            {filteredData.edges.length > 0 && (
              <>, {filteredData.edges.length} {filteredData.edges.length === 1 ? 'connection' : 'connections'}</>
            )}
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>

        <GraphFilters
          departments={data.filters.departments}
          expertiseAreas={data.filters.expertiseAreas}
          value={filters}
          onChange={setFilters}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative bg-white rounded-xl border border-coffee-foam overflow-hidden">
        {filteredData.nodes.length > 0 ? (
          <>
            <GraphCanvas
              nodes={filteredData.nodes}
              edges={filteredData.edges}
              onNodeClick={setSelectedNode}
              onNodeHover={setHoveredNode}
            />
            <GraphLegend />

            {/* Hover tooltip */}
            {hoveredNode && !selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg border border-coffee-foam p-3 shadow-lg max-w-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hoveredNode.color }}
                  />
                  <span className="font-medium text-coffee-espresso">
                    {hoveredNode.name}
                  </span>
                  {hoveredNode.currentlyAvailable && (
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
                {hoveredNode.major && (
                  <p className="text-sm text-coffee-cortado mt-1">
                    {hoveredNode.major}
                  </p>
                )}
                {hoveredNode.knowledgeAreas.length > 0 && (
                  <p className="text-xs text-coffee-latte mt-1">
                    {hoveredNode.knowledgeAreas.slice(0, 3).join(', ')}
                    {hoveredNode.knowledgeAreas.length > 3 && '...'}
                  </p>
                )}
                <p className="text-xs text-coffee-latte mt-2">
                  Click to view profile
                </p>
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="w-10 h-10 text-coffee-latte mb-3" />
            <p className="text-coffee-cortado">
              No results match your filters
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-coffee-mocha hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </motion.div>
  );
}
