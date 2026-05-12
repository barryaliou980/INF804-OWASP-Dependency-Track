'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ResultsDashboard } from '@/components/results-dashboard';
import { ScanResult } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const scanId = params.scanId as string;
  const [data, setData] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/results/${scanId}`)
      .then(res => {
        if (!res.ok) throw new Error('Scan non trouvé');
        return res.json();
      })
      .then(result => {
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      })
      .catch(() => setError('Résultats de scan non trouvés. Veuillez ré-uploader votre fichier.'))
      .finally(() => setLoading(false));
  }, [scanId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !data || !data.summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-gray-400" />
        <p className="text-gray-500 text-lg">{error || 'Résultats invalides.'}</p>
        <a href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          ← Nouvelle analyse
        </a>
      </div>
    );
  }

  return <ResultsDashboard data={data} />;
}
