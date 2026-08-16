'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getTopics, getAllLessons, getUserLessonProgress } from '@/lib/db';

const CATEGORIES = [
  {
    id:    'dsa',
    label: 'Data Structures & Algorithms',
    short: 'DSA',
    icon:  'account_tree',
    color: '#5a7a3a',
    dim:   '#eaf2e3',
  },
  {
    id:    'python',
    label: 'Python',
    short: 'Python',
    icon:  'code',
    color: '#2563a8',
    dim:   '#dbeafe',
  },
  {
    id:    'cs-fundamentals',
    label: 'CS Fundamentals',
    short: 'CS Fund.',
    icon:  'school',
    color: '#92400e',
    dim:   '#fef3c7',
  },
];

function TopicRow({ topic, lessons, completedLessonIds, color, onSelect }) {
  const total       = lessons.length;
  const done        = lessons.filter(l => completedLessonIds.has(l.id)).length;
  const pct         = total > 0 ? done / total : 0;
  const isLocked    = total === 0;
  const isCompleted = !isLocked && done === total;

  const r    = 18;
  const circ = 2 * Math.PI * r;

  return (
    <button
      onClick={() => !isLocked && onSelect(topic)}
      disabled={isLocked}
      className={`w-full flex items-center gap-4 px-4 py-3.5 border-b border-aq-border last:border-b-0 text-left transition-colors ${
        isLocked ? 'opacity-50 cursor-default' : 'hover:bg-aq-surface-raised active:bg-aq-surface-raised'
      }`}
    >
      <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill={isLocked ? '#f0ede6' : color + '18'} />
          {!isLocked && (
            <circle
              cx="20" cy="20" r={r}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              transform="rotate(-90 20 20)"
              opacity={0.85}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isLocked ? (
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#c8c3b8' }}>lock</span>
          ) : isCompleted ? (
            <span className="material-symbols-outlined filled" style={{ fontSize: 18, color }}>check_circle</span>
          ) : (
            <span className="material-symbols-outlined filled" style={{ fontSize: 16, color }}>{topic.icon}</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-sans font-semibold text-[15px] ${isLocked ? 'text-aq-text-muted' : 'text-aq-text-primary'}`}>
          {topic.name}
        </p>
        <p className="font-sans text-[12px] text-aq-text-muted mt-0.5">
          {isLocked
            ? 'No lessons yet'
            : isCompleted
              ? `All ${total} done ✓`
              : done > 0
                ? `${done} of ${total} done`
                : `${total} lesson${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {!isLocked && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-pill"
            style={{ color, backgroundColor: color + '18' }}
          >
            {done}/{total}
          </span>
          <span className="material-symbols-outlined text-[20px] text-aq-text-muted">chevron_right</span>
        </div>
      )}
    </button>
  );
}

function CategorySection({ cat, topics, lessons, completedLessonIds, onSelect }) {
  const catTopics = topics.filter(t => t.category_id === cat.id);
  const catLessons = lessons.filter(l => catTopics.some(t => t.id === l.topic_id));
  const totalLessons = catLessons.length;
  const doneLessons  = catLessons.filter(l => completedLessonIds.has(l.id)).length;
  const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  return (
    <div className="mb-5">
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-card border border-b-0"
        style={{ backgroundColor: cat.dim, borderColor: cat.color + '30' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined filled text-[20px]" style={{ color: cat.color }}>
            {cat.icon}
          </span>
          <div>
            <p className="font-sans font-bold text-[15px]" style={{ color: cat.color }}>
              {cat.label}
            </p>
            <p className="font-mono text-[10px] tracking-widest" style={{ color: cat.color + 'aa' }}>
              {doneLessons}/{totalLessons} LESSONS DONE
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="font-mono font-bold text-[14px]" style={{ color: cat.color }}>{pct}%</span>
          <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: cat.color + '25' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: cat.color }}
            />
          </div>
        </div>
      </div>

      <div
        className="rounded-b-card border overflow-hidden"
        style={{ borderColor: cat.color + '30' }}
      >
        {catTopics.length === 0 ? (
          <p className="px-4 py-4 font-sans text-[13px] text-aq-text-muted">No topics yet.</p>
        ) : (
          catTopics.map(topic => (
            <TopicRow
              key={topic.id}
              topic={topic}
              lessons={lessons.filter(l => l.topic_id === topic.id)}
              completedLessonIds={completedLessonIds}
              color={cat.color}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

function LessonCard({ lesson, isDone, color, onStart }) {
  return (
    <button
      onClick={() => onStart(lesson.slug)}
      className="w-full text-left px-5 py-4 border-b border-aq-border hover:bg-aq-surface-raised transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isDone && (
              <span className="material-symbols-outlined filled text-[16px]" style={{ color }}>
                check_circle
              </span>
            )}
            <p className={`font-sans font-semibold text-[15px] ${isDone ? 'text-aq-text-secondary' : 'text-aq-text-primary'}`}>
              {lesson.title}
            </p>
          </div>
          <p className="font-sans text-[12px] text-aq-text-secondary leading-snug mb-1">
            {lesson.description}
          </p>
          <p className="font-mono text-[11px] text-aq-text-muted">
            {lesson.exercises?.length ?? 0} exercises · +{lesson.xp_reward} XP
          </p>
        </div>
        <span className="material-symbols-outlined text-[22px] text-aq-text-muted flex-shrink-0 mt-0.5">
          {isDone ? 'replay' : 'chevron_right'}
        </span>
      </div>
    </button>
  );
}

function TopicSheet({ topic, lessons, completedLessonIds, catColor, onClose, onStartLesson }) {
  const done  = lessons.filter(l => completedLessonIds.has(l.id)).length;
  const total = lessons.length;
  const firstIncomplete = lessons.find(l => !completedLessonIds.has(l.id));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div className="flex-1" />
      <div
        className="bg-aq-surface rounded-t-[20px] flex flex-col"
        style={{ maxHeight: '82vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-aq-border">
          <div>
            <h2 className="font-sans font-bold text-[18px] text-aq-text-primary">{topic.name}</h2>
            <p className="font-mono text-[11px] text-aq-text-muted mt-0.5">
              {done}/{total} lessons complete{done === total && total > 0 ? ' ✓' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-aq-text-muted">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessons.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <span className="material-symbols-outlined text-[40px] text-aq-text-muted mb-3 block">construction</span>
              <p className="font-sans text-[14px] text-aq-text-muted">Lessons coming soon.</p>
            </div>
          ) : (
            lessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isDone={completedLessonIds.has(lesson.id)}
                color={catColor}
                onStart={onStartLesson}
              />
            ))
          )}
        </div>

        {lessons.length > 0 && (
          <div className="px-5 py-4 border-t border-aq-border">
            <button
              onClick={() => onStartLesson((firstIncomplete || lessons[0]).slug)}
              className="w-full py-3.5 rounded-input font-mono text-[12px] font-semibold tracking-widest uppercase text-white"
              style={{ backgroundColor: catColor }}
            >
              {firstIncomplete ? 'START NEXT LESSON →' : 'REVIEW LESSONS →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const [selectedTopic,  setSelectedTopic]  = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [topics,         setTopics]         = useState([]);
  const [lessons,        setLessons]        = useState([]);
  const [completedIds,   setCompletedIds]   = useState(new Set());
  const [loading,        setLoading]        = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }

      const [t, l, progress] = await Promise.all([
        getTopics(),
        getAllLessons(),
        getUserLessonProgress(user.id),
      ]);

      setTopics(t);
      setLessons(l);
      setCompletedIds(new Set((progress || []).filter(p => p.completed).map(p => p.lesson_id)));
      setLoading(false);
    });
  }, []);

  const visibleCats = activeCategory === 'all'
    ? CATEGORIES
    : CATEGORIES.filter(c => c.id === activeCategory);

  const selectedCat = selectedTopic
    ? CATEGORIES.find(c => c.id === selectedTopic.category_id)
    : null;

  const topicLessons = selectedTopic
    ? lessons.filter(l => l.topic_id === selectedTopic.id)
    : [];

  function handleStartLesson(slug) {
    setSelectedTopic(null);
    router.push(`/lesson/${slug}`);
  }

  return (
    <div className="min-h-screen bg-aq-bg">
      <div className="sticky top-0 z-40 bg-aq-surface border-b border-aq-border">
        <div className="px-5 h-14 flex items-center">
          <h1 className="font-sans font-bold text-[18px] text-aq-text-primary">Topics</h1>
        </div>

        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-pill font-mono text-[10px] font-semibold tracking-widest uppercase transition-colors ${
              activeCategory === 'all'
                ? 'bg-aq-text-primary text-white'
                : 'border border-aq-border text-aq-text-muted'
            }`}
          >
            ALL
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-pill font-mono text-[10px] font-semibold tracking-widest uppercase transition-colors ${
                activeCategory === cat.id
                  ? 'text-white'
                  : 'border text-aq-text-muted'
              }`}
              style={
                activeCategory === cat.id
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : { borderColor: cat.color + '50', color: cat.color }
              }
            >
              <span className="material-symbols-outlined filled" style={{ fontSize: 12 }}>{cat.icon}</span>
              {cat.short}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-[32px] text-aq-text-muted animate-spin">
              progress_activity
            </span>
          </div>
        ) : (
          visibleCats.map(cat => (
            <CategorySection
              key={cat.id}
              cat={cat}
              topics={topics}
              lessons={lessons}
              completedLessonIds={completedIds}
              onSelect={setSelectedTopic}
            />
          ))
        )}
      </div>

      {selectedTopic && selectedCat && (
        <TopicSheet
          topic={selectedTopic}
          lessons={topicLessons}
          completedLessonIds={completedIds}
          catColor={selectedCat.color}
          onClose={() => setSelectedTopic(null)}
          onStartLesson={handleStartLesson}
        />
      )}
    </div>
  );
}
