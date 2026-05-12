import { ScanResult, CVEResult, Dependency } from './types';

function mapSeverityToCycloneDX(severity: string): string {
  const map: Record<string, string> = {
    'CRITICAL': 'critical',
    'HIGH': 'high',
    'MEDIUM': 'medium',
    'LOW': 'low',
    'NONE': 'none'
  };
  return map[severity] || 'unknown';
}

function generatePurl(dependency: Dependency): string {
  const type = dependency.ecosystem === 'npm' ? 'npm' : 'pypi';
  return `pkg:${type}/${dependency.name}@${dependency.version}`;
}

export function generateSbom(scanResult: ScanResult): any {
  const components = scanResult.dependencies.map(item => {
    const purl = generatePurl(item.dependency);
    
    const component: any = {
      type: "library",
      name: item.dependency.name,
      version: item.dependency.version,
      purl: purl,
      bomRef: purl,
    };

    if (item.vulnerabilities.length > 0) {
      component.vulnerabilities = item.vulnerabilities.map(vuln => ({
        id: vuln.id,
        source: {
          name: "OSV",
          url: `https://osv.dev/vulnerability/${vuln.id}`
        },
        ratings: [
          {
            score: vuln.cvssScore,
            severity: mapSeverityToCycloneDX(vuln.severity),
            method: "CVSSv3",
            vector: vuln.cvssVector || ""
          }
        ],
        description: vuln.summary || vuln.details,
        advisories: vuln.references.map(ref => ({
          url: ref
        }))
      }));
    }

    return component;
  });

  const bom = {
    bomFormat: "CycloneDX",
    specVersion: "1.4",
    serialNumber: `urn:uuid:${crypto.randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: scanResult.scannedAt,
      tools: [
        {
          vendor: "DepScan",
          name: "DepScan Tool",
          version: "1.0.0"
        }
      ],
      component: {
        type: "application",
        name: scanResult.filename,
        version: "unknown"
      }
    },
    components: components
  };

  return bom;
}
