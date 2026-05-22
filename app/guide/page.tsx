export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Integration OWASP Dependency-Track
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Automatisez l&apos;analyse de vos dependances avec OWASP Dependency-Track
          et GitHub Actions. L&apos;instance est hebergee sur Oracle Cloud Free Tier.
        </p>
      </div>

      {/* Etape 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Prerequis
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">{"•"}</span>
              Une instance Dependency-Track deployee (Oracle Cloud Free Tier ou autre)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">{"•"}</span>
              Une cle API Dependency-Track avec permissions de creation de projet et upload de BOM
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">{"•"}</span>
              Un repository GitHub avec un fichier <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">package.json</code> et <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">package-lock.json</code>
            </li>
          </ul>
        </div>
      </section>

      {/* Etape 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Deployer Dependency-Track (Docker)
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <p className="text-gray-600">
            Sur votre VM Oracle Cloud, creez un fichier <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">docker-compose.yml</code> :
          </p>
          <pre className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
            {`version: '3.8'
services:
  dtrack-apiserver:
    image: dependencytrack/apiserver:latest
    ports:
      - "8081:8080"
    volumes:
      - dtrack-data:/data
    restart: unless-stopped

  dtrack-frontend:
    image: dependencytrack/frontend:latest
    ports:
      - "8080:8080"
    environment:
      - API_BASE_URL=http://votre-ip:8081
    restart: unless-stopped

volumes:
  dtrack-data:`}
          </pre>
          <pre className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
            {`docker compose up -d`}
          </pre>
          <p className="text-gray-500 text-sm">
            Login par defaut : <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">admin</code> / <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">admin</code>
          </p>
        </div>
      </section>

      {/* Etape 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Configurer les secrets GitHub
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <p className="text-gray-600">
            Dans votre repository, allez dans <strong>Settings {">"} Secrets and variables {">"} Actions</strong> et ajoutez :
          </p>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 space-y-1">
            <p><span className="text-emerald-400">DEPENDENCY_TRACK_URL</span>=https://votre-instance.example.com</p>
            <p><span className="text-emerald-400">DEPENDENCY_TRACK_API_KEY</span>=votre-cle-api-secrete</p>
          </div>
          <p className="text-gray-500 text-sm">
            Pour generer la cle API : Dependency-Track {">"} Administration {">"} Access Management {">"} Teams {">"} Automation {">"} API Keys
          </p>
        </div>
      </section>

      {/* Etape 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Workflow GitHub Actions
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <p className="text-gray-600">
            Le fichier <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-emerald-700 font-mono text-xs">.github/workflows/dependency-scan.yml</code> :
          </p>
          <pre className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
            {`name: OWASP Dependency-Track Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout du code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Installer les dependances
        run: npm ci

      - name: Generer le SBOM (CycloneDX)
        run: npx @cyclonedx/cyclonedx-npm --output-file bom.json --output-format JSON

      - name: Upload SBOM vers Dependency-Track
        uses: DependencyTrack/gh-upload-sbom@v3
        with:
          serverhostname: \${{ secrets.DEPENDENCY_TRACK_URL }}
          apikey: \${{ secrets.DEPENDENCY_TRACK_API_KEY }}
          project-name: \${{ github.repository }}
          project-version: \${{ github.ref_name }}
          bom-filename: bom.json
          auto-create: true

      - name: Attendre l'analyse
        run: sleep 15

      - name: Verifier le score de risque
        run: |
          RISK_SCORE=$(curl -s -H "X-Api-Key: \${{ secrets.DEPENDENCY_TRACK_API_KEY }}" \\
            "\${{ secrets.DEPENDENCY_TRACK_URL }}/api/v1/project/lookup?name=\${{ github.repository }}&version=\${{ github.ref_name }}" \\
            | node -e "
              const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
              console.log(data.lastInheritedRiskScore || 0);
            ")
          echo "Score de risque: $RISK_SCORE"
          if [ "$RISK_SCORE" -gt 70 ]; then
            echo "!! Score trop eleve ($RISK_SCORE > 70)"
            exit 1
          fi`}
          </pre>
        </div>
      </section>

      {/* Etape 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Policy et seuils de blocage
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <p className="text-gray-600">
            Le workflow bloque le build si le score de risque depasse <strong>70</strong>. Ce seuil est configurable dans l&apos;etape &quot;Verifier le score de risque&quot;.
          </p>
          <p className="text-gray-600">
            Dependency-Track offre aussi des <strong>policies granulaires</strong> dans son interface : regles par severite (Critical, High, Medium), par licence, ou par composant specifique.
          </p>
        </div>
      </section>

      {/* Etape 6 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">6</span>
          Notifications
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <p className="text-gray-600">
            Recevez des alertes quand des vulnerabilites sont detectees. Dependency-Track supporte nativement plusieurs canaux, et GitHub Actions permet d&apos;en ajouter d&apos;autres.
          </p>

          {/* Dependency-Track natif */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900">Via Dependency-Track (natif)</h3>
            <p className="text-gray-600 text-sm">
              Dans <strong>Administration {">"} Notifications</strong>, configurez directement des alertes vers Slack, Teams, Email ou Webhook pour chaque nouvelle vulnerabilite detectee.
            </p>
          </div>

          {/* Email GitHub */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900">Email (GitHub natif)</h3>
            <p className="text-gray-600 text-sm">
              GitHub envoie automatiquement un email au proprietaire du repo quand un workflow echoue. Aucune configuration requise.
            </p>
          </div>

          {/* Slack */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900">Slack (via GitHub Actions)</h3>
            <p className="text-gray-600 text-sm">
              Ajoutez cette etape au workflow. Configurez un Incoming Webhook dans Slack, puis ajoutez l&apos;URL dans <strong>Settings {">"} Secrets {">"} SLACK_WEBHOOK_URL</strong>.
            </p>
            <pre className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
              {`      - name: Notification Slack
        if: failure()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "!! Vulnerabilites detectees dans *\${{ github.repository }}*",
              "attachments": [{
                "color": "danger",
                "fields": [
                  { "title": "Branche", "value": "\${{ github.ref_name }}", "short": true },
                  { "title": "Declencheur", "value": "\${{ github.actor }}", "short": true },
                  { "title": "Rapport", "value": "\${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}" }
                ]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}`}
            </pre>
          </div>

          {/* Tableau recapitulatif */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-bold text-gray-900">Canal</th>
                  <th className="text-left py-2 pr-4 font-bold text-gray-900">Source</th>
                  <th className="text-left py-2 font-bold text-gray-900">Requis</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4">Email</td>
                  <td className="py-2 pr-4 text-emerald-600 font-medium">GitHub (natif)</td>
                  <td className="py-2">Rien</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4">Slack / Teams / Webhook</td>
                  <td className="py-2 pr-4 text-emerald-600 font-medium">Dependency-Track</td>
                  <td className="py-2">Configuration dans l&apos;interface DT</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 pr-4">Slack</td>
                  <td className="py-2 pr-4 text-yellow-600 font-medium">GitHub Actions</td>
                  <td className="py-2">Webhook URL dans les secrets</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Jira</td>
                  <td className="py-2 pr-4 text-red-600 font-medium">Dependency-Track</td>
                  <td className="py-2">API token + project key</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Ressources */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Ressources utiles</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">{">"}</span>
              <a href="https://docs.dependencytrack.org/" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium">
                Documentation officielle Dependency-Track
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">{">"}</span>
              <a href="https://owasp.org/www-project-dependency-track/" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium">
                Page OWASP du projet Dependency-Track
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">{">"}</span>
              <a href="https://cyclonedx.org/" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium">
                Standard CycloneDX (format SBOM)
              </a>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-600">{">"}</span>
              <a href="https://docs.github.com/en/actions" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-medium">
                Documentation GitHub Actions
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
