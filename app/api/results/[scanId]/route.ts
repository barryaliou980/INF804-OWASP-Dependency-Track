import { NextResponse } from 'next/server';
import { globalStorage } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { scanId: string } }
) {
  const { scanId } = params;

  const result = globalStorage.get(`result_${scanId}`);

  if (!result) {
    return NextResponse.json(
      { error: "Résultats de scan non trouvés. Le scan a peut-être expiré. Veuillez ré-uploader votre fichier." },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
