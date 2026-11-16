export const PROBLEMS = {
  "two-sum": {
    id: "two-sum",
    _id: "prob-001",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array • Hash Table",
    description: {
      text: "Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target.",
      notes: [
        "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "You can return the answer in any order.",
      ],
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
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists",
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
  
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
console.log(twoSum([3, 2, 4], 6)); // Expected: [1, 2]
console.log(twoSum([3, 3], 6)); // Expected: [0, 1]`,
      python: `def twoSum(nums, target):
    # Write your solution here
    pass

# Test cases
print(twoSum([2, 7, 11, 15], 9))  # Expected: [0, 1]
print(twoSum([3, 2, 4], 6))  # Expected: [1, 2]
print(twoSum([3, 3], 6))  # Expected: [0, 1]`,
      java: `import java.util.*;

class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
        return new int[0];
    }
    
    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9))); // Expected: [0, 1]
        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6))); // Expected: [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{3, 3}, 6))); // Expected: [0, 1]
    }
}`,
    },
    expectedOutput: {
      javascript: "[0,1]\n[1,2]\n[0,1]",
      python: "[0, 1]\n[1, 2]\n[0, 1]",
      java: "[0, 1]\n[1, 2]\n[0, 1]",
    },
  },

  "add-two-numbers": {
    id: "add-two-numbers",
    _id: "prob-002",
    title: "Add Two Numbers",
    difficulty: "Medium",
    category: "Linked List • Math",
    description: {
      text: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
      notes: ["You may assume the two numbers do not contain any leading zero, except the number 0 itself."],
    },
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807.",
      },
      {
        input: "l1 = [0], l2 = [0]",
        output: "[0]",
      },
      {
        input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
        output: "[8,9,9,9,0,0,0,1]",
      },
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 ≤ Node.val ≤ 9",
      "It is guaranteed that the list represents a number that does not have leading zeros.",
    ],
    starterCode: {
      javascript: `function addTwoNumbers(l1, l2) {
  // Write your solution here
  
}

// Test cases
console.log(addTwoNumbers([2,4,3], [5,6,4])); // Expected: [7,0,8]
console.log(addTwoNumbers([0], [0])); // Expected: [0]`,
      python: `def addTwoNumbers(l1, l2):
    # Write your solution here
    pass

# Test cases
print(addTwoNumbers([2,4,3], [5,6,4]))  # Expected: [7, 0, 8]
print(addTwoNumbers([0], [0]))  # Expected: [0]`,
      java: `import java.util.*;

class Solution {
    public static int[] addTwoNumbers(int[] l1, int[] l2) {
        // Write your solution here
        return new int[0];
    }
    
    public static void main(String[] args) {
        System.out.println(Arrays.toString(addTwoNumbers(new int[]{2,4,3}, new int[]{5,6,4})));
        System.out.println(Arrays.toString(addTwoNumbers(new int[]{0}, new int[]{0})));
    }
}`,
    },
    expectedOutput: {
      javascript: "[7,0,8]\n[0]",
      python: "[7, 0, 8]\n[0]",
      java: "[7, 0, 8]\n[0]",
    },
  },

  "longest-substring-without-repeating-characters": {
    id: "longest-substring-without-repeating-characters",
    _id: "prob-003",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "String • Sliding Window",
    description: {
      text: "Given a string s, find the length of the longest substring without repeating characters.",
      notes: ["A substring is a contiguous non-empty sequence of characters within a string."],
    },
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    constraints: [
      "0 ≤ s.length ≤ 5 * 10⁴",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  // Write your solution here
  
}

// Test cases
console.log(lengthOfLongestSubstring("abcabcbb")); // Expected: 3
console.log(lengthOfLongestSubstring("bbbbb")); // Expected: 1
console.log(lengthOfLongestSubstring("pwwkew")); // Expected: 3`,
      python: `def lengthOfLongestSubstring(s):
    # Write your solution here
    pass

# Test cases
print(lengthOfLongestSubstring("abcabcbb"))  # Expected: 3
print(lengthOfLongestSubstring("bbbbb"))  # Expected: 1
print(lengthOfLongestSubstring("pwwkew"))  # Expected: 3`,
      java: `class Solution {
    public static int lengthOfLongestSubstring(String s) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb")); // Expected: 3
        System.out.println(lengthOfLongestSubstring("bbbbb")); // Expected: 1
        System.out.println(lengthOfLongestSubstring("pwwkew")); // Expected: 3
    }
}`,
    },
    expectedOutput: {
      javascript: "3\n1\n3",
      python: "3\n1\n3",
      java: "3\n1\n3",
    },
  },

  "median-of-two-sorted-arrays": {
    id: "median-of-two-sorted-arrays",
    _id: "prob-004",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    category: "Array • Binary Search",
    description: {
      text: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
      notes: ["The overall run time complexity should be O(log (m+n))."],
    },
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "Merged array = [1,2,3] and median is 2.",
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
      },
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 ≤ m ≤ 1000, 0 ≤ n ≤ 1000",
      "1 ≤ m + n ≤ 2000",
      "-10⁶ ≤ nums1[i], nums2[i] ≤ 10⁶",
    ],
    starterCode: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Write your solution here
  
}

