'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScanProgress } from '@/components/scan-progress';
import { LiveFeed } from '@/components/live-feed';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedEvent {
  id: string;
  type: 'progress' | 'vuln';
  package?: string;
  cve?: string;
  severity?: string;
  status?: 'safe' | 'vuln' | 'info';
  timestamp: number;
}

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanId = searchParams.get('id');

  const [percent, setPercent] = useState(0);
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    if (!scanId) {
      router.push('/');
      return;
    }

    const eventSource = new EventSource(`/api/scan?id=${scanId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'progress') {
          setPercent(data.percent);
          setEvents(prev => [...prev, {
            ...data,
            id: crypto.randomUUID(),
            package: data.current,
            timestamp: Date.now()
          }]);
        } else if (data.type === 'vuln') {
          setEvents(prev => [...prev, {
            ...data,
            id: crypto.randomUUID(),
            timestamp: Date.now()
          }]);
        } else if (data.type === 'done') {
          setPercent(100);
          eventSource.close();
          // Petit délai avant redirection pour voir le 100%
          setTimeout(() => {
            router.push(`/results/${data.scanId}`);
          }, 1200);
        } else if (data.type === 'error') {
          toast.error(data.message);
          eventSource.close();
          router.push('/');
        }
      } catch (err) {
        console.error("Erreur parsing SSE:", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      toast.error("Erreur de connexion au serveur d'analyse");
      router.push('/');
    };

    return () => {
      eventSource.close();
    };
  }, [scanId, router]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 mt-4 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          Audit de Sécurité en <span className="bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent">Direct</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium max-w-xl mx-auto">
          Résolution des dépendances et analyse en cours sur les bases de données de vulnérabilités open-source OSV.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ScanProgress percent={percent} />
        </div>
        <div>
          <LiveFeed events={events} />
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20 bg-[var(--bg-main)] min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-accent dark:text-accent-400 animate-spin" />
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
