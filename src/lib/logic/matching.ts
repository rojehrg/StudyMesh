import stringSimilarity from "string-similarity";

// Memoization cache for skill similarity calculations
// This significantly improves performance for repeated skill comparisons
const similarityCache = new Map<string, boolean>();
const canonicalCache = new Map<string, string>();
const categoryCache = new Map<string, string | undefined>();

// Clear caches periodically (for long-running processes)
export function clearMatchingCaches() {
  similarityCache.clear();
  canonicalCache.clear();
  categoryCache.clear();
}

// Skill synonyms/aliases for better matching
// Maps common variations to a canonical form
const SKILL_SYNONYMS: Record<string, string[]> = {
  // Programming Languages
  "javascript": ["js", "ecmascript", "es6", "es2015", "vanilla js"],
  "typescript": ["ts"],
  "python": ["python3", "py", "python 3"],
  "c++": ["cpp", "c plus plus"],
  "c#": ["csharp", "c sharp", "dotnet", ".net"],
  "golang": ["go", "go lang"],
  "kotlin": ["kt"],
  "ruby": ["rb"],

  // Frameworks & Libraries
  "react": ["reactjs", "react.js", "react js"],
  "angular": ["angularjs", "angular.js"],
  "vue": ["vuejs", "vue.js", "vue js"],
  "node": ["nodejs", "node.js", "node js"],
  "next.js": ["nextjs", "next"],
  "express": ["expressjs", "express.js"],

  // Databases
  "postgresql": ["postgres", "psql", "pg"],
  "mongodb": ["mongo"],
  "mysql": ["my sql"],
  "redis": ["redis db"],
  "elasticsearch": ["elastic", "es"],

  // Cloud & DevOps
  "amazon web services": ["aws", "amazon cloud"],
  "google cloud platform": ["gcp", "google cloud"],
  "microsoft azure": ["azure", "ms azure"],
  "kubernetes": ["k8s", "kube"],
  "docker": ["containerization", "containers"],
  "ci/cd": ["cicd", "continuous integration", "continuous deployment"],

  // Data & Analytics
  "machine learning": ["ml", "ai/ml"],
  "artificial intelligence": ["ai"],
  "data science": ["data analytics", "analytics"],
  "business intelligence": ["bi", "bi tools"],
  "sql": ["structured query language"],

  // Design & UX
  "user experience": ["ux", "ux design"],
  "user interface": ["ui", "ui design"],
  "figma": ["figma design"],
  "adobe xd": ["xd"],

  // Business Skills
  "project management": ["pm", "project mgmt"],
  "product management": ["product mgmt", "product owner"],
  "agile": ["agile methodology", "scrum", "kanban"],
  "stakeholder management": ["stakeholder mgmt"],
  "financial analysis": ["financial modeling", "fin analysis"],
  "excel": ["microsoft excel", "ms excel", "spreadsheets"],
  "powerpoint": ["ppt", "microsoft powerpoint", "presentations"],
};

// Build reverse lookup for efficient matching
const SKILL_CANONICAL: Map<string, string> = new Map();
for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
  SKILL_CANONICAL.set(canonical.toLowerCase(), canonical.toLowerCase());
  for (const alias of aliases) {
    SKILL_CANONICAL.set(alias.toLowerCase(), canonical.toLowerCase());
  }
}

// Skill categories for broader matching
const SKILL_CATEGORIES: Record<string, string[]> = {
  "programming": ["javascript", "typescript", "python", "java", "c++", "c#", "golang", "ruby", "kotlin", "swift", "rust", "php"],
  "frontend": ["react", "angular", "vue", "html", "css", "tailwind", "sass", "webpack"],
  "backend": ["node", "express", "django", "flask", "spring", "rails", "fastapi", "graphql"],
  "database": ["postgresql", "mongodb", "mysql", "redis", "elasticsearch", "dynamodb", "sqlite"],
  "cloud": ["amazon web services", "google cloud platform", "microsoft azure", "heroku", "vercel", "netlify"],
  "devops": ["docker", "kubernetes", "terraform", "ansible", "jenkins", "ci/cd", "github actions"],
  "data": ["machine learning", "data science", "sql", "pandas", "numpy", "tensorflow", "pytorch"],
  "design": ["user experience", "user interface", "figma", "sketch", "adobe xd", "design systems"],
  "leadership": ["project management", "product management", "agile", "team leadership", "mentoring"],
  "finance": ["financial analysis", "excel", "accounting", "budgeting", "forecasting"],
};

