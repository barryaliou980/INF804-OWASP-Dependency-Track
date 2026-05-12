# DepScan - OWASP Dependency Vulnerability Scanner

DepScan est un outil de détection de vulnérabilités dans les dépendances inspiré par OWASP Dependency-Track. Il analyse les fichiers de dépendances (comme `requirements.txt` et `package.json`) et interroge l'API publique OSV pour identifier les vulnérabilités CVE.

## Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **react-force-graph-2d** (Graphe interactif)
- **API OSV** (Base de données de vulnérabilités open source)

## Lancement rapide

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Créez votre fichier d'environnement (optionnel, activé par défaut en mode démo si non défini) :
   ```bash
   cp .env.example .env.local
   ```
   > **Note** : Si `NEXT_PUBLIC_DEMO_MODE=true`, l'application utilisera des données factices pour la démonstration et n'appellera pas réellement l'API OSV afin de garantir un affichage peu importe l'état du réseau ou les limites de taux. Mettez-le à `false` ou supprimez-le pour utiliser la vraie API.

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Utilisation

1. Sur la page d'accueil, glissez-déposez un fichier `requirements.txt` ou `package.json`.
2. L'analyse s'effectue en temps réel (ou simulée en mode démo) avec un flux (Live Feed).
3. Consultez le tableau de bord des résultats avec les statistiques de vulnérabilités (Critical, High, Medium, Safe).
4. Naviguez vers l'onglet **Graphe de dépendances** pour visualiser vos composants sous forme de graphe interactif.
5. Exportez un **SBOM (Software Bill of Materials)** au format CycloneDX.
