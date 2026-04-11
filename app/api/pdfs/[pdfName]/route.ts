import { getRequestSessionClaims } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import * as fs from 'fs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pdfName: string }> }
) {
  const session = await getRequestSessionClaims();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const { pdfName } = params;

  if (!/^[\w-]+\.pdf$/.test(pdfName)) {
    return NextResponse.json({ error: 'Invalid PDF name' }, { status: 400 });
  }

  const pdfsDir = path.join(process.cwd(), 'public', 'pdfs');
  const publicPath = path.join(pdfsDir, pdfName);

  if (!publicPath.startsWith(pdfsDir)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  if (!fs.existsSync(publicPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(publicPath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfName}"`,
    },
  });
}