// Build category lookup
const SKILL_TO_CATEGORY: Map<string, string> = new Map();
for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
  for (const skill of skills) {
    SKILL_TO_CATEGORY.set(skill.toLowerCase(), category);
  }
}

interface Profile {
  expertiseSkills: string[];
  growthSkills: string[];
  strengths?: string[];
  department?: string;
  availability?: Record<string, string[]>;
  collaborationPreference?: string;
  currentProjects?: string[];
  reliability?: number;
  updatedAt?: string | Date; // For freshness/decay calculation
}

// Calculate freshness penalty for stale profiles
// Returns a multiplier between 0.7 and 1.0
function calculateFreshnessFactor(profile: Profile): number {
  if (!profile.updatedAt) return 1.0; // No penalty if no data

  const updatedAt = new Date(profile.updatedAt);
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

  // No penalty for first 30 days
  if (daysSinceUpdate <= 30) return 1.0;

  // Gradual decay from day 31 to day 120 (4 months)
  // At day 120+, minimum factor is 0.7 (30% reduction)
  if (daysSinceUpdate >= 120) return 0.7;

  // Linear interpolation: 1.0 at day 30, 0.7 at day 120
  const decayRange = 120 - 30; // 90 days
  const daysIntoDecay = daysSinceUpdate - 30;
  const decayAmount = (daysIntoDecay / decayRange) * 0.3; // Max 30% reduction

  return 1.0 - decayAmount;
}

interface MatchDetails {
  skills: {
    aMentorsB: string[];
    bMentorsA: string[];
  };
  projects: string[];
  deptDiversity: boolean;
  highAvailability: boolean;
  isReciprocal: boolean;
}

interface CompatibilityResult {
  skillGap: number;
  departmentDiversity: number;
  initiativeAlignment: number;
  availability: number;
  collaborationStyle: number;
  businessUnit: number;
  softMatch: number;
  reliability: number;
  final: number;
  details: MatchDetails;
}

function normalizeSkills(skills: string[]): string[] {
  return skills.filter(Boolean).map(s => s.trim().toLowerCase());
}

// Get canonical form of a skill (resolves aliases) - memoized
function getCanonicalSkill(skill: string): string {
  const normalized = skill.trim().toLowerCase();

  // Check cache first
  const cached = canonicalCache.get(normalized);
  if (cached !== undefined) return cached;

  const result = SKILL_CANONICAL.get(normalized) || normalized;
  canonicalCache.set(normalized, result);
  return result;
}

// Get skill category if exists - memoized
function getSkillCategory(skill: string): string | undefined {
  const normalized = skill.trim().toLowerCase();

  // Check cache first
  const cached = categoryCache.get(normalized);
  if (cached !== undefined) return cached;

  const canonical = getCanonicalSkill(skill);
  const result = SKILL_TO_CATEGORY.get(canonical);
  categoryCache.set(normalized, result);
  return result;
}

function areSkillsSimilar(skill1: string, skill2: string, threshold = 0.7): boolean {
  const s1 = skill1.trim().toLowerCase();
  const s2 = skill2.trim().toLowerCase();

  // Check cache first (use sorted key for consistency)
  const cacheKey = s1 < s2 ? `${s1}|${s2}|${threshold}` : `${s2}|${s1}|${threshold}`;
  const cached = similarityCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let result = false;

  // Direct match
  if (s1 === s2) {
    result = true;
  } else {
    // Check canonical forms (handles synonyms like JS = JavaScript)
    const canonical1 = getCanonicalSkill(s1);
    const canonical2 = getCanonicalSkill(s2);
    if (canonical1 === canonical2) {
      result = true;
    } else if (s1.length > 4 && s2.length > 4) {
      // Substring check for things like "Tax Recon" in "Tax Reconciliation"
      if (s1.includes(s2) || s2.includes(s1)) {
        result = true;
      }
    }

    // Fuzzy match (only if not already matched)
    if (!result) {
      const similarity = stringSimilarity.compareTwoStrings(s1, s2);
      result = similarity > threshold;
    }
  }

  // Cache the result
  similarityCache.set(cacheKey, result);
  return result;
}

// Check if skills are in the same category (for broader matching)
function areSkillsRelated(skill1: string, skill2: string): boolean {
  const cat1 = getSkillCategory(skill1);
  const cat2 = getSkillCategory(skill2);
  return cat1 !== undefined && cat1 === cat2;
}

