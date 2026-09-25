export const DECONSTRUCT_PROBLEMS = [
  {
    id: 'two-sum-hash',
    title: 'Two Sum',
    concept: 'Hash Map → O(n)',
    difficulty: 'easy',
    intro: 'This O(n) solution finds a pair summing to target using a hash map. The naive approach uses nested loops — O(n²).',
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    questions: [
      {
        id: 'q1',
        type: 'insight',
        label: 'Key Insight',
        prompt: 'What specifically does the hash map let us SKIP that the O(n²) approach can\'t? Don\'t just say "hash map lookup" — explain what expensive operation we\'re eliminating.',
      },
      {
        id: 'q2',
        type: 'invariant',
        label: 'Loop Invariant',
        prompt: 'At the START of each iteration, what exactly does `seen` contain? State it precisely in terms of the loop index i.',
      },
      {
        id: 'q3',
        type: 'break',
        label: 'Break It',
        prompt: 'If you moved `seen[num] = i` to BEFORE the complement check, give a specific input where the result would be wrong. Explain why.',
      },
    ],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    concept: 'Divide & Conquer → O(log n)',
    difficulty: 'easy',
    intro: 'Classic iterative binary search on a sorted array. This eliminates half the search space every step — O(log n).',
    code: `def binary_search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`,
    questions: [
      {
        id: 'q1',
        type: 'insight',
        label: 'Key Insight',
        prompt: 'Why can we safely eliminate half the array each step? What property of the input makes this valid? Would this work on an unsorted array?',
      },
      {
        id: 'q2',
        type: 'invariant',
        label: 'Loop Invariant',
        prompt: 'At every iteration, what is GUARANTEED to be true about `l` and `r` — specifically about where the target could be?',
      },
      {
        id: 'q3',
        type: 'break',
        label: 'Break It',
        prompt: 'Why is `mid = l + (r - l) // 2` safer than `mid = (l + r) // 2`? Give a specific scenario where the simpler version would cause a bug.',
      },
    ],
  },
  {
    id: 'floyd-cycle',
    title: 'Linked List Cycle Detection',
    concept: 'Floyd\'s Two-Pointer → O(n)',
    difficulty: 'medium',
    intro: 'Floyd\'s algorithm uses two pointers — slow moves one step, fast moves two. If there\'s a cycle they must meet.',
    code: `def has_cycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
    questions: [
      {
        id: 'q1',
        type: 'insight',
        label: 'Key Insight',
        prompt: 'WHY must fast catch slow if there\'s a cycle? Prove it mathematically: if slow is at position s and fast at f inside the cycle, what happens each step?',
      },
      {
        id: 'q2',
        type: 'invariant',
        label: 'Loop Invariant',
        prompt: 'What does the while condition `fast and fast.next` specifically protect against? What would happen without it — give a concrete example.',
      },
      {
        id: 'q3',
        type: 'break',
        label: 'Break It',
        prompt: 'What if both slow and fast started at head and moved at the SAME speed (one step each)? Would the cycle be detected? Why or why not?',
      },
    ],
  },
  {
    id: 'sliding-window-unique',
    title: 'Longest Unique Substring',
    concept: 'Sliding Window → O(n)',
    difficulty: 'medium',
    intro: 'Find the longest substring with no repeating characters. Uses a sliding window — expand right, shrink left when a duplicate appears.',
    code: `def length_of_longest_substring(s):
    seen = {}
    left = 0
    best = 0
    for right, char in enumerate(s):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1
        seen[char] = right
        best = max(best, right - left + 1)
    return best`,
    questions: [
      {
        id: 'q1',
        type: 'insight',
        label: 'Key Insight',
        prompt: 'Why do we only move `left` forward, never backward? What invariant about the window [left, right] does this maintain?',
      },
      {
        id: 'q2',
        type: 'invariant',
        label: 'Invariant',
        prompt: 'At any point, what property is GUARANTEED true about the substring s[left..right]? State it precisely.',
      },
      {
        id: 'q3',
        type: 'break',
        label: 'Break It',
        prompt: 'The condition is `seen[char] >= left`, not just `char in seen`. Give an input where removing the `>= left` check would return the wrong answer.',
      },
    ],
  },
  {
    id: 'valid-parens',
    title: 'Valid Parentheses',
    concept: 'Stack → O(n)',
    difficulty: 'easy',
    intro: 'Check if a bracket string is valid using a stack. Push opening brackets, pop and match on closing brackets.',
    code: `def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in '([{':
            stack.append(char)
        elif char in ')]}':
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    return len(stack) == 0`,
    questions: [
      {
        id: 'q1',
        type: 'insight',
        label: 'Key Insight',
        prompt: 'Why does a stack naturally solve nested bracket matching? What property of stacks directly mirrors the LIFO nature of brackets?',
      },
      {
        id: 'q2',
        type: 'invariant',
        label: 'Loop Invariant',
        prompt: 'At any point in the loop, what does the stack contain — and what does it represent about the brackets we\'ve seen so far?',
      },
      {
        id: 'q3',
        type: 'break',
        label: 'Break It',
        prompt: 'Why does the function return `len(stack) == 0` at the end instead of just `True`? Give an input where returning `True` unconditionally would be wrong.',
      },
    ],
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    concept: 'Sort + Linear Scan → O(n log n)',
    difficulty: 'medium',
    intro: 'Merge all overlapping intervals. Sort by start time, then scan once — merging greedily when the current interval overlaps the last merged one.',
    code: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            merged[-1][1] = max(last[1], end)
        else:
            merged.append([start, end])
    return merged`,
    questions: [
      {
        id: 'q1',
        type: 'insight',
        label: 'Key Insight',
        prompt: 'Why does sorting by start time allow us to merge in a SINGLE pass? What would go wrong if we didn\'t sort first?',
      },
      {
        id: 'q2',
        type: 'invariant',
        label: 'Loop Invariant',
        prompt: 'At each step, what is guaranteed about every interval in `merged` relative to each other? State the property precisely.',
      },
      {
        id: 'q3',
        type: 'break',
        label: 'Break It',
        prompt: 'Intervals [1,4] and [4,5] share the endpoint 4. Does `start <= last[1]` handle this correctly? What would the output be, and is it the expected result?',
      },
    ],
  },
];
