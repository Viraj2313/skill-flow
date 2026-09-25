export const COMPLEXITY_OPTIONS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'];

export const COMPLEXITY_PROBLEMS = [
  {
    id: 'cp-1',
    title: 'Linear Search',
    difficulty: 'easy',
    code: `def linear_search(nums, target):
    for i in range(len(nums)):
        if nums[i] == target:
            return i
    return -1`,
    bottleneckLine: 2,
    correct: 2,
    explanation: 'The for loop on line 2 visits every element once in the worst case. With n elements that is n iterations — O(n). Lines 3-4 are O(1) each, but the loop wraps them n times.',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'cp-2',
    title: 'Binary Search',
    difficulty: 'easy',
    code: `def binary_search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target: return mid
        elif nums[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1`,
    bottleneckLine: 3,
    correct: 1,
    explanation: 'Line 3 — the while loop. Each iteration halves the search space. Starting with n elements: n → n/2 → n/4 → ... → 1. That takes log₂(n) iterations — O(log n).',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'cp-3',
    title: 'Hash Map Lookup',
    difficulty: 'easy',
    code: `def get_value(hashmap, key):
    return hashmap[key]`,
    bottleneckLine: 2,
    correct: 0,
    explanation: 'Line 2 — dictionary lookup in Python. Hash maps compute the index directly from the key using a hash function. Regardless of how many keys exist, it is a single O(1) operation.',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'cp-4',
    title: 'Bubble Sort',
    difficulty: 'medium',
    code: `def bubble_sort(nums):
    n = len(nums)
    for i in range(n):
        for j in range(n - i - 1):
            if nums[j] > nums[j+1]:
                nums[j], nums[j+1] = nums[j+1], nums[j]
    return nums`,
    bottleneckLine: 4,
    correct: 4,
    explanation: 'Line 4 — the inner loop. The outer loop (line 3) runs n times. For each outer iteration, the inner loop runs up to n times. Total comparisons ≈ n²/2 → O(n²). The swap on line 5 is O(1) inside the loops.',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'cp-5',
    title: 'Fibonacci (Naive Recursion)',
    difficulty: 'medium',
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)`,
    bottleneckLine: 4,
    correct: 5,
    explanation: 'Line 4 — two recursive calls per invocation. Each call spawns two more, doubling the work at every level. The recursion tree has ~2^n nodes total — O(2^n). This is why memoization matters so much for Fibonacci.',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'cp-6',
    title: 'Check Palindrome',
    difficulty: 'easy',
    code: `def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    return True`,
    bottleneckLine: 3,
    correct: 2,
    explanation: 'Line 3 — the while loop. The two pointers move toward each other, meeting in the middle. The loop runs at most n/2 times. Dropping constants: O(n). Each comparison inside is O(1).',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'cp-7',
    title: 'Print All Pairs',
    difficulty: 'medium',
    code: `def print_pairs(nums):
    n = len(nums)
    for i in range(n):
        for j in range(i+1, n):
            print(nums[i], nums[j])`,
    bottleneckLine: 4,
    correct: 4,
    explanation: 'Line 4 — inner loop. For n=4: j runs 3, 2, 1 times → total = n(n-1)/2 = O(n²) pairs printed. Even though the inner loop gets shorter each time, the total work is still quadratic.',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'cp-8',
    title: 'Two Sum with Hash Map',
    difficulty: 'easy',
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    bottleneckLine: 3,
    correct: 2,
    explanation: 'Line 3 — single pass through the array. The loop runs n times. Line 5 (`complement in seen`) is O(1) for a hash map. Total: O(n). This is what makes the hash map approach so powerful — it turns O(n²) brute force into O(n).',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'cp-9',
    title: 'Fast Power',
    difficulty: 'hard',
    code: `def fast_pow(base, exp):
    if exp == 0:
        return 1
    if exp % 2 == 0:
        half = fast_pow(base, exp // 2)
        return half * half
    return base * fast_pow(base, exp - 1)`,
    bottleneckLine: 5,
    correct: 1,
    explanation: 'Line 5 — the recursive call halves exp each time (when exp is even). For even exponents the recursion depth is log₂(exp). Odd exponents subtract 1 first, making the next call even. Total depth: O(log n).',
    spaceComplexity: 'O(log n)',
  },
  {
    id: 'cp-10',
    title: 'Sort Then Search',
    difficulty: 'medium',
    code: `def find_pair_sum(nums, target):
    nums.sort()
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target: return True
        elif s < target: l += 1
        else: r -= 1
    return False`,
    bottleneckLine: 2,
    correct: 3,
    explanation: 'Line 2 — `nums.sort()` dominates. Python\'s sort is O(n log n). The two-pointer loop on lines 4-8 is only O(n). The overall complexity is determined by the most expensive step: O(n log n).',
    spaceComplexity: 'O(log n)',
  },
  {
    id: 'cp-11',
    title: 'Binary Tree Height',
    difficulty: 'medium',
    code: `def height(root):
    if root is None:
        return 0
    left  = height(root.left)
    right = height(root.right)
    return 1 + max(left, right)`,
    bottleneckLine: 4,
    correct: 2,
    explanation: 'Lines 4-5 — recursive calls. Every node in the tree is visited exactly once (once for root.left, once for root.right). A tree with n nodes → n recursive calls → O(n). The work per node (max + add) is O(1).',
    spaceComplexity: 'O(h)',
  },
  {
    id: 'cp-12',
    title: 'Find All Duplicates',
    difficulty: 'easy',
    code: `def find_duplicates(nums):
    seen = set()
    duplicates = []
    for num in nums:
        if num in seen:
            duplicates.append(num)
        seen.add(num)
    return duplicates`,
    bottleneckLine: 4,
    correct: 2,
    explanation: 'Line 4 — the for loop runs n times. Set lookup on line 5 is O(1). Set add on line 7 is O(1). Total: O(n). The set uses O(n) space in the worst case.',
    spaceComplexity: 'O(n)',
  },
];
