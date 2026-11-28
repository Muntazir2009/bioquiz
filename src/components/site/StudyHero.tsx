"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  X,
} from "lucide-react";

type TopicId = "cells" | "genetics" | "ecology";

type StudyCard = {
  id: TopicId;
  topic: string;
  prompt: string;
  options: string[];
  answer: number;
  why: string;
};

const CARDS: StudyCard[] = [
  {
    id: "cells",
    topic: "Cells",
    prompt:
      "Which organelle tags and sorts proteins before shipping them out of the cell?",
    options: ["Rough ER", "Golgi apparatus", "Lysosome"],
    answer: 1,
    why: "The rough ER builds the protein; the Golgi receives it, tags and sorts it, then buds it into a vesicle bound for the membrane. Build, then ship.",
  },
  {
    id: "genetics",
    topic: "Genetics",
    prompt:
      "A pure-breeding tall pea crossed with a pure-breeding short pea gives all tall offspring. What is the short parent's genotype?",
    options: ["tt", "Tt", "TT"],
    answer: 0,
    why: "Every seed got a T from the tall parent and still came out tall, so the short parent could only pass on t. Short is homozygous recessive: tt.",
  },
  {
    id: "ecology",
    topic: "Ecology",
    prompt:
      "Fertiliser runoff feeds an algal bloom in a lake. Which change comes first?",
    options: ["Fish numbers climb", "Dissolved oxygen falls", "Water clarity improves"],
    answer: 1,
    why: "The extra algae die and bacteria decompose them, drawing oxygen out of the water. Oxygen crashes before the fish are affected, and clarity drops, not rises.",
  },
];

const WEEK_GOAL = 3;
const HISTORY_KEY = "cosmos.history.v1";
const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type HistoryEntry = {
  date?: string;
  topic?: string;
  correct?: number;
  total?: number;
};

type WeekProgress =
  | { status: "loading" }
  | { status: "ready"; mastered: number; played: number }
  | { status: "empty" }
  | { status: "unavailable" };

function readWeekProgress(): WeekProgress {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const entries: HistoryEntry[] = Array.isArray(parsed) ? parsed : [];
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recent = entries.filter((entry) => {
      if (!entry || typeof entry.date !== "string") return false;
      const at = new Date(entry.date).getTime();
      return Number.isFinite(at) && at >= cutoff;
    });

    if (recent.length === 0) return { status: "empty" };

    const mastered = new Set(
      recent
        .filter((entry) => {
          const total = Number(entry.total);
          const correct = Number(entry.correct);
          return total > 0 && correct / total >= 0.8;
        })
        .map((entry) => String(entry.topic ?? "general"))
    ).size;

    return { status: "ready", mastered, played: recent.length };
  } catch {
    return { status: "unavailable" };
  }
}

