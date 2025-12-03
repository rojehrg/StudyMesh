import stringSimilarity from "string-similarity";

interface Profile {
  expertiseSkills: string[];
  growthSkills: string[];
  strengths?: string[];
  department?: string;
  availability?: Record<string, string[]>;
  collaborationPreference?: string;
  currentProjects?: string[];
  reliability?: number;
}

interface MatchDetails {
  skills: {
    aMentorsB: string[];
    bMentorsA: string[];
  };
  projects: string[];
  deptDiversity: boolean;
  highAvailability: boolean;
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

function areSkillsSimilar(skill1: string, skill2: string, threshold = 0.7): boolean {
  const s1 = skill1.trim().toLowerCase();
  const s2 = skill2.trim().toLowerCase();

  if (s1 === s2) return true;
  
  // Substring check for things like "Tax Recon" in "Tax Reconciliation"
  if (s1.length > 4 && s2.length > 4) {
    if (s1.includes(s2) || s2.includes(s1)) return true;
  }

  // Fuzzy match
  const similarity = stringSimilarity.compareTwoStrings(s1, s2);
  return similarity > threshold;
}

function calculateSkillGapScore(profileA: Profile, profileB: Profile): { score: number; details: MatchDetails['skills'] } {
  const expertiseA = normalizeSkills(profileA.expertiseSkills || profileA.strengths || []);
  const growthA = normalizeSkills(profileA.growthSkills || []);
  const expertiseB = normalizeSkills(profileB.expertiseSkills || profileB.strengths || []);
  const growthB = normalizeSkills(profileB.growthSkills || []);

  const details = {
    aMentorsB: [] as string[],
    bMentorsA: [] as string[],
  };
  
  let totalMatches = 0;

  // A can mentor B
  for (const exp of expertiseA) {
    for (const growth of growthB) {
      if (areSkillsSimilar(exp, growth)) {
        details.aMentorsB.push(exp); // Use A's term for display
        totalMatches++;
        break;
      }
    }
  }

  // B can mentor A
  for (const exp of expertiseB) {
    for (const growth of growthA) {
      if (areSkillsSimilar(exp, growth)) {
        details.bMentorsA.push(exp);
        totalMatches++;
        break;
      }
    }
  }

  const score = Math.min(30, totalMatches * 10);
  return { score, details };
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
  const { score: skillGap, details: skillDetails } = calculateSkillGapScore(profileA, profileB);
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
      highAvailability: availability > 10
    }
  };
}

// Simplified interface for UI usage
export function calculateMatches(profileA: Profile, profileB: Profile) {
  const { score: skillGap, details: skillDetails } = calculateSkillGapScore(profileA, profileB);
  
  return {
    score: skillGap,
    skills: {
      a_to_b: skillDetails.aMentorsB,
      b_to_a: skillDetails.bMentorsA,
    }
  };
}

