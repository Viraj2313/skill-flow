import TOPICS from '@/data/topics.json';
import PROBLEMS from '@/data/problems.json';
import USER from '@/data/user.json';
import LEADERBOARD from '@/data/leaderboard.json';
import LESSONS_DATA from '@/data/lessons.json';

export const MOCK_USER = USER;
export const MOCK_TOPICS = TOPICS;
export const MOCK_PROBLEMS = PROBLEMS;
export const MOCK_LEADERBOARD = LEADERBOARD;
export const MOCK_LESSONS = LESSONS_DATA;

export const MOCK_DAILY_CHALLENGE = {
  id: 'dc1',
  problem: PROBLEMS[4],
  bonus_xp: 200,
  resets_at: new Date(Date.now() + 8 * 3600 * 1000 + 24 * 60 * 1000 + 37 * 1000),
  streak_days: [true, true, true, true, true, true, false],
};

export const MOCK_RECENT_ACTIVITY = [
  { title: 'Two Sum', status: 'Accepted', runtime: '48ms', date: '2d ago', category: 'dsa' },
  { title: 'List Comprehension', status: 'Accepted', runtime: '32ms', date: '3d ago', category: 'python' },
  { title: 'Identify Complexity', status: 'Accepted', runtime: '--', date: '4d ago', category: 'cs-fundamentals' },
  { title: 'Binary Search', status: 'Accepted', runtime: '24ms', date: '5d ago', category: 'dsa' },
  { title: 'Contains Duplicate', status: 'Wrong Answer', runtime: '--', date: '6d ago', category: 'dsa' },
];

export const RANK_SYSTEM = [
  { name: 'Beginner', min_xp: 0, max_xp: 499, color: '#9c9284' },
  { name: 'Coder', min_xp: 500, max_xp: 1999, color: '#57534a' },
  { name: 'Problem Solver', min_xp: 2000, max_xp: 4999, color: '#5a7a3a' },
  { name: 'Algorithmist', min_xp: 5000, max_xp: 9999, color: '#4a6830' },
  { name: 'Grandmaster', min_xp: 10000, max_xp: Infinity, color: '#b8860b' },
];

export const CATEGORIES = [
  { id: 'dsa', label: 'DSA', icon: 'account_tree', color: 'var(--color-cat-dsa)' },
  { id: 'python', label: 'Python', icon: 'code', color: 'var(--color-cat-python)' },
  { id: 'cs-fundamentals', label: 'CS Fundamentals', icon: 'school', color: 'var(--color-cat-cs)' },
];
