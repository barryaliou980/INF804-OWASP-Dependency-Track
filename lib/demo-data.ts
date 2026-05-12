import { ScanResult, CVEResult } from './types';

// Quelques vulnérabilités factices basées sur des cas réels
const log4jVuln: CVEResult = {
  id: "CVE-2021-44228",
  aliases: ["GHSA-jfh8-c2rv-q59l"],
  summary: "Remote code execution in Log4j",
  details: "Apache Log4j2 2.0-beta9 through 2.14.1 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints. An attacker who can control log messages or log message parameters can execute arbitrary code loaded from LDAP servers when message lookup substitution is enabled.",
  cvssScore: 10.0,
  cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
  severity: "CRITICAL",
  fixedVersion: "2.15.0",
  references: ["https://nvd.nist.gov/vuln/detail/CVE-2021-44228"],
  publishedDate: "2021-12-10T10:15:00Z"
};

const pillowVuln: CVEResult = {
  id: "CVE-2022-22817",
  aliases: [],
  summary: "Arbitrary code execution in Pillow",
  details: "PIL.ImageMath.eval in Pillow before 9.0.0 allows evaluation of arbitrary expressions, such as ones that use the Python exec method.",
  cvssScore: 9.8,
  cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
  severity: "CRITICAL",
  fixedVersion: "9.0.0",
  references: ["https://nvd.nist.gov/vuln/detail/CVE-2022-22817"],
  publishedDate: "2022-01-10T14:10:00Z"
};

const cryptographyVuln: CVEResult = {
  id: "CVE-2023-0286",
  aliases: [],
  summary: "X.509 GeneralName confusion in cryptography",
  details: "There is a type confusion vulnerability relating to X.400 address processing inside an X.509 GeneralName.",
  cvssScore: 9.1,
  cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
  severity: "CRITICAL",
  fixedVersion: "39.0.1",
  references: ["https://nvd.nist.gov/vuln/detail/CVE-2023-0286"],
  publishedDate: "2023-02-08T20:15:00Z"
};

const requestsVuln: CVEResult = {
  id: "CVE-2023-32681",
  aliases: [],
  summary: "Unintended leak of Proxy-Authorization header in requests",
  details: "Requests is a HTTP library. Since Requests 2.3.0, Requests has been leaking Proxy-Authorization headers to destination servers when redirected to an HTTPS endpoint.",
  cvssScore: 8.8,
  cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
  severity: "HIGH",
  fixedVersion: "2.31.0",
  references: ["https://nvd.nist.gov/vuln/detail/CVE-2023-32681"],
  publishedDate: "2023-05-26T17:15:00Z"
};

const pyyamlVuln: CVEResult = {
  id: "CVE-2020-14343",
  aliases: [],
  summary: "Incomplete fix for CVE-2020-1747 in PyYAML",
  details: "A vulnerability was discovered in the PyYAML library in versions before 5.4, where it is susceptible to arbitrary code execution when it processes untrusted YAML files through the full_load method or with the FullLoader loader.",
  cvssScore: 7.5,
  cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H",
  severity: "HIGH",
  fixedVersion: "5.4.0",
  references: ["https://nvd.nist.gov/vuln/detail/CVE-2020-14343"],
  publishedDate: "2021-02-09T18:15:00Z"
};

// Génération de dépendances supplémentaires
function generateDeps(count: number, ecosystem: 'PyPI' | 'npm', isSafe: boolean): any[] {
  const deps = [];
  for (let i = 0; i < count; i++) {
    deps.push({
      dependency: {
        name: `${ecosystem === 'PyPI' ? 'pkg' : 'lib'}-${Math.random().toString(36).substring(7)}`,
        version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        ecosystem: ecosystem
      },
      vulnerabilities: [],
      isSafe: true
    });
  }
  return deps;
}

export const demoScanResult: ScanResult = {
  scanId: "demo-scan-12345",
  filename: "requirements.txt",
  ecosystem: "PyPI",
  totalPackages: 87,
  scannedAt: new Date().toISOString(),
  dependencies: [
    {
      dependency: { name: "log4j-core", version: "2.14.1", ecosystem: "Maven" },
      vulnerabilities: [log4jVuln],
      isSafe: false
    },
    {
      dependency: { name: "Pillow", version: "8.3.1", ecosystem: "PyPI" },
      vulnerabilities: [pillowVuln],
      isSafe: false
    },
    {
      dependency: { name: "cryptography", version: "36.0.0", ecosystem: "PyPI" },
      vulnerabilities: [cryptographyVuln],
      isSafe: false
    },
    {
      dependency: { name: "requests", version: "2.25.0", ecosystem: "PyPI" },
      vulnerabilities: [requestsVuln],
      isSafe: false
    },
    {
      dependency: { name: "PyYAML", version: "5.3.1", ecosystem: "PyPI" },
      vulnerabilities: [pyyamlVuln],
      isSafe: false
    },
    // Ajout d'autres High, Medium factices
    ...generateDeps(5, 'PyPI', false).map((d, i) => ({
      ...d, 
      isSafe: false, 
      vulnerabilities: [{...pyyamlVuln, id: `CVE-2020-TEST-${i}`, cvssScore: 7.0 + Math.random(), severity: "HIGH" as any}]
    })),
    ...generateDeps(12, 'PyPI', false).map((d, i) => ({
      ...d, 
      isSafe: false, 
      vulnerabilities: [{...pyyamlVuln, id: `CVE-2021-MED-${i}`, cvssScore: 4.5 + Math.random() * 2, severity: "MEDIUM" as any}]
    })),
    ...generateDeps(65, 'PyPI', true)
  ],
  globalRiskScore: 8.9,
  summary: {
    critical: 3,
    high: 7,
    medium: 12,
    low: 0,
    safe: 65
  }
};
