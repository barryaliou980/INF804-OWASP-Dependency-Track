import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ScanProgressProps {
  percent: number;
}

export function ScanProgress({ percent }: ScanProgressProps) {
  const steps = [
    { id: 1, name: 'Lecture et parsing du SBOM', status: 'complete' },
    { id: 2, name: 'Résolution des dépendances et versions', status: 'complete' },
    { id: 3, name: 'Audit de sécurité via API OSV.dev', status: percent < 100 ? 'current' : 'complete' },
    { id: 4, name: 'Calcul du score de risque CVSS global', status: percent === 100 ? 'complete' : 'upcoming' },
    { id: 5, name: 'Génération du graphe topologique', status: percent === 100 ? 'complete' : 'upcoming' },
  ];

  return (
    <div className="cyber-card p-6 font-sans relative">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[var(--card-border)] pointer-events-none" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[var(--card-border)] pointer-events-none" />

      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        Progression du Scan
      </h2>
      
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2 font-mono">
          <span className="text-[var(--text-secondary)]">Statut de l&apos;audit</span>
          <span className="text-accent-700 dark:text-accent-400 font-bold text-glow-accent">{percent}%</span>
        </div>
        <div className="w-full bg-[var(--panel-bg)] border border-[var(--card-border)] rounded-full h-3 overflow-hidden p-[1px]">
          <div 
            className="bg-gradient-to-r from-accent to-accent h-2 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(61,149,135,0.3)]"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-6 w-0.5 h-8 -ml-px ${step.status === 'complete' ? 'bg-accent/35 shadow-[0_0_8px_rgba(61,149,135,0.2)]' : 'bg-[var(--card-border)]'}`} 
                  style={{ left: '50%' }}
                />
              )}

              {step.status === 'complete' ? (
                <div className="rounded-full bg-[var(--bg-main)] p-0.5 border border-accent/20">
                  <CheckCircle2 className="w-5 h-5 text-accent dark:text-accent-400" />
                </div>
              ) : step.status === 'current' ? (
                <div className="rounded-full bg-[var(--bg-main)] p-0.5 border border-accent/50">
                  <Loader2 className="w-5 h-5 text-accent dark:text-accent-400 animate-spin" />
                </div>
              ) : (
                <div className="rounded-full bg-[var(--bg-main)] p-0.5 border border-[var(--card-border)]">
                  <Circle className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <span className={`text-sm font-semibold tracking-wide ${
                step.status === 'current' 
                  ? 'text-accent-700 dark:text-accent-400 font-bold text-glow-accent' 
                  : step.status === 'complete' 
                    ? 'text-[var(--text-primary)]' 
                    : 'text-[var(--text-muted)] font-medium'
              }`}>
                {step.name}
              </span>
              {step.status === 'current' && (
                <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-accent/10 text-accent-700 dark:text-accent-400 border border-accent/20 uppercase tracking-widest animate-pulse">
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
