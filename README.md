# DepScan - OWASP Dependency-Track

DepScan est un outil de detection de vulnerabilites dans les dependances base sur OWASP Dependency-Track. Il analyse les fichiers de dependances (comme `requirements.txt` et `package.json`), genere un SBOM et l'envoie a une instance Dependency-Track pour identifier les vulnerabilites CVE.

## Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **react-force-graph-2d** (Graphe interactif)
- **OWASP Dependency-Track** (Analyse de vulnerabilites)
- **CycloneDX** (Format SBOM)

## Lancement rapide

1. Installez les dependances :
   ```bash
   npm install
   ```

2. Lancez le serveur de developpement :
   ```bash
   npm run dev
   ```

3. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Utilisation

1. Sur la page d'accueil, glissez-deposez un fichier `requirements.txt` ou `package.json`.
2. L'analyse s'effectue en temps reel avec un flux (Live Feed).
3. Consultez le tableau de bord des resultats avec les statistiques de vulnerabilites (Critical, High, Medium, Safe).
4. Naviguez vers l'onglet **Graphe de dependances** pour visualiser vos composants sous forme de graphe interactif.
5. Exportez un **SBOM (Software Bill of Materials)** au format CycloneDX.

## CI/CD - GitHub Actions

Un workflow GitHub Actions est integre (`.github/workflows/dependency-scan.yml`). Il se declenche sur chaque push (`main`/`develop`) et sur les pull requests vers `main`.

Le pipeline :
1. Installe les dependances via `npm ci`
2. Genere un SBOM au format CycloneDX
3. Upload le SBOM vers l'instance Dependency-Track
4. Verifie le score de risque et bloque le build si le seuil est depasse (> 70)
5. Sauvegarde le SBOM en artifact telechargeables

### Configuration requise

Ajoutez ces secrets dans **Settings > Secrets and variables > Actions** :

| Secret | Description |
|---|---|
| `DEPENDENCY_TRACK_URL` | URL de votre instance Dependency-Track |
| `DEPENDENCY_TRACK_API_KEY` | Cle API avec permissions d'upload |

## Infrastructure

L'instance Dependency-Track est hebergee sur **Oracle Cloud Free Tier** (VM ARM, 4 OCPU, 24 Go RAM) via Docker Compose.
