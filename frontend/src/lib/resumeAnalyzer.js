// ─── Comprehensive Skills Knowledge Base ─────────────────────────────────────

const SKILLS_DICTIONARY = {
  frontend: ["React", "Vue.js", "Angular", "Next.js", "TypeScript", "JavaScript", "TailwindCSS", "CSS3", "HTML5", "Redux", "GraphQL", "Webpack", "Vite", "Jest", "Cypress", "Storybook", "SASS", "Zustand"],
  backend: ["Node.js", "Express", "Python", "FastAPI", "Django", "Java", "Spring Boot", "PostgreSQL", "MySQL", "MongoDB", "Redis", "REST", "GraphQL", "Docker", "Microservices", "Kafka", "gRPC", "Prisma", "Sequelize"],
  fullstack: ["React", "Node.js", "TypeScript", "Next.js", "PostgreSQL", "MongoDB", "Docker", "AWS", "REST", "Git", "CI/CD", "Redis", "TailwindCSS", "Express", "GraphQL", "Jest"],
  aiml: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", "OpenCV", "NLP", "Machine Learning", "Deep Learning", "FastAPI", "Docker", "HuggingFace", "LangChain", "CUDA", "MLflow"],
  devops: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform", "CI/CD", "GitHub Actions", "Jenkins", "Linux", "Bash", "Prometheus", "Grafana", "Nginx", "Ansible", "Helm"],
  mobile: ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Expo", "Firebase", "Redux", "TypeScript"],
};

// ─── ATS Power Keywords (not skills but resume section triggers) ──────────────
const ATS_POWER_KEYWORDS = [
  "led", "launched", "architected", "spearheaded", "engineered", "optimized",
  "reduced", "improved", "increased", "delivered", "deployed", "scaled",
  "mentored", "collaborated", "designed", "automated", "migrated", "integrated",
];

// ─── Weak → Strong Verb Mappings ─────────────────────────────────────────────
const WEAK_VERB_PATTERNS = [
  { pattern: /\bworked on\b/gi, replacement: "engineered", label: '"worked on"' },
  { pattern: /\bresponsible for\b/gi, replacement: "spearheaded", label: '"responsible for"' },
  { pattern: /\bhelped (with|to)\b/gi, replacement: "contributed to", label: '"helped with/to"' },
  { pattern: /\bhandled\b/gi, replacement: "managed and executed", label: '"handled"' },
  { pattern: /\bassisted (in|with)\b/gi, replacement: "collaborated to deliver", label: '"assisted in/with"' },
  { pattern: /\bwas (involved|part of)\b/gi, replacement: "actively contributed to", label: '"was involved/part of"' },
  { pattern: /\btried to\b/gi, replacement: "successfully", label: '"tried to"' },
  { pattern: /\bknowledge of\b/gi, replacement: "proficient in", label: '"knowledge of"' },
  { pattern: /\bfamiliar with\b/gi, replacement: "experienced with", label: '"familiar with"' },
  { pattern: /\bexposure to\b/gi, replacement: "hands-on experience with", label: '"exposure to"' },
];

// ─── Section Detection Patterns ───────────────────────────────────────────────
const SECTION_PATTERNS = {
  summary:    /\b(summary|profile|about me|objective|professional statement|overview)\b/i,
  experience: /\b(experience|work history|employment|career|position|role)\b/i,
  education:  /\b(education|degree|university|college|bachelor|master|b\.tech|m\.tech|phd|gpa|graduated)\b/i,
  projects:   /\b(project|portfolio|built|developed|created|implemented|open.?source)\b/i,
  skills:     /\b(skills|technologies|tech stack|tools|languages|frameworks|competencies)\b/i,
  certifications: /\b(certif|aws certified|google cloud|microsoft certified|credential|course)\b/i,
  achievements: /\b(achievement|award|honor|recognition|publication|patent|winner)\b/i,
  contact:    /\b(email|phone|linkedin|github|portfolio|website|mobile)\b/i,
};

