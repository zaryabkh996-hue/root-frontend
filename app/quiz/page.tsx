'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QuizAnswer {
  dimension: string;
  value: number;
}

type DimensionKey = 'identity' | 'emotional' | 'authenticity' | 'protocol' | 'community';

const DIMENSIONS: Record<DimensionKey, string> = {
  identity: 'Identity & Belonging',
  emotional: 'Emotional Readiness',
  authenticity: 'Authenticity',
  protocol: 'Cultural Protocol',
  community: 'Community Connection'
};

const DIMENSION_TAGS: Record<DimensionKey, string> = {
  identity: 'tag-brass',
  emotional: 'tag-terra',
  authenticity: 'tag-terra',
  protocol: 'tag-emerald',
  community: 'tag-emerald'
};

const QUESTIONS = [
  {
    id: 1,
    dimension: 'identity',
    question: 'How strong is your sense of African heritage?',
    options: [
      { key: 'A', label: 'Profound — I feel it daily', value: 4 },
      { key: 'B', label: 'Present — and growing', value: 3 },
      { key: 'C', label: 'Some — comes and goes', value: 2 },
      { key: 'D', label: 'Faint — I am just beginning', value: 1 }
    ]
  },
  {
    id: 2,
    dimension: 'emotional',
    question: 'How prepared do you feel to visit a slave castle?',
    options: [
      { key: 'A', label: 'Prepared — I have done inner work', value: 4 },
      { key: 'B', label: 'Mostly — some worry remains', value: 3 },
      { key: 'C', label: 'Uncertain — open but unprepared', value: 2 },
      { key: 'D', label: 'Not at all — I avoid thinking about it', value: 1 }
    ]
  },
  {
    id: 3,
    dimension: 'authenticity',
    question: 'How would you feel if you were not invited to a ceremony?',
    options: [
      { key: 'A', label: 'I would respect their judgement', value: 4 },
      { key: 'B', label: 'Disappointed — but I would understand', value: 3 },
      { key: 'C', label: 'Hurt — though I would hide it', value: 2 },
      { key: 'D', label: 'Devastated — I would feel rejected', value: 1 }
    ]
  },
  {
    id: 4,
    dimension: 'protocol',
    question: 'How well do you know how to greet an African elder?',
    options: [
      { key: 'A', label: 'Very well — I practise it', value: 4 },
      { key: 'B', label: 'I know the basics', value: 3 },
      { key: 'C', label: 'A little', value: 2 },
      { key: 'D', label: 'Not at all', value: 1 }
    ]
  },
  {
    id: 5,
    dimension: 'community',
    question: 'How important is it to meet other diaspora travellers?',
    options: [
      { key: 'A', label: 'Essential — community is the work', value: 4 },
      { key: 'B', label: 'Important', value: 3 },
      { key: 'C', label: 'Useful', value: 2 },
      { key: 'D', label: 'I prefer to do this alone', value: 1 }
    ]
  },
  {
    id: 6,
    dimension: 'identity',
    question: 'Have you visited an African country before?',
    options: [
      { key: 'A', label: 'Yes — multiple times', value: 4 },
      { key: 'B', label: 'Yes — once', value: 3 },
      { key: 'C', label: 'No, but family has', value: 2 },
      { key: 'D', label: 'No, this would be my first', value: 1 }
    ]
  },
  {
    id: 7,
    dimension: 'emotional',
    question: 'Can you sit with joy and grief at the same time?',
    options: [
      { key: 'A', label: 'Yes — both can be true', value: 4 },
      { key: 'B', label: 'I am learning to', value: 3 },
      { key: 'C', label: 'It is hard for me', value: 2 },
      { key: 'D', label: 'I prefer one or the other', value: 1 }
    ]
  },
  {
    id: 8,
    dimension: 'authenticity',
    question: 'Do tip jars at sacred sites bother you?',
    options: [
      { key: 'A', label: 'I understand — locals must live', value: 4 },
      { key: 'B', label: 'Conflicted but accepting', value: 3 },
      { key: 'C', label: 'It bothers me a little', value: 2 },
      { key: 'D', label: 'It feels disrespectful', value: 1 }
    ]
  }
];

