import React from 'react';

interface SeverityBadgeProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | 'SAFE';
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const styles = {
    CRITICAL: 'bg-[#E24B4A] text-[#A32D2D] bg-opacity-20 border-[#E24B4A]',
    HIGH: 'bg-[#EF9F27] text-[#633806] bg-opacity-20 border-[#EF9F27]',
    MEDIUM: 'bg-[#FAC775] text-[#412402] bg-opacity-20 border-[#FAC775]',
    LOW: 'bg-gray-200 text-gray-800 border-gray-300',
    NONE: 'bg-[#639922] text-[#27500A] bg-opacity-20 border-[#639922]',
    SAFE: 'bg-[#639922] text-[#27500A] bg-opacity-20 border-[#639922]'
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[severity]} ${className}`}>
      {labels[severity]}
    </span>
  );
}
