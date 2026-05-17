'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Network, ShieldCheck } from 'lucide-react';
import { ScanResult } from '@/lib/types';
import { ExportButton } from '@/components/export-button';

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const scanId = params.scanId as string;
  const isGraphView = pathname.includes('/graph');
  const [data, setData] = useState<ScanResult | null>(null);

  useEffect(() => {
    fetch(`/api/results/${scanId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [scanId]);

  if (!data) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-xl w-full"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">
              {data.ecosystem}
            </span>
            <span className="text-gray-500 text-sm font-mono">{data.filename}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Rapport d&apos;analyse</h1>
          <p className="text-gray-500 mt-1">
            Scanné le {new Date(data.scannedAt).toLocaleString('fr-FR')} • {data.totalPackages} paquets analysés
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton scanId={data.scanId} />
          <a
            href="/upload"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 py-2"
          >
            Nouveau Scan
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href={`/results/${data.scanId}`}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${!isGraphView 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <ShieldCheck className="w-4 h-4" />
            Tableau de bord
          </Link>

          <Link
            href={`/results/${data.scanId}/graph`}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${isGraphView 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Network className="w-4 h-4" />
            Graphe de dépendances
          </Link>
        </nav>
      </div>

      {/* Content — les pages enfant récupèrent leurs propres données */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
