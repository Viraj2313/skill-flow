

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

  const metaName = user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name;
  const emailPrefix = user.email ? user.email.split('@')[0] : '';
  const normalNameFromEmail = emailPrefix
    ? emailPrefix
        .replace(/[._-]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Engineer';
  const cleanBase = (emailPrefix || 'user').replace(/[^a-zA-Z0-9_]/g, '');
  const preferredName = metaName || normalNameFromEmail || 'Engineer';
  const preferredUsername = user.user_metadata?.username || (cleanBase || 'user') + '_' + Date.now().toString(36).slice(-4);

  let localLessonsCount = 0;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('aq_completed_lessons');
      if (raw) localLessonsCount = JSON.parse(raw).length;
    } catch {}
  }

  const fallback = {
    id: user.id,
    username: preferredUsername,
    display_name: preferredName,
    xp: localLessonsCount * 25,
    streak_current: localLessonsCount > 0 ? 1 : 0,
    streak_best: localLessonsCount > 0 ? 1 : 0,
    created_at: user.created_at || new Date().toISOString(),
    email: user.email,
  };

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      return {
        ...fallback,
        ...data,
        display_name: (data.display_name && data.display_name !== 'User' && data.display_name !== 'Engineer' && data.display_name !== 'Alex')
          ? data.display_name
          : preferredName,
        xp: Math.max(Number(data.xp) || 0, fallback.xp),
        streak_current: Math.max(Number(data.streak_current) || 0, fallback.streak_current),
        streak_best: Math.max(Number(data.streak_best) || 0, fallback.streak_best),
        created_at: data.created_at || user.created_at || fallback.created_at,
      };
    }

    if (!data) {
      const { data: created } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          username: preferredUsername,
          display_name: preferredName,
          xp: fallback.xp,
          streak_current: fallback.streak_current,
          streak_best: fallback.streak_best,
        })
        .select()
        .maybeSingle();

      if (created) {
        return {
          ...fallback,
          ...created,
          created_at: created.created_at || user.created_at || fallback.created_at,
        };
      }
    }
  } catch {}

  return fallback;
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
  let dbProgress = [];
  try {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select('*, lessons(id, title, slug, topic_id, topics(category_id, name))')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) dbProgress = data;
  } catch {}

  if (dbProgress.length === 0) {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*, lessons(id, title, slug, topics(category_id))')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) dbProgress = data;
    } catch {}
  }

  if (dbProgress.length === 0) {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId);

      if (!error && data && data.length > 0) dbProgress = data;
    } catch {}
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem('aq_completed_lessons');
      if (raw) {
        const localLessonIds = JSON.parse(raw);
        const existingIds = new Set(dbProgress.map(p => String(p.lesson_id)));
        const now = new Date().toISOString();
        for (const lid of localLessonIds) {
          const lidStr = String(lid);
          if (!existingIds.has(lidStr)) {
            dbProgress.push({
              lesson_id: lidStr,
              completed: true,
              completed_at: now,
              correct_count: 5,
              total_count: 5,
              xp_earned: 25,
            });
            existingIds.add(lidStr);
          }
        }
      }
    } catch {}
  }

  return dbProgress;
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
  if (error) return [];
  return data || [];
}

export async function getDailyChallenge() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*, lessons(*)')
    .eq('active_date', today)
    .maybeSingle();

  if (error) return null;
  return data ?? null;
}