// ─── Grammar Issues Detector ──────────────────────────────────────────────────
const GRAMMAR_RULES = [
  {
    test: /\bi\b(?!\s*[A-Z])/g,
    type: "Capitalization",
    issue: 'First-person pronoun "I" should never appear on a resume.',
    fix: "Remove all references to 'I', 'my', 'me' — write in first-person implied style (e.g., \"Built X\" not \"I built X\").",
    severity: "high",
  },
  {
    test: /\bmy\b/gi,
    type: "First-Person Language",
    issue: 'Phrase "my" is first-person language — unprofessional on a resume.',
    fix: 'Replace "my team" with "the team", "my project" with "the project".',
    severity: "high",
  },
  {
    test: /\bteam player\b/gi,
    type: "Overused Cliché",
    issue: '"Team player" is one of the most overused resume clichés with zero impact.',
    fix: 'Replace with concrete example: "Collaborated with 5 engineers to deliver X feature 2 weeks ahead of schedule."',
    severity: "medium",
  },
  {
    test: /\bhard.?working\b/gi,
    type: "Overused Cliché",
    issue: '"Hard-working" is a vague cliché that adds no value to ATS or hiring managers.',
    fix: "Show, don't tell — replace with a metric-backed achievement instead.",
    severity: "medium",
  },
  {
    test: /\bpassionate about\b/gi,
    type: "Vague Filler Phrase",
    issue: '"Passionate about" is a filler phrase that wastes resume space.',
    fix: 'Replace with specific deliverable: "Developed X using Y, resulting in Z improvement."',
    severity: "low",
  },
  {
    test: /\bstrong (communication|interpersonal)\b/gi,
    type: "Overused Trait Claim",
    issue: "Self-declared soft skills without evidence are ignored by ATS systems.",
    fix: "Back claims with examples: \"Presented quarterly roadmap to 200+ stakeholders.\"",
    severity: "low",
  },
];

