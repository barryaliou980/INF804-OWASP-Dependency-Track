import { Dependency, CVEResult, Severity } from './types';

const OSV_API_URL = 'https://api.osv.dev/v1/querybatch';
const BATCH_SIZE = 20;

interface OSVQuery {
  package: { name: string; ecosystem: string };
  version: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════════
// Calculateur CVSS v3 — implémentation conforme à la spécification
// https://www.first.org/cvss/v3.1/specification-document
// ═══════════════════════════════════════════════════════════════════

function calculateCvssV3Score(vector: string): number | null {
  if (!vector || !vector.startsWith('CVSS:3')) return null;

  const metrics: Record<string, string> = {};
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
  const avValues: Record<string, number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.20 };
  const acValues: Record<string, number> = { L: 0.77, H: 0.44 };
  const uiValues: Record<string, number> = { N: 0.85, R: 0.62 };

  // PR dépend du Scope
  const prValuesUnchanged: Record<string, number> = { N: 0.85, L: 0.62, H: 0.27 };
  const prValuesChanged: Record<string, number> = { N: 0.85, L: 0.68, H: 0.50 };

  const impactValues: Record<string, number> = { H: 0.56, L: 0.22, N: 0 };

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

  let impact: number;
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
  let baseScore: number;
  if (scopeChanged) {
    baseScore = Math.min(1.08 * (impact + exploitability), 10);
  } else {
    baseScore = Math.min(impact + exploitability, 10);
  }

  // Arrondir vers le haut au dixième (roundup)
  return Math.ceil(baseScore * 10) / 10;
}

function mapSeverityFromScore(score: number): Severity {
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  if (score > 0) return 'LOW';
  return 'NONE';
}

// Mapper la sévérité textuelle renvoyée par certaines bases (ex: GHSA)
function mapSeverityFromString(severity: string): { score: number; level: Severity } {
  const s = severity.toUpperCase();
  if (s === 'CRITICAL') return { score: 9.5, level: 'CRITICAL' };
  if (s === 'HIGH') return { score: 7.5, level: 'HIGH' };
  if (s === 'MODERATE' || s === 'MEDIUM') return { score: 5.5, level: 'MEDIUM' };
  if (s === 'LOW') return { score: 2.5, level: 'LOW' };
  return { score: 0, level: 'NONE' };
}

