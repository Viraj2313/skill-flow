

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

  const [{ data: exercises, error: exError }, { data: cards }] = await Promise.all([
    supabase.from('exercises').select('*').eq('lesson_id', lesson.id).order('sort_order', { ascending: true }),
    supabase.from('concept_cards').select('*').eq('lesson_id', lesson.id).order('sort_order', { ascending: true }),
  ]);

  if (exError) throw exError;

  return {
    ...lesson,
    cards: cards || [],
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
    .select('*, lessons(id, title, slug, topics(category_id))')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function getExercisesByTopic(topicId, limit = 20) {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, slug')
    .eq('topic_id', topicId);

  const lessonMap = Object.fromEntries((lessons || []).map(l => [l.id, l.slug]));
  const lessonIds = Object.keys(lessonMap);
  if (!lessonIds.length) return [];

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .in('lesson_id', lessonIds)
    .eq('type', 'mcq')
    .limit(limit);

  if (error) return [];
  return (data || []).map(e => ({ ...normaliseExercise(e), lessonSlug: lessonMap[e.lesson_id] || null }));
}

export async function saveSpeedScore(topicId, correct, total, timeMs) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to save scores.');

  const { error } = await supabase
    .from('speed_round_scores')
    .insert({ user_id: user.id, topic_id: topicId, correct, total, time_ms: timeMs });

  if (error) throw error;
}

export async function getSpeedLeaderboard(topicId, limit = 10) {
  const { data, error } = await supabase
    .from('speed_round_scores')
    .select('correct, total, time_ms, created_at, user_id, user_profiles(display_name)')
    .eq('topic_id', topicId)
    .order('correct', { ascending: false })
    .order('time_ms', { ascending: true })
    .limit(limit);

  if (error) return [];
  return data || [];
}


export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase.rpc('get_leaderboard', { result_limit: limit });
  if (error) throw error;
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
  if (!user) throw new Error('Sign in to save lesson progress.');

  const { error } = await supabase.rpc('complete_lesson', {
    lesson_id_input: lessonId,
    correct_count_input: correctCount,
    total_count_input: totalCount,
    xp_earned_input: xpEarned,
  });
  if (error) throw error;
}

export async function saveCodeSubmission(submission) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to save submissions.');

  const { data, error } = await supabase
    .from('code_submissions')
    .insert({ user_id: user.id, ...submission })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveAiReview(review) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to save reviews.');

  const { error } = await supabase
    .from('ai_reviews')
    .insert({ user_id: user.id, ...review });
  if (error) throw error;
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

export async function saveGoal({ company, interviewDate, topicPlan }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const { error } = await supabase.from('user_goals').upsert({
    user_id:        user.id,
    company,
    interview_date: interviewDate,
    topic_plan:     topicPlan,
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function getGoal() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  return data;
}

export async function deleteGoal() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('user_goals').delete().eq('user_id', user.id);
}

export async function saveExerciseAttempt({ exerciseId, lessonId, isCorrect, attemptsTaken = 1 }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('user_exercise_attempts').insert({
    user_id:        user.id,
    exercise_id:    exerciseId,
    lesson_id:      lessonId,
    is_correct:     isCorrect,
    attempts_taken: attemptsTaken,
  });
}

export async function getWeakExercises(limit = 10) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('user_exercise_attempts')
    .select('exercise_id, lesson_id, is_correct, attempts_taken, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200);
  if (!data) return [];
  const map = {};
  for (const row of data) {
    if (!map[row.exercise_id]) map[row.exercise_id] = { exerciseId: row.exercise_id, lessonId: row.lesson_id, total: 0, wrong: 0, maxAttempts: 0 };
    map[row.exercise_id].total++;
    if (!row.is_correct) map[row.exercise_id].wrong++;
    map[row.exercise_id].maxAttempts = Math.max(map[row.exercise_id].maxAttempts, row.attempts_taken);
  }
  return Object.values(map)
    .filter(e => e.total >= 2 && e.wrong > 0)
    .sort((a, b) => (b.wrong / b.total) - (a.wrong / a.total))
    .slice(0, limit);
}

export async function saveAhaJournal({ lessonId, lessonTitle, note }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('aha_journal').upsert({
    user_id:      user.id,
    lesson_id:    lessonId,
    lesson_title: lessonTitle,
    note,
    reviewed:     false,
  }, { onConflict: 'user_id,lesson_id' });
  if (error) throw error;
}

export async function getAhaJournal({ limit = 50, unreviewedOnly = false } = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let query = supabase
    .from('aha_journal')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (unreviewedOnly) query = query.eq('reviewed', false);
  const { data } = await query;
  return data || [];
}

export async function markAhaReviewed(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('aha_journal').update({ reviewed: true }).eq('id', id).eq('user_id', user.id);
}

export async function savePracticeResult({ mode, correct, total, metadata = {} }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('practice_results').insert({
    user_id:  user.id,
    mode,
    correct,
    total,
    metadata,
  });
}

export async function getPracticeHistory(mode = null, limit = 20) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let query = supabase
    .from('practice_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (mode) query = query.eq('mode', mode);
  const { data } = await query;
  return data || [];
}

export async function getPracticeStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { data } = await supabase
    .from('practice_results')
    .select('mode, correct, total')
    .eq('user_id', user.id);
  if (!data) return {};
  const stats = {};
  for (const row of data) {
    if (!stats[row.mode]) stats[row.mode] = { sessions: 0, correct: 0, total: 0 };
    stats[row.mode].sessions++;
    stats[row.mode].correct += row.correct;
    stats[row.mode].total   += row.total;
  }
  for (const m of Object.values(stats)) {
    m.accuracy = m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0;
  }
  return stats;
}
