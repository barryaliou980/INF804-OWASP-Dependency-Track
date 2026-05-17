import { UploadZone } from '@/components/upload-zone';

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900">
          Scanner vos <span className="text-emerald-600">dépendances</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Uploadez votre fichier de dépendances. Nous l&apos;analyserons instantanément via l&apos;API OSV pour identifier les vulnérabilités CVE critiques.
        </p>
      </div>

      <div className="w-full">
        <UploadZone />
      </div>
    </div>
  );
}