function parseOSVVuln(vuln: Record<string, any>): CVEResult {
  let score = 0;
  let vector = '';
  let severity: Severity = 'NONE';

  // Stratégie 1 : Score numérique dans database_specific.cvss.score (GHSA)
  if (vuln.database_specific?.cvss?.score) {
    score = vuln.database_specific.cvss.score;
    vector = vuln.database_specific.cvss.vectorString || '';
    severity = mapSeverityFromScore(score);
  }

  // Stratégie 2 : Calculer depuis le vecteur CVSS v3 fourni dans severity[]
  if (score === 0 && vuln.severity && vuln.severity.length > 0) {
    const cvss3 = vuln.severity.find((s: Record<string, string>) => s.type === 'CVSS_V3');
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

  // Dernier recours : si on a toujours rien, laisser à 0 / NONE
  // (mieux vaut afficher 0 que de mentir avec un faux score)

  // Trouver la version corrigée si disponible
  let fixedVersion: string | undefined;
  if (vuln.affected && vuln.affected.length > 0) {
    for (const affected of vuln.affected) {
      if (affected.ranges) {
        for (const range of affected.ranges) {
          if (range.events) {
            for (const event of range.events) {
              if (event.fixed) {
                fixedVersion = event.fixed;
                break;
              }
            }
          }
          if (fixedVersion) break;
        }
      }
      if (fixedVersion) break;
    }
  }

  return {
    id: vuln.id || 'UNKNOWN',
    aliases: vuln.aliases || [],
    summary: vuln.summary || 'Aucun résumé disponible',
    details: vuln.details || '',
    cvssScore: Math.round(score * 10) / 10,
    cvssVector: vector,
    severity,
    fixedVersion,
    references: vuln.references?.map((r: Record<string, string>) => r.url).filter(Boolean) || [],
    publishedDate: vuln.published || new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════
// Requêtes OSV avec batching et retry
// ═══════════════════════════════════════════════════════════════════

async function fetchBatchWithRetry(queries: OSVQuery[], retries = 3): Promise<Record<string, any>> {
  let attempt = 0;
  let backoffMs = 1000;

  while (attempt < retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(OSV_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OSV API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      await delay(backoffMs);
      backoffMs *= 2;
    }
  }

  throw new Error('OSV API: max retries reached');
}

async function fetchVulnDetails(vulnId: string, retries = 3): Promise<Record<string, any> | null> {
  let attempt = 0;
  let backoffMs = 1000;

  while (attempt < retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`https://api.osv.dev/v1/vulns/${vulnId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`OSV API returned ${response.status} for ${vulnId}`);
      }
      return await response.json();
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        console.error(`Erreur fetch détails vuln ${vulnId}:`, error);
        return null;
      }
      await delay(backoffMs);
      backoffMs *= 2;
    }
  }
  return null;
}

export async function queryOSV(dependencies: Dependency[]): Promise<Array<{ dependency: Dependency; vulnerabilities: CVEResult[] }>> {
  const results: Array<{ dependency: Dependency; vulnerabilities: CVEResult[] }> = [];

  const validDeps = dependencies.filter(d => d.version !== 'unknown');

  // Cache global pour éviter de requêter plusieurs fois le même CVE
  const globalVulnDetailsCache = new Map<string, Record<string, any>>();

  for (let i = 0; i < validDeps.length; i += BATCH_SIZE) {
    const batch = validDeps.slice(i, i + BATCH_SIZE);
    const queries: OSVQuery[] = batch.map(d => ({
      package: { name: d.name, ecosystem: d.ecosystem },
      version: d.version
    }));

    try {
      const data = await fetchBatchWithRetry(queries);

      if (data && data.results) {
        // Collecter tous les IDs uniques de ce batch
        const vulnIdsToFetch = new Set<string>();
        data.results.forEach((r: any) => {
          if (r.vulns) {
            r.vulns.forEach((v: any) => {
              if (!globalVulnDetailsCache.has(v.id)) {
                vulnIdsToFetch.add(v.id);
              }
            });
          }
        });

        // Fetch les détails pour chaque ID par lots de 10
        const idsArray = Array.from(vulnIdsToFetch);
        for (let j = 0; j < idsArray.length; j += 10) {
           const chunk = idsArray.slice(j, j + 10);
           const promises = chunk.map(async (id) => {
             const detail = await fetchVulnDetails(id);
             if (detail) globalVulnDetailsCache.set(id, detail);
           });
           await Promise.all(promises);
        }

        data.results.forEach((result: Record<string, any>, index: number) => {
          const dep = batch[index];
          const vulns = result.vulns
            ? result.vulns.map((v: any) => {
                // Utiliser les détails complets s'ils ont été récupérés, sinon l'objet basique
                const fullVuln = globalVulnDetailsCache.get(v.id) || v;
                return parseOSVVuln(fullVuln);
              })
            : [];

          results.push({
            dependency: dep,
            vulnerabilities: vulns
          });
        });
      } else {
        batch.forEach(dep => {
          results.push({ dependency: dep, vulnerabilities: [] });
        });
      }
    } catch (error) {
      console.error('Erreur lors de la requête OSV batch:', error);
      batch.forEach(dep => {
        results.push({ dependency: dep, vulnerabilities: [] });
      });
    }
  }

  // Dépendances sans version -> pas de lookup
  dependencies.filter(d => d.version === 'unknown').forEach(dep => {
    results.push({ dependency: dep, vulnerabilities: [] });
  });

  return results;
}