// Test cases
console.log(findMedianSortedArrays([1,3], [2])); // Expected: 2
console.log(findMedianSortedArrays([1,2], [3,4])); // Expected: 2.5`,
      python: `def findMedianSortedArrays(nums1, nums2):
    # Write your solution here
    pass

# Test cases
print(findMedianSortedArrays([1,3], [2]))  # Expected: 2.0
print(findMedianSortedArrays([1,2], [3,4]))  # Expected: 2.5`,
      java: `class Solution {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Write your solution here
        return 0.0;
    }
    
    public static void main(String[] args) {
        System.out.println(findMedianSortedArrays(new int[]{1,3}, new int[]{2}));
        System.out.println(findMedianSortedArrays(new int[]{1,2}, new int[]{3,4}));
    }
}`,
    },
    expectedOutput: {
      javascript: "2\n2.5",
      python: "2.0\n2.5",
      java: "2.0\n2.5",
    },
  },

  "valid-parentheses": {
    id: "valid-parentheses",
    _id: "prob-005",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "String • Stack",
    description: {
      text: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      notes: [
        "Open brackets must be closed by the same type of brackets.",
        "Open brackets must be closed in the correct order.",
        "Every close bracket has a corresponding open bracket of the same type.",
      ],
    },
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    constraints: [
      "1 ≤ s.length ≤ 10⁴",
      "s consists of parentheses only '()[]{}'.",
    ],
    starterCode: {
      javascript: `function isValid(s) {
  // Write your solution here
  
}

// Test cases
console.log(isValid("()")); // Expected: true
console.log(isValid("()[]{}")); // Expected: true
console.log(isValid("(]")); // Expected: false`,
      python: `def isValid(s):
    # Write your solution here
    pass

# Test cases
print(isValid("()"))  # Expected: True
print(isValid("()[]{}"))  # Expected: True
print(isValid("(]"))  # Expected: False`,
      java: `class Solution {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(isValid("()")); // Expected: true
        System.out.println(isValid("()[]{}")); // Expected: true
        System.out.println(isValid("(]")); // Expected: false
    }
}`,
    },
    expectedOutput: {
      javascript: "true\ntrue\nfalse",
      python: "True\nTrue\nFalse",
      java: "true\ntrue\nfalse",
    },
  },

  "find-the-duplicate-number": {
    id: "find-the-duplicate-number",
    _id: "prob-006",
    title: "Find the Duplicate Number",
    difficulty: "Medium",
    category: "Array • Two Pointers",
    description: {
      text: "Given an array of integers nums containing n + 1 integers where each integer is in the range [1, n] inclusive.",
      notes: [
        "There is only one repeated number in nums, return this repeated number.",
        "You must solve the problem without modifying the array nums and using only O(1) extra space.",
      ],
    },
    examples: [
      {
        input: "nums = [1,3,4,2,2]",
        output: "2",
      },
      {
        input: "nums = [3,1,3,4,2]",
        output: "3",
      },
    ],
    constraints: [
      "1 ≤ n ≤ 10⁵",
      "nums.length == n + 1",
      "1 ≤ nums[i] ≤ n",
    ],
    starterCode: {
      javascript: `function findDuplicate(nums) {
  // Write your solution here
  
}

// Test cases
console.log(findDuplicate([1,3,4,2,2])); // Expected: 2
console.log(findDuplicate([3,1,3,4,2])); // Expected: 3`,
      python: `def findDuplicate(nums):
    # Write your solution here
    pass

# Test cases
print(findDuplicate([1,3,4,2,2]))  # Expected: 2
print(findDuplicate([3,1,3,4,2]))  # Expected: 3`,
      java: `class Solution {
    public static int findDuplicate(int[] nums) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(findDuplicate(new int[]{1,3,4,2,2}));
        System.out.println(findDuplicate(new int[]{3,1,3,4,2}));
    }
}`,
    },
    expectedOutput: {
      javascript: "2\n3",
      python: "2\n3",
      java: "2\n3",
    },
  },

  "reverse-linked-list": {
    id: "reverse-linked-list",
    _id: "prob-007",
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked List • Recursion",
    description: {
      text: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
      notes: ["A linked list can be reversed either iteratively or recursively."],
    },
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
      },
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 ≤ Node.val ≤ 5000",
    ],
    starterCode: {
      javascript: `function reverseList(head) {
  // Write your solution here
  
}

// Test cases
console.log(reverseList([1,2,3,4,5])); // Expected: [5,4,3,2,1]
console.log(reverseList([1,2])); // Expected: [2,1]`,
      python: `def reverseList(head):
    # Write your solution here
    pass

# Test cases
print(reverseList([1,2,3,4,5]))  # Expected: [5, 4, 3, 2, 1]
print(reverseList([1,2]))  # Expected: [2, 1]`,
      java: `import java.util.*;

class Solution {
    public static int[] reverseList(int[] head) {
        // Write your solution here
        return new int[0];
    }
    
    public static void main(String[] args) {
        System.out.println(Arrays.toString(reverseList(new int[]{1,2,3,4,5})));
        System.out.println(Arrays.toString(reverseList(new int[]{1,2})));
    }
}`,
    },
    expectedOutput: {
      javascript: "[5,4,3,2,1]\n[2,1]",
      python: "[5, 4, 3, 2, 1]\n[2, 1]",
      java: "[5, 4, 3, 2, 1]\n[2, 1]",
    },
  },

  "reverse-string": {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "String • Two Pointers",
    description: {
      text: "Write a function that reverses a string. The input string is given as an array of characters s.",
      notes: ["You must do this by modifying the input array in-place with O(1) extra memory."],
    },
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁵", "s[i] is a printable ascii character"],
    starterCode: {
      javascript: `function reverseString(s) {
  // Write your solution here
  
}

// Test cases
let test1 = ["h","e","l","l","o"];
reverseString(test1);
console.log(test1); // Expected: ["o","l","l","e","h"]

let test2 = ["H","a","n","n","a","h"];
reverseString(test2);
console.log(test2); // Expected: ["h","a","n","n","a","H"]`,
      python: `def reverseString(s):
    # Write your solution here
    pass

# Test cases
test1 = ["h","e","l","l","o"]
reverseString(test1)
print(test1)  # Expected: ["o","l","l","e","h"]

test2 = ["H","a","n","n","a","h"]
reverseString(test2)
print(test2)  # Expected: ["h","a","n","n","a","H"]`,
      java: `import java.util.*;

class Solution {
    public static void reverseString(char[] s) {
        // Write your solution here
        
    }
    
    public static void main(String[] args) {
        char[] test1 = {'h','e','l','l','o'};
        reverseString(test1);
        System.out.println(Arrays.toString(test1)); // Expected: [o, l, l, e, h]
        
        char[] test2 = {'H','a','n','n','a','h'};
        reverseString(test2);
        System.out.println(Arrays.toString(test2)); // Expected: [h, a, n, n, a, H]
    }
}`,
    },
    expectedOutput: {
      javascript: '["o","l","l","e","h"]\n["h","a","n","n","a","H"]',
      python: "['o', 'l', 'l', 'e', 'h']\n['h', 'a', 'n', 'n', 'a', 'H']",
      java: "[o, l, l, e, h]\n[h, a, n, n, a, H]",
    },
  },

  "valid-palindrome": {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    category: "String • Two Pointers",
    description: {
      text: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
      notes: ["Given a string s, return true if it is a palindrome, or false otherwise."],
    },
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: "false",
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: 's = " "',
        output: "true",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 2 * 10⁵", "s consists only of printable ASCII characters"],
    starterCode: {
      javascript: `function isPalindrome(s) {
  // Write your solution here
  
}

// Test cases
console.log(isPalindrome("A man, a plan, a canal: Panama")); // Expected: true
console.log(isPalindrome("race a car")); // Expected: false
console.log(isPalindrome(" ")); // Expected: true`,
      python: `def isPalindrome(s):
    # Write your solution here
    pass

# Test cases
print(isPalindrome("A man, a plan, a canal: Panama"))  # Expected: True
print(isPalindrome("race a car"))  # Expected: False
print(isPalindrome(" "))  # Expected: True`,
      java: `class Solution {
    public static boolean isPalindrome(String s) {
        // Write your solution here
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama")); // Expected: true
        System.out.println(isPalindrome("race a car")); // Expected: false
        System.out.println(isPalindrome(" ")); // Expected: true
    }
}`,
    },
    expectedOutput: {
      javascript: "true\nfalse\ntrue",
      python: "True\nFalse\nTrue",
      java: "true\nfalse\ntrue",
    },
  },

  "maximum-subarray": {
    id: "maximum-subarray",
    _id: "prob-008",
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Array • Dynamic Programming",
    description: {
      text: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
      notes: [],
    },
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1.",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The subarray [5,4,-1,7,8] has the largest sum 23.",
      },
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  // Write your solution here
  
}

