import React, { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface FeedEvent {
  id: string;
  type: 'progress' | 'vuln';
  package?: string;
  cve?: string;
  severity?: string;
  status?: 'safe' | 'vuln' | 'info';
  timestamp: number;
}

interface LiveFeedProps {
  events: FeedEvent[];
}

export function LiveFeed({ events }: LiveFeedProps) {
  const endOfFeedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll au nouvel événement
  useEffect(() => {
    endOfFeedRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="cyber-card overflow-hidden flex flex-col h-[384px] bg-[var(--card-bg)] border-[var(--card-border)] relative">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[var(--card-border)] pointer-events-none" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[var(--card-border)] pointer-events-none" />

      {/* Header bar */}
      <div className="bg-[var(--panel-bg)] border-b border-[var(--card-border)] px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-widest flex items-center gap-2 font-mono">
          Console de Sécurité
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        </h3>
        <span className="text-xs font-mono font-bold text-accent-700 dark:text-accent-400 bg-accent/10 px-2 py-0.5 rounded border border-accent/20 shadow-sm">
          {events.length} événements
        </span>
      </div>
      
      {/* Event scrolling logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[13px] text-[var(--text-secondary)] bg-[var(--bg-main)]">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)] italic text-xs">
            En attente de démarrage de l&apos;audit...
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-2.5 animate-fade-in">
              <span className="text-[var(--text-muted)] text-[11px] mt-0.5 shrink-0 select-none">
                [{new Date(event.timestamp).toISOString().split('T')[1].substring(0, 8)}]
              </span>
              
              {event.type === 'progress' && event.status === 'safe' && (
                <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                  <CheckCircle2 className="w-4 h-4 text-accent dark:text-accent-400 shrink-0 mt-0.5" />
                  <span>
                    Audit <span className="text-[var(--text-primary)] font-semibold">{event.package}</span> : <span className="text-accent-700 dark:text-accent-400 font-medium">Aucune menace</span>
                  </span>
                </div>
              )}

              {event.type === 'vuln' && (
                <div className="flex items-start gap-2">
                  {event.severity === 'CRITICAL' ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 text-glow-rose" />
                      <span className="text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{event.package}</span> vulnérable &rarr;{' '}
                        <span className="text-rose-600 dark:text-rose-400 font-bold text-glow-rose">
                          {event.cve}
                        </span>
                        <span className="ml-2 px-1.5 py-0.2 text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded">
                          CRITICAL
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 text-glow-amber" />
                      <span className="text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">{event.package}</span> vulnérable &rarr;{' '}
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-glow-amber">
                          {event.cve}
                        </span>
                        <span className="ml-2 px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/20 rounded">
                          {event.severity || 'HIGH'}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              )}

              {event.type === 'progress' && event.status === 'info' && (
                <div className="flex items-start gap-2 text-[var(--text-muted)]">
                  <div className="w-4 h-4 rounded-full bg-[var(--bg-main)] border border-[var(--card-border)] flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent dark:bg-accent-400 animate-pulse"></div>
                  </div>
                  <span>
                    Audit en cours : <span className="text-accent-700 dark:text-accent-400">{event.package}</span>
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={endOfFeedRef} />
      </div>
    </div>
  );
}