export default function Quiz() {
  const router = useRouter();
  const [quizState, setQuizState] = useState<'intro' | 'active' | 'completing'>('intro');
  const [name, setName] = useState('');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIdx];
  const currentAnswer = answers.find(a => a.dimension === currentQuestion.dimension);
  const answeredCount = answers.length;
  const totalQuestions = QUESTIONS.length;
  const progress = (answeredCount / totalQuestions) * 100;

  const getConfidenceText = () => {
    const pct = Math.min(90, Math.round(progress * 1.1));
    return `Confidence rising · ${pct}%`;
  };

  const handleSelectOption = async (value: number) => {
    setIsTransitioning(true);

    const newAnswers = answers.filter(a => a.dimension !== currentQuestion.dimension);
    newAnswers.push({ dimension: currentQuestion.dimension, value });
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIdx < QUESTIONS.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else {
        setQuizState('completing');
        handleSubmit(newAnswers);
      }
      setIsTransitioning(false);
    }, 400);
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleStartQuiz = () => {
    if (name.trim()) {
      setQuizState('active');
      setCurrentQuestionIdx(0);
    }
  };

  const calculateScores = (finalAnswers: QuizAnswer[]) => {
    const dimensions: { [key: string]: number[] } = {
      identity: [],
      emotional: [],
      authenticity: [],
      protocol: [],
      community: []
    };

    finalAnswers.forEach(answer => {
      dimensions[answer.dimension].push(answer.value);
    });

    const avgScores: { [key: string]: number } = {};
    Object.keys(dimensions).forEach(key => {
      const scores = dimensions[key];
      const avgValue = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
      avgScores[key] = Math.round((avgValue / 4) * 100);
    });

    return avgScores;
  };

  const getTierAndPersona = (totalScore: number) => {
    if (totalScore < 40) {
      return { tier: 'Latent', persona: 'Foundation Seeker', tier_display: 'Free' };
    } else if (totalScore < 60) {
      return { tier: 'Active', persona: 'Cultural Explorer', tier_display: 'Community' };
    } else {
      return { tier: 'Immersive', persona: 'Heritage Seeker', tier_display: 'Preparation' };
    }
  };

  const handleSubmit = (finalAnswers: QuizAnswer[]) => {
    const scores = calculateScores(finalAnswers);
    const totalScore = Math.round(
      (scores.identity + scores.emotional + scores.authenticity + scores.protocol + scores.community) / 5
    );
    const tierInfo = getTierAndPersona(totalScore);

    const reportData = {
      name,
      totalScore,
      scores,
      tier: tierInfo.tier,
      persona: tierInfo.persona,
      tier_display: tierInfo.tier_display
    };

    sessionStorage.setItem('quizReport', JSON.stringify(reportData));
    setTimeout(() => router.push('/report'), 600);
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Intro State */}
        {quizState === 'intro' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-10">
              <div className="eyebrow mb-4 ornament">Travel DNA Quiz™</div>
              <h1 className="display text-5xl font-light leading-tight mb-6">
                Before we begin, may we know your name?
              </h1>
              <p className="text-ink-dim text-lg leading-relaxed max-w-xl mx-auto">
                This is the only thing we save before the questions. Your responses are private, and your name is what we will call you when we welcome you home.
              </p>
            </div>

            <div className="scard p-8 mb-6">
              <label className="eyebrow block mb-2">Your first name</label>
              <input
                id="quiz-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amara"
                className="field text-lg w-full"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleStartQuiz()}
              />
              <div className="flex items-center gap-2 mt-5 text-xs text-ink-dim">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                <span>~5 minutes · adaptive · we ask only what we need</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                className="btn-primary text-base"
              >
                Begin
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14m-6-6 6 6-6 6"></path>
                </svg>
              </button>
            </div>

            <div className="text-center mt-12">
              <div className="eyebrow mb-3">What we measure</div>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="tag tag-brass">Identity & Belonging</span>
                <span className="tag tag-emerald">Emotional Readiness</span>
                <span className="tag tag-terra">Authenticity</span>
                <span className="tag tag-brass">Cultural Protocol</span>
                <span className="tag tag-emerald">Community</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Quiz State */}
        {quizState === 'active' && (
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* Progress */}
            <div className="flex items-center justify-between mb-3 text-xs mono text-ink-dim">
              <span id="quiz-progress-text">Question {currentQuestionIdx + 1} of ~{totalQuestions}</span>
              <span className={`tag ${DIMENSION_TAGS[currentQuestion.dimension as DimensionKey]}`}>
                {DIMENSIONS[currentQuestion.dimension as DimensionKey]}
              </span>
            </div>

            <div className="quiz-bar mb-12">
              <div
                className="quiz-bar-fill"
                id="quiz-progress-fill"
                style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
              ></div>
            </div>

            {/* Question */}
            <div className="mb-10">
              <div className="eyebrow mb-3" id="quiz-q-num">
                Question {String(currentQuestionIdx + 1).padStart(2, '0')}
              </div>
              <h2 id="quiz-question" className="display text-3xl md:text-4xl font-light leading-tight">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-10" id="quiz-options">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option.value)}
                  className={`quiz-option w-full p-4 text-left rounded-md border-2 transition-all ${
                    currentAnswer?.value === option.value
                      ? 'border-brass bg-brass/5'
                      : 'border-line hover:border-brass/30'
                  }`}
                  data-v={option.value}
                >
                  <div className="flex items-center gap-3">
                    <span className="opt-key font-bold text-brass">{option.key}</span>
                    <span className="text-base font-medium text-ink">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-line">
              <button
                onClick={handleBack}
                id="quiz-back-btn"
                className="btn-ghost"
                disabled={currentQuestionIdx === 0}
              >
                ← Back
              </button>
              <div className="text-xs text-ink-faint mono" id="quiz-confidence">
                {getConfidenceText()}
              </div>
            </div>
          </div>
        )}

        {/* Completing State */}
        {quizState === 'completing' && (
          <div className="text-center py-12">
            <div className="display text-2xl mb-4">Analyzing your responses...</div>
            <div className="w-12 h-12 border-4 border-brass border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        .field {
          background: var(--cream);
          border: 1px solid var(--line);
          border-radius: 3px;
          padding: 12px 16px;
          font-family: inherit;
          font-size: 16px;
          color: var(--ink);
          transition: all 0.2s;
        }

        .field:focus {
          outline: none;
          border-color: var(--brass);
          box-shadow: 0 0 0 3px rgba(201, 161, 74, 0.1);
        }

        .field::placeholder {
          color: var(--ink-faint);
        }

        .quiz-bar {
          width: 100%;
          height: 8px;
          background: var(--line);
          border-radius: 4px;
          overflow: hidden;
        }

        .quiz-bar-fill {
          height: 100%;
          background: var(--brass);
          border-radius: 4px;
        }

        .quiz-option {
          border: 1px solid var(--line);
          transition: all 0.2s;
          cursor: pointer;
        }

        .quiz-option:hover:not(:disabled) {
          border-color: rgba(201, 161, 74, 0.3);
          background: var(--cream-warm);
        }

        .opt-key {
          display: inline-flex;
          width: 24px;
          height: 24px;
          align-items: center;
          justify-content: center;
          background: rgba(201, 161, 74, 0.1);
          border-radius: 50%;
          flex-shrink: 0;
          font-size: 12px;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
