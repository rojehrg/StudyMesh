/**
 * Team Directory - Grid view of team members grouped by department
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, ChevronDown, ChevronRight, MessageSquare, Slack, Briefcase, MapPin } from 'lucide-react';
import { useGraphData, type GraphNode } from './hooks/useGraphData';
import { NodeDetailModal } from './NodeDetailModal';
import { PageLoader } from '@/components/loading-states';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function KnowledgeGraph() {
  const { data, isLoading, error } = useGraphData();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());

  // Group nodes by department
  const departmentGroups = useMemo(() => {
    if (!data?.nodes) return {};

    const groups: Record<string, GraphNode[]> = {};

    for (const node of data.nodes) {
      const dept = node.department || 'No Department';
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(node);
    }

    // Sort each department's members by name
    for (const dept of Object.keys(groups)) {
      groups[dept].sort((a, b) => a.name.localeCompare(b.name));
    }

    return groups;
  }, [data?.nodes]);

  // Filter nodes by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return departmentGroups;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, GraphNode[]> = {};

    for (const [dept, nodes] of Object.entries(departmentGroups)) {
      const matchingNodes = nodes.filter(node =>
        node.name.toLowerCase().includes(query) ||
        node.expertiseText?.toLowerCase().includes(query) ||
        node.major?.toLowerCase().includes(query)
      );
      if (matchingNodes.length > 0) {
        filtered[dept] = matchingNodes;
      }
    }

    return filtered;
  }, [departmentGroups, searchQuery]);

  // Sort departments alphabetically, with "No Department" at the end
  const sortedDepartments = useMemo(() => {
    return Object.keys(filteredGroups).sort((a, b) => {
      if (a === 'No Department') return 1;
      if (b === 'No Department') return -1;
      return a.localeCompare(b);
    });
  }, [filteredGroups]);

  const totalPeople = useMemo(() => {
    return Object.values(filteredGroups).reduce((sum, nodes) => sum + nodes.length, 0);
  }, [filteredGroups]);

  const toggleDepartment = (dept: string) => {
    setCollapsedDepts(prev => {
      const next = new Set(prev);
      if (next.has(dept)) {
        next.delete(dept);
      } else {
        next.add(dept);
      }
      return next;
    });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Users className="w-12 h-12 text-coffee-latte mb-4" />
        <h2 className="text-lg font-medium text-coffee-espresso mb-2">
          Could not load team directory
        </h2>
        <p className="text-coffee-cortado max-w-sm">
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
          Invite teammates to see the team directory
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-coffee-espresso mb-2">
          Team Directory
        </h1>
        <p className="text-lg text-coffee-mocha">
          See who knows what across your organization
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-mocha" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or skill..."
            className="pl-12 h-12 text-base border-2 border-coffee-foam focus:border-coffee-latte"
          />
        </div>
      </div>

      {/* Stats */}
      <p className="text-base text-coffee-mocha mb-6 font-medium">
        {totalPeople} {totalPeople === 1 ? 'teammate' : 'teammates'}
        {searchQuery && <span className="text-coffee-cortado font-normal"> matching "{searchQuery}"</span>}
      </p>

      {/* No results */}
      {sortedDepartments.length === 0 && searchQuery && (
        <div className="text-center py-12 bg-coffee-cream/30 rounded-xl">
          <Users className="w-10 h-10 text-coffee-latte mx-auto mb-3" />
          <p className="text-coffee-mocha font-medium">No matches found</p>
          <p className="text-coffee-cortado text-sm mt-1">
            Try different keywords
          </p>
        </div>
      )}

      {/* Department sections */}
      <div className="space-y-6">
        {sortedDepartments.map((dept) => {
          const nodes = filteredGroups[dept];
          const isCollapsed = collapsedDepts.has(dept);

          return (
            <div key={dept} className="bg-white rounded-xl border-2 border-coffee-foam overflow-hidden shadow-sm">
              {/* Department header */}
              <button
                onClick={() => toggleDepartment(dept)}
                className="w-full flex items-center justify-between px-5 py-4 bg-coffee-cream/50 hover:bg-coffee-cream transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-coffee-espresso" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-coffee-espresso" />
                  )}
                  <span className="font-semibold text-lg text-coffee-espresso">{dept}</span>
                  <Badge variant="secondary" className="bg-coffee-mocha text-white text-xs px-2">
                    {nodes.length}
                  </Badge>
                </div>
              </button>

              {/* Members grid */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {nodes.map((node) => (
                        <PersonCard
                          key={node.id}
                          node={node}
                          onSelect={() => setSelectedNode(node)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}

// Person card component
function PersonCard({ node, onSelect }: { node: GraphNode; onSelect: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className="bg-white rounded-lg border-2 border-coffee-foam/80 p-4 hover:border-coffee-latte hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-coffee-mocha focus:ring-offset-2"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${node.name}${node.major ? `, ${node.major}` : ''}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-coffee-foam">
          {node.avatarUrl && <AvatarImage src={node.avatarUrl} alt={node.name} />}
          <AvatarFallback
            className="text-sm font-semibold"
            style={{ backgroundColor: node.color, color: 'white' }}
            aria-hidden="true"
          >
            {node.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-coffee-espresso truncate">{node.name}</h3>
            {node.currentlyAvailable && (
              <span
                className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0 ring-2 ring-green-200"
                aria-label="Currently available"
                role="status"
              />
            )}
          </div>
          {node.major && (
            <p className="text-sm text-coffee-mocha truncate">{node.major}</p>
          )}
        </div>
      </div>

      {/* Expertise - expands on hover with smooth animation */}
      {node.expertiseText && (
        <div className="mb-3 p-2.5 bg-coffee-cream/40 rounded-md">
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : '2.75rem' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-sm text-coffee-espresso">
              {node.expertiseText}
            </p>
          </motion.div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end pt-3 border-t border-coffee-foam">
        {node.slackConnected ? (
          <Button
            size="sm"
            className="h-8 text-sm bg-coffee-espresso hover:bg-coffee-roast"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            aria-label={`Ask ${node.name} for help`}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Ask
          </Button>
        ) : (
          <span className="text-sm text-coffee-mocha flex items-center gap-1" aria-label="Slack not connected">
            <Slack className="w-3.5 h-3.5" aria-hidden="true" />
            No Slack
          </span>
        )}
      </div>
    </article>
  );
}
