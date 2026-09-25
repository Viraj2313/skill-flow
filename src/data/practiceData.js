export const PATTERN_PROBLEMS = [
  {
    id: 'pp1',
    statement: 'Given an array of integers and a target, find two numbers that add up to the target. Return their indices.',
    answer: 'Hash Map',
    options: ['Sliding Window', 'Two Pointers', 'Hash Map', 'Binary Search', 'DFS/BFS', 'Dynamic Programming'],
    explanation: 'Store each value and its index as you iterate. For each number, check if target - number is already in the map. O(n) time.',
    difficulty: 'easy',
  },
  {
    id: 'pp2',
    statement: 'Given a string, find the length of the longest substring without repeating characters.',
    answer: 'Sliding Window',
    options: ['Sliding Window', 'Two Pointers', 'Hash Map', 'Binary Search', 'Recursion', 'Dynamic Programming'],
    explanation: 'Maintain a window with a set of characters. Shrink from the left when a duplicate is found. O(n).',
    difficulty: 'easy',
  },
  {
    id: 'pp3',
    statement: 'Given a sorted array and a target value, return the index if found, else return where it would be inserted.',
    answer: 'Binary Search',
    options: ['Sliding Window', 'Two Pointers', 'Hash Map', 'Binary Search', 'Greedy', 'DFS/BFS'],
    explanation: 'The array is sorted — this is the classic signal for binary search. Eliminate half the search space each step.',
    difficulty: 'easy',
  },
  {
    id: 'pp4',
    statement: 'Given an array of integers sorted in ascending order, find a pair that sums to a given target.',
    answer: 'Two Pointers',
    options: ['Sliding Window', 'Two Pointers', 'Hash Map', 'Binary Search', 'Greedy', 'Stack'],
    explanation: 'With a sorted array, place one pointer at each end. If sum > target, move right pointer left; if sum < target, move left pointer right.',
    difficulty: 'easy',
  },
  {
    id: 'pp5',
    statement: 'Given a binary tree, find the maximum depth (number of nodes along the longest path from root to leaf).',
    answer: 'DFS/BFS',
    options: ['Sliding Window', 'Two Pointers', 'Hash Map', 'Binary Search', 'DFS/BFS', 'Dynamic Programming'],
    explanation: 'Recursively compute depth of left and right subtrees, return 1 + max(left, right). Classic DFS on a tree.',
    difficulty: 'easy',
  },
  {
    id: 'pp6',
    statement: 'You are given coins of different denominations and a target amount. Find the minimum number of coins needed to make the amount.',
    answer: 'Dynamic Programming',
    options: ['Sliding Window', 'Greedy', 'Hash Map', 'Binary Search', 'DFS/BFS', 'Dynamic Programming'],
    explanation: 'Greedy fails here (e.g. coins [1,3,4], target 6 → greedy gives 4+1+1=3 coins, DP finds 3+3=2 coins). Optimal substructure exists — use DP.',
    difficulty: 'medium',
  },
  {
    id: 'pp7',
    statement: 'Given an array of stock prices (one price per day), find the maximum profit by buying on one day and selling on a later day.',
    answer: 'Greedy',
    options: ['Sliding Window', 'Two Pointers', 'Greedy', 'Binary Search', 'Dynamic Programming', 'Stack'],
    explanation: 'Track the minimum price seen so far and the maximum profit. One pass — no DP needed because you just need the best buy before the best sell.',
    difficulty: 'easy',
  },
  {
    id: 'pp8',
    statement: 'Given a string of parentheses, check if they are balanced (every open bracket has a matching close bracket in the right order).',
    answer: 'Stack',
    options: ['Sliding Window', 'Two Pointers', 'Hash Map', 'Binary Search', 'Stack', 'Dynamic Programming'],
    explanation: 'Push opening brackets onto a stack. When a closing bracket appears, check if it matches the top of the stack. Stack handles the LIFO (last opened, first closed) property.',
    difficulty: 'easy',
  },
  {
    id: 'pp9',
    statement: 'Given a list of intervals, merge all overlapping intervals and return the result.',
    answer: 'Greedy',
    options: ['Sliding Window', 'Two Pointers', 'Greedy', 'Binary Search', 'DFS/BFS', 'Dynamic Programming'],
    explanation: 'Sort by start time. Then greedily merge: if the current interval overlaps with the previous one, extend it. Otherwise add it as a new interval.',
    difficulty: 'medium',
  },
  {
    id: 'pp10',
    statement: 'Given a graph of nodes, find if there is a path between two given nodes.',
    answer: 'DFS/BFS',
    options: ['Sliding Window', 'Two Pointers', 'Hash Map', 'Binary Search', 'DFS/BFS', 'Dynamic Programming'],
    explanation: 'BFS or DFS traversal from the source node. Track visited nodes to avoid cycles. If you reach the destination, a path exists.',
    difficulty: 'easy',
  },
  {
    id: 'pp11',
    statement: 'Given an integer array, find the maximum sum of any contiguous subarray.',
    answer: 'Greedy',
    options: ['Sliding Window', 'Two Pointers', 'Greedy', 'Dynamic Programming', 'DFS/BFS', 'Stack'],
    explanation: "Kadane's algorithm: greedily extend the current subarray if adding the next element helps, otherwise start fresh. O(n) without any DP table.",
    difficulty: 'medium',
  },
  {
    id: 'pp12',
    statement: 'Given a string and a pattern, find all starting indices of the pattern\'s anagrams in the string.',
    answer: 'Sliding Window',
    options: ['Sliding Window', 'Two Pointers', 'Hash Map', 'Binary Search', 'DFS/BFS', 'Dynamic Programming'],
    explanation: 'Use a fixed-size sliding window equal to the length of the pattern. Track character frequencies in the window and compare to the pattern frequency map.',
    difficulty: 'medium',
  },
];

