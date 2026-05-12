import { CVEResult } from './types';

export function calculateRiskScore(vulnerabilities: CVEResult[]): number {
  if (vulnerabilities.length === 0) return 0.0;

  // Extraire tous les scores CVSS
  const scores = vulnerabilities.map(v => v.cvssScore).sort((a, b) => b - a);

  const maxScore = scores[0] || 0;
  
  // Prendre les 5 plus hauts scores (ou moins si < 5 vulnérabilités)
  const top5 = scores.slice(0, 5);
  const avgTop5 = top5.length > 0 
    ? top5.reduce((sum, score) => sum + score, 0) / top5.length 
    : 0;

  // Formule : max(CVSS_scores) × 0.6 + moyenne_top5 × 0.4
  const rawScore = (maxScore * 0.6) + (avgTop5 * 0.4);
  
  // Plafonner à 10.0 au cas où, et arrondir à 1 décimale
  const finalScore = Math.min(10.0, Math.round(rawScore * 10) / 10);
  
  return finalScore;
}