export function StudyHero({ onBrowse }: { onBrowse: () => void }) {
  const [week, setWeek] = useState<WeekProgress>({ status: "loading" });
  const [cardIndex, setCardIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    setWeek(readWeekProgress());
  }, []);

  const card = CARDS[cardIndex];
  const answeredCorrectly = picked !== null && picked === card.answer;

  const selectTopic = useCallback((index: number) => {
    setCardIndex(index);
    setPicked(null);
  }, []);

  const nextCard = useCallback(() => {
    setCardIndex((current) => (current + 1) % CARDS.length);
    setPicked(null);
  }, []);

  const { percent, note, ringLabel } = useMemo(() => {
    if (week.status === "ready") {
      const ratio = Math.min(week.mastered, WEEK_GOAL) / WEEK_GOAL;
      return {
        percent: Math.round(ratio * 100),
        note: `${week.mastered} of ${WEEK_GOAL} topics at 80%+ this week · ${week.played} quiz${
          week.played === 1 ? "" : "zes"
        } played`,
        ringLabel: `${week.mastered} of ${WEEK_GOAL} topics mastered this week`,
      };
    }
    if (week.status === "empty") {
      return {
        percent: 0,
        note: "Nothing logged this week yet. Finish one quiz and the ring starts to fill.",
        ringLabel: "No topics mastered this week yet",
      };
    }
    if (week.status === "unavailable") {
      return {
        percent: 0,
        note: "Saved progress is blocked in this browser. Quizzes still work.",
        ringLabel: "Progress unavailable in this browser",
      };
    }
    return {
      percent: 0,
      note: "Reading this week's results…",
      ringLabel: "Loading this week's progress",
    };
  }, [week]);

  const showWhy = picked !== null;

  return (
    <div className="study-slide">
      <div className="study-sheet">
        <section className="study-copy study-rise">
          <p className="study-eyebrow">Biology, one question at a time</p>

          <h1 className="study-title">
            Learn how life
            <br />
            <em>actually</em> works
          </h1>

          <p className="study-lede">
            Bioquiz turns cell biology, genetics and ecology into focused daily
            quizzes. Track what you have mastered, see exactly which topics need
            review, and build real retention through spaced practice.
          </p>

          <div className="study-actions">
            <a className="cta-pump" href="/quiz.html">
              <span className="cta-pump__field" aria-hidden="true" />
              <span className="cta-pump__beat" aria-hidden="true" />
              <span
                className="cta-pump__bloom cta-pump__bloom--1"
                aria-hidden="true"
              />
              <span
                className="cta-pump__bloom cta-pump__bloom--2"
                aria-hidden="true"
              />
              <span
                className="cta-pump__bloom cta-pump__bloom--3"
                aria-hidden="true"
              />
              <span className="cta-pump__scrim" aria-hidden="true" />
              <span className="cta-pump__label">
                Start today&rsquo;s quiz
                <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
              </span>
            </a>

            <button type="button" className="study-alt" onClick={onBrowse}>
              Browse all modules
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          <p className="study-meta">
            <span>{CARDS.length} sample cards</span>
            <span>No sign-up</span>
            <span>Free</span>
          </p>
        </section>

        <aside className="study-dash study-rise study-rise--2" aria-label="Study dashboard">
          <div className="study-week">
            <div className="study-week__ringwrap">
              <svg
                className="study-week__ring"
                viewBox="0 0 62 62"
                role="img"
                aria-label={ringLabel}
              >
                <circle className="study-week__track" cx="31" cy="31" r={RING_RADIUS} />
                <circle
                  className="study-week__bar"
                  cx="31"
                  cy="31"
                  r={RING_RADIUS}
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={
                    RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE
                  }
                />
                <text
                  className="study-week__pct"
                  x="31"
                  y="31"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform="rotate(90 31 31)"
                >
                  {week.status === "loading" ? "—" : `${percent}%`}
                </text>
              </svg>
            </div>

            <div>
              <p className="study-week__label">This week</p>
              <p className="study-week__value">Topics mastered</p>
              <p className="study-week__note">{note}</p>
            </div>
          </div>

          <article className="study-card">
            <div className="study-card__head">
              <span className="study-chip">{card.topic}</span>
              <span className="study-step">
                Card {cardIndex + 1} of {CARDS.length}
              </span>
            </div>

            <p className="study-q">{card.prompt}</p>

            <div className="study-opts" role="group" aria-label="Answer options">
              {card.options.map((option, index) => {
                const isAnswer = index === card.answer;
                const isPicked = picked === index;
                const stateClass = showWhy
                  ? isAnswer
                    ? " is-correct"
                    : isPicked
                      ? " is-wrong"
                      : " is-dim"
                  : "";

                return (
                  <button
                    key={option}
                    type="button"
                    className={`study-opt${stateClass}`}
                    onClick={() => setPicked(index)}
                    disabled={showWhy}
                  >
                    <span className="study-opt__key" aria-hidden="true">
                      {showWhy && isAnswer ? (
                        <Check size={12} strokeWidth={3} />
                      ) : showWhy && isPicked ? (
                        <X size={12} strokeWidth={3} />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            <div aria-live="polite">
              {showWhy && (
                <div
                  key={`${card.id}-${picked}`}
                  className={`study-why${answeredCorrectly ? "" : " study-why--wrong"}`}
                >
                  <span className="study-why__label">
                    {answeredCorrectly ? (
                      <>
                        <Check size={11} strokeWidth={3} aria-hidden="true" />
                        Correct
                      </>
                    ) : (
                      <>
                        <X size={11} strokeWidth={3} aria-hidden="true" />
                        Not quite — {card.options[card.answer]}
                      </>
                    )}
                  </span>
                  <span className="study-why__text">{card.why}</span>
                </div>
              )}
            </div>

            <div className="study-card__foot">
              <button type="button" className="study-next" onClick={nextCard}>
                Another card
                <ChevronRight size={13} aria-hidden="true" />
              </button>
              <a className="study-link" href="/quiz.html">
                Open the full quiz
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </div>
          </article>

          <div className="study-map" role="group" aria-label="Topic map">
            <span className="study-map__label">Topic map</span>
            {CARDS.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                className="study-topic"
                aria-pressed={index === cardIndex}
                onClick={() => selectTopic(index)}
              >
                <span className="study-topic__dot" aria-hidden="true" />
                {entry.topic}
              </button>
            ))}
          </div>
        </aside>

        <div className="study-foot">
          <span>&copy; {new Date().getFullYear()} BioQuiz</span>
          <span className="study-foot__hint">
            Swipe or use &larr; &rarr; to explore modules
          </span>
        </div>
      </div>
    </div>
  );
}
