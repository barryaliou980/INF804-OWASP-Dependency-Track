import { CVEResult } from './types';

const SEVERITY_WEIGHTS = {
  CRITICAL: 100,
  HIGH: 40,
  MEDIUM: 10,
  LOW: 3,
  NONE: 0,
} as const;

/**
 * Engine de scoring inspiré des approches SCA (Snyk / Dependency-Track)
 */
export function calculateRiskScore(vulnerabilities: CVEResult[]): number {
  if (!vulnerabilities.length) return 0.0;

  let totalRisk = 0;

  for (const vuln of vulnerabilities) {
    const weight = SEVERITY_WEIGHTS[vuln.severity] ?? 0;

    // CVSS normalisé (0 → 1)
    const cvssFactor = clamp(vuln.cvssScore / 10, 0, 1);

    // Score de base
    let risk = weight * cvssFactor;

    // BONUS: criticité CVSS réelle (accent sur > 7)
    if (vuln.cvssScore >= 9) risk *= 1.3;
    else if (vuln.cvssScore >= 7) risk *= 1.15;

    totalRisk += risk;
  }

  /**
   * NORMALISATION INDUSTRY-LIKE
   * - évite saturation à 10
   * - prend en compte la taille du projet
   */
  const n = vulnerabilities.length;

  // MaxRisk dynamique (croissance logarithmique)
  const maxRisk = 100 * Math.log1p(n) + 50;

  // Score logarithmique (standard dans les moteurs de risk)
  const score =
    10 * (Math.log1p(totalRisk) / Math.log1p(maxRisk));

  return round(clamp(score, 0, 10), 1);
}

/**
 * Helpers
 */
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals: number) {
  return Number(value.toFixed(decimals));
}