import fs from 'fs';
import path from 'path';

const PUBLIC_WORKBOOKS_DIR = path.join(process.cwd(), 'public', 'workbooks');
const OUTPUT_PATH = path.join(process.cwd(), 'lib', 'workbooks-manifest.json');

interface WorkbookManifest {
  version: number;
  generatedAt: string;
  files: string[];
  byUnitAndLesson: Record<string, { student: boolean; teacher: boolean }>;
  byCapstone: { student: boolean; teacher: boolean };
}

function scanWorkbooks(): WorkbookManifest {
  if (!fs.existsSync(PUBLIC_WORKBOOKS_DIR)) {
    throw new Error(`Workbook directory not found: ${PUBLIC_WORKBOOKS_DIR}`);
  }
  const files = fs.readdirSync(PUBLIC_WORKBOOKS_DIR).filter((f) => f.endsWith('.xlsx'));
  
  const byUnitAndLesson: Record<string, { student: boolean; teacher: boolean }> = {};
  const byCapstone = { student: false, teacher: false };
  
  for (const file of files) {
    const unitLessonMatch = file.match(/^unit_(\d+)_lesson_(\d+)_(student|teacher)\.xlsx$/);
    if (unitLessonMatch) {
      const [, unitNum, lessonNum, type] = unitLessonMatch;
      const key = `${parseInt(unitNum, 10)}-${parseInt(lessonNum, 10)}`;
      if (!byUnitAndLesson[key]) {
        byUnitAndLesson[key] = { student: false, teacher: false };
      }
      byUnitAndLesson[key][type as 'student' | 'teacher'] = true;
      continue;
    }
    
    const capstoneMatch = file.match(/^capstone_.+\.xlsx$/);
    if (capstoneMatch) {
      if (file.endsWith('_teacher.xlsx')) {
        byCapstone.teacher = true;
      } else {
        byCapstone.student = true;
      }
    }
  }
  
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    files: files.sort(),
    byUnitAndLesson,
    byCapstone,
  };
}

const manifest = scanWorkbooks();
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
console.log(`Generated workbook manifest with ${manifest.files.length} files at ${OUTPUT_PATH}`);