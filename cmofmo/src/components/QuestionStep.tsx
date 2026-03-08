import { useState } from 'react';
import { useWizard } from '../hooks/useWizard';
import { useLanguage } from '../config/i18n';
import { useTheme } from '../themes/ThemeProvider';
import { getQuestionsForSector } from '../config/questions';

export function QuestionStep() {
  const { sector, answers, setAnswer, nextStep } = useWizard();
  const { lang } = useLanguage();
  const theme = useTheme();
  const [currentQ, setCurrentQ] = useState(0);

  if (!sector) return null;

  const sectorData = getQuestionsForSector(sector);
  const questions = sectorData.questions;
  const totalQ = questions.length;
  const question = questions[currentQ];
  const progress = Object.keys(answers).length;
  const allAnswered = progress === totalQ;

  // Welke dimensie hoort bij deze vraag?
  const dimName = sectorData.dimensions[question.dim];

  function handleSelect(score: number) {
    setAnswer(currentQ, score);
    // Auto-advance naar volgende vraag na korte delay
    if (currentQ < totalQ - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-brand-text-dim">
            {progress} / {totalQ} vragen beantwoord
          </span>
          <span className="text-xs font-mono text-brand-primary-light">
            {dimName}
          </span>
        </div>
        <div className="h-1.5 bg-brand-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(progress / totalQ) * 100}%`,
              backgroundColor: theme.colors.primary,
            }}
          />
        </div>
      </div>

      {/* Vraag navigatie dots */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`
              w-7 h-7 rounded-full text-[10px] font-bold transition-all
              ${i === currentQ
                ? 'bg-brand-primary text-white scale-110'
                : answers[i] !== undefined
                  ? 'bg-brand-primary-dim text-brand-primary-light'
                  : 'bg-brand-bg-elevated text-brand-text-dim'
              }
            `}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Huidige vraag */}
      <div className="animate-fade-in" key={currentQ}>
        <div className="text-xs font-mono text-brand-text-dim mb-2">
          Vraag {currentQ + 1} van {totalQ}
        </div>
        <h3 className="font-serif text-xl text-brand-text-bright mb-6 leading-relaxed">
          {question.text}
        </h3>

        {/* Antwoordopties */}
        <div className="space-y-3">
          {question.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(opt.score)}
              className={`
                w-full text-left p-4 rounded-xl border transition-all duration-200
                ${answers[currentQ] === opt.score
                  ? 'border-brand-primary bg-brand-primary-dim'
                  : 'border-brand-border bg-brand-bg-card hover:border-brand-primary-light hover:bg-brand-bg-elevated'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${answers[currentQ] === opt.score
                    ? 'bg-brand-primary text-white'
                    : 'bg-brand-bg-elevated text-brand-text-dim'
                  }
                `}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className={`text-sm ${answers[currentQ] === opt.score ? 'text-brand-primary-light font-medium' : 'text-brand-text'}`}>
                  {opt.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigatie */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
          disabled={currentQ === 0}
          className="px-4 py-2 text-sm text-brand-text-dim hover:text-brand-text-bright disabled:opacity-30 transition-colors"
        >
          ← Vorige vraag
        </button>

        {currentQ < totalQ - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="px-4 py-2 text-sm text-brand-primary-light hover:text-white transition-colors"
          >
            Volgende vraag →
          </button>
        ) : allAnswered ? (
          <button
            onClick={nextStep}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Genereer rapport →
          </button>
        ) : (
          <span className="text-xs text-brand-text-dim">
            Beantwoord alle vragen om door te gaan
          </span>
        )}
      </div>
    </div>
  );
}
