'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LESSONS from '@/data/lessons.json';

const CAT_COLOR = {
  dsa: '#5a7a3a',
  python: '#2563a8',
  'cs-fundamentals': '#92400e',
};

function ProgressBar({ current, total, color }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="h-2 bg-aq-surface-raised rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function CodeBlock({ text }) {
  return (
    <div className="bg-aq-surface-raised rounded-input px-4 py-3 font-mono text-[14px] text-aq-text-primary whitespace-pre leading-relaxed">
      {text}
    </div>
  );
}

function MCQExercise({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;

  function handleSelect(i) {
    if (answered) return;
    setSelected(i);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        {exercise.explanation_context && (
          <p className="font-sans text-[13px] text-aq-text-muted mb-3 italic">{exercise.explanation_context}</p>
        )}
        <h2 className="font-sans font-bold text-[20px] text-aq-text-primary leading-snug mb-6">
          {exercise.question}
        </h2>
        <div className="flex flex-col gap-3">
          {exercise.options.map((opt, i) => {
            let border = 'border-aq-border';
            let bg = 'bg-aq-surface';
            let text = 'text-aq-text-primary';

            if (answered) {
              if (i === exercise.correct) {
                border = 'border-aq-success';
                bg = 'bg-aq-success-bg';
                text = 'text-aq-success';
              } else if (i === selected) {
                border = 'border-aq-error';
                bg = 'bg-aq-error-bg';
                text = 'text-aq-error';
              } else {
                text = 'text-aq-text-muted';
              }
            } else if (selected === i) {
              border = 'border-aq-primary';
              bg = 'bg-aq-primary-dim';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-3.5 border rounded-card transition-colors ${border} ${bg}`}
              >
                <span className={`font-sans text-[15px] font-medium ${text}`}>{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 p-4 rounded-card border border-aq-border bg-aq-surface">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined filled text-[18px] ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'CORRECT' : 'NOT QUITE'}
              </span>
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{exercise.explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-aq-border">
        {!answered ? (
          <button
            onClick={() => selected !== null && handleSelect(selected)}
            disabled={selected === null}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase transition-colors disabled:opacity-30 disabled:cursor-default bg-aq-text-primary text-white"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAnswer(selected === exercise.correct)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white transition-colors"
            style={{ backgroundColor: selected === exercise.correct ? '#5a7a3a' : '#9b3c3c' }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}

function CodePickExercise({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;

  function handleSelect(i) {
    if (answered) return;
    setSelected(i);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h2 className="font-sans font-bold text-[20px] text-aq-text-primary leading-snug mb-4">
          {exercise.question}
        </h2>
        {exercise.context && (
          <div className="mb-6">
            <CodeBlock text={exercise.context} />
          </div>
        )}
        <div className="flex flex-col gap-3">
          {exercise.options.map((opt, i) => {
            let border = 'border-aq-border';
            let bg = 'bg-aq-surface';
            let text = 'text-aq-text-primary';

            if (answered) {
              if (i === exercise.correct) { border = 'border-aq-success'; bg = 'bg-aq-success-bg'; text = 'text-aq-success'; }
              else if (i === selected) { border = 'border-aq-error'; bg = 'bg-aq-error-bg'; text = 'text-aq-error'; }
              else { text = 'text-aq-text-muted'; }
            } else if (selected === i) {
              border = 'border-aq-primary'; bg = 'bg-aq-primary-dim';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-3 border rounded-card transition-colors ${border} ${bg}`}
              >
                <span className={`font-mono text-[14px] ${text}`}>{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 p-4 rounded-card border border-aq-border bg-aq-surface">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined filled text-[18px] ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'CORRECT' : 'NOT QUITE'}
              </span>
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{exercise.explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-aq-border">
        {!answered ? (
          <button
            disabled={selected === null}
            onClick={() => selected !== null && setSelected(selected)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase transition-colors disabled:opacity-30 disabled:cursor-default bg-aq-text-primary text-white"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAnswer(selected === exercise.correct)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white transition-colors"
            style={{ backgroundColor: selected === exercise.correct ? '#5a7a3a' : '#9b3c3c' }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}

function FillBlankExercise({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h2 className="font-sans font-bold text-[20px] text-aq-text-primary leading-snug mb-4">
          {exercise.question}
        </h2>

        <div className="bg-aq-surface-raised rounded-card px-4 py-4 font-mono text-[14px] leading-loose mb-6">
          {exercise.code_lines.map((line, i) => {
            if (i === exercise.blank_index) {
              const filled = selected !== null ? exercise.options[selected] : null;
              return (
                <div key={i}>
                  {line.replace(exercise.blank_placeholder, '')}
                  <span
                    className={`inline-block px-2 py-0.5 rounded mx-1 border transition-colors ${
                      filled
                        ? answered
                          ? selected === exercise.correct
                            ? 'border-aq-success bg-aq-success-bg text-aq-success'
                            : 'border-aq-error bg-aq-error-bg text-aq-error'
                          : 'border-aq-primary bg-aq-primary-dim text-aq-primary'
                        : 'border-dashed border-aq-border text-aq-text-muted w-16 text-center'
                    }`}
                  >
                    {filled || '____'}
                  </span>
                </div>
              );
            }
            return <div key={i} className="text-aq-text-primary">{line}</div>;
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {exercise.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => !answered && setSelected(isSelected ? null : i)}
                className={`px-4 py-2.5 rounded-input border font-mono text-[14px] font-medium transition-colors ${
                  isSelected
                    ? 'border-aq-primary bg-aq-primary-dim text-aq-primary'
                    : 'border-aq-border bg-aq-surface text-aq-text-primary hover:border-aq-border-strong'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="p-4 rounded-card border border-aq-border bg-aq-surface mt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined filled text-[18px] ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest ${selected === exercise.correct ? 'text-aq-success' : 'text-aq-error'}`}>
                {selected === exercise.correct ? 'CORRECT' : 'NOT QUITE'}
              </span>
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{exercise.explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-aq-border">
        {!answered ? (
          <button
            disabled={selected === null}
            onClick={() => selected !== null && setSelected(selected)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase transition-colors disabled:opacity-30 disabled:cursor-default bg-aq-text-primary text-white"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAnswer(selected === exercise.correct)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white"
            style={{ backgroundColor: selected === exercise.correct ? '#5a7a3a' : '#9b3c3c' }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}

function ArrangeExercise({ exercise, onAnswer }) {
  const [order, setOrder] = useState(() =>
    exercise.blocks.map((_, i) => i).sort(() => Math.random() - 0.5)
  );
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && JSON.stringify(order) === JSON.stringify(exercise.correct_order);

  function moveUp(idx) {
    if (idx === 0 || submitted) return;
    const next = [...order];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setOrder(next);
  }

  function moveDown(idx) {
    if (idx === order.length - 1 || submitted) return;
    const next = [...order];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setOrder(next);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <h2 className="font-sans font-bold text-[20px] text-aq-text-primary leading-snug mb-2">
          {exercise.question}
        </h2>
        <p className="font-sans text-[13px] text-aq-text-muted mb-5">Tap ↑ ↓ to reorder the lines.</p>

        <div className="flex flex-col gap-2">
          {order.map((blockIdx, pos) => {
            const isCorrectPos = submitted && exercise.correct_order[pos] === blockIdx;
            const isWrongPos = submitted && exercise.correct_order[pos] !== blockIdx;
            return (
              <div
                key={blockIdx}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-card border transition-colors ${
                  isCorrectPos ? 'border-aq-success bg-aq-success-bg' :
                  isWrongPos ? 'border-aq-error bg-aq-error-bg' :
                  'border-aq-border bg-aq-surface'
                }`}
              >
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveUp(pos)}
                    disabled={pos === 0 || submitted}
                    className="text-aq-text-muted hover:text-aq-text-primary disabled:opacity-20 text-[14px] leading-none"
                  >↑</button>
                  <button
                    onClick={() => moveDown(pos)}
                    disabled={pos === order.length - 1 || submitted}
                    className="text-aq-text-muted hover:text-aq-text-primary disabled:opacity-20 text-[14px] leading-none"
                  >↓</button>
                </div>
                <span className={`font-mono text-[13px] flex-1 ${
                  isCorrectPos ? 'text-aq-success' : isWrongPos ? 'text-aq-error' : 'text-aq-text-primary'
                }`}>
                  {exercise.blocks[blockIdx]}
                </span>
              </div>
            );
          })}
        </div>

        {submitted && (
          <div className="mt-5 p-4 rounded-card border border-aq-border bg-aq-surface">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined filled text-[18px] ${isCorrect ? 'text-aq-success' : 'text-aq-error'}`}>
                {isCorrect ? 'check_circle' : 'cancel'}
              </span>
              <span className={`font-mono text-[11px] font-bold tracking-widest ${isCorrect ? 'text-aq-success' : 'text-aq-error'}`}>
                {isCorrect ? 'CORRECT' : 'NOT QUITE'}
              </span>
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{exercise.explanation}</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-aq-border">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase bg-aq-text-primary text-white"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAnswer(isCorrect)}
            className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white"
            style={{ backgroundColor: isCorrect ? '#5a7a3a' : '#9b3c3c' }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  );
}

function CompletionScreen({ lesson, correct, total, color, onFinish }) {
  const xpEarned = Math.round((correct / total) * lesson.xp_reward);
  const perfect = correct === total;

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: color + '20' }}
      >
        <span className="material-symbols-outlined filled text-[44px]" style={{ color }}>
          {perfect ? 'workspace_premium' : 'check_circle'}
        </span>
      </div>
      <h2 className="font-sans font-bold text-[26px] text-aq-text-primary mb-2">
        {perfect ? 'Perfect score!' : 'Lesson complete!'}
      </h2>
      <p className="font-sans text-[15px] text-aq-text-secondary mb-8">
        {correct}/{total} correct
      </p>

      <div className="flex gap-6 mb-10">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono font-bold text-[28px]" style={{ color }}>+{xpEarned}</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-aq-text-muted">XP EARNED</span>
        </div>
        <div className="w-px bg-aq-border" />
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono font-bold text-[28px] text-aq-gold">
            <span className="material-symbols-outlined filled text-[28px]">local_fire_department</span>
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-aq-text-muted">STREAK +1</span>
        </div>
      </div>

      <button
        onClick={onFinish}
        className="w-full py-3.5 rounded-input font-mono text-[13px] font-semibold tracking-widest uppercase text-white"
        style={{ backgroundColor: color }}
      >
        BACK TO TOPICS
      </button>
    </div>
  );
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lesson = LESSONS.find(l => l.slug === params.slug);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-aq-bg flex items-center justify-center">
        <p className="font-sans text-aq-text-muted">Lesson not found.</p>
      </div>
    );
  }

  const color = CAT_COLOR[lesson.category] || CAT_COLOR.dsa;
  const exercises = lesson.exercises;
  const currentExercise = exercises[exerciseIndex];

  function handleAnswer(isCorrect) {
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    if (exerciseIndex + 1 >= exercises.length) {
      setCorrectCount(nextCorrect);
      setDone(true);
    } else {
      setCorrectCount(nextCorrect);
      setExerciseIndex(exerciseIndex + 1);
    }
  }

  function renderExercise(exercise) {
    const key = `${lesson.id}-${exercise.id}`;
    if (exercise.type === 'mcq') return <MCQExercise key={key} exercise={exercise} onAnswer={handleAnswer} />;
    if (exercise.type === 'code_pick') return <CodePickExercise key={key} exercise={exercise} onAnswer={handleAnswer} />;
    if (exercise.type === 'fill_blank') return <FillBlankExercise key={key} exercise={exercise} onAnswer={handleAnswer} />;
    if (exercise.type === 'arrange') return <ArrangeExercise key={key} exercise={exercise} onAnswer={handleAnswer} />;
    return null;
  }

  return (
    <div className="min-h-screen bg-aq-surface flex flex-col" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-aq-border bg-aq-surface">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.back()}
            className="p-1 text-aq-text-muted hover:text-aq-text-primary flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
          <div className="flex-1">
            <ProgressBar
              current={done ? exercises.length : exerciseIndex}
              total={exercises.length}
              color={color}
            />
          </div>
          <span className="font-mono text-[11px] text-aq-text-muted flex-shrink-0">
            {done ? exercises.length : exerciseIndex}/{exercises.length}
          </span>
        </div>
        <h1 className="font-mono text-[12px] font-semibold tracking-widest uppercase" style={{ color }}>
          {lesson.title}
        </h1>
      </div>

      <div className="flex-1 overflow-hidden">
        {done ? (
          <div className="h-full px-5 py-6">
            <CompletionScreen
              lesson={lesson}
              correct={correctCount}
              total={exercises.length}
              color={color}
              onFinish={() => router.push('/skills')}
            />
          </div>
        ) : (
          renderExercise(currentExercise)
        )}
      </div>
    </div>
  );
}