export const TRACE_PROBLEMS = [
  {
    id: 'tr1',
    title: 'Two Sum — Hash Map',
    difficulty: 'easy',
    code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    input: 'nums = [2, 7, 11, 15], target = 9',
    steps: [
      { line: 2, description: 'seen is initialised', variables: { seen: '{}', i: '—', num: '—', complement: '—' } },
      { line: 3, description: 'i=0, num=2', variables: { seen: '{}', i: '0', num: '2', complement: '—' } },
      { line: 4, description: 'complement = 9 - 2', variables: { seen: '{}', i: '0', num: '2', complement: '7' } },
      { line: 5, description: '7 in {} → False', variables: { seen: '{}', i: '0', num: '2', complement: '7' } },
      { line: 7, description: 'store seen[2] = 0', variables: { seen: '{2:0}', i: '0', num: '2', complement: '7' } },
      { line: 3, description: 'i=1, num=7', variables: { seen: '{2:0}', i: '1', num: '7', complement: '—' } },
      { line: 4, description: 'complement = 9 - 7', variables: { seen: '{2:0}', i: '1', num: '7', complement: '2' } },
      { line: 5, description: '2 in {2:0} → True', variables: { seen: '{2:0}', i: '1', num: '7', complement: '2' } },
      { line: 6, description: 'return [seen[2], 1] = [0, 1]', variables: { seen: '{2:0}', i: '1', num: '7', complement: '2' } },
    ],
    questions: [
      { afterStep: 4, question: 'What is `complement` when i=0?', answer: '7' },
      { afterStep: 6, question: 'What is `seen` after the first iteration completes?', answer: '{2: 0}' },
      { afterStep: 8, question: 'What does the function return?', answer: '[0, 1]' },
    ],
  },
  {
    id: 'tr2',
    title: 'Reverse a Linked List',
    difficulty: 'easy',
    code: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
    input: 'head → 1 → 2 → 3 → None',
    steps: [
      { line: 2, description: 'prev = None, curr = node(1)', variables: { prev: 'None', curr: '1', next_node: '—' } },
      { line: 4, description: 'next_node = curr.next = node(2)', variables: { prev: 'None', curr: '1', next_node: '2' } },
      { line: 5, description: 'curr.next = prev = None  →  1→None', variables: { prev: 'None', curr: '1', next_node: '2' } },
      { line: 6, description: 'prev = curr = node(1)', variables: { prev: '1', curr: '1', next_node: '2' } },
      { line: 7, description: 'curr = next_node = node(2)', variables: { prev: '1', curr: '2', next_node: '2' } },
      { line: 4, description: 'next_node = curr.next = node(3)', variables: { prev: '1', curr: '2', next_node: '3' } },
      { line: 5, description: 'curr.next = prev = node(1)  →  2→1→None', variables: { prev: '1', curr: '2', next_node: '3' } },
      { line: 6, description: 'prev = curr = node(2)', variables: { prev: '2', curr: '2', next_node: '3' } },
      { line: 7, description: 'curr = next_node = node(3)', variables: { prev: '2', curr: '3', next_node: '3' } },
    ],
    questions: [
      { afterStep: 2, question: 'After step 1: what does `curr.next` point to after line 5?', answer: 'None' },
      { afterStep: 7, question: 'After processing node 2: what is `prev`?', answer: 'node(2) or 2' },
      { afterStep: 9, question: 'What does the function eventually return?', answer: 'prev (the new head, node 3)' },
    ],
  },
];