export async function completeLesson(lessonId, correctCount, totalCount, xpEarned) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to save lesson progress.');

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = JSON.parse(localStorage.getItem('aq_completed_lessons') || '[]');
      const s = new Set(cached.map(String));
      s.add(String(lessonId));
      localStorage.setItem('aq_completed_lessons', JSON.stringify(Array.from(s)));
      window.dispatchEvent(new CustomEvent('aq_lesson_completed', { detail: { lessonId: String(lessonId) } }));
    }
  } catch {}

  let rpcSuccess = false;
  try {
    const { error: rpcError } = await supabase.rpc('complete_lesson', {
      lesson_id_input: String(lessonId),
      correct_count_input: Number(correctCount) || 0,
      total_count_input: Number(totalCount) || 0,
      xp_earned_input: Number(xpEarned) || 0,
    });
    if (!rpcError) {
      rpcSuccess = true;
    }
  } catch {}

  if (!rpcSuccess) {
    const now = new Date().toISOString();
    const payload = {
      user_id: user.id,
      lesson_id: String(lessonId),
      completed: true,
      correct_count: Number(correctCount) || 0,
      total_count: Number(totalCount) || 0,
      xp_earned: Number(xpEarned) || 0,
      completed_at: now,
    };

    const { error: upsertError } = await supabase
      .from('user_lesson_progress')
      .upsert(payload, { onConflict: 'user_id,lesson_id' });

    if (upsertError) {
      const { error: insertError } = await supabase
        .from('user_lesson_progress')
        .insert(payload);

      if (insertError) {
        await supabase
          .from('user_lesson_progress')
          .update({
            completed: true,
            correct_count: Number(correctCount) || 0,
            total_count: Number(totalCount) || 0,
            xp_earned: Number(xpEarned) || 0,
            completed_at: now,
          })
          .eq('user_id', user.id)
          .eq('lesson_id', String(lessonId));
      }
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('xp, streak_current, streak_best, last_activity_date')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const lastDate = profile.last_activity_date;
        let streak = profile.streak_current || 0;
        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          streak = lastDate === yesterday ? streak + 1 : 1;
        }
        await supabase
          .from('user_profiles')
          .update({
            xp: (profile.xp || 0) + (Number(xpEarned) || 0),
            streak_current: streak,
            streak_best: Math.max(profile.streak_best || 0, streak),
            last_activity_date: today,
          })
          .eq('id', user.id);
      } else {
        const metaName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name;
        const emailPrefix = user.email ? user.email.split('@')[0] : 'Engineer';
        const cleanBase = (emailPrefix || 'user').replace(/[^a-zA-Z0-9_]/g, '');
        const fallbackName = metaName || emailPrefix || 'Engineer';
        const username = user.user_metadata?.username || (cleanBase || 'user') + '_' + Date.now().toString(36).slice(-4);
        await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            username,
            display_name: fallbackName,
            xp: Number(xpEarned) || 25,
            streak_current: 1,
            streak_best: 1,
            last_activity_date: today,
          });
      }
    } catch {}

    try {
      const { data: lessonRow } = await supabase
        .from('lessons')
        .select('topic_id')
        .eq('id', String(lessonId))
        .maybeSingle();

      if (lessonRow?.topic_id) {
        const { data: topicLessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('topic_id', lessonRow.topic_id);

        const totalTopic = (topicLessons || []).length;
        const topicLessonIds = (topicLessons || []).map(l => l.id);

        const { data: userProg } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true)
          .in('lesson_id', topicLessonIds);

        const doneCount = (userProg || []).length;
        const status = doneCount >= totalTopic && totalTopic > 0 ? 'completed' : 'in-progress';

        await supabase
          .from('user_topic_progress')
          .upsert({
            user_id: user.id,
            topic_id: lessonRow.topic_id,
            lessons_completed: doneCount,
            status: status,
            updated_at: now,
          }, { onConflict: 'user_id,topic_id' });
      }
    } catch {}
  }
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

