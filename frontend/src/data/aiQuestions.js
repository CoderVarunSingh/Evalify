export const AI_INTERVIEW_QUESTIONS = {
  "Software Engineer": [
    {
      id: "se-1",
      title: "Data Structures & Time Complexity Trade-offs",
      text: "Compare Hash Maps, Balanced Binary Search Trees, and Arrays for searching and insertion. When would you use a Trie data structure?",
      category: "Data Structures",
      difficulty: "Medium",
      timeMinutes: 3,
    },
    {
      id: "se-2",
      title: "Object-Oriented Design Principles (SOLID)",
      text: "Explain the SOLID principles with a real-world example. How does Dependency Inversion promote clean architecture and unit testing?",
      category: "Software Architecture",
      difficulty: "Medium",
      timeMinutes: 3,
    },
    {
      id: "se-3",
      title: "Concurrency, Threads & Deadlocks",
      text: "What causes a deadlock in multi-threaded programming? Explain techniques like Mutex locks, Semaphores, and Atomic operations to prevent race conditions.",
      category: "OS & Concurrency",
      difficulty: "Hard",
      timeMinutes: 4,
    },
    {
      id: "se-4",
      title: "Memory Management & Garbage Collection",
      text: "How does Garbage Collection work in modern runtimes (V8/JVM)? Compare Stack vs Heap memory allocation.",
      category: "Systems & Memory",
      difficulty: "Hard",
      timeMinutes: 4,
    },
    {
      id: "se-5",
      title: "Design Patterns in Practice",
      text: "Explain the Singleton, Factory, and Observer design patterns. Give an example where misusing a Singleton pattern causes issues in testing.",
      category: "Design Patterns",
      difficulty: "Easy",
      timeMinutes: 3,
    },
  ],

  "Frontend Developer": [
    {
      id: "fe-1",
      title: "Virtual DOM & React Reconciliation",
      text: "Explain how React's Virtual DOM works and how the reconciliation diffing algorithm optimizes browser DOM updates.",
      category: "Frontend Architecture",
      difficulty: "Medium",
      timeMinutes: 3,
    },
    {
      id: "fe-2",
      title: "JavaScript Closures & Lexical Scope",
      text: "What is a Closure in JavaScript? Give a practical example where closures are useful in real-world application state or event handlers.",
      category: "JavaScript Deep Dive",
      difficulty: "Easy",
      timeMinutes: 2,
    },
    {
      id: "fe-3",
      title: "Web Performance Optimization",
      text: "How do you optimize initial page load performance for a large React single-page application? Mention code splitting, lazy loading, and Core Web Vitals.",
      category: "Performance",
      difficulty: "Hard",
      timeMinutes: 4,
    },
  ],

  "Backend Developer": [
    {
      id: "be-1",
      title: "Node.js Event Loop Architecture",
      text: "Explain the Node.js Event Loop phases and how asynchronous non-blocking I/O operations are handled under the hood.",
      category: "Backend Runtimes",
      difficulty: "Hard",
      timeMinutes: 4,
    },
    {
      id: "be-2",
      title: "REST vs GraphQL API Design",
      text: "Compare RESTful APIs with GraphQL. What are the key advantages and drawbacks of each regarding network over-fetching and caching?",
      category: "API Architecture",
      difficulty: "Medium",
      timeMinutes: 3,
    },
  ],

  "Full Stack Developer": [
    {
      id: "fs-1",
      title: "End-to-End Application Architecture",
      text: "Walk through how a request flows from a React frontend through a API Gateway, authentication middleware, microservice controller, to a database.",
      category: "Full Stack Systems",
      difficulty: "Hard",
      timeMinutes: 4,
    },
  ],

  "HR & Behavioral": [
    {
      id: "hr-1",
      title: "Conflict Resolution & Collaboration",
      text: "Describe a situation where you had a major disagreement with a teammate or technical lead regarding project architecture. How did you resolve it?",
      category: "Behavioral / HR",
      difficulty: "Easy",
      timeMinutes: 3,
    },
  ],
};

