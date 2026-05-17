import { UploadZone } from '@/components/upload-zone';

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[72vh] max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--text-primary)] font-[family-name:var(--font-display)]">
          Scanner vos <span className="text-accent-700 dark:text-accent-400">dépendances</span>
        </h1>
        <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Sélectionnez ou glissez votre fichier manifeste de dépendances. L&apos;analyse est effectuée en direct via l&apos;API publique OSV pour cartographier vos failles de sécurité.
        </p>
      </div>

      <div className="w-full">
        <UploadZone />
      </div>
    </div>
  );
}
