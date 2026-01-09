/**
 * GraphCanvas - Force-directed graph visualization using react-force-graph-2d
 */

'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { GraphNode, GraphEdge } from './hooks/useGraphData';

// Dynamic import to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-coffee-cortado">Loading graph...</div>
    </div>
  ),
});

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
}

export function GraphCanvas({ nodes, edges, onNodeClick, onNodeHover }: Props) {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isMobile, setIsMobile] = useState(false);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
      setIsMobile(window.innerWidth < 768);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Format data for force-graph
  const graphData = {
    nodes: nodes.map(n => ({
      ...n,
      val: n.expertiseDepth,
    })),
    links: edges.map(e => ({
      source: e.source,
      target: e.target,
      value: e.similarity,
      strength: e.strength,
    })),
  };

  // Custom node rendering with Canvas API
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = 6 + (node.expertiseDepth || 1) * 1.5; // 7.5-21px range
    const x = node.x || 0;
    const y = node.y || 0;

    // Draw node circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = node.color || '#8B7355';
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw availability indicator (green dot)
    if (node.currentlyAvailable) {
      ctx.beginPath();
      ctx.arc(x + size * 0.7, y - size * 0.7, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw label (only when zoomed in on desktop)
    const showLabel = globalScale > 0.8 && !isMobile;
    if (showLabel && node.name) {
      const fontSize = 10 / globalScale;
      ctx.font = `${fontSize}px "Source Serif 4", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#4a3f38'; // coffee-mocha
      ctx.fillText(node.name, x, y + size + 4);
    }
  }, [isMobile]);

  // Node pointer area (for click detection)
  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const size = 6 + (node.expertiseDepth || 1) * 1.5 + 4; // Slightly larger for easier clicking
    ctx.beginPath();
    ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }, []);

  // Link styling
  const linkColor = useCallback((link: any) => {
    const alpha = link.strength === 'strong' ? 0.5 :
                  link.strength === 'medium' ? 0.3 : 0.15;
    return `rgba(139, 115, 85, ${alpha})`; // coffee-cortado
  }, []);

  const linkWidth = useCallback((link: any) => {
    return link.strength === 'strong' ? 2 :
           link.strength === 'medium' ? 1.5 : 1;
  }, []);

  // Auto-fit on mount and when data changes
  useEffect(() => {
    if (graphRef.current && nodes.length > 0) {
      setTimeout(() => {
        graphRef.current?.zoomToFit(400, 50);
      }, 500);
    }
  }, [nodes.length]);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node as GraphNode);
  }, [onNodeClick]);

  // Handle node hover
  const handleNodeHover = useCallback((node: any) => {
    if (onNodeHover) {
      onNodeHover(node as GraphNode | null);
    }
    // Change cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'grab';
    }
  }, [onNodeHover]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {dimensions.width > 0 && (
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          enableNodeDrag={!isMobile}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={50}
          cooldownTicks={100}
          nodeRelSize={isMobile ? 4 : 6}
          linkDirectionalParticles={0}
          backgroundColor="transparent"
        />
      )}
    </div>
  );
}
