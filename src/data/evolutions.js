export const EVOLUTIONS = {
  'two-sum-think-it-through': {
    title: 'Two Sum',
    problem: 'Given an array of integers nums and a target, return the indices of the two numbers that add up to target.',
    example: { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
    steps: [
      {
        label: 'Brute Force',
        complexity: { time: 'O(n²)', space: 'O(1)' },
        insight: 'Check every pair. For each element, scan every other element to find the complement. Simple but slow — nested loops kill you at scale.',
        bad: true,
        code: `def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []

# nums = [2, 7, 11, 15], target = 9
# i=0: check (2,7) → 9 ✓ → return [0, 1]
# Worst case: scan ALL pairs → 1M items = 10^12 ops`,
        highlight: [2, 3],
      },
      {
        label: 'The Key Insight',
        complexity: { time: 'O(n²) → O(n)', space: 'O(1) → O(n)' },
        insight: 'Instead of "find the complement by scanning", ask: "have I SEEN the complement before?" A hash map answers that in O(1). Trade space for time.',
        bad: false,
        code: `# What the brute force really does:
# for every nums[i], search for (target - nums[i])

# The insight:
# If I store every number I've SEEN in a hash map,
# I can check if complement exists in O(1).

# I don't need to look FORWARD — I can look BACKWARD.
# By the time I reach nums[j], if complement is in the map,
# the answer is (map[complement], j).`,
        highlight: [],
      },
      {
        label: 'Optimised',
        complexity: { time: 'O(n)', space: 'O(n)' },
        insight: 'One pass. For each number, check if its complement is already in the map. If yes, done. If no, store it. Single loop, constant-time lookup.',
        bad: false,
        code: `def two_sum(nums, target):
    seen = {}                          # num → index

    for i, num in enumerate(nums):
        complement = target - num

        if complement in seen:         # O(1) lookup
            return [seen[complement], i]

        seen[num] = i                  # store for future

    return []

# nums = [2, 7, 11, 15], target = 9
# i=0: complement=7, not in seen → store {2:0}
# i=1: complement=2, IN seen → return [0, 1] ✓`,
        highlight: [3, 4, 5, 6],
      },
    ],
  },

  'sliding-window-intro': {
    title: 'Sliding Window — Max Sum Subarray',
    problem: 'Find the maximum sum of any contiguous subarray of size k.',
    example: { input: 'nums = [2, 1, 5, 1, 3, 2], k = 3', output: '9  (subarray [5, 1, 3])' },
    steps: [
      {
        label: 'Brute Force',
        complexity: { time: 'O(n·k)', space: 'O(1)' },
        insight: 'For every starting position, sum the next k elements. Lots of repeated addition — you recompute most of the window every time.',
        bad: true,
        code: `def max_sum_subarray(nums, k):
    n = len(nums)
    max_sum = float('-inf')

    for i in range(n - k + 1):
        window_sum = 0
        for j in range(i, i + k):   # recompute ENTIRE window
            window_sum += nums[j]
        max_sum = max(max_sum, window_sum)

    return max_sum

# For k=3, n=6: computes 4 windows × 3 additions each
# Wasted work: window [2,1,5] → [1,5,1] shares [1,5]!`,
        highlight: [6, 7],
      },
      {
        label: 'The Key Insight',
        complexity: { time: 'O(n·k) → O(n)', space: 'O(1)' },
        insight: 'Adjacent windows share k-1 elements. Instead of recomputing the whole sum, just subtract the element leaving and add the element entering. One operation per slide.',
        bad: false,
        code: `# Window [2, 1, 5] has sum = 8
# Slide right → Window [1, 5, 1] has sum = ?

# Brute force: 1 + 5 + 1 = 7  (3 ops)

# Insight:
# new_sum = old_sum - nums[left] + nums[right]
#         = 8       - 2          + 1
#         = 7  (1 op!)

# The "window" slides, not restarts.`,
        highlight: [],
      },
      {
        label: 'Optimised',
        complexity: { time: 'O(n)', space: 'O(1)' },
        insight: 'Build the first window, then slide it across in a single pass. Each step is O(1): subtract what left, add what entered.',
        bad: false,
        code: `def max_sum_subarray(nums, k):
    window_sum = sum(nums[:k])          # first window O(k)
    max_sum    = window_sum

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]  # slide O(1)
        max_sum = max(max_sum, window_sum)

    return max_sum

# nums=[2,1,5,1,3,2], k=3
# Initial: 2+1+5 = 8
# Slide: 8 - 2 + 1 = 7
# Slide: 7 - 1 + 3 = 9  ← max
# Slide: 9 - 5 + 2 = 6`,
        highlight: [5],
      },
    ],
  },

  'strings-palindrome': {
    title: 'Valid Palindrome',
    problem: 'Check if a string reads the same forwards and backwards.',
    example: { input: '"racecar"', output: 'True' },
    steps: [
      {
        label: 'Brute Force',
        complexity: { time: 'O(n)', space: 'O(n)' },
        insight: 'Reverse the string and compare. Correct, but allocates O(n) extra memory for the reversed copy. Not necessary.',
        bad: true,
        code: `def is_palindrome(s):
    reversed_s = s[::-1]        # O(n) extra space!
    return s == reversed_s

# "racecar"[::-1] → "racecar" → True
# "hello"[::-1]   → "olleh"   → False

# Works, but creates a full copy of the string.
# For a 1GB string this matters.`,
        highlight: [2],
      },
      {
        label: 'The Key Insight',
        complexity: { time: 'O(n)', space: 'O(n) → O(1)' },
        insight: 'You never need the full reversed string. Just compare character at position i with character at position n-1-i. If any pair mismatches, it\'s not a palindrome. Stop early.',
        bad: false,
        code: `# "racecar"
#  r a c e c a r
#  ↑           ↑   compare → match
#    ↑       ↑     compare → match
#      ↑   ↑       compare → match
#        ↑         middle, done

# Two pointers: left starts at 0, right starts at end.
# Move inward. If they ever differ → not a palindrome.`,
        highlight: [],
      },
      {
        label: 'Optimised',
        complexity: { time: 'O(n)', space: 'O(1)' },
        insight: 'Two pointers, moving inward. Same time complexity as the reverse approach but zero extra memory allocation.',
        bad: false,
        code: `def is_palindrome(s):
    left, right = 0, len(s) - 1

    while left < right:
        if s[left] != s[right]:
            return False
        left  += 1
        right -= 1

    return True

# Time: O(n)  — at most n/2 iterations
# Space: O(1) — only two integer pointers
# Bonus: exits EARLY on first mismatch`,
        highlight: [3, 4, 5],
      },
    ],
  },

  'linked-list-reverse': {
    title: 'Reverse a Linked List',
    problem: 'Reverse a singly linked list in-place.',
    example: { input: '1 → 2 → 3 → 4 → 5', output: '5 → 4 → 3 → 2 → 1' },
    steps: [
      {
        label: 'Naive: Extra Array',
        complexity: { time: 'O(n)', space: 'O(n)' },
        insight: 'Collect all values into an array, reverse it, overwrite each node\'s value. It works but uses O(n) extra space and misses the point of linked lists.',
        bad: true,
        code: `def reverse_list(head):
    values = []
    curr = head
    while curr:                     # collect all values
        values.append(curr.val)
        curr = curr.next

    curr = head
    for val in reversed(values):    # overwrite each node
        curr.val = val
        curr = curr.next

    return head

# O(n) extra space for the values array.
# A real interviewer will immediately ask for in-place.`,
        highlight: [3, 4, 8, 9],
      },
      {
        label: 'The Key Insight',
        complexity: { time: 'O(n)', space: 'O(n) → O(1)' },
        insight: 'You don\'t need extra space. Just reverse the pointers one by one. Each node\'s next should point BACKWARD. Keep track of prev and next to avoid losing the chain.',
        bad: false,
        code: `# 1 → 2 → 3 → None  (before)
# None ← 1 ← 2 ← 3   (after)

# At each node, do THREE things:
# 1. Save next (or you lose the rest of the list)
# 2. Point curr.next BACKWARD to prev
# 3. Advance prev and curr forward

# Three pointers: prev, curr, next_node`,
        highlight: [],
      },
      {
        label: 'Optimised',
        complexity: { time: 'O(n)', space: 'O(1)' },
        insight: 'Three pointers move forward together. At each step, flip the current pointer backward, then advance. Clean, in-place, O(1) space.',
        bad: false,
        code: `def reverse_list(head):
    prev = None
    curr = head

    while curr:
        next_node  = curr.next   # 1. save next
        curr.next  = prev        # 2. flip pointer
        prev       = curr        # 3. advance prev
        curr       = next_node   # 4. advance curr

    return prev                  # prev is new head

# Trace on 1→2→3→None:
# Step 1: None←1  curr=2
# Step 2: 1←2     curr=3
# Step 3: 2←3     curr=None → done, return 3`,
        highlight: [5, 6, 7, 8],
      },
    ],
  },

  'recursion-fibonacci': {
    title: 'Fibonacci — Eliminating Waste',
    problem: 'Compute the nth Fibonacci number efficiently.',
    example: { input: 'n = 10', output: '55' },
    steps: [
      {
        label: 'Naive Recursion',
        complexity: { time: 'O(2ⁿ)', space: 'O(n)' },
        insight: 'The classic recursive definition. Elegant but catastrophically slow — it recomputes the same values over and over. fib(40) does over a billion operations.',
        bad: true,
        code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# fib(5) call tree:
#           fib(5)
#          /      \\
#       fib(4)   fib(3)
#       /    \\   /    \\
#    fib(3) fib(2) fib(2) fib(1)
#    ...
# fib(2) alone is computed 3 times!`,
        highlight: [4],
      },
      {
        label: 'Memoization',
        complexity: { time: 'O(2ⁿ) → O(n)', space: 'O(n)' },
        insight: 'Cache every result. If fib(k) was already computed, return the cached value instantly. Each unique subproblem is solved exactly once.',
        bad: false,
        code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# Now fib(2) is computed ONCE and cached.
# fib(40): 41 unique calls instead of 1B+
# This is top-down dynamic programming.`,
        highlight: [2, 3],
      },
      {
        label: 'Bottom-Up DP',
        complexity: { time: 'O(n)', space: 'O(1)' },
        insight: 'No recursion needed at all. Build up from fib(0) and fib(1). Each step only needs the previous two values — drop the array entirely.',
        bad: false,
        code: `def fib(n):
    if n <= 1:
        return n

    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr

    return curr

# n=5:
# prev=0, curr=1
# prev=1, curr=1
# prev=1, curr=2
# prev=2, curr=3
# prev=3, curr=5  ← answer`,
        highlight: [5, 6],
      },
    ],
  },
};

export const EVOLUTION_LESSON_MAP = {
  'two-sum-think-it-through': 'two-sum-think-it-through',
  'sliding-window-intro':     'sliding-window-intro',
  'strings-palindrome':       'strings-palindrome',
  'linked-list-reverse':      'linked-list-reverse',
  'recursion-fibonacci':      'recursion-fibonacci',
};