function calculateSkillGapScore(profileA: Profile, profileB: Profile): { score: number; details: MatchDetails['skills']; isReciprocal: boolean } {
  const expertiseA = normalizeSkills(profileA.expertiseSkills || profileA.strengths || []);
  const growthA = normalizeSkills(profileA.growthSkills || []);
  const expertiseB = normalizeSkills(profileB.expertiseSkills || profileB.strengths || []);
  const growthB = normalizeSkills(profileB.growthSkills || []);

  const details = {
    aMentorsB: [] as string[],
    bMentorsA: [] as string[],
  };

  let directMatches = 0;
  let categoryMatches = 0;

  // A can mentor B (direct skill match)
  for (const exp of expertiseA) {
    let matched = false;
    for (const growth of growthB) {
      if (areSkillsSimilar(exp, growth)) {
        details.aMentorsB.push(exp);
        directMatches++;
        matched = true;
        break;
      }
    }
    // If no direct match, check for category match (partial credit)
    if (!matched) {
      for (const growth of growthB) {
        if (areSkillsRelated(exp, growth)) {
          // Don't add to display list for category matches (too noisy)
          categoryMatches++;
          break;
        }
      }
    }
  }

  // B can mentor A (direct skill match)
  for (const exp of expertiseB) {
    let matched = false;
    for (const growth of growthA) {
      if (areSkillsSimilar(exp, growth)) {
        details.bMentorsA.push(exp);
        directMatches++;
        matched = true;
        break;
      }
    }
    // Category match fallback
    if (!matched) {
      for (const growth of growthA) {
        if (areSkillsRelated(exp, growth)) {
          categoryMatches++;
          break;
        }
      }
    }
  }

  // Calculate score: direct matches worth 10 points, category matches worth 3 points
  let score = Math.min(30, directMatches * 10 + categoryMatches * 3);

  // Reciprocal bonus: if both can help each other, add 5 bonus points
  const isReciprocal = details.aMentorsB.length > 0 && details.bMentorsA.length > 0;
  if (isReciprocal) {
    score = Math.min(35, score + 5); // Cap at 35 for skill gap (was 30)
  }

  return { score, details, isReciprocal };
}

function calculateDepartmentDiversityScore(profileA: Profile, profileB: Profile): number {
  const deptA = (profileA.department || "").trim().toLowerCase();
  const deptB = (profileB.department || "").trim().toLowerCase();
  
  if (!deptA || !deptB) return 0;
  return deptA !== deptB ? 10 : 0;
}

function calculateAvailabilityScore(profileA: Profile, profileB: Profile): number {
  const availA = profileA.availability || {};
  const availB = profileB.availability || {};
  
  if (Object.keys(availA).length === 0 || Object.keys(availB).length === 0) return 0;

  let commonSlots = 0;
  let totalUniqueSlots = 0;
  
  const allDays = new Set([...Object.keys(availA), ...Object.keys(availB)]);
  
  allDays.forEach(day => {
    const slotsA = new Set(availA[day] || []);
    const slotsB = new Set(availB[day] || []);
    
    // Intersection size
    const intersection = new Set([...slotsA].filter(x => slotsB.has(x)));
    commonSlots += intersection.size;
    
    // Union size
    const union = new Set([...slotsA, ...slotsB]);
    totalUniqueSlots += union.size;
  });

  if (totalUniqueSlots === 0) return 0;
  
  const overlapPercent = commonSlots / totalUniqueSlots;
  return Math.floor(overlapPercent * 15);
}

function calculateCollaborationStyleScore(profileA: Profile, profileB: Profile): number {
  const styleA = (profileA.collaborationPreference || "hybrid").toLowerCase();
  const styleB = (profileB.collaborationPreference || "hybrid").toLowerCase();

  if (styleA === styleB) return 10;
  if (styleA === "hybrid" || styleB === "hybrid") return 7;
  if ((styleA === "async" && styleB === "live") || (styleA === "live" && styleB === "async")) return 5;
  return 0;
}

function calculateSoftMatchScore(profileA: Profile, profileB: Profile): { score: number; reasons: string[] } {
  const projectsA = normalizeSkills(profileA.currentProjects || []);
  const projectsB = normalizeSkills(profileB.currentProjects || []);
  
  const matches: string[] = [];
  if (projectsA.length > 0 && projectsB.length > 0) {
    const shared = new Set<string>();
    for (const pA of projectsA) {
      for (const pB of projectsB) {
        if (areSkillsSimilar(pA, pB, 0.85)) {
          shared.add(pA); // Use A's term
        }
      }
    }
    
    if (shared.size > 0) {
      matches.push(`Shared Projects: ${Array.from(shared).join(", ")}`);
      return { score: 5, reasons: matches };
    }
  }
  
  return { score: 0, reasons: matches };
}

