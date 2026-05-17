import React from 'react';

interface SeverityBadgeProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | 'SAFE';
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const styles = {
    CRITICAL: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    HIGH: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    LOW: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    NONE: 'bg-accent/10 text-accent-800 dark:text-accent-400 border-accent/20',
    SAFE: 'bg-accent/10 text-accent-800 dark:text-accent-400 border-accent/20'
  };

  const dotStyles = {
    CRITICAL: 'bg-rose-500 animate-pulse',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-slate-500',
    NONE: 'bg-accent',
    SAFE: 'bg-accent'
  };

  const labels = {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
    NONE: 'Safe',
    SAFE: 'Safe'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border tracking-wide uppercase ${styles[severity]} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dotStyles[severity]}`} />
      {labels[severity]}
    </span>
  );
}
