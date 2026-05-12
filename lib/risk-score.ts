import { CVEResult } from './types';

const SEVERITY_WEIGHTS = {
  CRITICAL: 100,
  HIGH: 40,
  MEDIUM: 10,
  LOW: 3,
  NONE: 0,
};

export function calculateRiskScore(vulnerabilities: CVEResult[]): number {
  if (vulnerabilities.length === 0) {
    return 0.0;
  }

  let rawRisk = 0;

  for (const vuln of vulnerabilities) {
    // Poids selon la sévérité
    const severityWeight =
      SEVERITY_WEIGHTS[vuln.severity] || 0;

    // Facteur CVSS (0 → 1)
    const cvssFactor =
      (vuln.cvssScore || 0) / 10;

    // Calcul du risque
    const risk =
      severityWeight * cvssFactor;

    rawRisk += risk;
  }

  // Risque maximum théorique
  const maxRisk =
    vulnerabilities.length * 100;

  // Score logarithmique normalisé sur 10
  const normalizedScore =
    10 *
    (
      Math.log(1 + rawRisk) /
      Math.log(1 + maxRisk)
    );

  // Arrondi à 1 décimale
  return Math.min(
    10,
    Math.round(normalizedScore * 10) / 10
  );
}