function calculateReliabilityScore(profileA: Profile, profileB: Profile): number {
  const relA = profileA.reliability || 0;
  const relB = profileB.reliability || 0;
  const avg = (relA + relB) / 2;
  return Math.min(15, Math.floor(avg * 3));
}

export function calculateCompatibility(
  profileA: Profile,
  profileB: Profile,
  isSamePod: boolean = true
): CompatibilityResult {
  const { score: skillGap, details: skillDetails, isReciprocal } = calculateSkillGapScore(profileA, profileB);
  const deptDiversity = calculateDepartmentDiversityScore(profileA, profileB);
  const initiativeAlignment = isSamePod ? 20 : 0;
  const availability = calculateAvailabilityScore(profileA, profileB);
  const collaborationStyle = calculateCollaborationStyleScore(profileA, profileB);
  const businessUnit = isSamePod ? 10 : 0; // Simplified assumption: same pod = same BU focus
  const { score: softMatch, reasons: softReasons } = calculateSoftMatchScore(profileA, profileB);
  const reliability = calculateReliabilityScore(profileA, profileB);

  const total = skillGap + deptDiversity + initiativeAlignment + availability + collaborationStyle + businessUnit + softMatch + reliability;

  return {
    skillGap,
    departmentDiversity: deptDiversity,
    initiativeAlignment,
    availability,
    collaborationStyle,
    businessUnit,
    softMatch,
    reliability,
    final: Math.min(100, total),
    details: {
      skills: skillDetails,
      projects: softReasons,
      deptDiversity: deptDiversity > 0,
      highAvailability: availability > 10,
      isReciprocal,
    }
  };
}

// Simplified interface for UI usage
export function calculateMatches(profileA: Profile, profileB: Profile, isSamePod: boolean = false) {
  const { score: skillGap, details: skillDetails, isReciprocal } = calculateSkillGapScore(profileA, profileB);
  const deptDiversity = calculateDepartmentDiversityScore(profileA, profileB);
  const initiativeAlignment = isSamePod ? 20 : 0;
  const availability = calculateAvailabilityScore(profileA, profileB);

  // Calculate base score
  let total = skillGap + deptDiversity + initiativeAlignment + availability;

  // Apply freshness decay to profile B (the match being ranked)
  // This ensures stale profiles are deprioritized in the list
  const freshnessFactor = calculateFreshnessFactor(profileB);
  total = Math.round(total * freshnessFactor);

  return {
    score: Math.min(100, total),
    skills: {
      a_to_b: skillDetails.aMentorsB,
      b_to_a: skillDetails.bMentorsA,
    },
    breakdown: {
      skills: skillGap,
      samePod: initiativeAlignment,
      crossDepartment: deptDiversity,
      availability: availability,
    },
    isReciprocal,
    freshnessFactor, // Expose for potential UI indicator
  };
}

// Calculate similarity score between two profiles (for "Similar to you" recommendations)
// Higher score = more similar skill sets
export function calculateSimilarity(profileA: Profile, profileB: Profile): {
  score: number;
  sharedExpertise: string[];
  sharedGrowth: string[];
  sharedCategory: string[];
} {
  const expertiseA = normalizeSkills(profileA.expertiseSkills || []);
  const expertiseB = normalizeSkills(profileB.expertiseSkills || []);
  const growthA = normalizeSkills(profileA.growthSkills || []);
  const growthB = normalizeSkills(profileB.growthSkills || []);

  const sharedExpertise: string[] = [];
  const sharedGrowth: string[] = [];
  const sharedCategory: string[] = [];

  // Find shared expertise skills
  for (const skillA of expertiseA) {
    for (const skillB of expertiseB) {
      if (areSkillsSimilar(skillA, skillB)) {
        sharedExpertise.push(skillA);
        break;
      }
    }
  }

  // Find shared growth goals
  for (const skillA of growthA) {
    for (const skillB of growthB) {
      if (areSkillsSimilar(skillA, skillB)) {
        sharedGrowth.push(skillA);
        break;
      }
    }
  }

  // Find shared skill categories
  const categoriesA = new Set<string>();
  const categoriesB = new Set<string>();

  for (const skill of [...expertiseA, ...growthA]) {
    const cat = getSkillCategory(skill);
    if (cat) categoriesA.add(cat);
  }
  for (const skill of [...expertiseB, ...growthB]) {
    const cat = getSkillCategory(skill);
    if (cat) categoriesB.add(cat);
  }

  for (const cat of categoriesA) {
    if (categoriesB.has(cat)) {
      sharedCategory.push(cat);
    }
  }

  // Calculate similarity score (0-100)
  const expertiseScore = Math.min(40, sharedExpertise.length * 15);
  const growthScore = Math.min(30, sharedGrowth.length * 10);
  const categoryScore = Math.min(20, sharedCategory.length * 5);
  const deptScore = profileA.department?.toLowerCase() === profileB.department?.toLowerCase() ? 10 : 0;

  return {
    score: Math.min(100, expertiseScore + growthScore + categoryScore + deptScore),
    sharedExpertise,
    sharedGrowth,
    sharedCategory,
  };
}