// Helper function to dynamically generate unique questions for any role, type, difficulty, and count
export const generateQuestionsForSession = (roleName, type, difficulty, count = 5) => {
  const targetCount = Number(count) || 5;

  // SPECIAL MIXED MODE: Combines Voice, Technical, Live Coding, HR, and Adaptive AI Follow-Up questions
  if (type === "Mixed") {
    const mixedSlots = [
      {
        title: `${roleName} • HR & Behavioral Round`,
        text: `[HR Round - Behavioral]: Tell me about a complex project where you faced tight deadlines and conflicting technical requirements for a ${roleName} role. How did you prioritize?`,
        category: "HR & Culture Fit",
        difficulty: "Easy",
        mode: "voice",
        questionType: "hr",
      },
      {
        title: `${roleName} • Technical Architecture Deep-Dive`,
        text: `[Technical Round - ${difficulty || "Medium"}]: Explain the core architectural patterns and state management mechanisms you use when building high-performance ${roleName} applications.`,
        category: "Technical Core",
        difficulty: difficulty || "Medium",
        mode: "voice",
        questionType: "technical",
      },
      {
        title: `${roleName} • Live Coding Challenge`,
        text: `[Coding Challenge - Live Editor]: Write an optimal algorithm: Given an array of integers, return the indices of two numbers such that they add up to a target sum. Explain your time and space complexity.`,
        category: "Live Coding",
        difficulty: "Medium",
        mode: "coding",
        questionType: "coding",
        codeSnippet: "// Live Coding Challenge\nfunction solution(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(solution([2, 7, 11, 15], 9)); // Expected: [0, 1]\n",
      },
      {
        title: `${roleName} • System Design & Scalability`,
        text: `[System Design - ${difficulty || "Hard"}]: How would you design a resilient, high-throughput microservice architecture for ${roleName} workloads? Detail caching, rate limiting, and database sharding.`,
        category: "System Architecture",
        difficulty: difficulty || "Hard",
        mode: "voice",
        questionType: "system_design",
      },
      {
        title: `${roleName} • Adaptive AI Probing Round`,
        text: `[Adaptive AI Round - Follow-Up]: (AI will generate a dynamic follow-up question probing your previous answer)`,
        category: "Adaptive AI Probing",
        difficulty: "Hard",
        mode: "voice",
        questionType: "adaptive_followup",
        isAdaptive: true,
      },
    ];

    const results = [];
    for (let i = 0; i < targetCount; i++) {
      const slot = mixedSlots[i % mixedSlots.length];
      results.push({
        ...slot,
        id: `mixed-q${i + 1}-${Date.now().toString(36)}-${i}`,
      });
    }
    return results;
  }

  // STANDARD MODE (Voice or Coding)
  const primaryPool = AI_INTERVIEW_QUESTIONS[roleName] || [];
  const uniqueMap = new Map();
  primaryPool.forEach((q) => uniqueMap.set(q.text, q));

  Object.entries(AI_INTERVIEW_QUESTIONS).forEach(([cat, questions]) => {
    questions.forEach((q) => {
      if (!uniqueMap.has(q.text)) {
        uniqueMap.set(q.text, q);
      }
    });
  });

  const fullUniquePool = Array.from(uniqueMap.values());
  const results = [];
  const sessionMode = type === "Coding" ? "coding" : "voice";

  for (let i = 0; i < targetCount; i++) {
    const template = fullUniquePool[i % fullUniquePool.length];
    results.push({
      id: `q-${i + 1}-${Date.now().toString(36)}-${i}`,
      title: template.title || `${roleName} Question ${i + 1}`,
      text: `[${type || "Technical"} Round - ${difficulty || "Medium"}]: ${template.text}`,
      category: template.category || `${roleName} Core`,
      difficulty: difficulty || template.difficulty || "Medium",
      timeMinutes: template.timeMinutes || 3,
      mode: sessionMode,
      questionType: type?.toLowerCase() || "technical",
    });
  }

  return results;
};

export const COMPANY_PREP_SETS = [
  {
    company: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    questionsCount: 45,
    tag: "Algorithms & System Scale",
    color: "from-blue-600 to-red-500",
  },
  {
    company: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    questionsCount: 52,
    tag: "Leadership Principles & System Design",
    color: "from-amber-500 to-orange-600",
  },
  {
    company: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    questionsCount: 38,
    tag: "Data Structures & Cloud Architecture",
    color: "from-sky-500 to-indigo-600",
  },
];
