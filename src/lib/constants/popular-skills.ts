export const POPULAR_SKILLS = {
  engineering: [
    "Python", "JavaScript", "TypeScript", "React", "Node.js",
    "SQL", "AWS", "Docker", "Git", "API Design",
    "System Design", "Testing", "CI/CD", "Kubernetes", "Go"
  ],
  sales: [
    "Prospecting", "Cold Calling", "Negotiation", "CRM (Salesforce)",
    "Deal Closing", "Account Management", "Lead Generation", "Sales Strategy",
    "Customer Relationship", "Pipeline Management", "Presentation Skills",
    "Objection Handling", "Forecasting", "Territory Planning", "Value Selling"
  ],
  product: [
    "Product Strategy", "User Research", "Roadmap Planning", "Agile/Scrum",
    "Data Analysis", "A/B Testing", "Wireframing", "User Stories",
    "Stakeholder Management", "Product Metrics", "Go-to-Market", "Figma",
    "SQL", "Analytics", "Customer Interviews"
  ],
  marketing: [
    "Content Marketing", "SEO", "Social Media", "Email Marketing",
    "Google Analytics", "Copywriting", "Brand Strategy", "Campaign Management",
    "Marketing Automation", "PPC/SEM", "Growth Hacking", "Data Analysis",
    "A/B Testing", "Customer Segmentation", "Marketing Strategy"
  ],
  design: [
    "Figma", "UI/UX Design", "Prototyping", "User Research",
    "Visual Design", "Design Systems", "Interaction Design", "Wireframing",
    "Adobe Creative Suite", "Sketch", "User Testing", "Information Architecture",
    "Responsive Design", "Typography", "Color Theory"
  ],
  operations: [
    "Project Management", "Process Optimization", "Data Analysis", "Excel",
    "Budgeting", "Vendor Management", "Supply Chain", "Risk Management",
    "Compliance", "Documentation", "Cross-functional Collaboration",
    "Problem Solving", "Stakeholder Communication", "Reporting", "Process Documentation"
  ],
  finance: [
    "Financial Modeling", "Excel", "Forecasting", "Budgeting",
    "Financial Analysis", "Accounting", "Tax", "Reconciliation",
    "Financial Reporting", "FP&A", "Cash Flow", "Audit", "Compliance",
    "SQL", "Data Analysis"
  ],
  leadership: [
    "Team Management", "Coaching", "Strategic Planning", "Decision Making",
    "Conflict Resolution", "Communication", "Delegation", "Performance Management",
    "Change Management", "Hiring", "Feedback", "Mentoring", "Vision Setting",
    "Stakeholder Management", "Cross-functional Leadership"
  ],
  general: [
    "Communication", "Problem Solving", "Time Management", "Collaboration",
    "Critical Thinking", "Adaptability", "Leadership", "Presentation Skills",
    "Writing", "Research", "Data Analysis", "Project Management",
    "Teamwork", "Organization", "Attention to Detail"
  ]
};

export function getSkillsForDepartment(department: string | null): string[] {
  if (!department) return POPULAR_SKILLS.general;
  
  const dept = department.toLowerCase();
  
  if (dept.includes('eng') || dept.includes('tech') || dept.includes('dev')) {
    return POPULAR_SKILLS.engineering;
  }
  if (dept.includes('sales') || dept.includes('revenue')) {
    return POPULAR_SKILLS.sales;
  }
  if (dept.includes('product') || dept.includes('pm')) {
    return POPULAR_SKILLS.product;
  }
  if (dept.includes('market')) {
    return POPULAR_SKILLS.marketing;
  }
  if (dept.includes('design') || dept.includes('ux') || dept.includes('ui')) {
    return POPULAR_SKILLS.design;
  }
  if (dept.includes('ops') || dept.includes('operations')) {
    return POPULAR_SKILLS.operations;
  }
  if (dept.includes('finance') || dept.includes('accounting')) {
    return POPULAR_SKILLS.finance;
  }
  if (dept.includes('management') || dept.includes('executive') || dept.includes('lead')) {
    return POPULAR_SKILLS.leadership;
  }
  
  return POPULAR_SKILLS.general;
}

