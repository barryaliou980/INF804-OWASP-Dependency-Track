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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-96">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          Flux en direct
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </h3>
        <span className="text-xs text-gray-500">{events.length} événements</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-gray-400 text-xs mt-0.5 whitespace-nowrap">
              {new Date(event.timestamp).toISOString().split('T')[1].substring(0, 8)}
            </span>
            
            {event.type === 'progress' && event.status === 'safe' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">
                  Analyse <span className="text-gray-900 font-medium">{event.package}</span> : <span className="text-green-600">Aucune vulnérabilité</span>
                </span>
              </>
            )}

            {event.type === 'vuln' && (
              <>
                {event.severity === 'CRITICAL' ? (
                  <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                )}
                <span className="text-gray-800">
                  <span className="font-medium">{event.package}</span> vulnérable à{' '}
                  <span className={event.severity === 'CRITICAL' ? 'text-red-600 font-bold' : 'text-orange-600 font-bold'}>
                    {event.cve}
                  </span>
                </span>
              </>
            )}

            {event.type === 'progress' && event.status === 'info' && (
              <>
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <span className="text-gray-600 italic">{event.package}</span>
              </>
            )}
          </div>
        ))}
        <div ref={endOfFeedRef} />
      </div>
    </div>
  );
}
