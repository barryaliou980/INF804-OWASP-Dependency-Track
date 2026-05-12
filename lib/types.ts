export type Ecosystem = 'PyPI' | 'npm' | 'Maven' | 'Go';

export interface Dependency {
  name: string;
  version: string;
  ecosystem: Ecosystem;
  isDev?: boolean;
}

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface CVEResult {
  id: string;              // ex: "CVE-2021-44228"
  aliases: string[];
  summary: string;
  details: string;
  cvssScore: number;       // 0.0–10.0
  cvssVector: string;
  severity: Severity;
  fixedVersion?: string;   // version qui corrige la vulnérabilité
  references: string[];    // URLs NVD, GitHub Advisory, etc.
  publishedDate: string;
}

export interface ScanResult {
  scanId: string;
  filename: string;
  ecosystem: Ecosystem;
  totalPackages: number;
  scannedAt: string;
  dependencies: Array<{
    dependency: Dependency;
    vulnerabilities: CVEResult[];
    isSafe: boolean;
  }>;
  globalRiskScore: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    safe: number;
  };
}

export interface GraphNode {
  id: string;
  name: string;
  version: string;
  severity: Severity | 'SAFE' | 'ROOT';
  cvssScore?: number;
  cveIds: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
}