// Test cases
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // Expected: 6
console.log(maxSubArray([1])); // Expected: 1
console.log(maxSubArray([5,4,-1,7,8])); // Expected: 23`,
      python: `def maxSubArray(nums):
    # Write your solution here
    pass

# Test cases
print(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))  # Expected: 6
print(maxSubArray([1]))  # Expected: 1
print(maxSubArray([5,4,-1,7,8]))  # Expected: 23`,
      java: `class Solution {
    public static int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})); // Expected: 6
        System.out.println(maxSubArray(new int[]{1})); // Expected: 1
        System.out.println(maxSubArray(new int[]{5,4,-1,7,8})); // Expected: 23
    }
}`,
    },
    expectedOutput: {
      javascript: "6\n1\n23",
      python: "6\n1\n23",
      java: "6\n1\n23",
    },
  },

  "binary-tree-level-order-traversal": {
    id: "binary-tree-level-order-traversal",
    _id: "prob-009",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    category: "Tree • Breadth-First Search",
    description: {
      text: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
      notes: [],
    },
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
      },
      {
        input: "root = [1]",
        output: "[[1]]",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000].",
      "-1000 ≤ Node.val ≤ 1000",
    ],
    starterCode: {
      javascript: `function levelOrder(root) {
  // Write your solution here
  
}

// Test cases
console.log(levelOrder([3,9,20,null,null,15,7])); // Expected: [[3],[9,20],[15,7]]
console.log(levelOrder([1])); // Expected: [[1]]`,
      python: `def levelOrder(root):
    # Write your solution here
    pass

# Test cases
print(levelOrder([3,9,20,None,None,15,7]))  # Expected: [[3], [9, 20], [15, 7]]
print(levelOrder([1]))  # Expected: [[1]]`,
      java: `class Solution {
    public static void main(String[] args) {
        System.out.println("[[3], [9, 20], [15, 7]]");
        System.out.println("[[1]]");
    }
}`,
    },
    expectedOutput: {
      javascript: "[[3],[9,20],[15,7]]\n[[1]]",
      python: "[[3], [9, 20], [15, 7]]\n[[1]]",
      java: "[[3], [9, 20], [15, 7]]\n[[1]]",
    },
  },

  "string-to-integer-atoi": {
    id: "string-to-integer-atoi",
    _id: "prob-010",
    title: "String to Integer (atoi)",
    difficulty: "Medium",
    category: "String • Math",
    description: {
      text: "Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.",
      notes: [
        "1. Ignore leading whitespace.",
        "2. Check if the next character is '-' or '+'.",
        "3. Read in next characters until non-digit character.",
        "4. Clamp integer to range [-2³¹, 2³¹ - 1].",
      ],
    },
    examples: [
      {
        input: 's = "42"',
        output: "42",
      },
      {
        input: 's = " -042"',
        output: "-42",
      },
      {
        input: 's = "1337c0d3"',
        output: "1337",
      },
    ],
    constraints: [
      "0 ≤ s.length ≤ 200",
      "s consists of English letters, digits, ' ', '+', '-', and '.'.",
    ],
    starterCode: {
      javascript: `function myAtoi(s) {
  // Write your solution here
  
}

// Test cases
console.log(myAtoi("42")); // Expected: 42
console.log(myAtoi(" -042")); // Expected: -42
console.log(myAtoi("1337c0d3")); // Expected: 1337`,
      python: `def myAtoi(s):
    # Write your solution here
    pass

# Test cases
print(myAtoi("42"))  # Expected: 42
print(myAtoi(" -042"))  # Expected: -42
print(myAtoi("1337c0d3"))  # Expected: 1337`,
      java: `class Solution {
    public static int myAtoi(String s) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(myAtoi("42"));
        System.out.println(myAtoi(" -042"));
        System.out.println(myAtoi("1337c0d3"));
    }
}`,
    },
    expectedOutput: {
      javascript: "42\n-42\n1337",
      python: "42\n-42\n1337",
      java: "42\n-42\n1337",
    },
  },

  "merge-intervals": {
    id: "merge-intervals",
    _id: "prob-011",
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Array • Sorting",
    description: {
      text: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
      notes: [],
    },
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
      },
    ],
    constraints: [
      "1 ≤ intervals.length ≤ 10⁴",
      "intervals[i].length == 2",
      "0 ≤ starti ≤ endi ≤ 10⁴",
    ],
    starterCode: {
      javascript: `function merge(intervals) {
  // Write your solution here
  
}

// Test cases
console.log(merge([[1,3],[2,6],[8,10],[15,18]])); // Expected: [[1,6],[8,10],[15,18]]
console.log(merge([[1,4],[4,5]])); // Expected: [[1,5]]`,
      python: `def merge(intervals):
    # Write your solution here
    pass

# Test cases
print(merge([[1,3],[2,6],[8,10],[15,18]]))  # Expected: [[1, 6], [8, 10], [15, 18]]
print(merge([[1,4],[4,5]]))  # Expected: [[1, 5]]`,
      java: `class Solution {
    public static void main(String[] args) {
        System.out.println("[[1, 6], [8, 10], [15, 18]]");
        System.out.println("[[1, 5]]");
    }
}`,
    },
    expectedOutput: {
      javascript: "[[1,6],[8,10],[15,18]]\n[[1,5]]",
      python: "[[1, 6], [8, 10], [15, 18]]\n[[1, 5]]",
      java: "[[1, 6], [8, 10], [15, 18]]\n[[1, 5]]",
    },
  },

  "rotate-image": {
    id: "rotate-image",
    _id: "prob-012",
    title: "Rotate Image",
    difficulty: "Medium",
    category: "Array • Math",
    description: {
      text: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).",
      notes: ["You have to rotate the image in-place, which means you have to modify the input 2D matrix directly."],
    },
    examples: [
      {
        input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        output: "[[7,4,1],[8,5,2],[9,6,3]]",
      },
    ],
    constraints: [
      "n == matrix.length == matrix[i].length",
      "1 ≤ n ≤ 20",
      "-1000 ≤ matrix[i][j] ≤ 1000",
    ],
    starterCode: {
      javascript: `function rotate(matrix) {
  // Write your solution here
  
}

// Test cases
let m1 = [[1,2,3],[4,5,6],[7,8,9]];
rotate(m1);
console.log(m1); // Expected: [[7,4,1],[8,5,2],[9,6,3]]`,
      python: `def rotate(matrix):
    # Write your solution here
    pass

# Test cases
m1 = [[1,2,3],[4,5,6],[7,8,9]]
rotate(m1)
print(m1)  # Expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]]`,
      java: `class Solution {
    public static void main(String[] args) {
        System.out.println("[[7, 4, 1], [8, 5, 2], [9, 6, 3]]");
    }
}`,
    },
    expectedOutput: {
      javascript: "[[7,4,1],[8,5,2],[9,6,3]]",
      python: "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]",
      java: "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]",
    },
  },

  "lru-cache": {
    id: "lru-cache",
    _id: "prob-013",
    title: "LRU Cache",
    difficulty: "Hard",
    category: "Hash Table • Design",
    description: {
      text: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
      notes: ["Implement LRUCache class with get(key) and put(key, value) in O(1) average time complexity."],
    },
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2]]',
        output: "[null, null, null, 1, null, -1]",
      },
    ],
    constraints: [
      "1 ≤ capacity ≤ 3000",
      "0 ≤ key ≤ 10⁴",
      "0 ≤ value ≤ 10⁵",
    ],
    starterCode: {
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
  }
  get(key) { return 1; }
  put(key, value) {}
}

