'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_TOPICS, MOCK_LESSONS } from '@/lib/mock-data';

const CAT_META = {
  dsa: { color: '#5a7a3a', dim: '#eaf2e3', label: 'DSA' },
  python: { color: '#2563a8', dim: '#dbeafe', label: 'Python' },
  'cs-fundamentals': { color: '#92400e', dim: '#fef3c7', label: 'CS Fundamentals' },
};

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'dsa', label: 'DSA' },
  { id: 'python', label: 'Python' },
  { id: 'cs-fundamentals', label: 'CS Fund.' },
];

function PathNode({ topic, lessons, isLast, onSelect }) {
  const meta = CAT_META[topic.category] || CAT_META.dsa;
  const isLocked = topic.status === 'locked';
  const isCompleted = topic.status === 'completed';
  const pct = topic.total_problems > 0 ? topic.problems_solved / topic.total_problems : 0;
  const r = 24;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-stretch gap-4">
      <div className="flex flex-col items-center">
        <button
          onClick={() => !isLocked && onSelect(topic)}
          disabled={isLocked}
          className="relative flex-shrink-0 outline-none"
          style={{ width: 56, height: 56 }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={r} fill={isLocked ? '#f0ede6' : meta.dim} stroke={isLocked ? '#ddd9cf' : '#e8e4dc'} strokeWidth="1" />
            {!isLocked && (
              <circle
                cx="28" cy="28" r={r}
                fill="none"
                stroke={meta.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct)}
                transform="rotate(-90 28 28)"
                opacity={isCompleted ? 1 : 0.7}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isLocked ? (
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#c8c3b8' }}>lock</span>
            ) : isCompleted ? (
              <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: meta.color }}>check_circle</span>
            ) : (
              <span className="material-symbols-outlined filled" style={{ fontSize: 20, color: meta.color }}>{topic.icon}</span>
            )}
          </div>
        </button>
        {!isLast && (
          <div
            className="w-0.5 flex-1 min-h-[20px]"
            style={{ backgroundColor: isLocked ? '#e8e4dc' : meta.color, opacity: isLocked ? 1 : 0.25 }}
          />
        )}
      </div>

      <button
        onClick={() => !isLocked && onSelect(topic)}
        disabled={isLocked}
        className="flex-1 min-w-0 py-3 text-left"
      >
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`font-sans font-semibold text-[15px] ${isLocked ? 'text-aq-text-muted' : 'text-aq-text-primary'}`}>
            {topic.name}
          </span>
          {!isLocked && (
            <span className="font-mono text-[10px] text-aq-text-muted flex-shrink-0">
              {topic.problems_solved}/{topic.total_problems}
            </span>
          )}
        </div>
        <p className={`font-sans text-[13px] leading-snug ${isLocked ? 'text-aq-text-muted' : 'text-aq-text-secondary'}`}>
          {isLocked
            ? 'Complete previous topics to unlock'
            : lessons.length > 0
              ? `${lessons.length} lesson${lessons.length > 1 ? 's' : ''} available`
              : topic.description}
        </p>
      </button>
    </div>
  );
}

function LessonCard({ lesson, color, onStart }) {
  const typeLabels = {
    mcq: 'Concept',
    code_pick: 'Coding',
    fill_blank: 'Fill Blank',
    arrange: 'Arrange',
  };

  const types = [...new Set(lesson.exercises.map(e => typeLabels[e.type] || e.type))];

  return (
    <button
      onClick={() => onStart(lesson.slug)}
      className="w-full text-left px-5 py-4 border-b border-aq-border hover:bg-aq-surface-raised transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-[15px] text-aq-text-primary mb-1">{lesson.title}</p>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {types.map(t => (
              <span key={t} className="font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-pill border border-aq-border text-aq-text-muted">
                {t.toUpperCase()}
              </span>
            ))}
          </div>
          <p className="font-mono text-[11px] text-aq-text-muted">{lesson.exercises.length} exercises · +{lesson.xp_reward} XP</p>
        </div>
        <span className="material-symbols-outlined text-[22px] text-aq-text-muted flex-shrink-0 mt-0.5">chevron_right</span>
      </div>
    </button>
  );
}

function TopicSheet({ topic, lessons, onClose, onStartLesson }) {
  const meta = CAT_META[topic.category] || CAT_META.dsa;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="flex-1" />
      <div
        className="bg-aq-surface rounded-t-[20px] flex flex-col"
        style={{ maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-aq-border">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: meta.color }}>{meta.label}</span>
            </div>
            <h2 className="font-sans font-bold text-[18px] text-aq-text-primary">{topic.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-aq-text-muted">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessons.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <span className="material-symbols-outlined text-[40px] text-aq-text-muted mb-3 block">construction</span>
              <p className="font-sans text-[14px] text-aq-text-muted">Lessons coming soon for this topic.</p>
            </div>
          ) : (
            lessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                color={meta.color}
                onStart={onStartLesson}
              />
            ))
          )}
        </div>

        {lessons.length > 0 && (
          <div className="px-5 py-4 border-t border-aq-border">
            <button
              onClick={() => onStartLesson(lessons[0].slug)}
              className="w-full py-3.5 rounded-input font-mono text-[12px] font-semibold tracking-widest uppercase text-white"
              style={{ backgroundColor: meta.color }}
            >
              START NEXT LESSON →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const router = useRouter();

  const visibleTopics = activeCategory === 'all'
    ? MOCK_TOPICS
    : MOCK_TOPICS.filter(t => t.category === activeCategory);

  const topicLessons = selectedTopic
    ? MOCK_LESSONS.filter(l => l.topic_id === selectedTopic.id)
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
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-pill font-mono text-[10px] font-semibold tracking-widest uppercase transition-colors ${
                activeCategory === tab.id
                  ? 'bg-aq-primary text-white'
                  : 'border border-aq-border text-aq-text-muted hover:text-aq-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-6">
        {visibleTopics.map((topic, i) => {
          const lessons = MOCK_LESSONS.filter(l => l.topic_id === topic.id);
          return (
            <PathNode
              key={topic.id}
              topic={topic}
              lessons={lessons}
              isLast={i === visibleTopics.length - 1}
              onSelect={setSelectedTopic}
            />
          );
        })}
      </div>

      {selectedTopic && (
        <TopicSheet
          topic={selectedTopic}
          lessons={topicLessons}
          onClose={() => setSelectedTopic(null)}
          onStartLesson={handleStartLesson}
        />
      )}
    </div>
  );
}
