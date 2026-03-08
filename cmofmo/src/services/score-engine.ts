import type { DimensionScore, SectorId } from '../config/types';
import { getQuestionsForSector } from '../config/questions';

function scoreToColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 7) return 'green';
  if (score >= 4) return 'amber';
  return 'red';
}

function scoreToClass(score: number): string {
  if (score >= 7) return 'ADEQUAAT';
  if (score >= 4) return 'AANDACHT';
  return 'KRITIEK';
}

/**
 * Bereken dimensie-scores vanuit de quickscan-antwoorden.
 * Elke vraag scoort 0-3. Per dimensie wordt het gemiddelde omgerekend naar 1-10.
 */
export function calculateScores(sectorId: SectorId, answers: Record<number, number>): DimensionScore[] {
  const sectorData = getQuestionsForSector(sectorId);
  const { dimensions, questions } = sectorData;

  return dimensions.map((dimName, dimIndex) => {
    // Vind alle vragen voor deze dimensie
    const dimQuestions = questions
      .map((q, i) => ({ question: q, index: i }))
      .filter(({ question }) => question.dim === dimIndex);

    // Bereken gemiddelde score (0-3) → omrekenen naar 1-10
    const totalScore = dimQuestions.reduce((sum, { index }) => {
      return sum + (answers[index] ?? 0);
    }, 0);

    const avgScore = dimQuestions.length > 0
      ? totalScore / dimQuestions.length
      : 0;

    // 0-3 schaal → 1-10 schaal
    // 0 → 1, 1 → 3.5, 2 → 6.5, 3 → 9.5
    const score10 = Math.max(1, Math.min(10, Math.round(avgScore * 3 + 1)));

    return {
      id: `dim_${dimIndex}`,
      label: { nl: dimName, en: dimName },
      score: score10,
      maxScore: 10,
      color: scoreToColor(score10),
      className: scoreToClass(score10),
    };
  });
}

// Fallback voor mock mode (als er geen antwoorden zijn)
export function generateMockScores(sectorId: SectorId): DimensionScore[] {
  const sectorData = getQuestionsForSector(sectorId);
  return sectorData.dimensions.map((dimName, i) => {
    const score = Math.floor(Math.random() * 7) + 2;
    return {
      id: `dim_${i}`,
      label: { nl: dimName, en: dimName },
      score,
      maxScore: 10,
      color: scoreToColor(score),
      className: scoreToClass(score),
    };
  });
}
