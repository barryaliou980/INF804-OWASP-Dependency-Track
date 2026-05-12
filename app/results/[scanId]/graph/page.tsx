'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ScanResult } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Le graphe utilise canvas et le DOM, il doit être rendu uniquement côté client
const DepGraph = dynamic(() => import('@/components/dep-graph').then(mod => mod.DepGraph), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Génération du graphe...</p>
    </div>
  )
});

export default function GraphPage() {
  const params = useParams();
  const scanId = params.scanId as string;
  const [data, setData] = useState<ScanResult | null>(null);

  useEffect(() => {
    fetch(`/api/results/${scanId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [scanId]);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <DepGraph data={data} />
    </div>
  );
}
