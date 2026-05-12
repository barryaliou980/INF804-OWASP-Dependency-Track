import { NextResponse } from 'next/server';
import { globalStorage } from '@/lib/storage';
import { generateSbom } from '@/lib/sbom-generator';

export async function GET(
  request: Request,
  { params }: { params: { scanId: string } }
) {
  const { scanId } = params;

  const scanResult = globalStorage.get(`result_${scanId}`);

  if (!scanResult) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  const sbom = generateSbom(scanResult);

  return new NextResponse(JSON.stringify(sbom, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="bom.json"'
    }
  });
}