export const DEBUG_PROBLEMS = [
  {
    id: 'db1',
    title: 'Binary Search — Off-by-One',
    difficulty: 'easy',
    description: 'This binary search has a bug that causes an infinite loop on certain inputs. Find and fix it.',
    buggyCode: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) / 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    bugLine: 4,
    bugDescription: 'Integer division needed. `/` gives a float in Python 3, making `nums[mid]` fail with a TypeError.',
    fix: 'mid = (left + right) // 2',
    hint: 'What type does `/` return in Python 3 vs `//`?',
  },
  {
    id: 'db2',
    title: 'Fibonacci — Wrong Base Case',
    difficulty: 'easy',
    description: 'This recursive Fibonacci function returns the wrong result for small inputs.',
    buggyCode: `def fib(n):
    if n == 0:
        return 0
    return fib(n - 1) + fib(n - 2)`,
    bugLine: 2,
    bugDescription: 'Missing base case for n == 1. When fib(1) is called, it recurses into fib(0) + fib(-1), which recurses infinitely.',
    fix: 'if n <= 1:\n        return n',
    hint: 'What happens when n=1? Trace through the calls.',
  },
  {
    id: 'db3',
    title: 'Valid Parentheses — Wrong Return',
    difficulty: 'easy',
    description: 'This stack-based checker passes most tests but fails on strings like "(())".',
    buggyCode: `def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in pairs:
            if stack[-1] == pairs[char]:
                stack.pop()
        else:
            stack.append(char)
    return len(stack) == 0`,
    bugLine: 5,
    bugDescription: '`stack[-1]` raises IndexError on an empty stack (e.g. input starts with `)`). Must check `if stack and stack[-1] == ...`.',
    fix: 'if stack and stack[-1] == pairs[char]:',
    hint: 'What happens if the first character is a closing bracket?',
  },
  {
    id: 'db4',
    title: 'Two Sum — Wrong Return Index',
    difficulty: 'easy',
    description: 'This solution always returns the right pair of values but sometimes the wrong indices.',
    buggyCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [i, seen[complement]]
        seen[num] = i`,
    bugLine: 6,
    bugDescription: 'The problem expects indices in the order [earlier, later]. `seen[complement]` holds the earlier index, so it should come first.',
    fix: 'return [seen[complement], i]',
    hint: 'Which index was stored first — `seen[complement]` or `i`?',
  },
  {
    id: 'db5',
    title: 'Reverse Linked List — Lost Reference',
    difficulty: 'medium',
    description: 'This reversal corrupts the list because it loses the reference to the next node before using it.',
    buggyCode: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        curr.next = prev
        prev = curr
        curr = curr.next
    return prev`,
    bugLine: 7,
    bugDescription: '`curr.next` was already overwritten on line 5, so `curr = curr.next` now points to `prev`, not the next node in the original list.',
    fix: 'Save next_node = curr.next before line 5, then use curr = next_node on line 7.',
    hint: 'After line 5 runs, what does `curr.next` point to?',
  },
];