export async function getUserMistakesAndPerformance() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: attempts }, { data: allLessons }, { data: allExercises }, { data: topics }] = await Promise.all([
    supabase
      .from('user_exercise_attempts')
      .select('exercise_id, lesson_id, is_correct, attempts_taken, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(300),
    supabase.from('lessons').select('id, title, slug, topic_id, xp_reward'),
    supabase.from('exercises').select('id, lesson_id, type, question, options, correct_option, explanation, context'),
    supabase.from('topics').select('id, name, category_id, description, tier'),
  ]);

  const lessonMap = Object.fromEntries((allLessons || []).map(l => [String(l.id), l]));
  const exerciseMap = Object.fromEntries((allExercises || []).map(e => [String(e.id), normaliseExercise(e)]));
  const topicMap = Object.fromEntries((topics || []).map(t => [String(t.id), t]));

  const attemptRows = attempts || [];
  const exerciseStats = {};

  for (const row of attemptRows) {
    const eid = String(row.exercise_id);
    if (!exerciseStats[eid]) {
      exerciseStats[eid] = {
        exerciseId: eid,
        lessonId: String(row.lesson_id || ''),
        total: 0,
        wrong: 0,
        correct: 0,
        lastAttemptDate: row.created_at,
        isLatestCorrect: row.is_correct,
        history: [],
      };
    }
    exerciseStats[eid].total++;
    if (row.is_correct) exerciseStats[eid].correct++;
    else exerciseStats[eid].wrong++;
    exerciseStats[eid].history.push(row.is_correct);
  }

  const mistakes = [];
  for (const stat of Object.values(exerciseStats)) {
    if (stat.wrong > 0) {
      const ex = exerciseMap[stat.exerciseId] || {};
      const lesson = lessonMap[stat.lessonId] || (ex.lesson_id ? lessonMap[String(ex.lesson_id)] : null) || {};
      const topic = topicMap[String(lesson.topic_id)] || {};

      let formattedCorrect = '';
      if (Array.isArray(ex.options) && typeof ex.correct === 'number' && ex.options[ex.correct]) {
        formattedCorrect = ex.options[ex.correct];
      } else if (ex.correct !== null && ex.correct !== undefined) {
        formattedCorrect = String(ex.correct);
      }

      mistakes.push({
        exerciseId: stat.exerciseId,
        question: ex.question || 'Practice exercise',
        type: ex.type || 'mcq',
        options: ex.options || [],
        correctAnswer: formattedCorrect,
        explanation: ex.explanation || '',
        explanationContext: ex.context || '',
        lessonId: lesson.id || stat.lessonId,
        lessonTitle: lesson.title || 'Lesson',
        lessonSlug: lesson.slug || '',
        topicId: lesson.topic_id,
        topicName: topic.name || 'DSA',
        category: topic.category_id || 'dsa',
        wrongCount: stat.wrong,
        totalAttempts: stat.total,
        isResolved: stat.isLatestCorrect,
        lastAttemptedAt: stat.lastAttemptDate,
      });
    }
  }

  mistakes.sort((a, b) => {
    if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
    return new Date(b.lastAttemptedAt).getTime() - new Date(a.lastAttemptedAt).getTime();
  });

  const totalQuestionsTackled = attemptRows.length;
  const totalCorrect = attemptRows.filter(r => r.is_correct).length;
  const overallAccuracy = totalQuestionsTackled > 0 ? Math.round((totalCorrect / totalQuestionsTackled) * 100) : 0;

  const recent10 = attemptRows.slice(0, 10);
  const recentAccuracy = recent10.length > 0 ? Math.round((recent10.filter(r => r.is_correct).length / recent10.length) * 100) : overallAccuracy;

  const topicAccuracyMap = {};
  for (const row of attemptRows) {
    const eid = String(row.exercise_id);
    const ex = exerciseMap[eid] || {};
    const lid = String(row.lesson_id || ex.lesson_id || '');
    const l = lessonMap[lid];
    if (!l) continue;
    const tid = String(l.topic_id);
    if (!topicAccuracyMap[tid]) {
      const topic = topicMap[tid] || { id: tid, name: 'Topic', category_id: 'dsa' };
      topicAccuracyMap[tid] = {
        topic,
        total: 0,
        correct: 0,
        lessonSlug: l.slug,
      };
    }
    topicAccuracyMap[tid].total++;
    if (row.is_correct) topicAccuracyMap[tid].correct++;
  }

  const topicPerformance = Object.values(topicAccuracyMap).map(t => ({
    topicId: t.topic.id,
    name: t.topic.name,
    category: t.topic.category_id || 'dsa',
    accuracy: Math.round((t.correct / t.total) * 100),
    totalAnswered: t.total,
    lessonSlug: t.lessonSlug,
    status: (t.total >= 2 && (t.correct / t.total) < 0.6) ? 'struggling' : (t.correct / t.total) >= 0.8 ? 'strong' : 'inprogress',
  })).sort((a, b) => a.accuracy - b.accuracy);

  return {
    mistakes,
    unresolvedCount: mistakes.filter(m => !m.isResolved).length,
    overallAccuracy,
    recentAccuracy,
    totalQuestionsTackled,
    topicPerformance,
  };
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

export async function saveMockInterviewSession({
  topic,
  problemTitle,
  verdict,
  overallScore,
  rubricScores,
  durationSeconds,
  transcript,
  userCode,
  feedback,
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('mock_interview_sessions')
    .insert({
      user_id: user.id,
      topic,
      problem_title: problemTitle,
      verdict,
      overall_score: overallScore,
      rubric_scores: rubricScores || {},
      duration_seconds: durationSeconds || 0,
      transcript: transcript || [],
      user_code: userCode || '',
      feedback: feedback || {},
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserMockInterviews(limit = 10) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('mock_interview_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

