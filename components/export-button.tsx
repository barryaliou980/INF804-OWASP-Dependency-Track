'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  scanId: string;
}

export function ExportButton({ scanId }: ExportButtonProps) {
  return (
    <a
      href={`/api/sbom/${scanId}`}
      download="bom.json"
      className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--card-hover-border)] text-[var(--text-primary)] h-10 px-5 py-2 shadow-sm"
    >
      <Download className="w-4 h-4" />
      Export SBOM
    </a>
  );
}
