import { getRequestSessionClaims } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import * as fs from 'fs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ unit: string; lesson: string; type: 'student' | 'teacher' }> }
) {
  const session = await getRequestSessionClaims();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const { unit, lesson, type } = params;

  if (type !== 'student' && type !== 'teacher') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const role = session.role;
  const requestedType = type;

  if (requestedType === 'teacher' && role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const fileName = `unit_${unit}_lesson_${lesson}_${requestedType}.xlsx`;
  const publicPath = path.join(process.cwd(), 'public', 'workbooks', fileName);

  if (!fs.existsSync(publicPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(publicPath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
