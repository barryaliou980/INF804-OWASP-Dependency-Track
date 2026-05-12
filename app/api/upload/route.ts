import { NextResponse } from 'next/server';
import { parseRequirementsTxt } from '@/lib/parsers/requirements';
import { parsePackageJson } from '@/lib/parsers/package-json';
import { Dependency, Ecosystem } from '@/lib/types';
import { globalStorage } from '@/lib/storage';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Validation taille max 2 MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Le fichier dépasse 2 MB" }, { status: 400 });
    }

    const filename = file.name;
    const content = await file.text();
    let dependencies: Dependency[] = [];
    let ecosystem: Ecosystem = 'npm';

    if (filename === 'requirements.txt') {
      dependencies = parseRequirementsTxt(content);
      ecosystem = 'PyPI';
    } else if (filename === 'package.json') {
      dependencies = parsePackageJson(content, false);
      ecosystem = 'npm';
    } else if (filename === 'package-lock.json') {
      dependencies = parsePackageJson(content, true);
      ecosystem = 'npm';
    } else {
      return NextResponse.json({ error: "Format de fichier non supporté. Utilisez requirements.txt, package.json ou package-lock.json." }, { status: 400 });
    }

    if (dependencies.length === 0) {
      return NextResponse.json({ error: "Aucune dépendance trouvée dans le fichier." }, { status: 400 });
    }

    const scanId = randomUUID();

    // Stockage temporaire pour l'étape de scan
    globalStorage.set(scanId, {
      filename,
      ecosystem,
      dependencies,
      createdAt: Date.now()
    });

    return NextResponse.json({
      scanId,
      filename,
      totalPackages: dependencies.length,
      ecosystem
    });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json({ error: "Erreur serveur lors de l'analyse du fichier" }, { status: 500 });
  }
}
