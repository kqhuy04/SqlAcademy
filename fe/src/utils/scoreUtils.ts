/**
 * Calculates preview of score earned for a question based on baseScore, hints used, and attempts.
 * Penalty:
 * - Each hint: -20% of baseScore (baseScore / 5)
 * - Each additional attempt after the 1st: -10% of baseScore (baseScore / 10)
 * Min score: 0
 */
export function calculateScorePreview(
  baseScore: number,
  hintsUsed: number,
  attempts: number
): number {
  if (!baseScore || baseScore <= 0) return 0;
  const hintPenalty = hintsUsed * Math.floor(baseScore / 5);
  const attemptPenalty = Math.max(0, attempts - 1) * Math.floor(baseScore / 10);
  return Math.max(0, baseScore - hintPenalty - attemptPenalty);
}
