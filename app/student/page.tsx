import { redirect } from 'next/navigation';

import { studentDashboardPath } from '@/lib/student/navigation';

export default async function StudentIndexPage() {
  redirect(studentDashboardPath());
}
