/**
 * LeetCode-like problems fetcher
 * Can be extended to fetch from actual LeetCode API
 */

// Expanded in-memory database with more problems
export const leetcodeProblems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description: "Find two numbers that add up to target",
    topic: ["Hash Table", "Array"],
    companies: ["Google", "Amazon", "Meta"],
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "String",
    description: "Reverse a string in-place",
    topic: ["String", "Two Pointers"],
    companies: ["Google", "Microsoft"],
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    category: "Math",
    description: "Check if integer is palindrome",
    topic: ["Math"],
    companies: ["Google", "Amazon"],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description: "Check if parentheses are valid",
    topic: ["String", "Stack"],
    companies: ["Google", "Meta", "Amazon"],
  },
  {
    id: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    category: "Linked List",
    description: "Merge two sorted linked lists",
    topic: ["Linked List", "Recursion"],
    companies: ["Google", "Microsoft", "Meta"],
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: "Find subarray with largest sum (Kadane's algorithm)",
    topic: ["Dynamic Programming", "Array", "Divide and Conquer"],
    companies: ["Google", "Amazon", "Meta"],
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: "Count ways to climb n stairs (1 or 2 steps at a time)",
    topic: ["Dynamic Programming", "Math"],
    companies: ["Google", "Amazon"],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Binary Search",
    description: "Search target in sorted array",
    topic: ["Binary Search", "Array"],
    companies: ["Google", "Meta", "Microsoft"],
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "String",
    description: "Find length of longest substring without repeating chars",
    topic: ["Hash Table", "String", "Sliding Window"],
    companies: ["Google", "Amazon", "Meta"],
  },
  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Array",
    description: "Find two lines that form container with max area",
    topic: ["Array", "Two Pointers"],
    companies: ["Google", "Meta", "Amazon"],
  },
];

/**
 * Get all problems with filtering
 */
export async function getAllLeetcodeProblems({
  difficulty,
  category,
  topic,
  company,
} = {}) {
  let filtered = [...leetcodeProblems];

  if (difficulty) {
    filtered = filtered.filter(
      (p) => p.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  if (category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (topic) {
    filtered = filtered.filter((p) =>
      p.topic?.some((t) => t.toLowerCase() === topic.toLowerCase())
    );
  }

  if (company) {
    filtered = filtered.filter((p) =>
      p.companies?.some((c) => c.toLowerCase() === company.toLowerCase())
    );
  }

  return filtered;
}

/**
 * Get problem by ID
 */
export async function getLeetcodeProblemById(id) {
  return leetcodeProblems.find((p) => p.id === id);
}

/**
 * Get trending problems (mock - would fetch from API)
 */
export async function getTrendingProblems() {
  return leetcodeProblems.slice(0, 5);
}

/**
 * Get problems by company (mock)
 */
export async function getProblemsByCompany(company) {
  return getAllLeetcodeProblems({ company });
}

/**
 * Get problems by topic
 */
export async function getProblemsByTopic(topic) {
  return getAllLeetcodeProblems({ topic });
}
