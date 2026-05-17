import { CVEResult } from './types';

const SEVERITY_WEIGHTS = {
  CRITICAL: 10,
  HIGH: 5,
  MEDIUM: 2,
  LOW: 0.5,
  NONE: 0,
} as const;

export function calculateRiskScore(vulnerabilities: CVEResult[]): number {
  if (!vulnerabilities.length) return 0.0;

  let totalRisk = 0;

  for (const vuln of vulnerabilities) {
    const weight = SEVERITY_WEIGHTS[vuln.severity] ?? 0;

    const cvss = clamp(vuln.cvssScore ?? 0, 0, 10);
    const cvssFactor = cvss / 10;

    let risk = weight * cvssFactor;

    if (cvss >= 9) risk *= 1.1;
    else if (cvss >= 7) risk *= 1.05;

    totalRisk += risk;
  }

  const n = vulnerabilities.length;

  const maxRisk = 10 * Math.log1p(n + 5);

  const rawScore =
    Math.log1p(totalRisk) / Math.log1p(maxRisk);

  let score = 10 * Math.pow(rawScore, 0.9);

  const saturation = 1 - Math.exp(-n / 15);
  score *= saturation;

  return Number(clamp(score, 0, 10).toFixed(2));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
