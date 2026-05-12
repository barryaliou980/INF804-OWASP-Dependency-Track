'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, AlertCircle, Loader2 } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto mt-12">
      <div 
        {...getRootProps()} 
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          ) : isDragReject ? (
            <AlertCircle className="w-12 h-12 text-red-500" />
          ) : (
            <CloudUpload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          )}
          
          <div className="space-y-1">
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? "Analyse en cours..." : isDragActive ? "Déposez le fichier ici" : "Glissez-déposez votre fichier ici"}
            </p>
            <p className="text-sm text-gray-500">
              ou cliquez pour parcourir vos fichiers
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-gray-700 mb-3 text-center">Formats acceptés :</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['requirements.txt', 'package.json', 'package-lock.json', 'pom.xml', 'go.mod', 'bom.json'].map(format => (
            <span key={format} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
              {format}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Analysé via OSV API, jamais stocké sur nos serveurs. Max 2 MB.
        </p>
      </div>
    </div>
  );
}
