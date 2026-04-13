import { getRequestSessionClaims } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import * as fs from 'fs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: 'student' | 'teacher' }> }
) {
  const session = await getRequestSessionClaims(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const { type } = params;

  if (type !== 'student' && type !== 'teacher') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const role = session.role;

  if (type === 'teacher' && role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const fileName = type === 'teacher'
    ? 'capstone_investor_ready_workbook_teacher.xlsx'
    : 'capstone_investor_ready_workbook.xlsx';
  
  const workbooksDir = path.join(process.cwd(), 'public', 'workbooks');
  const publicPath = path.join(workbooksDir, fileName);

  if (!publicPath.startsWith(workbooksDir)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

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