import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 cyber-grid" />

      {/* Soft glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-200/20 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10 px-4">

        {/* Course badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow" />
          <span className="font-mono text-xs tracking-widest text-emerald-700 uppercase">
            Session Été 2026
          </span>
        </div>

        {/* Main title */}
        <div className="space-y-4 animate-slide-up">
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-[0.9]">
            INF804
          </h1>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-emerald-600">
            Sécurité des logiciels
          </h2>
        </div>

        {/* Team info card */}
        <div className="relative mx-auto max-w-lg animate-slide-up animation-delay-200">
          <div className="relative rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-emerald-200" />
              <span className="font-mono text-[11px] tracking-[0.3em] text-gray-500 uppercase">Groupe 2</span>
              <div className="h-px flex-1 bg-emerald-200" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              OWASP Dependency-Track
            </h3>
            <p className="font-mono text-xs text-emerald-600 tracking-wide">
              Démo
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto space-y-4 animate-slide-up animation-delay-400">
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Ce projet implémente un scanner de vulnérabilités inspiré de
            <span className="text-emerald-700 font-semibold"> OWASP Dependency-Track</span>.
            Analysez vos fichiers de dépendances en temps réel et identifiez les failles de sécurité
            connues (CVE) grâce à l&apos;API <span className="text-teal-700 font-semibold">OSV.dev</span>.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Importez un fichier <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">package-lock.json</code>,
            <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">requirements.txt</code> ou
            <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">pom.xml</code> pour
            obtenir un rapport détaillé des vulnérabilités avec scores CVSS, graphe de dépendances
            et recommandations de remédiation.
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-slide-up animation-delay-600">
          <Link
            href="/upload"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white bg-emerald-600 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:bg-emerald-700 transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Lancer un Scan
          </Link>
        </div>

        {/* Bottom stats */}
        <div className="flex items-center justify-center gap-8 pt-4 animate-slide-up animation-delay-800">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-gray-900">OSV</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">API Source</div>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-gray-900">CVSS</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Scoring</div>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-gray-900">SBOM</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">Analysis</div>
          </div>
        </div>
      </div>
    </div>
  );
}
