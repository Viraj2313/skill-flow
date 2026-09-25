export const ALGORITHMS = [
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Arrays',
    icon: 'manage_search',
    renderType: 'array',
    code: `def binary_search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`,
    frames: [
      {
        message: 'Array: [1,3,5,7,9,11,13,15,17,19]. Target = 13. Set l=0, r=9.',
        variables: { l: 0, r: 9, mid: '—', target: 13 },
        codeLine: 2,
        elements: [
          { v: 1,  state: 'active', pointers: ['l'] },
          { v: 3,  state: 'active', pointers: [] },
          { v: 5,  state: 'active', pointers: [] },
          { v: 7,  state: 'active', pointers: [] },
          { v: 9,  state: 'active', pointers: [] },
          { v: 11, state: 'active', pointers: [] },
          { v: 13, state: 'active', pointers: [] },
          { v: 15, state: 'active', pointers: [] },
          { v: 17, state: 'active', pointers: [] },
          { v: 19, state: 'active', pointers: ['r'] },
        ],
      },
      {
        message: 'mid = (0+9)//2 = 4. nums[4]=9. 9 < 13 → target in right half. Move l = 5.',
        variables: { l: 0, r: 9, mid: 4, target: 13 },
        codeLine: 7,
        elements: [
          { v: 1,  state: 'eliminated', pointers: [] },
          { v: 3,  state: 'eliminated', pointers: [] },
          { v: 5,  state: 'eliminated', pointers: [] },
          { v: 7,  state: 'eliminated', pointers: [] },
          { v: 9,  state: 'mid',        pointers: [] },
          { v: 11, state: 'active',     pointers: [] },
          { v: 13, state: 'active',     pointers: [] },
          { v: 15, state: 'active',     pointers: [] },
          { v: 17, state: 'active',     pointers: [] },
          { v: 19, state: 'active',     pointers: ['r'] },
        ],
      },
      {
        message: 'l=5, r=9. mid=(5+9)//2=7. nums[7]=15. 15 > 13 → target in left half. Move r = 6.',
        variables: { l: 5, r: 9, mid: 7, target: 13 },
        codeLine: 9,
        elements: [
          { v: 1,  state: 'eliminated', pointers: [] },
          { v: 3,  state: 'eliminated', pointers: [] },
          { v: 5,  state: 'eliminated', pointers: [] },
          { v: 7,  state: 'eliminated', pointers: [] },
          { v: 9,  state: 'eliminated', pointers: [] },
          { v: 11, state: 'active',     pointers: ['l'] },
          { v: 13, state: 'active',     pointers: [] },
          { v: 15, state: 'mid',        pointers: [] },
          { v: 17, state: 'eliminated', pointers: [] },
          { v: 19, state: 'eliminated', pointers: ['r'] },
        ],
      },
      {
        message: 'l=5, r=6. mid=(5+6)//2=5. nums[5]=11. 11 < 13 → move l = 6.',
        variables: { l: 5, r: 6, mid: 5, target: 13 },
        codeLine: 7,
        elements: [
          { v: 1,  state: 'eliminated', pointers: [] },
          { v: 3,  state: 'eliminated', pointers: [] },
          { v: 5,  state: 'eliminated', pointers: [] },
          { v: 7,  state: 'eliminated', pointers: [] },
          { v: 9,  state: 'eliminated', pointers: [] },
          { v: 11, state: 'mid',        pointers: ['l'] },
          { v: 13, state: 'active',     pointers: ['r'] },
          { v: 15, state: 'eliminated', pointers: [] },
          { v: 17, state: 'eliminated', pointers: [] },
          { v: 19, state: 'eliminated', pointers: [] },
        ],
      },
      {
        message: '✓ l=6, r=6. mid=6. nums[6]=13 === target. Found at index 6!',
        variables: { l: 6, r: 6, mid: 6, target: 13 },
        codeLine: 5,
        elements: [
          { v: 1,  state: 'eliminated', pointers: [] },
          { v: 3,  state: 'eliminated', pointers: [] },
          { v: 5,  state: 'eliminated', pointers: [] },
          { v: 7,  state: 'eliminated', pointers: [] },
          { v: 9,  state: 'eliminated', pointers: [] },
          { v: 11, state: 'eliminated', pointers: [] },
          { v: 13, state: 'found',      pointers: ['l', 'mid', 'r'] },
          { v: 15, state: 'eliminated', pointers: [] },
          { v: 17, state: 'eliminated', pointers: [] },
          { v: 19, state: 'eliminated', pointers: [] },
        ],
      },
    ],
  },

  {
    id: 'two-pointer',
    name: 'Two Pointer',
    category: 'Arrays',
    icon: 'sync_alt',
    renderType: 'array',
    code: `def two_sum_sorted(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        elif s < target:
            l += 1
        else:
            r -= 1
    return []`,
    frames: [
      {
        message: 'Array: [2,7,11,15]. Target = 9. Place pointers at both ends.',
        variables: { l: 0, r: 3, sum: '—', target: 9 },
        codeLine: 2,
        elements: [
          { v: 2,  state: 'active', pointers: ['l'] },
          { v: 7,  state: 'active', pointers: [] },
          { v: 11, state: 'active', pointers: [] },
          { v: 15, state: 'active', pointers: ['r'] },
        ],
      },
      {
        message: 'sum = nums[0]+nums[3] = 2+15 = 17. 17 > 9 → too large, move r left.',
        variables: { l: 0, r: 3, sum: 17, target: 9 },
        codeLine: 9,
        elements: [
          { v: 2,  state: 'active',     pointers: ['l'] },
          { v: 7,  state: 'active',     pointers: [] },
          { v: 11, state: 'active',     pointers: [] },
          { v: 15, state: 'eliminated', pointers: ['r'] },
        ],
      },
      {
        message: 'sum = nums[0]+nums[2] = 2+11 = 13. 13 > 9 → still too large, move r left.',
        variables: { l: 0, r: 2, sum: 13, target: 9 },
        codeLine: 9,
        elements: [
          { v: 2,  state: 'active',     pointers: ['l'] },
          { v: 7,  state: 'active',     pointers: [] },
          { v: 11, state: 'eliminated', pointers: ['r'] },
          { v: 15, state: 'eliminated', pointers: [] },
        ],
      },
      {
        message: '✓ sum = nums[0]+nums[1] = 2+7 = 9 === target. Return [0, 1].',
        variables: { l: 0, r: 1, sum: 9, target: 9 },
        codeLine: 5,
        elements: [
          { v: 2,  state: 'found',      pointers: ['l'] },
          { v: 7,  state: 'found',      pointers: ['r'] },
          { v: 11, state: 'eliminated', pointers: [] },
          { v: 15, state: 'eliminated', pointers: [] },
        ],
      },
    ],
  },

  {
    id: 'sliding-window',
    name: 'Sliding Window',
    category: 'Arrays',
    icon: 'view_column',
    renderType: 'sliding',
    code: `def max_sum_subarray(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i-k]
        max_sum = max(max_sum, window_sum)
    return max_sum`,
    frames: [
      {
        message: 'Array: [2,1,5,1,3,2]. Window size k=3. Initial window sum = 2+1+5 = 8.',
        variables: { windowStart: 0, windowEnd: 2, windowSum: 8, maxSum: 8 },
        codeLine: 2,
        elements: [
          { v: 2, state: 'window' },
          { v: 1, state: 'window' },
          { v: 5, state: 'window' },
          { v: 1, state: 'active' },
          { v: 3, state: 'active' },
          { v: 2, state: 'active' },
        ],
      },
      {
        message: 'Slide right: remove nums[0]=2, add nums[3]=1. Sum = 8-2+1 = 7. Max stays 8.',
        variables: { windowStart: 1, windowEnd: 3, windowSum: 7, maxSum: 8 },
        codeLine: 5,
        elements: [
          { v: 2, state: 'eliminated' },
          { v: 1, state: 'window' },
          { v: 5, state: 'window' },
          { v: 1, state: 'window' },
          { v: 3, state: 'active' },
          { v: 2, state: 'active' },
        ],
      },
      {
        message: 'Slide right: remove nums[1]=1, add nums[4]=3. Sum = 7-1+3 = 9. New max = 9!',
        variables: { windowStart: 2, windowEnd: 4, windowSum: 9, maxSum: 9 },
        codeLine: 5,
        elements: [
          { v: 2, state: 'eliminated' },
          { v: 1, state: 'eliminated' },
          { v: 5, state: 'window' },
          { v: 1, state: 'window' },
          { v: 3, state: 'window' },
          { v: 2, state: 'active' },
        ],
      },
      {
        message: 'Slide right: remove nums[2]=5, add nums[5]=2. Sum = 9-5+2 = 6. Max stays 9.',
        variables: { windowStart: 3, windowEnd: 5, windowSum: 6, maxSum: 9 },
        codeLine: 5,
        elements: [
          { v: 2, state: 'eliminated' },
          { v: 1, state: 'eliminated' },
          { v: 5, state: 'eliminated' },
          { v: 1, state: 'window' },
          { v: 3, state: 'window' },
          { v: 2, state: 'window' },
        ],
      },
      {
        message: '✓ Loop ends. Maximum sum subarray of length 3 = 9 (elements [5,1,3]).',
        variables: { windowStart: 2, windowEnd: 4, windowSum: 9, maxSum: 9 },
        codeLine: 7,
        elements: [
          { v: 2, state: 'eliminated' },
          { v: 1, state: 'eliminated' },
          { v: 5, state: 'found' },
          { v: 1, state: 'found' },
          { v: 3, state: 'found' },
          { v: 2, state: 'eliminated' },
        ],
      },
    ],
  },

  {
    id: 'linked-list-reverse',
    name: 'Reverse Linked List',
    category: 'Linked List',
    icon: 'swap_horiz',
    renderType: 'linkedlist',
    code: `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev`,
    frames: [
      {
        message: 'Initial: 1→2→3→4→5. prev=None, curr=node(1).',
        variables: { prev: 'None', curr: 1, next: '—' },
        nodes: [1, 2, 3, 4, 5],
        currIdx: 0,
        prevIdx: null,
        reversed: [],
      },
      {
        message: 'next=2. Reverse link: 1.next = None. Move prev=1, curr=2.',
        variables: { prev: 1, curr: 2, next: 2 },
        nodes: [1, 2, 3, 4, 5],
        currIdx: 1,
        prevIdx: 0,
        reversed: [0],
      },
      {
        message: 'next=3. Reverse link: 2.next = 1. Move prev=2, curr=3.',
        variables: { prev: 2, curr: 3, next: 3 },
        nodes: [1, 2, 3, 4, 5],
        currIdx: 2,
        prevIdx: 1,
        reversed: [0, 1],
      },
      {
        message: 'next=4. Reverse link: 3.next = 2. Move prev=3, curr=4.',
        variables: { prev: 3, curr: 4, next: 4 },
        nodes: [1, 2, 3, 4, 5],
        currIdx: 3,
        prevIdx: 2,
        reversed: [0, 1, 2],
      },
      {
        message: 'next=5. Reverse link: 4.next = 3. Move prev=4, curr=5.',
        variables: { prev: 4, curr: 5, next: 5 },
        nodes: [1, 2, 3, 4, 5],
        currIdx: 4,
        prevIdx: 3,
        reversed: [0, 1, 2, 3],
      },
      {
        message: '✓ next=None. Reverse link: 5.next = 4. curr=None → loop ends. Return prev=5. List is now 5→4→3→2→1.',
        variables: { prev: 5, curr: 'None', next: 'None' },
        nodes: [1, 2, 3, 4, 5],
        currIdx: null,
        prevIdx: 4,
        reversed: [0, 1, 2, 3, 4],
      },
    ],
  },

  {
    id: 'tree-dfs',
    name: 'Tree DFS (In-order)',
    category: 'Trees',
    icon: 'account_tree',
    renderType: 'tree',
    code: `def inorder(root, result=[]):
    if root is None:
        return
    inorder(root.left, result)
    result.append(root.val)
    inorder(root.right, result)
    return result`,
    treeNodes: [
      { id: 0, val: 4, left: 1, right: 2, x: 240, y: 36 },
      { id: 1, val: 2, left: 3, right: 4, x: 120, y: 116 },
      { id: 2, val: 6, left: 5, right: 6, x: 360, y: 116 },
      { id: 3, val: 1, left: null, right: null, x: 60,  y: 196 },
      { id: 4, val: 3, left: null, right: null, x: 180, y: 196 },
      { id: 5, val: 5, left: null, right: null, x: 300, y: 196 },
      { id: 6, val: 7, left: null, right: null, x: 420, y: 196 },
    ],
    frames: [
      {
        message: 'inorder(4). Go left recursively until leaf.',
        result: [],
        activeNode: 0,
        visitedNodes: [],
      },
      {
        message: 'inorder(2). Go left.',
        result: [],
        activeNode: 1,
        visitedNodes: [],
      },
      {
        message: 'inorder(1). Left is None. Append 1 to result.',
        result: [1],
        activeNode: 3,
        visitedNodes: [3],
      },
      {
        message: 'Back at node 2. Append 2 to result.',
        result: [1, 2],
        activeNode: 1,
        visitedNodes: [3, 1],
      },
      {
        message: 'inorder(3). Left is None. Append 3 to result.',
        result: [1, 2, 3],
        activeNode: 4,
        visitedNodes: [3, 1, 4],
      },
      {
        message: 'Back at node 4 (root). Append 4 to result.',
        result: [1, 2, 3, 4],
        activeNode: 0,
        visitedNodes: [3, 1, 4, 0],
      },
      {
        message: 'inorder(6). Go left: inorder(5). Append 5.',
        result: [1, 2, 3, 4, 5],
        activeNode: 5,
        visitedNodes: [3, 1, 4, 0, 5],
      },
      {
        message: 'Back at node 6. Append 6.',
        result: [1, 2, 3, 4, 5, 6],
        activeNode: 2,
        visitedNodes: [3, 1, 4, 0, 5, 2],
      },
      {
        message: '✓ inorder(7). Append 7. Result = [1,2,3,4,5,6,7]. In-order visits nodes sorted!',
        result: [1, 2, 3, 4, 5, 6, 7],
        activeNode: 6,
        visitedNodes: [3, 1, 4, 0, 5, 2, 6],
      },
    ],
  },

  {
    id: 'graph-bfs',
    name: 'Graph BFS',
    category: 'Graphs',
    icon: 'hub',
    renderType: 'graph',
    code: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                queue.append(nb)`,
    graphNodes: [
      { id: 0, label: '0', x: 180, y: 130 },
      { id: 1, label: '1', x: 320, y: 70  },
      { id: 2, label: '2', x: 80,  y: 210 },
      { id: 3, label: '3', x: 440, y: 130 },
      { id: 4, label: '4', x: 320, y: 210 },
    ],
    graphEdges: [[0,1],[0,2],[1,3],[1,4],[2,4]],
    frames: [
      {
        message: 'Start BFS from node 0. visited={0}, queue=[0].',
        nodeStates: ['active', 'unvisited', 'unvisited', 'unvisited', 'unvisited'],
        queue: [0],
        result: [],
      },
      {
        message: 'Pop 0. Visit neighbours 1, 2. visited={0,1,2}, queue=[1,2].',
        nodeStates: ['visited', 'queued', 'queued', 'unvisited', 'unvisited'],
        queue: [1, 2],
        result: [0],
      },
      {
        message: 'Pop 1. Neighbours: 0(visited), 3, 4. Add 3, 4. queue=[2,3,4].',
        nodeStates: ['visited', 'visited', 'queued', 'queued', 'queued'],
        queue: [2, 3, 4],
        result: [0, 1],
      },
      {
        message: 'Pop 2. Neighbours: 0(visited), 4(visited). Nothing to add. queue=[3,4].',
        nodeStates: ['visited', 'visited', 'visited', 'queued', 'queued'],
        queue: [3, 4],
        result: [0, 1, 2],
      },
      {
        message: 'Pop 3. Neighbour 1(visited). Nothing to add. queue=[4].',
        nodeStates: ['visited', 'visited', 'visited', 'visited', 'queued'],
        queue: [4],
        result: [0, 1, 2, 3],
      },
      {
        message: '✓ Pop 4. Neighbours 1,2 all visited. Queue empty. BFS order: [0,1,2,3,4].',
        nodeStates: ['visited', 'visited', 'visited', 'visited', 'visited'],
        queue: [],
        result: [0, 1, 2, 3, 4],
      },
    ],
  },
  ...(() => {
    const arr = [5, 3, 8, 1, 9, 2, 6, 4];
    const a = [...arr];
    const n = a.length;
    const frames = [];
    const mk = (arr, cmp = [], sorted = []) => arr.map((v, k) => ({
      v, pointers: [],
      state: sorted.includes(k) ? 'found' : cmp.includes(k) ? 'mid' : 'active',
    }));
    frames.push({ message: `Array: [${arr.join(', ')}]. Bubble sort compares adjacent pairs — larger values "bubble" to the right each pass.`, variables: { pass: '-', swaps: 0 }, elements: mk(arr) });
    let swaps = 0;
    const sortedIdx = [];
    for (let i = 0; i < n - 1; i++) {
      let swappedThisPass = false;
      for (let j = 0; j < n - i - 1; j++) {
        frames.push({ message: `Pass ${i+1}: Compare a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}. ${a[j] > a[j+1] ? `${a[j]} > ${a[j+1]} → SWAP!` : `${a[j]} ≤ ${a[j+1]} → no swap.`}`, variables: { pass: i+1, comparing: `${a[j]} vs ${a[j+1]}`, swaps }, elements: mk(a, [j, j+1], sortedIdx) });
        if (a[j] > a[j+1]) {
          [a[j], a[j+1]] = [a[j+1], a[j]];
          swaps++;
          swappedThisPass = true;
          frames.push({ message: `Swapped! [${a.join(', ')}]`, variables: { pass: i+1, swapped: `pos ${j} & ${j+1}`, swaps }, elements: mk(a, [j, j+1], sortedIdx) });
        }
      }
      sortedIdx.push(n - 1 - i);
      if (!swappedThisPass) {
        frames.push({ message: `No swaps in pass ${i+1}! Array already sorted — early exit. Total swaps: ${swaps}.`, variables: { pass: i+1, swaps, early_exit: true }, elements: mk(a, [], Array.from({length: n}, (_, k) => k)) });
        break;
      }
    }
    if (!sortedIdx.includes(0)) {
      frames.push({ message: `Sorted! [${a.join(', ')}]. Bubble sort is O(n²) — ${swaps} swaps to sort ${n} elements.`, variables: { total_swaps: swaps, complexity: 'O(n²)' }, elements: a.map(v => ({ v, state: 'found', pointers: [] })) });
    }
    return [{ id: 'bubble-sort', name: 'Bubble Sort', category: 'Sorting', icon: 'swap_vert', renderType: 'array', code: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        swapped = False\n        for j in range(n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n                swapped = True\n        if not swapped:\n            break  # Already sorted!`, frames }];
  })(),
  {
    id: 'stack',
    name: 'Stack',
    category: 'Linear Structures',
    icon: 'layers',
    renderType: 'stack',
    code: `stack = []\nstack.append(5)   # push\nstack.append(12)  # push\nstack.append(7)   # push\ntop = stack[-1]   # peek\nstack.pop()       # pop → 7\nstack.pop()       # pop → 12`,
    frames: [
      { message: 'Stack starts empty. LIFO — Last In, First Out. Think of a stack of plates.', variables: { size: 0, top: '—' }, stack: [], operation: null },
      { message: 'push(5). Add 5 to the top.', variables: { size: 1, top: 5, op: 'push(5)' }, stack: [5], operation: 'push', highlight: 0 },
      { message: 'push(12). 12 goes on top of 5.', variables: { size: 2, top: 12, op: 'push(12)' }, stack: [5, 12], operation: 'push', highlight: 1 },
      { message: 'push(7). 7 is now the top element.', variables: { size: 3, top: 7, op: 'push(7)' }, stack: [5, 12, 7], operation: 'push', highlight: 2 },
      { message: 'push(3). Stack grows to 4 elements.', variables: { size: 4, top: 3, op: 'push(3)' }, stack: [5, 12, 7, 3], operation: 'push', highlight: 3 },
      { message: 'peek(). Look at top (3) without removing. Stack unchanged.', variables: { size: 4, top: 3, peek: 3 }, stack: [5, 12, 7, 3], operation: 'peek', highlight: 3 },
      { message: 'pop() → returns 3. LIFO: last pushed, first out.', variables: { size: 3, top: 7, returned: 3 }, stack: [5, 12, 7], operation: 'pop', highlight: 2 },
      { message: 'pop() → returns 7.', variables: { size: 2, top: 12, returned: 7 }, stack: [5, 12], operation: 'pop', highlight: 1 },
      { message: 'pop() → returns 12.', variables: { size: 1, top: 5, returned: 12 }, stack: [5], operation: 'pop', highlight: 0 },
      { message: 'pop() → returns 5. Stack is empty. Used for: function calls, undo, bracket matching.', variables: { size: 0, top: '—', returned: 5 }, stack: [], operation: 'pop', highlight: null },
    ],
  },
  {
    id: 'queue',
    name: 'Queue',
    category: 'Linear Structures',
    icon: 'view_week',
    renderType: 'queue',
    code: `from collections import deque\nq = deque()\nq.append('A')    # enqueue\nq.append('B')    # enqueue\nq.append('C')    # enqueue\nfront = q[0]     # peek front\nq.popleft()      # dequeue → 'A'\nq.popleft()      # dequeue → 'B'`,
    frames: [
      { message: 'Queue starts empty. FIFO — First In, First Out. Like a line at a store.', variables: { size: 0, front: '—', back: '—' }, queue: [], operation: null },
      { message: 'enqueue(A). A enters at the BACK.', variables: { size: 1, front: 'A', back: 'A', op: 'enqueue(A)' }, queue: ['A'], operation: 'enqueue', highlight: 0 },
      { message: 'enqueue(B). B joins at the back.', variables: { size: 2, front: 'A', back: 'B', op: 'enqueue(B)' }, queue: ['A', 'B'], operation: 'enqueue', highlight: 1 },
      { message: 'enqueue(C). Queue: [A, B, C].', variables: { size: 3, front: 'A', back: 'C', op: 'enqueue(C)' }, queue: ['A', 'B', 'C'], operation: 'enqueue', highlight: 2 },
      { message: 'enqueue(D). Queue: [A, B, C, D].', variables: { size: 4, front: 'A', back: 'D', op: 'enqueue(D)' }, queue: ['A', 'B', 'C', 'D'], operation: 'enqueue', highlight: 3 },
      { message: 'peek(). Front is A — the next to leave. Queue unchanged.', variables: { size: 4, front: 'A', back: 'D', peek: 'A' }, queue: ['A', 'B', 'C', 'D'], operation: 'peek', highlight: 0 },
      { message: 'dequeue() → A leaves from the FRONT. FIFO: first in, first out.', variables: { size: 3, front: 'B', back: 'D', returned: 'A' }, queue: ['B', 'C', 'D'], operation: 'dequeue', highlight: 0 },
      { message: 'dequeue() → B leaves.', variables: { size: 2, front: 'C', back: 'D', returned: 'B' }, queue: ['C', 'D'], operation: 'dequeue', highlight: 0 },
      { message: 'dequeue() → C leaves. Only D remains.', variables: { size: 1, front: 'D', back: 'D', returned: 'C' }, queue: ['D'], operation: 'dequeue', highlight: 0 },
      { message: 'dequeue() → D leaves. Queue empty. Used for: BFS, task scheduling, breadth-first processing.', variables: { size: 0, front: '—', back: '—', returned: 'D' }, queue: [], operation: 'dequeue', highlight: null },
    ],
  },

  ...(() => {
    const arr = [5, 3, 8, 1, 9, 2, 6, 4];
    const a = [...arr];
    const n = a.length;
    const frames = [];
    const mk = (arr, sorted = [], minI = -1, curr = -1) => arr.map((v, k) => ({
      v, pointers: minI === k ? ['min'] : [],
      state: sorted.includes(k) ? 'found' : k === minI ? 'mid' : k === curr ? 'window' : 'active',
    }));
    frames.push({ message: `Array: [${arr.join(', ')}]. Selection sort scans for the minimum each pass and places it in order. Always O(n²) — no shortcuts.`, variables: { pass: '-', comparisons: 0 }, elements: mk(arr) });
    let cmp = 0;
    const sorted = [];
    for (let i = 0; i < n - 1; i++) {
      let minI = i;
      frames.push({ message: `Pass ${i+1}: Scan positions ${i}–${n-1} for minimum. Candidate: a[${i}]=${a[i]}.`, variables: { pass: i+1, candidate: a[i], at: i, comparisons: cmp }, elements: mk(a, sorted, minI, i) });
      for (let j = i + 1; j < n; j++) {
        cmp++;
        if (a[j] < a[minI]) {
          const prev = a[minI]; minI = j;
          frames.push({ message: `a[${j}]=${a[j]} < ${prev} — new minimum found!`, variables: { pass: i+1, new_min: a[j], at: j, comparisons: cmp }, elements: mk(a, sorted, minI, j) });
        }
      }
      if (minI !== i) {
        [a[i], a[minI]] = [a[minI], a[i]];
        frames.push({ message: `Swap minimum ${a[i]} into position ${i}. Array: [${a.join(', ')}]`, variables: { pass: i+1, placed: a[i], comparisons: cmp }, elements: mk(a, sorted, i, i) });
      }
      sorted.push(i);
    }
    sorted.push(n-1);
    frames.push({ message: `Sorted! [${a.join(', ')}]. Selection sort makes exactly n(n-1)/2 = ${cmp} comparisons, always.`, variables: { total_comparisons: cmp, complexity: 'O(n²)' }, elements: a.map(v => ({ v, state: 'found', pointers: [] })) });
    return [{
      id: 'selection-sort', name: 'Selection Sort', category: 'Sorting', icon: 'low_priority', renderType: 'array',
      code: `def selection_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        min_i = i\n        for j in range(i + 1, n):\n            if arr[j] < arr[min_i]:\n                min_i = j\n        arr[i], arr[min_i] = arr[min_i], arr[i]`,
      frames,
    }];
  })(),

  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    icon: 'merge',
    renderType: 'array',
    code: `def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left  = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i]); i += 1\n        else:\n            result.append(right[j]); j += 1\n    return result + left[i:] + right[j:]`,
    frames: [
      { message: 'Array: [5, 3, 8, 1, 9, 2, 6, 4]. Merge sort: divide into halves, sort each, then merge. Guaranteed O(n log n).', variables: { step: 'divide' }, elements: [5,3,8,1,9,2,6,4].map(v => ({ v, state: 'active', pointers: [] })) },
      { message: 'Split into left [5,3,8,1] and right [9,2,6,4]. Each half is sorted independently.', variables: { step: 'split level 1' }, elements: [{v:5,state:'window',pointers:[]},{v:3,state:'window',pointers:[]},{v:8,state:'window',pointers:[]},{v:1,state:'window',pointers:[]},{v:9,state:'mid',pointers:[]},{v:2,state:'mid',pointers:[]},{v:6,state:'mid',pointers:[]},{v:4,state:'mid',pointers:[]}] },
      { message: 'Split again: [5,3] | [8,1] | [9,2] | [6,4]. Each pair is now a sub-problem.', variables: { step: 'split level 2' }, elements: [{v:5,state:'window',pointers:[]},{v:3,state:'window',pointers:[]},{v:8,state:'mid',pointers:[]},{v:1,state:'mid',pointers:[]},{v:9,state:'window',pointers:[]},{v:2,state:'window',pointers:[]},{v:6,state:'mid',pointers:[]},{v:4,state:'mid',pointers:[]}] },
      { message: 'Merge pairs: sort [5,3]→[3,5], [8,1]→[1,8], [9,2]→[2,9], [6,4]→[4,6].', variables: { step: 'merge pairs' }, elements: [{v:3,state:'found',pointers:[]},{v:5,state:'found',pointers:[]},{v:1,state:'found',pointers:[]},{v:8,state:'found',pointers:[]},{v:2,state:'found',pointers:[]},{v:9,state:'found',pointers:[]},{v:4,state:'found',pointers:[]},{v:6,state:'found',pointers:[]}] },
      { message: 'Merge [3,5] and [1,8]: compare 3 vs 1. Take 1 (smaller).', variables: { left_ptr: 3, right_ptr: 1, result: '[1]' }, elements: [{v:3,state:'mid',pointers:['i']},{v:5,state:'active',pointers:[]},{v:1,state:'window',pointers:['j']},{v:8,state:'active',pointers:[]},{v:2,state:'normal',pointers:[]},{v:9,state:'normal',pointers:[]},{v:4,state:'normal',pointers:[]},{v:6,state:'normal',pointers:[]}] },
      { message: 'Compare 3 vs 8. Take 3. Then take 5. Then take 8. Merged: [1,3,5,8].', variables: { left_half: '[3,5]', right_half: '[1,8]', merged: '[1,3,5,8]' }, elements: [{v:1,state:'found',pointers:[]},{v:3,state:'found',pointers:[]},{v:5,state:'found',pointers:[]},{v:8,state:'found',pointers:[]},{v:2,state:'active',pointers:[]},{v:9,state:'active',pointers:[]},{v:4,state:'active',pointers:[]},{v:6,state:'active',pointers:[]}] },
      { message: 'Merge [2,9] and [4,6]: compare 2 vs 4. Take 2. Then 4. Then 6. Then 9. → [2,4,6,9].', variables: { left_half: '[2,9]', right_half: '[4,6]', merged: '[2,4,6,9]' }, elements: [{v:1,state:'found',pointers:[]},{v:3,state:'found',pointers:[]},{v:5,state:'found',pointers:[]},{v:8,state:'found',pointers:[]},{v:2,state:'found',pointers:[]},{v:4,state:'found',pointers:[]},{v:6,state:'found',pointers:[]},{v:9,state:'found',pointers:[]}] },
      { message: 'Final merge: [1,3,5,8] and [2,4,6,9]. Compare 1 vs 2. Take 1.', variables: { left_ptr: 1, right_ptr: 2, result: '[1]' }, elements: [{v:1,state:'mid',pointers:['i']},{v:3,state:'active',pointers:[]},{v:5,state:'active',pointers:[]},{v:8,state:'active',pointers:[]},{v:2,state:'window',pointers:['j']},{v:4,state:'active',pointers:[]},{v:6,state:'active',pointers:[]},{v:9,state:'active',pointers:[]}] },
      { message: 'Take 2. Compare 3 vs 2 → take 2. Compare 3 vs 4 → take 3. Compare 4 vs 5...', variables: { result: '[1,2,3,...]' }, elements: [{v:1,state:'found',pointers:[]},{v:2,state:'found',pointers:[]},{v:3,state:'mid',pointers:['i']},{v:5,state:'active',pointers:[]},{v:8,state:'active',pointers:[]},{v:4,state:'window',pointers:['j']},{v:6,state:'active',pointers:[]},{v:9,state:'active',pointers:[]}] },
      { message: '✓ Final sorted array: [1,2,3,4,5,6,8,9]. Merge sort: O(n log n) always — log n levels, each level does O(n) work merging.', variables: { complexity: 'O(n log n)', space: 'O(n)' }, elements: [1,2,3,4,5,6,8,9].map(v => ({ v, state: 'found', pointers: [] })) },
    ],
  },

  {
    id: 'graph-dfs',
    name: 'Graph DFS',
    category: 'Graphs',
    icon: 'account_tree',
    renderType: 'graph',
    code: `def dfs(graph, start):\n    visited = set()\n    stack = [start]\n    while stack:\n        node = stack.pop()\n        if node not in visited:\n            visited.add(node)\n            for nb in reversed(graph[node]):\n                if nb not in visited:\n                    stack.append(nb)`,
    graphNodes: [
      { id: 0, label: '0', x: 180, y: 130 },
      { id: 1, label: '1', x: 320, y: 70  },
      { id: 2, label: '2', x: 80,  y: 210 },
      { id: 3, label: '3', x: 440, y: 130 },
      { id: 4, label: '4', x: 320, y: 210 },
    ],
    graphEdges: [[0,1],[0,2],[1,3],[1,4],[2,4]],
    frames: [
      { message: 'Start DFS from node 0. Push to stack. DFS explores as FAR as possible before backtracking — opposite of BFS.', nodeStates: ['active','unvisited','unvisited','unvisited','unvisited'], queue: [0], result: [] },
      { message: 'Pop 0, visit it. Push neighbors 2, then 1 (reversed order, so 1 is processed first via LIFO). Stack=[2,1].', nodeStates: ['visited','queued','queued','unvisited','unvisited'], queue: [2,1], result: [0] },
      { message: 'Pop 1, visit it. Push unvisited neighbors 4, then 3. Stack=[2,4,3].', nodeStates: ['visited','visited','queued','queued','queued'], queue: [2,4,3], result: [0,1] },
      { message: 'Pop 3, visit it. Neighbor 1 already visited. Stack=[2,4].', nodeStates: ['visited','visited','queued','visited','queued'], queue: [2,4], result: [0,1,3] },
      { message: 'Pop 4, visit it. Neighbors: 1(visited), 2(in stack, not visited yet). Push 2 — already in stack but not visited. Stack=[2,2].', nodeStates: ['visited','visited','queued','visited','visited'], queue: [2,2], result: [0,1,3,4] },
      { message: 'Pop 2, visit it. Neighbors 0(visited), 4(visited). Nothing to push. Stack=[2] (duplicate, will be skipped).', nodeStates: ['visited','visited','visited','visited','visited'], queue: [2], result: [0,1,3,4,2] },
      { message: '✓ Pop 2 again — already visited, skip. DFS order: [0,1,3,4,2]. DFS went deep (0→1→3) before backtracking to explore (4) then (2).', nodeStates: ['visited','visited','visited','visited','visited'], queue: [], result: [0,1,3,4,2] },
    ],
  },

  {
    id: 'tree-bfs',
    name: 'Tree BFS',
    category: 'Trees',
    icon: 'account_tree',
    renderType: 'tree',
    code: `from collections import deque\n\ndef level_order(root):\n    if not root: return []\n    queue = deque([root])\n    result = []\n    while queue:\n        node = queue.popleft()\n        result.append(node.val)\n        if node.left:  queue.append(node.left)\n        if node.right: queue.append(node.right)\n    return result`,
    treeNodes: [
      { id: 0, val: 4, left: 1, right: 2, x: 240, y: 40  },
      { id: 1, val: 2, left: 3, right: 4, x: 120, y: 120 },
      { id: 2, val: 6, left: 5, right: 6, x: 360, y: 120 },
      { id: 3, val: 1, left: null, right: null, x: 60,  y: 196 },
      { id: 4, val: 3, left: null, right: null, x: 180, y: 196 },
      { id: 5, val: 5, left: null, right: null, x: 300, y: 196 },
      { id: 6, val: 7, left: null, right: null, x: 420, y: 196 },
    ],
    frames: [
      { message: 'Level-order (BFS) traversal. Use a queue. Start with root 4. Queue=[4].', result: [], activeNode: 0, visitedNodes: [] },
      { message: 'Dequeue 4. Enqueue children 2 and 6. Queue=[2,6]. Level 1 complete.', result: [4], activeNode: 1, visitedNodes: [0] },
      { message: 'Dequeue 2. Enqueue children 1 and 3. Queue=[6,1,3].', result: [4,2], activeNode: 2, visitedNodes: [0,1] },
      { message: 'Dequeue 6. Enqueue children 5 and 7. Queue=[1,3,5,7]. Level 2 complete.', result: [4,2,6], activeNode: 3, visitedNodes: [0,1,2] },
      { message: 'Dequeue 1. No children. Queue=[3,5,7].', result: [4,2,6,1], activeNode: 4, visitedNodes: [0,1,2,3] },
      { message: 'Dequeue 3. No children. Queue=[5,7].', result: [4,2,6,1,3], activeNode: 5, visitedNodes: [0,1,2,3,4] },
      { message: 'Dequeue 5. No children. Queue=[7].', result: [4,2,6,1,3,5], activeNode: 6, visitedNodes: [0,1,2,3,4,5] },
      { message: '✓ Dequeue 7. Queue empty. Level-order: [4,2,6,1,3,5,7]. BFS visits all nodes level by level — perfect for shortest path in unweighted trees.', result: [4,2,6,1,3,5,7], activeNode: null, visitedNodes: [0,1,2,3,4,5,6] },
    ],
  },

  {
    id: 'hash-map',
    name: 'Hash Map',
    category: 'Data Structures',
    icon: 'grid_on',
    renderType: 'hashmap',
    code: `# Python dict is a hash map\nhm = {}\nhm['dog'] = 5      # O(1) average\nhm['cat'] = 3      # O(1) average\nval = hm['dog']    # O(1) average\ndel hm['cat']      # O(1) average\n'fish' in hm       # O(1) average\n\n# hash('dog') % buckets → bucket index`,
    frames: [
      { message: 'Hash map: stores key→value pairs. Uses a hash function to convert keys to bucket indices. Average O(1) for insert, lookup, delete.', variables: { size: 0, load: '0/8' }, buckets: [null,null,null,null,null,null,null,null], highlight: null, operation: null },
      { message: "put('dog', 5). hash('dog') = (d+o+g) % 8 = 314 % 8 = 2. Place in bucket 2.", variables: { size: 1, hash: '314 % 8 = 2' }, buckets: [null,null,[{k:'dog',v:5}],null,null,null,null,null], highlight: 2, operation: 'insert' },
      { message: "put('cat', 3). hash('cat') = 312 % 8 = 0. Place in bucket 0.", variables: { size: 2, hash: '312 % 8 = 0' }, buckets: [[{k:'cat',v:3}],null,[{k:'dog',v:5}],null,null,null,null,null], highlight: 0, operation: 'insert' },
      { message: "put('sun', 6). hash('sun') = 342 % 8 = 6. Place in bucket 6.", variables: { size: 3, hash: '342 % 8 = 6' }, buckets: [[{k:'cat',v:3}],null,[{k:'dog',v:5}],null,null,null,[{k:'sun',v:6}],null], highlight: 6, operation: 'insert' },
      { message: "put('moon', 2). hash('moon') = 441 % 8 = 1. Place in bucket 1.", variables: { size: 4, hash: '441 % 8 = 1' }, buckets: [[{k:'cat',v:3}],[{k:'moon',v:2}],[{k:'dog',v:5}],null,null,null,[{k:'sun',v:6}],null], highlight: 1, operation: 'insert' },
      { message: "put('fish', 9). hash('fish') = 426 % 8 = 2. COLLISION — bucket 2 already has 'dog'! Use chaining: add to the bucket's list.", variables: { size: 5, hash: '426 % 8 = 2', collision: true }, buckets: [[{k:'cat',v:3}],[{k:'moon',v:2}],[{k:'dog',v:5},{k:'fish',v:9}],null,null,null,[{k:'sun',v:6}],null], highlight: 2, operation: 'collision' },
      { message: "get('dog'). hash('dog') = 2 → look in bucket 2 → scan chain → found! Returns 5.", variables: { hash: '314 % 8 = 2', found: true, value: 5 }, buckets: [[{k:'cat',v:3}],[{k:'moon',v:2}],[{k:'dog',v:5},{k:'fish',v:9}],null,null,null,[{k:'sun',v:6}],null], highlight: 2, operation: 'lookup' },
      { message: "get('cat'). hash('cat') = 0 → bucket 0 → found! Returns 3.", variables: { hash: '312 % 8 = 0', found: true, value: 3 }, buckets: [[{k:'cat',v:3}],[{k:'moon',v:2}],[{k:'dog',v:5},{k:'fish',v:9}],null,null,null,[{k:'sun',v:6}],null], highlight: 0, operation: 'lookup' },
      { message: "get('bird'). hash('bird') = 417 % 8 = 1 → bucket 1 → only 'moon' there → NOT FOUND. Still O(1) average!", variables: { hash: '417 % 8 = 1', found: false }, buckets: [[{k:'cat',v:3}],[{k:'moon',v:2}],[{k:'dog',v:5},{k:'fish',v:9}],null,null,null,[{k:'sun',v:6}],null], highlight: 1, operation: 'miss' },
      { message: "delete('sun'). hash('sun') = 6 → bucket 6 → remove. Bucket becomes empty.", variables: { size: 4, hash: '342 % 8 = 6' }, buckets: [[{k:'cat',v:3}],[{k:'moon',v:2}],[{k:'dog',v:5},{k:'fish',v:9}],null,null,null,null,null], highlight: 6, operation: 'delete' },
      { message: '✓ Hash map summary: O(1) average for all ops. Worst case O(n) with many collisions. Python dict, JavaScript objects/Map — all hash maps under the hood.', variables: { avg: 'O(1)', worst: 'O(n)', load_factor: '4/8 = 0.5' }, buckets: [[{k:'cat',v:3}],[{k:'moon',v:2}],[{k:'dog',v:5},{k:'fish',v:9}],null,null,null,null,null], highlight: null, operation: null },
    ],
  },
];
