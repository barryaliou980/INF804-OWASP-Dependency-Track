import { Dependency } from '../types';

export function parseRequirementsTxt(content: string): Dependency[] {
  const lines = content.split('\n');
  const dependencies: Dependency[] = [];

  for (let line of lines) {
    line = line.trim();
    // Ignorer les commentaires et les lignes vides
    if (!line || line.startsWith('#') || line.startsWith('-')) {
      continue;
    }

    // Retirer les commentaires en fin de ligne
    line = line.split('#')[0].trim();

    // Expression régulière pour capturer le nom et la version (== ou >=)
    // On ignore les contraintes plus complexes pour la démo
    const match = line.match(/^([a-zA-Z0-9_\-\.]+)(?:[=|>]=)(.*)$/);
    if (match) {
      const name = match[1].trim();
      const versionList = match[2].split(',').map(v => v.trim());
      // Prendre la première version comme version de base (souvent la minimale ou l'exacte)
      let version = versionList[0];
      
      // Nettoyer les caractères parasites potentiels
      version = version.replace(/^[=|>]=/, '').trim();

      dependencies.push({
        name,
        version,
        ecosystem: 'PyPI'
      });
    } else if (/^[a-zA-Z0-9_\-\.]+$/.test(line)) {
      // Cas où seul le nom du package est présent sans version
      dependencies.push({
        name: line,
        version: 'unknown',
        ecosystem: 'PyPI'
      });
    }
  }

  return dependencies;
}
