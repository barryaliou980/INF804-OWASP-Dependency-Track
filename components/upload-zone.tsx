'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, AlertCircle, Loader2, ShieldCheck, FileCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function UploadZone() {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validation taille < 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier dépasse la taille maximale de 2 MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur d'upload");
      }

      const data = await response.json();
      router.push(`/scan?id=${data.scanId}`);
    } catch (error: any) {
      toast.error(error.message);
      setIsUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'text/xml': ['.xml']
    }
  });

  return (
    <div className="max-w-2xl mx-auto mt-8 font-sans">
      <div 
        {...getRootProps()} 
        className={`relative overflow-hidden rounded-xl border border-[var(--card-border)] p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-accent bg-accent/5 dark:bg-accent-900/20 shadow-[0_0_25px_rgba(61,149,135,0.15)] scale-[1.01]' : 'bg-[var(--card-bg)] hover:border-[var(--card-hover-border)]'}
          ${isDragReject ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.15)]' : ''}
          ${isUploading ? 'opacity-85 pointer-events-none radar-scan border-accent/40' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {/* Decorative corner brackets for tech grid vibe */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[var(--card-border)] pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[var(--card-border)] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[var(--card-border)] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[var(--card-border)] pointer-events-none" />

        <div className="flex flex-col items-center justify-center space-y-5">
          {isUploading ? (
            <div className="relative">
              <Loader2 className="w-14 h-14 text-accent dark:text-accent-400 animate-spin" />
              <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping" />
            </div>
          ) : isDragReject ? (
            <AlertCircle className="w-14 h-14 text-rose-500 text-glow-rose" />
          ) : (
            <div className={`p-4 rounded-full bg-[var(--panel-bg)] border border-[var(--card-border)] transition-all duration-300 ${isDragActive ? 'border-accent text-accent dark:text-accent-400 bg-accent/10 dark:bg-accent-900/40 shadow-[0_0_15px_rgba(61,149,135,0.2)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <CloudUpload className="w-8 h-8" />
            </div>
          )}
          
          <div className="space-y-1.5">
            <p className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {isUploading ? "Lecture et Audit du SBOM..." : isDragActive ? "Relâchez pour scanner" : "Glissez-déposez un fichier"}
            </p>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
              {isUploading ? "Audit en cours sur la base de vulnérabilités" : "ou parcourez vos fichiers locaux en un clic"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase text-center flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Formats SBOM & Fichiers de Dépendances Supportés
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
          {[
            { name: 'requirements.txt', type: 'Python' },
            { name: 'package.json', type: 'NodeJS' },
            { name: 'package-lock.json', type: 'NodeJS' },
            { name: 'pom.xml', type: 'Java/Maven' },
            { name: 'go.mod', type: 'Go' },
            { name: 'bom.json', type: 'CycloneDX' }
          ].map(format => (
            <div key={format.name} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-xs font-mono text-[var(--text-secondary)] shadow-sm transition-all hover:border-[var(--card-hover-border)] hover:text-[var(--text-primary)]">
              <FileCheck className="w-3.5 h-3.5 text-accent/80" />
              <span>{format.name}</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold pl-1 font-sans border-l border-[var(--card-border)]">{format.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-accent/80" />
          Analyse sécurisée sans persistance. Fichiers jamais sauvegardés. Max 2 MB.
        </p>
      </div>
    </div>
  );
}
