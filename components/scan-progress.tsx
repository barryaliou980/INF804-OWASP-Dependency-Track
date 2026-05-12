import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ScanProgressProps {
  percent: number;
}

export function ScanProgress({ percent }: ScanProgressProps) {
  const steps = [
    { id: 1, name: 'Parsing du fichier', status: 'complete' },
    { id: 2, name: 'Résolution des versions', status: 'complete' },
    { id: 3, name: 'Lookup CVE via OSV API', status: percent < 100 ? 'current' : 'complete' },
    { id: 4, name: 'Calcul du score de risque', status: percent === 100 ? 'complete' : 'upcoming' },
    { id: 5, name: 'Génération du graphe', status: percent === 100 ? 'complete' : 'upcoming' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Progression de l'analyse</h2>
      
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Scan global</span>
          <span className="font-medium text-blue-600">{percent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center relative">
              {/* Ligne connectrice */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-6 w-0.5 h-8 -ml-px ${step.status === 'complete' ? 'bg-blue-600' : 'bg-gray-200'}`} 
                  style={{ left: '50%' }}
                />
              )}

              {step.status === 'complete' ? (
                <CheckCircle2 className="w-6 h-6 text-blue-600 bg-white" />
              ) : step.status === 'current' ? (
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin bg-white" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300 bg-white" />
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <span className={`text-sm font-medium ${step.status === 'current' ? 'text-blue-600' : step.status === 'complete' ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.name}
              </span>
              {step.status === 'current' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  En cours
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
