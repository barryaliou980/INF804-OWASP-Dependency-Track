import { queryOSV } from '@/lib/osv-client';
import { calculateRiskScore } from '@/lib/risk-score';
import { globalStorage } from '@/lib/storage';
import { CVEResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scanId = searchParams.get('id');

  if (!scanId) {
    return new Response("Missing scanId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const scanData = globalStorage.get(scanId);
        if (!scanData) {
          sendEvent({ type: 'error', message: 'Données de scan introuvables. Veuillez ré-uploader votre fichier.' });
          controller.close();
          return;
        }

        const { dependencies, filename, ecosystem } = scanData;
        const total = dependencies.length;

        // Étape 1 & 2 : déjà faites lors de l'upload
        sendEvent({ type: 'progress', percent: 5, current: 'Parsing terminé', status: 'info' });

        // Étape 3 : Requêtes OSV en temps réel
        const osvResults = await queryOSV(dependencies);

        // Étape 4 : Construction des résultats
        let critical = 0, high = 0, medium = 0, low = 0, safe = 0;
        const allVulns: CVEResult[] = [];

        const finalDependencies = osvResults.map((result, index) => {
          const isSafe = result.vulnerabilities.length === 0;

          if (isSafe) {
            safe++;
          } else {
            const maxSeverity = result.vulnerabilities.reduce((prev, curr) => {
              if (curr.severity === 'CRITICAL' || prev === 'CRITICAL') return 'CRITICAL';
              if (curr.severity === 'HIGH' || prev === 'HIGH') return 'HIGH';
              if (curr.severity === 'MEDIUM' || prev === 'MEDIUM') return 'MEDIUM';
              return 'LOW';
            }, 'LOW' as string);

            if (maxSeverity === 'CRITICAL') critical++;
            else if (maxSeverity === 'HIGH') high++;
            else if (maxSeverity === 'MEDIUM') medium++;
            else low++;
          }

          allVulns.push(...result.vulnerabilities);

          // Envoi d'événement progressif par paquet
          sendEvent({
            type: 'progress',
            percent: Math.round(((index + 1) / total) * 100),
            current: result.dependency.name,
            status: isSafe ? 'safe' : 'vuln'
          });

          if (!isSafe) {
            result.vulnerabilities.forEach(v => {
              sendEvent({
                type: 'vuln',
                package: result.dependency.name,
                cve: v.id,
                cvss: v.cvssScore,
                severity: v.severity
              });
            });
          }

          return {
            dependency: result.dependency,
            vulnerabilities: result.vulnerabilities,
            isSafe
          };
        });

        const globalRiskScore = calculateRiskScore(allVulns);

        const scanResult = {
          scanId,
          filename,
          ecosystem,
          totalPackages: total,
          scannedAt: new Date().toISOString(),
          dependencies: finalDependencies,
          globalRiskScore,
          summary: { critical, high, medium, low, safe }
        };

        // Stocker les résultats
        globalStorage.set(`result_${scanId}`, scanResult);
        // Nettoyer les données temporaires de l'upload
        globalStorage.delete(scanId);

        sendEvent({ type: 'done', scanId });
        controller.close();
      } catch (error) {
        console.error("Scan error:", error);
        sendEvent({ type: 'error', message: "Erreur lors de l'analyse OSV. Vérifiez votre connexion internet." });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