// ─── Core Analysis Engine ─────────────────────────────────────────────────────
export function analyzeResume(resumeText) {
  if (!resumeText || !resumeText.trim()) return null;

  const text = resumeText;
  const textLower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // ── 1. Skill Detection ───────────────────────────────────────────────────────
  const allSkillsSet = new Set(Object.values(SKILLS_DICTIONARY).flat());
  const detectedSkills = [...allSkillsSet].filter((s) =>
    textLower.includes(s.toLowerCase())
  );

  // ── 2. Role Inference ────────────────────────────────────────────────────────
  let inferredRole = "Fullstack";
  let maxMatch = 0;
  for (const [roleKey, skills] of Object.entries(SKILLS_DICTIONARY)) {
    const matches = skills.filter((s) => textLower.includes(s.toLowerCase())).length;
    if (matches > maxMatch) {
      maxMatch = matches;
      inferredRole = roleKey === "aiml" ? "AI/ML" : roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
    }
  }

  const targetKey = inferredRole.toLowerCase().replace(/[^a-z]/g, "");
  const domainSkills = SKILLS_DICTIONARY[targetKey] || SKILLS_DICTIONARY.fullstack;
  const missingKeywords = domainSkills
    .filter((s) => !textLower.includes(s.toLowerCase()))
    .slice(0, 8);

  // ── 3. Section Detection ─────────────────────────────────────────────────────
  const sections = {};
  for (const [name, pattern] of Object.entries(SECTION_PATTERNS)) {
    sections[name] = pattern.test(text);
  }

  // ── 4. Metric & Impact Detection ─────────────────────────────────────────────
  const metricMatches = text.match(/(\d+[\+\-]?\s*(%|x|k|m|billion|million|thousand|users|customers|ms|seconds|hours|days|weeks)|\$\s*\d+[\.,\d]*|increased|reduced|improved|saved|accelerated|grew|boosted)/gi) || [];
  const hasMetrics = metricMatches.length > 0;
  const metricCount = metricMatches.length;

  const powerVerbMatches = ATS_POWER_KEYWORDS.filter((v) =>
    new RegExp(`\\b${v}\\b`, "i").test(text)
  );
  const hasActionVerbs = powerVerbMatches.length >= 3;

  // ── 5. ATS Score Calculation (weighted) ──────────────────────────────────────
  // Keyword match (35%)
  const skillMatchRatio = Math.min(detectedSkills.length / 10, 1);
  const keywordScore = Math.round(skillMatchRatio * 100);

  // Structure & Sections (25%)
  let structurePoints = 0;
  if (sections.summary) structurePoints += 20;
  if (sections.experience) structurePoints += 30;
  if (sections.education) structurePoints += 20;
  if (sections.skills) structurePoints += 15;
  if (sections.projects) structurePoints += 10;
  if (sections.contact) structurePoints += 5;
  const structureScore = Math.min(structurePoints, 100);

  // Impact & Power (25%)
  const metricScore = Math.min(metricCount * 10, 60);
  const verbScore = Math.min(powerVerbMatches.length * 6, 40);
  const impactScore = Math.min(metricScore + verbScore, 100);

  // Length & Density (15%)
  let lengthScore;
  if (wordCount < 200) lengthScore = 40;
  else if (wordCount < 300) lengthScore = 65;
  else if (wordCount <= 700) lengthScore = 100;
  else if (wordCount <= 900) lengthScore = 85;
  else lengthScore = 60;

  let atsScore = Math.round(
    keywordScore * 0.35 +
    structureScore * 0.25 +
    impactScore * 0.25 +
    lengthScore * 0.15
  );
  atsScore = Math.min(Math.max(atsScore, 35), 97);

  // ── 6. Strengths ──────────────────────────────────────────────────────────────
  const strengths = [];
  if (detectedSkills.length >= 8) {
    strengths.push(`Excellent technical breadth — ${detectedSkills.length} industry-recognized skills detected across your resume.`);
  } else if (detectedSkills.length >= 4) {
    strengths.push(`Solid technical stack with ${detectedSkills.length} relevant skills identified by ATS keyword scanners.`);
  }
  if (hasMetrics) {
    strengths.push(`${metricCount} quantified metric${metricCount > 1 ? "s" : ""} found — measurable impact makes your resume stand out to hiring managers.`);
  }
  if (hasActionVerbs) {
    strengths.push(`Strong use of ${powerVerbMatches.length} action verbs (${powerVerbMatches.slice(0, 3).join(", ")}...) — shows ownership and drives recruiter attention.`);
  }
  if (sections.summary && sections.experience && sections.education) {
    strengths.push("Well-structured resume with all essential ATS sections: Summary, Experience, and Education present.");
  }
  if (sections.certifications) {
    strengths.push("Certifications section detected — credentials significantly boost ATS ranking in technical roles.");
  }
  if (wordCount >= 350 && wordCount <= 700) {
    strengths.push(`Ideal resume length at ${wordCount} words — long enough for ATS but concise enough for human reviewers.`);
  }
  if (sections.projects) {
    strengths.push("Projects section included — demonstrating hands-on experience beyond job titles boosts hiring confidence.");
  }
  if (strengths.length === 0) {
    strengths.push("Plain-text structure is readable by ATS systems without special formatting barriers.");
  }

  // ── 7. Weaknesses ─────────────────────────────────────────────────────────────
  const weaknesses = [];
  if (!hasMetrics) {
    weaknesses.push("Zero quantified metrics found — bullet points without numbers are ignored by ATS and lose recruiter attention immediately.");
  }
  if (detectedSkills.length < 5) {
    weaknesses.push(`Very low technical keyword density (${detectedSkills.length}/${domainSkills.length} expected skills) — ATS may rank you below candidates with more keywords.`);
  }
  if (!hasActionVerbs) {
    weaknesses.push("Weak or passive verb usage detected — recruiters scan for leadership verbs in the first 6 seconds of reading.");
  }
  if (!sections.summary) {
    weaknesses.push("No Professional Summary section — the top 3 lines of your resume are prime ATS keyword real estate you're leaving empty.");
  }
  if (wordCount < 300) {
    weaknesses.push(`Resume is too short at ${wordCount} words — ATS systems expect 400–700 words minimum for a competitive ranking.`);
  }
  if (missingKeywords.length > 3) {
    weaknesses.push(`Missing ${missingKeywords.length} high-demand ${inferredRole} keywords that appear in 80%+ of job descriptions: ${missingKeywords.slice(0, 4).join(", ")}.`);
  }
  if (!sections.projects && !sections.certifications) {
    weaknesses.push("No Projects or Certifications sections — these differentiate you from candidates with identical job titles.");
  }

  // ── 8. Grammar Issues ─────────────────────────────────────────────────────────
  const grammarIssues = [];
  for (const rule of GRAMMAR_RULES) {
    rule.test.lastIndex = 0; // Reset regex
    if (rule.test.test(text)) {
      grammarIssues.push({
        type: rule.type,
        severity: rule.severity,
        issue: rule.issue,
        fix: rule.fix,
      });
    }
  }

  // Weak verb detection
  for (const { pattern, replacement, label } of WEAK_VERB_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      grammarIssues.push({
        type: "Weak Action Verb",
        severity: "high",
        issue: `Passive phrase ${label} detected — signals lack of ownership.`,
        fix: `Replace with strong action verb like "${replacement}" to demonstrate impact and leadership.`,
      });
    }
  }

  // Duplicate words check
  const wordFreq = {};
  words.forEach((w) => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, "");
    if (clean.length > 4) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });
  const overusedWords = Object.entries(wordFreq)
    .filter(([w, count]) => count > 5 && !["experience", "software", "development", "engineer", "technical"].includes(w))
    .map(([w, count]) => `"${w}" (×${count})`);

  if (overusedWords.length > 0) {
    grammarIssues.push({
      type: "Word Repetition",
      severity: "low",
      issue: `Overused words detected: ${overusedWords.slice(0, 3).join(", ")} — reduces readability and ATS diversity score.`,
      fix: "Use varied vocabulary and synonyms to improve readability and keyword coverage.",
    });
  }

  // ── 9. Actionable Suggestions ─────────────────────────────────────────────────
  const suggestions = [];

  if (!sections.summary) {
    suggestions.push({
      priority: "Critical",
      title: "Add a Professional Summary",
      detail: `Write a 2–3 line executive summary at the top highlighting your role, core ${inferredRole} skills, and years of experience. This is the highest-value ATS section.`,
    });
  }

  if (missingKeywords.length > 0) {
    suggestions.push({
      priority: "High",
      title: "Add Missing Industry Keywords",
      detail: `Naturally incorporate these ${inferredRole}-specific keywords into your experience bullets: ${missingKeywords.join(", ")}.`,
    });
  }

  if (!hasMetrics) {
    suggestions.push({
      priority: "High",
      title: "Quantify Every Achievement",
      detail: "Transform every bullet point into a metric: 'Built API' → 'Built REST API processing 2M daily requests with 99.9% uptime'. Use %, $, users, ms, time-to-market.",
    });
  }

  if (!hasActionVerbs) {
    suggestions.push({
      priority: "High",
      title: "Strengthen Action Verbs",
      detail: "Start every bullet with a power verb: Architected, Spearheaded, Optimized, Deployed, Engineered, Launched, Scaled, Reduced, Increased, Mentored.",
    });
  }

  if (!sections.projects) {
    suggestions.push({
      priority: "Medium",
      title: "Add a Projects Section",
      detail: "Include 2–3 notable projects with tech stack, your role, and measurable impact. Link to GitHub or live URL for extra credibility.",
    });
  }

  if (!sections.certifications) {
    suggestions.push({
      priority: "Medium",
      title: "Add Certifications",
      detail: `${inferredRole} roles benefit significantly from certifications like AWS Solutions Architect, Google Cloud, or role-specific credentials.`,
    });
  }

  suggestions.push({
    priority: "Low",
    title: "Optimize for ATS Formatting",
    detail: "Use a single-column layout with standard section headers (EXPERIENCE, EDUCATION, SKILLS). Avoid tables, columns, text boxes, headers/footers, and special characters.",
  });

  suggestions.push({
    priority: "Low",
    title: "Tailor Resume Per Job Description",
    detail: "Mirror exact keywords from each job posting in your resume. ATS systems score by keyword match rate — a tailored resume scores 40–60% higher than a generic one.",
  });

  // ── 10. Improved Resume Generator ────────────────────────────────────────────
  let improvedText = text;

  // Step 1: Replace weak/passive verbs with strong action verbs
  for (const { pattern, replacement } of WEAK_VERB_PATTERNS) {
    pattern.lastIndex = 0;
    improvedText = improvedText.replace(pattern, replacement);
  }

  // Step 2: Remove first-person language
  improvedText = improvedText.replace(/\bI (am|have|was|did|built|created|developed)\b/gi, (_, verb) =>
    verb.charAt(0).toUpperCase() + verb.slice(1)
  );
  improvedText = improvedText.replace(/\bMy\b/gi, "The");

  // Step 3: Clean up accidental double spaces from replacements
  improvedText = improvedText.replace(/  +/g, " ");

  // Build clean header sections to prepend (only if missing from original)
  const outputParts = [];

  if (!sections.summary) {
    const yearsEst = Math.max(2, Math.floor(wordCount / 150));
    const skillPreview = detectedSkills.slice(0, 5).join(", ") || "modern software engineering practices";
    outputParts.push(
      `PROFESSIONAL SUMMARY\n` +
      `Results-driven ${inferredRole} Engineer with ${yearsEst}+ years of experience building scalable, production-grade systems. ` +
      `Core expertise in ${skillPreview}. ` +
      `Proven track record of delivering high-impact technical solutions, optimizing performance, and collaborating with cross-functional teams to ship reliable software on time.`
    );
  }

  if (!sections.skills && detectedSkills.length > 0) {
    const coreSkills = detectedSkills.join(", ");
    const recommended = missingKeywords.slice(0, 5).join(", ");
    outputParts.push(
      `TECHNICAL SKILLS\n` +
      `Core: ${coreSkills}` +
      (recommended ? `\nRecommended to Add: ${recommended}` : "")
    );
  }

  // Add the improved body (original text with verb upgrades applied)
  outputParts.push(improvedText.trim());

  const improvedResumeText = outputParts.join("\n\n");

  // ── 11. Keyword Density Map ───────────────────────────────────────────────────
  const keywordDensity = detectedSkills.reduce((acc, skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = text.match(regex);
    acc[skill] = matches ? matches.length : 0;
    return acc;
  }, {});

  return {
    atsScore,
    scoreBreakdown: {
      keywordMatch: keywordScore,
      structure: structureScore,
      impact: impactScore,
      length: lengthScore,
    },
    inferredRole,
    wordCount,
    sentenceCount: sentences.length,
    detectedSkills,
    missingKeywords,
    keywordDensity,
    sections,
    metricCount,
    powerVerbMatches,
    strengths,
    weaknesses,
    grammarIssues,
    suggestions,
    improvedResumeText,
  };
}
