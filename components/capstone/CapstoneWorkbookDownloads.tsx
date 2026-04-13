'use client';

import Link from 'next/link';
import { FileSpreadsheet, Download } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export function CapstoneWorkbookDownloads() {
  const { session } = useAuth();
  const isTeacher = session?.role === 'teacher';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
      <Link
        href="/api/workbooks/capstone/student"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Download Investor Workbook
      </Link>
      {isTeacher && (
        <Link
          href="/api/workbooks/capstone/teacher"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Teacher Workbook
        </Link>
      )}
    </div>
  );
}