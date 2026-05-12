const fs = require('fs');

function calculateCvssV3Score(vector) {
  if (!vector || !vector.startsWith('CVSS:3')) return null;

  const metrics = {};
  const parts = vector.split('/');
  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key && value) {
      metrics[key] = value;
    }
  }

  // Vérifier que les métriques de base sont présentes
  if (!metrics['AV'] || !metrics['AC'] || !metrics['PR'] || !metrics['UI'] ||
      !metrics['S'] || !metrics['C'] || !metrics['I'] || !metrics['A']) {
    return null;
  }

  // Valeurs des métriques selon la spécification CVSS v3.1
  const avValues = { N: 0.85, A: 0.62, L: 0.55, P: 0.20 };
  const acValues = { L: 0.77, H: 0.44 };
  const uiValues = { N: 0.85, R: 0.62 };

  // PR dépend du Scope
  const prValuesUnchanged = { N: 0.85, L: 0.62, H: 0.27 };
  const prValuesChanged = { N: 0.85, L: 0.68, H: 0.50 };

  const impactValues = { H: 0.56, L: 0.22, N: 0 };

  const scopeChanged = metrics['S'] === 'C';
  const prValues = scopeChanged ? prValuesChanged : prValuesUnchanged;

  const av = avValues[metrics['AV']];
  const ac = acValues[metrics['AC']];
  const pr = prValues[metrics['PR']];
  const ui = uiValues[metrics['UI']];
  const confImpact = impactValues[metrics['C']];
  const integImpact = impactValues[metrics['I']];
  const availImpact = impactValues[metrics['A']];

  if (av === undefined || ac === undefined || pr === undefined || ui === undefined ||
      confImpact === undefined || integImpact === undefined || availImpact === undefined) {
    return null;
  }

  // Calcul ISC (Impact Sub Score)
  const iscBase = 1 - ((1 - confImpact) * (1 - integImpact) * (1 - availImpact));

  let impact;
  if (scopeChanged) {
    impact = 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15);
  } else {
    impact = 6.42 * iscBase;
  }

  // Si l'impact est négatif ou nul, le score est 0
  if (impact <= 0) return 0;

  // Exploitabilité
  const exploitability = 8.22 * av * ac * pr * ui;

  // Score final
  let baseScore;
  if (scopeChanged) {
    baseScore = Math.min(1.08 * (impact + exploitability), 10);
  } else {
    baseScore = Math.min(impact + exploitability, 10);
  }

  // Arrondir vers le haut au dixième (roundup)
  return Math.ceil(baseScore * 10) / 10;
}

function mapSeverityFromScore(score) {
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  if (score > 0) return 'LOW';
  return 'NONE';
}

function mapSeverityFromString(severity) {
  const s = severity.toUpperCase();
  if (s === 'CRITICAL') return { score: 9.5, level: 'CRITICAL' };
  if (s === 'HIGH') return { score: 7.5, level: 'HIGH' };
  if (s === 'MODERATE' || s === 'MEDIUM') return { score: 5.5, level: 'MEDIUM' };
  if (s === 'LOW') return { score: 2.5, level: 'LOW' };
  return { score: 0, level: 'NONE' };
}

function parseOSVVuln(vuln) {
  let score = 0;
  let vector = '';
  let severity = 'NONE';

  // Stratégie 1 : Score numérique dans database_specific.cvss.score (GHSA)
  if (vuln.database_specific?.cvss?.score) {
    score = vuln.database_specific.cvss.score;
    vector = vuln.database_specific.cvss.vectorString || '';
    severity = mapSeverityFromScore(score);
  }

  // Stratégie 2 : Calculer depuis le vecteur CVSS v3 fourni dans severity[]
  if (score === 0 && vuln.severity && vuln.severity.length > 0) {
    const cvss3 = vuln.severity.find((s) => s.type === 'CVSS_V3');
    if (cvss3 && cvss3.score) {
      vector = cvss3.score;
      const calculated = calculateCvssV3Score(cvss3.score);
      if (calculated !== null) {
        score = calculated;
        severity = mapSeverityFromScore(score);
      }
    }
  }

  // Stratégie 3 : Sévérité textuelle dans database_specific.severity (GHSA)
  if (score === 0 && vuln.database_specific?.severity) {
    const mapped = mapSeverityFromString(vuln.database_specific.severity);
    score = mapped.score;
    severity = mapped.level;
  }

  // Stratégie 4 : Chercher dans ecosystem_specific
  if (score === 0 && vuln.ecosystem_specific?.severity) {
    const mapped = mapSeverityFromString(vuln.ecosystem_specific.severity);
    score = mapped.score;
    severity = mapped.level;
  }

  return {
    id: vuln.id || 'UNKNOWN',
    cvssScore: Math.round(score * 10) / 10,
    cvssVector: vector,
    severity
  };
}

const vuln = {
  "id": "GHSA-36qx-fr4f-26g5",
  "database_specific": {
    "severity": "HIGH"
  },
  "severity": [
    {
      "type": "CVSS_V3",
      "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
    }
  ]
};

console.log(parseOSVVuln(vuln));
