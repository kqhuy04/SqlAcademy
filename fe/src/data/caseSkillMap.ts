// Map of SQL skills and techniques covered in each case dossier
export const CASE_SKILL_MAP: Record<number, string[]> = {
  1: ['JOIN', 'WHERE', 'DATETIME'],
  2: ['JOIN', 'GROUP BY', 'HAVING', 'COUNT'],
  3: ['SUBQUERY', 'JOIN', 'WHERE'],
  4: ['GROUP BY', 'HAVING', 'AVG', 'ROUND'],
  5: ['JOIN', 'GROUP BY', 'HAVING', 'SUM'],
  6: ['CTE', 'WINDOW FN', 'RANK()', 'JOIN'],
  7: ['RECURSIVE CTE', 'JOIN', 'SUM'],
  8: ['WINDOW FN', 'PARTITION BY', 'CASE WHEN'],
  9: ['SELF JOIN', 'WINDOW FN', 'LAG()', 'CTE'],
  10: ['WINDOW FN', 'RANK()', 'LAG()', 'CASE WHEN'],
  11: ['WINDOW FN', 'LAG()', 'ABS()', 'BETWEEN'],
  12: ['JOIN', 'BETWEEN', 'GROUP BY', 'HAVING'],
  13: ['JOIN', 'ABS()', 'WHERE', 'TIME()'],
  14: ['SUBSTRING_INDEX', 'GROUP BY', 'HAVING'],
  15: ['WINDOW FN', 'LAG()', 'LEAD()', 'SELF JOIN'],
  16: ['JOIN', 'TIMESTAMPDIFF', 'SUM', 'GROUP BY'],
  17: ['WINDOW FN', 'ROWS BETWEEN', 'GROUP BY'],
  18: ['STDDEV_POP', 'GROUP BY', 'HAVING'],
  19: ['BITWISE', 'HAVING', 'GROUP BY', 'WHERE'],
  20: ['RECURSIVE CTE', 'UNION ALL', 'SUM'],
};

/**
 * Returns canonical SQL skills for a given case ID.
 */
export function getSkillsForCase(caseId: number): string[] {
  return CASE_SKILL_MAP[caseId] || ['SQL QUERY', 'FILTER'];
}
