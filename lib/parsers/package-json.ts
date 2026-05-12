import { Dependency } from '../types';

function cleanVersion(version: string): string {
  // Retire les préfixes courants dans package.json
  return version.replace(/^[\^~>=<]+/, '').trim();
}

export function parsePackageJson(content: string, isLockFile = false): Dependency[] {
  try {
    const data = JSON.parse(content);
    const dependencies: Dependency[] = [];

    if (isLockFile) {
      // Structure package-lock.json v2/v3
      if (data.packages) {
        for (const [path, pkgInfo] of Object.entries(data.packages)) {
          if (!path || path === '') continue; // Le projet racine
          
          const nameMatch = path.match(/node_modules\/(.+)$/);
          const name = nameMatch ? nameMatch[1] : path;
          const pkg = pkgInfo as any;

          if (pkg.version) {
            dependencies.push({
              name,
              version: cleanVersion(pkg.version),
              ecosystem: 'npm',
              isDev: pkg.dev || false
            });
          }
        }
      } 
      // Structure package-lock.json v1
      else if (data.dependencies) {
        for (const [name, info] of Object.entries(data.dependencies)) {
          const pkg = info as any;
          if (pkg.version) {
            dependencies.push({
              name,
              version: cleanVersion(pkg.version),
              ecosystem: 'npm',
              isDev: pkg.dev || false
            });
          }
        }
      }
    } else {
      // Structure package.json classique
      if (data.dependencies) {
        for (const [name, version] of Object.entries(data.dependencies)) {
          dependencies.push({
            name,
            version: cleanVersion(version as string),
            ecosystem: 'npm',
            isDev: false
          });
        }
      }
      if (data.devDependencies) {
        for (const [name, version] of Object.entries(data.devDependencies)) {
          dependencies.push({
            name,
            version: cleanVersion(version as string),
            ecosystem: 'npm',
            isDev: true
          });
        }
      }
    }

    return dependencies;
  } catch (error) {
    console.error("Erreur lors du parsing du fichier JSON:", error);
    return [];
  }
}
