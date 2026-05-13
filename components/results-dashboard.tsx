'use client';

import React, { useState } from 'react';
import { ScanResult } from '@/lib/types';
import { SeverityBadge } from './severity-badge';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResultsDashboardProps {
  data: ScanResult;
}

export function ResultsDashboard({ data }: ResultsDashboardProps) {
  const router = useRouter();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedCve, setSelectedCve] = useState<any | null>(null);

  const stats = [
    { label: 'Critical', value: data.summary.critical, icon: ShieldAlert, color: 'text-[#E24B4A]', bg: 'bg-[#E24B4A]/10' },
    { label: 'High', value: data.summary.high, icon: AlertTriangle, color: 'text-[#EF9F27]', bg: 'bg-[#EF9F27]/10' },
    { label: 'Medium', value: data.summary.medium, icon: AlertCircle, color: 'text-[#FAC775]', bg: 'bg-[#FAC775]/10' },
    { label: 'Safe', value: data.summary.safe, icon: CheckCircle2, color: 'text-[#639922]', bg: 'bg-[#639922]/10' },
  ];

  // Aplatir les vulnérabilités pour le tableau
  const allVulns = data.dependencies.flatMap(d =>
    d.vulnerabilities.map(v => ({
      ...v,
      package: d.dependency.name,
      packageVersion: d.dependency.version
    }))
  );
  console.log(data)

  // Filtrage
  const filteredVulns = filterSeverity === 'ALL'
    ? allVulns
    : allVulns.filter(v => v.severity === filterSeverity);

  // Tri par CVSS décroissant
  const sortedVulns = [...filteredVulns].sort((a, b) => b.cvssScore - a.cvssScore);

  return (
    <div className="space-y-6">
      {/* Bandeau d'alerte */}
      {data.globalRiskScore >= 8 && (
        <div className="bg-[#E24B4A] text-white px-4 py-3 rounded-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6" />
            <span className="font-semibold">Risque critique détecté — Action immédiate requise</span>
          </div>
          <button
            onClick={() => router.push(`/results/${data.scanId}/graph`)}
            className="text-white text-sm underline hover:text-red-100"
          >
            Voir dans le graphe
          </button>
        </div>
      )}

      {/* Cartes Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Score global */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-sm font-medium text-gray-500 mb-2">Score de risque global</span>
          <div className="text-5xl font-black tabular-nums tracking-tight text-gray-900">
            {data.globalRiskScore}
            <span className="text-xl text-gray-400 font-medium ml-1">/10</span>
          </div>
        </div>

        {/* 4 Compteurs */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-auto">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                <span className="block text-sm font-medium text-gray-500 mt-1">{stat.label} Dependencies</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau CVE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">

        {/* Partie Gauche: Tableau */}
        <div className={`flex-1 transition-all duration-300 ${selectedCve ? 'md:w-2/3 border-r border-gray-200' : 'w-full'}`}>
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-semibold text-gray-900">Vulnérabilités détectées ({allVulns.length})</h3>

            <div className="flex items-center gap-3">
              <select
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="ALL">Toutes les sévérités</option>
                <option value="CRITICAL">Critical uniquement</option>
                <option value="HIGH">High uniquement</option>
                <option value="MEDIUM">Medium uniquement</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Paquet</th>
                  <th className="px-6 py-3 font-medium">CVE ID</th>
                  <th className="px-6 py-3 font-medium">Sévérité</th>
                  <th className="px-6 py-3 font-medium">CVSS</th>
                  <th className="px-6 py-3 font-medium">Correctif</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedVulns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucune vulnérabilité trouvée pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  sortedVulns.map((vuln, idx) => (
                    <tr
                      key={`${vuln.id}-${idx}`}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedCve?.id === vuln.id ? 'bg-blue-50/50' : ''}`}
                      onClick={() => setSelectedCve(vuln)}
                    >
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{vuln.package}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">v{vuln.packageVersion}</div>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs">{vuln.id}</td>
                      <td className="px-6 py-3"><SeverityBadge severity={vuln.severity} /></td>
                      <td className="px-6 py-3 font-mono font-medium">{vuln.cvssScore > 0 ? vuln.cvssScore.toFixed(1) : '-'}</td>
                      <td className="px-6 py-3">
                        {vuln.fixedVersion ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-green-100 text-green-800">
                            v{vuln.fixedVersion}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Aucun</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partie Droite: Détail Panel Latéral */}
        {selectedCve && (
          <div className="w-full md:w-1/3 bg-gray-50 p-6 overflow-y-auto max-h-[600px] border-t md:border-t-0 border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">{selectedCve.id}</h4>
                <SeverityBadge severity={selectedCve.severity} />
              </div>
              <button
                onClick={() => setSelectedCve(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Package Affecté</h5>
                <div className="bg-white border border-gray-200 rounded-md p-3 flex justify-between items-center">
                  <span className="font-medium">{selectedCve.package}</span>
                  <span className="font-mono text-sm text-gray-500">v{selectedCve.packageVersion}</span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h5>
                <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-200 p-3 rounded-md">
                  {selectedCve.summary || selectedCve.details || "Aucune description fournie par l'OSV."}
                </p>
              </div>

              {selectedCve.cvssVector && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vecteur CVSS</h5>
                  <div className="font-mono text-xs text-gray-600 bg-white border border-gray-200 p-3 rounded-md break-all">
                    {selectedCve.cvssVector}
                  </div>
                </div>
              )}

              {selectedCve.references && selectedCve.references.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Références</h5>
                  <ul className="space-y-2 bg-white border border-gray-200 p-3 rounded-md">
                    {selectedCve.references.slice(0, 5).map((ref: string, idx: number) => (
                      <li key={idx}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 truncate"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{ref}</span>
                        </a>
                      </li>
                    ))}
                    {selectedCve.references.length > 5 && (
                      <li className="text-xs text-gray-500 italic mt-2">
                        + {selectedCve.references.length - 5} autres références
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => router.push(`/results/${data.scanId}/graph`)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Voir dans le graphe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
