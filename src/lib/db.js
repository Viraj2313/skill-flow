

import { supabase } from './supabase';

export async function getTopics(categoryId = null) {
  let query = supabase
    .from('topics')
    .select('*')
    .order('tier', { ascending: true })
    .order('sort_order', { ascending: true });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getLessonsByTopic(topicId) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('topic_id', topicId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getLessonBySlug(slug) {
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('slug', slug)
    .single();

  if (lessonError) throw lessonError;

  const { data: exercises, error: exError } = await supabase
    .from('exercises')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('sort_order', { ascending: true });

  if (exError) throw exError;

  return {
    ...lesson,
    exercises: exercises.map(normaliseExercise),
  };
}

export async function getAllLessons() {
  const { data: lessons, error: lErr } = await supabase
    .from('lessons')
    .select('*')
    .order('sort_order', { ascending: true });

  if (lErr) throw lErr;

  const { data: exercises, error: eErr } = await supabase
    .from('exercises')
    .select('*')
    .order('sort_order', { ascending: true });

  if (eErr) throw eErr;

  const byLesson = {};
  for (const ex of exercises) {
    if (!byLesson[ex.lesson_id]) byLesson[ex.lesson_id] = [];
    byLesson[ex.lesson_id].push(normaliseExercise(ex));
  }

  return lessons.map(l => ({
    ...l,
    exercises: byLesson[l.id] || [],
  }));
}

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTopicProgress(userId) {
  const { data, error } = await supabase
    .from('user_topic_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function getRecentActivity(userId, limit = 5) {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('completed_at, xp_earned, correct_count, total_count, lessons(id, title, topic_id, topics(category_id, name))')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

export async function getNextLesson(userId) {
  const { data: progress } = await supabase
    .from('user_lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('completed', true);

  const completedIds = (progress || []).map(p => p.lesson_id);

  let query = supabase
    .from('lessons')
    .select('*, topics(category_id, name)')
    .order('sort_order', { ascending: true })
    .limit(1);

  if (completedIds.length > 0) {
    query = query.not('id', 'in', `(${completedIds.map(id => `"${id}"`).join(',')})`);
  }

  const { data, error } = await query.maybeSingle();
  if (error) return null;
  return data;
}

export async function getWeekActivity(userId) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('user_lesson_progress')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('completed_at', monday.toISOString());

  const activeDays = new Set();
  for (const row of data || []) {
    const d = new Date(row.completed_at);
    const idx = (d.getDay() + 6) % 7;
    activeDays.add(idx);
  }

  return Array.from({ length: 7 }, (_, i) => activeDays.has(i));
}

export async function getUserLessonProgress(userId) {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .limit(limit);

  if (error) {
    const { data: profiles, error: pErr } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, xp, streak_current, avatar_url')
      .order('xp', { ascending: false })
      .limit(limit);
    if (pErr) throw pErr;
    return profiles;
  }
  return data;
}

export async function getDailyChallenge() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*, lessons(*)')
    .eq('active_date', today)
    .single();

  if (error) return null;
  return data;
}

export async function completeLesson(lessonId, correctCount, totalCount, xpEarned) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    completed: true,
    correct_count: correctCount,
    total_count: totalCount,
    xp_earned: xpEarned,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_id' });
  await supabase.rpc('increment_xp', { uid: user.id, amount: xpEarned });
}

function normaliseExercise(ex) {
  return {
    id: ex.id,
    type: ex.type,
    question: ex.question,
    explanation: ex.explanation,
    options: ex.options ?? null,
    correct: ex.correct_option ?? null,
    context: ex.context ?? null,
    code_lines: ex.code_lines ?? null,
    blank_index: ex.blank_index ?? null,
    blank_placeholder: ex.blank_placeholder ?? null,
    blocks: ex.blocks ?? null,
    correct_order: ex.correct_order ?? null,
  };
}