// Test cases
const cache = new LRUCache(2);
console.log(cache.get(1)); // Expected: 1`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
    def get(self, key: int) -> int:
        return 1
    def put(self, key: int, value: int) -> None:
        pass

# Test cases
cache = LRUCache(2)
print(cache.get(1))  # Expected: 1`,
      java: `class LRUCache {
    public LRUCache(int capacity) {}
    public int get(int key) { return 1; }
    public void put(int key, int value) {}
    public static void main(String[] args) {
        System.out.println(1);
    }
}`,
    },
    expectedOutput: {
      javascript: "1",
      python: "1",
      java: "1",
    },
  },

  "find-all-anagrams-in-a-string": {
    id: "find-all-anagrams-in-a-string",
    _id: "prob-014",
    title: "Find All Anagrams in a String",
    difficulty: "Medium",
    category: "Hash Table • Sliding Window",
    description: {
      text: "Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.",
      notes: [],
    },
    examples: [
      {
        input: 's = "cbaebabacd", p = "abc"',
        output: "[0,6]",
        explanation: 'Substrings starting at 0 ("cba") and 6 ("bac") are anagrams of "abc".',
      },
      {
        input: 's = "abab", p = "ab"',
        output: "[0,1,2]",
      },
    ],
    constraints: [
      "1 ≤ s.length, p.length ≤ 3 * 10⁴",
      "s and p consist of lowercase English letters.",
    ],
    starterCode: {
      javascript: `function findAnagrams(s, p) {
  // Write your solution here
  
}

// Test cases
console.log(findAnagrams("cbaebabacd", "abc")); // Expected: [0,6]
console.log(findAnagrams("abab", "ab")); // Expected: [0,1,2]`,
      python: `def findAnagrams(s, p):
    # Write your solution here
    pass

# Test cases
print(findAnagrams("cbaebabacd", "abc"))  # Expected: [0, 6]
print(findAnagrams("abab", "ab"))  # Expected: [0, 1, 2]`,
      java: `class Solution {
    public static void main(String[] args) {
        System.out.println("[0, 6]");
        System.out.println("[0, 1, 2]");
    }
}`,
    },
    expectedOutput: {
      javascript: "[0,6]\n[0,1,2]",
      python: "[0, 6]\n[0, 1, 2]",
      java: "[0, 6]\n[0, 1, 2]",
    },
  },

  "container-with-most-water": {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Array • Two Pointers",
    description: {
      text: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).",
      notes: [
        "Find two lines that together with the x-axis form a container, such that the container contains the most water.",
        "Return the maximum amount of water a container can store.",
      ],
    },
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The max area of water the container can contain is 49.",
      },
      {
        input: "height = [1,1]",
        output: "1",
      },
    ],
    constraints: ["n == height.length", "2 ≤ n ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"],
    starterCode: {
      javascript: `function maxArea(height) {
  // Write your solution here
  
}

// Test cases
console.log(maxArea([1,8,6,2,5,4,8,3,7])); // Expected: 49
console.log(maxArea([1,1])); // Expected: 1`,
      python: `def maxArea(height):
    # Write your solution here
    pass

# Test cases
print(maxArea([1,8,6,2,5,4,8,3,7]))  # Expected: 49
print(maxArea([1,1]))  # Expected: 1`,
      java: `class Solution {
    public static int maxArea(int[] height) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(maxArea(new int[]{1,8,6,2,5,4,8,3,7})); // Expected: 49
        System.out.println(maxArea(new int[]{1,1})); // Expected: 1
    }
}`,
    },
    expectedOutput: {
      javascript: "49\n1",
      python: "49\n1",
      java: "49\n1",
    },
  },
};

export const LANGUAGE_CONFIG = {
  javascript: {
    name: "JavaScript",
    icon: "/javascript.png",
    monacoLang: "javascript",
  },
  python: {
    name: "Python",
    icon: "/python.png",
    monacoLang: "python",
  },
  java: {
    name: "Java",
    icon: "/java.png",
    monacoLang: "java",
  },
};
