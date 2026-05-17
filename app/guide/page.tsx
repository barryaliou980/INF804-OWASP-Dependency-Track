export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Intégration GitHub Actions
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Automatisez l&apos;analyse de vos dépendances avec OWASP Dependency-Track
          directement dans votre pipeline CI/CD GitHub Actions.
        </p>
      </div>

      {/* Étape 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Prérequis
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">•</span>
              Une instance Dependency-Track déployée (auto-hébergée ou cloud)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">•</span>
              Une clé API Dependency-Track avec permissions de création de projet et upload de BOM
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">•</span>
              Un repository GitHub avec un fichier de dépendances (package.json, requirements.txt, pom.xml)
            </li>
          </ul>
        </div>
      </section>

      {/* Étape 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Configurer les secrets GitHub
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <p className="text-gray-600">
            Dans votre repository, allez dans <strong>Settings {"→"} Secrets and variables {"→"} Actions</strong> et ajoutez :
          </p>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 space-y-1">
            <p><span className="text-emerald-400">DEPENDENCY_TRACK_URL</span>=https://votre-instance.example.com</p>
            <p><span className="text-emerald-400">DEPENDENCY_TRACK_API_KEY</span>=votre-clé-api-secrète</p>
          </div>
        </div>
      </section>

      {/* Étape 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Créer le workflow GitHub Actions
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <p className="text-gray-600">
            Créez le fichier <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">.github/workflows/dependency-track.yml</code> :
          </p>
          <pre className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
            {`name: Dependency-Track SBOM Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Chaque lundi à 6h

jobs:
  sbom-analysis:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout du code
        uses: actions/checkout@v4

      - name: Installer CycloneDX CLI
        run: |
          npm install -g @cyclonedx/cyclonedx-npm
          # Pour Python: pip install cyclonedx-bom
          # Pour Maven: mvn org.cyclonedx:cyclonedx-maven-plugin:makeBom

      - name: Générer le SBOM (CycloneDX)
        run: |
          cyclonedx-npm --output-file bom.json

      - name: Upload SBOM vers Dependency-Track
        uses: DependencyTrack/gh-upload-sbom@v3
        with:
          serverhostname: \${{ secrets.DEPENDENCY_TRACK_URL }}
          apikey: \${{ secrets.DEPENDENCY_TRACK_API_KEY }}
          project-name: \${{ github.repository }}
          project-version: \${{ github.ref_name }}
          bom-filename: bom.json
          auto-create: true

      - name: Vérifier les vulnérabilités
        run: |
          echo "[OK!] SBOM uploadé avec succès"
          echo "Consultez les résultats sur votre instance Dependency-Track"`}
          </pre>
        </div>
      </section>

      {/* Étape 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Policy et seuils de blocage
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <p className="text-gray-600">
            Pour bloquer un merge si des vulnérabilités critiques sont détectées, ajoutez une étape de vérification :
          </p>
          <pre className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
            {`      - name: Vérifier le score de risque
        run: |
          RISK_SCORE=$(curl -s -H "X-Api-Key: \${{ secrets.DEPENDENCY_TRACK_API_KEY }}" \\
            "\${{ secrets.DEPENDENCY_TRACK_URL }}/api/v1/metrics/project/current?name=\${{ github.repository }}" \\
            | jq '.inheritedRiskScore')

          echo "Score de risque: $RISK_SCORE"

          if [ "$RISK_SCORE" -gt 70 ]; then
            echo "[CRITICAL] Score de risque trop élevé ($RISK_SCORE > 70)"
            exit 1
          fi

          echo "[OK] Score de risque acceptable ($RISK_SCORE <= 70)"`}
          </pre>
        </div>
      </section>

      {/* Étape 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Notifications et rapports
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <p className="text-gray-600">
            Dependency-Track supporte plusieurs canaux de notification :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="font-bold text-gray-900">Webhook</p>
              <p className="text-sm text-gray-500 mt-1">Slack, Teams, Discord</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="font-bold text-gray-900">Email</p>
              <p className="text-sm text-gray-500 mt-1">Alertes SMTP configurables</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="font-bold text-gray-900">Jira</p>
              <p className="text-sm text-gray-500 mt-1">Création automatique de tickets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ressources */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Ressources utiles</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">{"→"}</span>
              <a href="https://docs.dependencytrack.org/" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium">
                Documentation officielle Dependency-Track
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">{"→"}</span>
              <a href="https://cyclonedx.org/" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium">
                Standard CycloneDX (format SBOM)
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">{"→"}</span>
              <a href="https://owasp.org/www-project-dependency-track/" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium">
                Page OWASP du projet
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
