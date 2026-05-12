import { UploadZone } from '@/components/upload-zone';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900">
          Sécurisez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E24B4A] to-[#EF9F27]">dépendances</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Uploadez votre fichier de dépendances. Nous l'analyserons instantanément via l'API OSV pour identifier les vulnérabilités CVE critiques.
        </p>
      </div>

      <div className="w-full">
        <UploadZone />
      </div>
    </div>
  );
}