// Analyze team/pod skill composition and identify gaps
export interface TeamAnalysis {
  totalMembers: number;
  skillCoverage: Record<string, number>; // category -> count of members with skills
  strongAreas: string[]; // categories with good coverage (>50%)
  gapAreas: string[]; // categories with poor coverage (<25%)
  topExpertise: Array<{ skill: string; count: number }>;
  topGrowthNeeds: Array<{ skill: string; count: number }>;
  balanceScore: number; // 0-100, higher = more balanced team
  recommendations: string[];
}

export function analyzeTeamComposition(profiles: Profile[]): TeamAnalysis {
  const totalMembers = profiles.length;
  if (totalMembers === 0) {
    return {
      totalMembers: 0,
      skillCoverage: {},
      strongAreas: [],
      gapAreas: [],
      topExpertise: [],
      topGrowthNeeds: [],
      balanceScore: 0,
      recommendations: ["Add team members to see analysis"],
    };
  }

  // Count skills and categories
  const expertiseCount: Record<string, number> = {};
  const growthCount: Record<string, number> = {};
  const categoryMembers: Record<string, Set<number>> = {};

  profiles.forEach((profile, index) => {
    const expertise = normalizeSkills(profile.expertiseSkills || []);
    const growth = normalizeSkills(profile.growthSkills || []);

    // Count expertise skills
    for (const skill of expertise) {
      const canonical = getCanonicalSkill(skill);
      expertiseCount[canonical] = (expertiseCount[canonical] || 0) + 1;

      const category = getSkillCategory(skill);
      if (category) {
        if (!categoryMembers[category]) categoryMembers[category] = new Set();
        categoryMembers[category].add(index);
      }
    }

    // Count growth needs
    for (const skill of growth) {
      const canonical = getCanonicalSkill(skill);
      growthCount[canonical] = (growthCount[canonical] || 0) + 1;
    }
  });

  // Calculate coverage for each category
  const allCategories = Object.keys(SKILL_CATEGORIES);
  const skillCoverage: Record<string, number> = {};
  const strongAreas: string[] = [];
  const gapAreas: string[] = [];

  for (const category of allCategories) {
    const memberCount = categoryMembers[category]?.size || 0;
    const coveragePercent = Math.round((memberCount / totalMembers) * 100);
    skillCoverage[category] = coveragePercent;

    if (coveragePercent >= 50) strongAreas.push(category);
    else if (coveragePercent < 25) gapAreas.push(category);
  }

  // Get top expertise and growth needs
  const topExpertise = Object.entries(expertiseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  const topGrowthNeeds = Object.entries(growthCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  // Calculate balance score
  const coverageValues = Object.values(skillCoverage);
  const avgCoverage = coverageValues.length > 0
    ? coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length
    : 0;
  const variance = coverageValues.length > 0
    ? coverageValues.reduce((sum, val) => sum + Math.pow(val - avgCoverage, 2), 0) / coverageValues.length
    : 0;
  const balanceScore = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance))));

  // Generate recommendations
  const recommendations: string[] = [];

  if (gapAreas.length > 0) {
    recommendations.push(`Consider adding members with ${gapAreas.slice(0, 2).join(" or ")} skills`);
  }

  // Check if growth needs can be met internally
  const unmatchedGrowth = topGrowthNeeds.filter(
    need => !topExpertise.some(exp => areSkillsSimilar(exp.skill, need.skill))
  );
  if (unmatchedGrowth.length > 0) {
    recommendations.push(`Team needs mentors for: ${unmatchedGrowth.slice(0, 2).map(n => n.skill).join(", ")}`);
  }

  if (strongAreas.length >= 3) {
    recommendations.push(`Strong in ${strongAreas.slice(0, 3).join(", ")} - leverage for cross-training`);
  }

  if (recommendations.length === 0) {
    recommendations.push("Team has good skill balance!");
  }

  return {
    totalMembers,
    skillCoverage,
    strongAreas,
    gapAreas,
    topExpertise,
    topGrowthNeeds,
    balanceScore,
    recommendations,
  };
}

