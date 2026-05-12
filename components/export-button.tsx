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
      className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 h-10 px-4 py-2"
    >
      <Download className="w-4 h-4" />
      Export SBOM
    </a>
  );
}
