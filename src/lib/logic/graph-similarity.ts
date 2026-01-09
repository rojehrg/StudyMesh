/**
 * Graph Similarity Computation
 *
 * Computes edges for the knowledge graph based on expertise similarity.
 * Uses hybrid approach: vector cosine similarity + tag overlap.
 */

const SIMILARITY_THRESHOLD = 0.5;  // Min similarity for edge (lowered for more connections)
const MAX_EDGES_PER_NODE = 5;      // Prevent visual clutter

export interface GraphMember {
  user_id: string;
  expertise_embedding: number[] | null;
  knowledge_areas: string[] | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  similarity: number;
  sharedAreas: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Compute Jaccard similarity between two sets of tags
 */
export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;

  const setA = new Set(a.map(s => s.toLowerCase()));
  const setB = new Set(b.map(s => s.toLowerCase()));

  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;

  return union === 0 ? 0 : intersection / union;
}

/**
 * Find shared knowledge areas between two members
 */
export function findSharedAreas(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(s => s.toLowerCase()));
  return a.filter(area => setB.has(area.toLowerCase()));
}

/**
 * Determine edge strength based on similarity score
 */
export function getEdgeStrength(similarity: number): 'weak' | 'medium' | 'strong' {
  if (similarity >= 0.75) return 'strong';
  if (similarity >= 0.6) return 'medium';
  return 'weak';
}

/**
 * Compute edges for all members based on expertise similarity
 *
 * Uses hybrid approach:
 * - 70% vector similarity (if embeddings exist)
 * - 30% tag overlap (knowledge areas)
 */
export function computeEdges(members: GraphMember[]): GraphEdge[] {
  const similarities: Array<{
    source: string;
    target: string;
    similarity: number;
    sharedAreas: string[];
  }> = [];

  // Compute all pairwise similarities
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];

      const areasA = a.knowledge_areas || [];
      const areasB = b.knowledge_areas || [];

      // Vector similarity (if both have embeddings)
      let vectorSim = 0;
      if (a.expertise_embedding && b.expertise_embedding) {
        vectorSim = cosineSimilarity(a.expertise_embedding, b.expertise_embedding);
      }

      // Tag similarity (Jaccard)
      const tagSim = jaccardSimilarity(areasA, areasB);

      // Shared areas for display
      const sharedAreas = findSharedAreas(areasA, areasB);

      // Weighted combination
      // If vector exists: 70% vector + 30% tags
      // If no vector: 100% tags
      const hasVectors = a.expertise_embedding && b.expertise_embedding;
      const finalSim = hasVectors
        ? vectorSim * 0.7 + tagSim * 0.3
        : tagSim;

      if (finalSim >= SIMILARITY_THRESHOLD) {
        similarities.push({
          source: a.user_id,
          target: b.user_id,
          similarity: finalSim,
          sharedAreas,
        });
      }
    }
  }

  // Sort by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Apply edge limits per node
  const edges: GraphEdge[] = [];
  const nodeEdgeCount = new Map<string, number>();

  for (const sim of similarities) {
    const sourceCount = nodeEdgeCount.get(sim.source) || 0;
    const targetCount = nodeEdgeCount.get(sim.target) || 0;

    if (sourceCount < MAX_EDGES_PER_NODE && targetCount < MAX_EDGES_PER_NODE) {
      edges.push({
        ...sim,
        strength: getEdgeStrength(sim.similarity),
      });
      nodeEdgeCount.set(sim.source, sourceCount + 1);
      nodeEdgeCount.set(sim.target, targetCount + 1);
    }
  }

  return edges;
}

/**
 * Calculate expertise depth score (1-10) based on profile completeness
 */
export function calculateExpertiseDepth(profile: {
  expertise_text?: string | null;
  knowledge_areas?: string[] | null;
  expertise_embedding?: number[] | null;
}): number {
  let score = 1; // Base score

  // Expertise text length
  const textLength = profile.expertise_text?.length || 0;
  if (textLength > 200) score += 3;
  else if (textLength > 100) score += 2;
  else if (textLength > 50) score += 1;

  // Number of knowledge areas
  const areaCount = profile.knowledge_areas?.length || 0;
  if (areaCount >= 5) score += 3;
  else if (areaCount >= 3) score += 2;
  else if (areaCount >= 1) score += 1;

  // Has embedding (indicates AI-processed expertise)
  if (profile.expertise_embedding && profile.expertise_embedding.length > 0) {
    score += 2;
  }

  return Math.min(10, score);
}

/**
 * Department color mapping for consistent node colors
 */
const DEPARTMENT_COLORS: Record<string, string> = {
  engineering: '#3B82F6',    // blue
  design: '#8B5CF6',         // purple
  product: '#10B981',        // green
  marketing: '#F59E0B',      // amber
  sales: '#EF4444',          // red
  operations: '#6366F1',     // indigo
  finance: '#14B8A6',        // teal
  hr: '#EC4899',             // pink
  legal: '#6B7280',          // gray
  support: '#F97316',        // orange
};

const DEFAULT_COLOR = '#8B7355'; // coffee-cortado

/**
 * Get color for department
 */
export function getDepartmentColor(department: string | null): string {
  if (!department) return DEFAULT_COLOR;

  const key = department.toLowerCase().replace(/[^a-z]/g, '');

  // Check for partial matches
  for (const [dept, color] of Object.entries(DEPARTMENT_COLORS)) {
    if (key.includes(dept) || dept.includes(key)) {
      return color;
    }
  }

  return DEFAULT_COLOR;
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0]?.toUpperCase() || '';
  const last = lastName?.[0]?.toUpperCase() || '';
  return first + last || '?';
}
