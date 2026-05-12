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
          
          const parts = path.split('node_modules/');
          const name = parts[parts.length - 1]; // le nom du paquet est toujours à la fin
          
          let parent: string | undefined = undefined;
          if (parts.length > 2) {
            // S'il y a plus d'un node_modules/, le parent est l'élément juste avant
            // Ex: "node_modules/express/node_modules/accepts" -> parts = ["", "express/", "accepts"]
            const parentPart = parts[parts.length - 2];
            parent = parentPart.replace(/\/$/, ''); // enlever le slash de fin
          }

          const pkg = pkgInfo as any;

          if (pkg.version) {
            dependencies.push({
              name,
              version: cleanVersion(pkg.version),
              ecosystem: 'npm',
              isDev: pkg.dev || false,
              parent
            });
          }
        }
      } 
      // Structure package-lock.json v1 (récursif)
      else if (data.dependencies) {
        const parseLockV1 = (deps: any, parentName?: string) => {
          for (const [name, info] of Object.entries(deps)) {
            const pkg = info as any;
            if (pkg.version) {
              dependencies.push({
                name,
                version: cleanVersion(pkg.version),
                ecosystem: 'npm',
                isDev: pkg.dev || false,
                parent: parentName
              });
              if (pkg.dependencies) {
                parseLockV1(pkg.dependencies, name);
              }
            }
          }
        };
        parseLockV1(data.dependencies);
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
