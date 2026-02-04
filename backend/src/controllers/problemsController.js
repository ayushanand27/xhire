// Sample LeetCode-style problems (stored in-memory for now)
const problems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    description: {
      text: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      notes: ["You can return the answer in any order."],
    },
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "nums[1] + nums[2] == 6.",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] == 6.",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Your code here
}

// Test
console.log(twoSum([2,7,11,15], 9));`,
      python: `def two_sum(nums, target):
    # Your code here
    pass

# Test
print(two_sum([2,7,11,15], 9))`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] result = sol.twoSum(new int[]{2,7,11,15}, 9);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`,
    },
    expectedOutput: {
      javascript: "[0,1]",
      python: "[0, 1]",
      java: "[0,1]",
    },
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "Strings",
    description: {
      text: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
      notes: [],
    },
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: "",
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: "",
      },
    ],
    constraints: [
      "1 <= s.length <= 10^5",
      "s[i] is a printable ascii character.",
    ],
    starterCode: {
      javascript: `function reverseString(s) {
  // Your code here - modify s in place
}

// Test
const s = ["h","e","l","l","o"];
reverseString(s);
console.log(s);`,
      python: `def reverse_string(s):
    # Your code here - modify s in place
    pass

# Test
s = ["h","e","l","l","o"]
reverse_string(s)
print(s)`,
      java: `class Solution {
    public void reverseString(char[] s) {
        // Your code here
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        char[] s = {'h','e','l','l','o'};
        sol.reverseString(s);
        System.out.println(java.util.Arrays.toString(s));
    }
}`,
    },
    expectedOutput: {
      javascript: '["o","l","l","e","h"]',
      python: "['o', 'l', 'l', 'e', 'h']",
      java: "[o, l, l, e, h]",
    },
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    category: "Math",
    description: {
      text: "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same forward and backward.",
      notes: ["Could you solve it without converting the integer to a string?"],
    },
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-.",
      },
      {
        input: "x = 10",
        output: "false",
        explanation: "Reads 01 from right to left. Therefore it is not a palindrome.",
      },
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    starterCode: {
      javascript: `function isPalindrome(x) {
  // Your code here
}

// Test
console.log(isPalindrome(121));
console.log(isPalindrome(-121));
console.log(isPalindrome(10));`,
      python: `def is_palindrome(x):
    # Your code here
    pass

# Test
print(is_palindrome(121))
print(is_palindrome(-121))
print(is_palindrome(10))`,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isPalindrome(121));
        System.out.println(sol.isPalindrome(-121));
        System.out.println(sol.isPalindrome(10));
    }
}`,
    },
    expectedOutput: {
      javascript: "true\nfalse\nfalse",
      python: "True\nFalse\nFalse",
      java: "true\nfalse\nfalse",
    },
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description: {
      text: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
      notes: [],
    },
    examples: [
      { input: 's = "()"', output: "true", explanation: "" },
      { input: 's = "()[]{}"', output: "true", explanation: "" },
      { input: 's = "(]"', output: "false", explanation: "" },
      { input: 's = "([])"', output: "true", explanation: "" },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    starterCode: {
      javascript: `function isValid(s) {
  // Your code here
}

// Test
console.log(isValid("()"));
console.log(isValid("()[]{}"));
console.log(isValid("(]"));`,
      python: `def is_valid(s):
    # Your code here
    pass

# Test
print(is_valid("()"))
print(is_valid("()[]{}"))
print(is_valid("(]"))`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isValid("()"));
        System.out.println(sol.isValid("()[]{}"));
        System.out.println(sol.isValid("(]"));
    }
}`,
    },
    expectedOutput: {
      javascript: "true\ntrue\nfalse",
      python: "True\nTrue\nFalse",
      java: "true\ntrue\nfalse",
    },
  },
  {
    id: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    category: "Linked List",
    description: {
      text: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
      notes: [],
    },
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
        explanation: "",
      },
      { input: "list1 = [], list2 = []", output: "[]", explanation: "" },
      { input: "list1 = [], list2 = [0]", output: "[0]", explanation: "" },
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order.",
    ],
    starterCode: {
      javascript: `// For simplicity, using arrays instead of actual linked lists
function mergeTwoLists(list1, list2) {
  // Your code here
}

// Test
console.log(mergeTwoLists([1,2,4], [1,3,4]));`,
      python: `def merge_two_lists(list1, list2):
    # Your code here (using arrays for simplicity)
    pass

# Test
print(merge_two_lists([1,2,4], [1,3,4]))`,
      java: `import java.util.*;

class Solution {
    public int[] mergeTwoLists(int[] list1, int[] list2) {
        // Your code here (using arrays for simplicity)
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] result = sol.mergeTwoLists(new int[]{1,2,4}, new int[]{1,3,4});
        System.out.println(Arrays.toString(result));
    }
}`,
    },
    expectedOutput: {
      javascript: "[1,1,2,3,4,4]",
      python: "[1, 1, 2, 3, 4, 4]",
      java: "[1, 1, 2, 3, 4, 4]",
    },
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: {
      text: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
      notes: ["A subarray is a contiguous non-empty sequence of elements within an array."],
    },
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      { input: "nums = [1]", output: "1", explanation: "The subarray [1] has the largest sum 1." },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The subarray [5,4,-1,7,8] has the largest sum 23.",
      },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  // Your code here
}

// Test
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));`,
      python: `def max_sub_array(nums):
    # Your code here
    pass

# Test
print(max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4}));
    }
}`,
    },
    expectedOutput: {
      javascript: "6",
      python: "6",
      java: "6",
    },
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: {
      text: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      notes: [],
    },
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways: 1+1 and 2.",
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways: 1+1+1, 1+2, and 2+1.",
      },
    ],
    constraints: ["1 <= n <= 45"],
    starterCode: {
      javascript: `function climbStairs(n) {
  // Your code here
}

// Test
console.log(climbStairs(2));
console.log(climbStairs(3));`,
      python: `def climb_stairs(n):
    # Your code here
    pass

# Test
print(climb_stairs(2))
print(climb_stairs(3))`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.climbStairs(2));
        System.out.println(sol.climbStairs(3));
    }
}`,
    },
    expectedOutput: {
      javascript: "2\n3",
      python: "2\n3",
      java: "2\n3",
    },
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Binary Search",
    description: {
      text: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
      notes: [],
    },
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4.",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1.",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    starterCode: {
      javascript: `function search(nums, target) {
  // Your code here
}

// Test
console.log(search([-1,0,3,5,9,12], 9));
console.log(search([-1,0,3,5,9,12], 2));`,
      python: `def search(nums, target):
    # Your code here
    pass

# Test
print(search([-1,0,3,5,9,12], 9))
print(search([-1,0,3,5,9,12], 2))`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
        return -1;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.search(new int[]{-1,0,3,5,9,12}, 9));
        System.out.println(sol.search(new int[]{-1,0,3,5,9,12}, 2));
    }
}`,
    },
    expectedOutput: {
      javascript: "4\n-1",
      python: "4\n-1",
      java: "4\n-1",
    },
  },
];

// Get all problems
export const getAllProblems = async (req, res) => {
  try {
    const { difficulty, category, title } = req.query;
    
    let filtered = problems;
    
    if (difficulty) {
      filtered = filtered.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    
    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    if (title) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    
    res.json({ problems: filtered });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get problem by ID
export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = problems.find(p => p.id === id);
    
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    
    res.json({ problem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
