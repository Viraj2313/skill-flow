const CHECKLISTS = {
  'binary search': [
    { icon: 'sort',              text: 'Is the input sorted? Binary search only works on sorted data.' },
    { icon: 'compare_arrows',   text: 'What happens when l > r? Make sure your termination condition is right.' },
    { icon: 'center_focus_strong', text: 'Which half do you eliminate — left or right? Trace one step.' },
  ],
  'linked list': [
    { icon: 'dangerous',        text: 'What if head is null? Always handle the empty list edge case.' },
    { icon: 'arrow_forward',    text: 'Save next before overwriting — or you lose the reference.' },
    { icon: 'person',           text: 'Test with 1 node and 2 nodes. These are the trickiest edge cases.' },
  ],
  'two pointer': [
    { icon: 'sync_alt',         text: 'Are the pointers converging toward each other, or moving the same way?' },
    { icon: 'done_all',         text: 'Stop condition: l < r means they haven\'t crossed. Is yours right?' },
    { icon: 'straighten',       text: 'Two pointer usually requires sorted input. Confirm that here.' },
  ],
  'sliding window': [
    { icon: 'view_column',      text: 'What leaves the window on the left as the right pointer advances?' },
    { icon: 'tune',             text: 'Is this a fixed-size or variable-size window problem?' },
    { icon: 'timeline',         text: 'Track window state incrementally — recomputing from scratch costs O(kn).' },
  ],
  'bfs': [
    { icon: 'mark_as_unread',  text: 'Mark nodes visited BEFORE enqueuing — not after. Prevents duplicates.' },
    { icon: 'queue',            text: 'BFS uses a queue (FIFO), not a stack. Is yours a deque/queue?' },
    { icon: 'hub',              text: 'Are you handling disconnected components?' },
  ],
  'dfs': [
    { icon: 'stacked_bar_chart', text: 'Base case prevents infinite recursion. Is it correct and reachable?' },
    { icon: 'mark_as_unread',  text: 'Mark visited before recursing — or you risk infinite loops.' },
    { icon: 'alt_route',        text: 'DFS finds A path — not the shortest. For shortest, use BFS.' },
  ],
  'dynamic programming': [
    { icon: 'table_chart',      text: 'What does dp[i] represent? State definition is everything in DP.' },
    { icon: 'foundation',       text: 'Are your base cases set before you build up from them?' },
    { icon: 'trending_up',      text: 'Trace your recurrence on a small example (n=3 or n=4).' },
  ],
  'memoization': [
    { icon: 'memory',           text: 'Memoization = recursion + cache. Is every unique subproblem cached?' },
    { icon: 'foundation',       text: 'Base case must return a real value, not hit the cache.' },
    { icon: 'recycling',        text: 'Top-down (memo) vs bottom-up (tabulation) — both are DP.' },
  ],
  'recursion': [
    { icon: 'undo',             text: 'What is the base case? Every recursive function needs an exit.' },
    { icon: 'trending_down',    text: 'Does each call make the problem strictly smaller?' },
    { icon: 'layers',           text: 'Stack depth = recursion depth. Will it overflow for large n?' },
  ],
  'tree': [
    { icon: 'park',             text: 'What do you do when root is null? Always check for empty tree.' },
    { icon: 'account_tree',     text: 'In-order = Left→Root→Right. Pre-order = Root→Left→Right.' },
    { icon: 'height',           text: 'Height = O(log n) balanced, O(n) skewed. Which applies here?' },
  ],
  'graph': [
    { icon: 'hub',              text: 'Have you marked visited nodes? Without it, you\'ll loop forever.' },
    { icon: 'device_hub',       text: 'Directed vs undirected? It changes the adjacency logic.' },
    { icon: 'alt_route',        text: 'BFS = shortest path. DFS = reachability, cycle detection.' },
  ],
  'hash': [
    { icon: 'key',              text: 'Hash map lookups are O(1) average — that\'s what makes this faster.' },
    { icon: 'memory',           text: 'You\'re trading O(n) space for O(n) time savings. Is that the tradeoff?' },
    { icon: 'block',            text: 'Sets are hash maps where you only care about presence, not value.' },
  ],
  'sort': [
    { icon: 'sort',             text: 'O(n log n) is the comparison sort lower bound. Anything faster needs constraints.' },
    { icon: 'swap_horiz',       text: 'In-place vs extra space? Merge sort needs O(n), quicksort needs O(log n) stack.' },
    { icon: 'star_rate',        text: 'Stability matters if equal elements must preserve their relative order.' },
  ],
};

const DEFAULT = [
  { icon: 'warning',           text: 'Edge cases: empty input, single element, all duplicates, negatives.' },
  { icon: 'speed',             text: 'Could a hash map, two pointers, or sorting make this faster?' },
  { icon: 'psychology',        text: 'Trace your answer on a 3-4 element example before locking in.' },
];

export function getChecklist(lessonTitle) {
  const lower = (lessonTitle || '').toLowerCase();
  for (const [key, items] of Object.entries(CHECKLISTS)) {
    if (lower.includes(key)) return items;
  }
  return DEFAULT;
}
