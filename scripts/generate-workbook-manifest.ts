import fs from 'fs';
import path from 'path';

const PUBLIC_WORKBOOKS_DIR = path.join(process.cwd(), 'public', 'workbooks');
const OUTPUT_PATH = path.join(process.cwd(), 'lib', 'workbooks-manifest.json');

interface WorkbookManifest {
  version: number;
  generatedAt: string;
  files: string[];
  byUnitAndLesson: Record<string, { student: boolean; teacher: boolean }>;
}

function scanWorkbooks(): WorkbookManifest {
  const files = fs.readdirSync(PUBLIC_WORKBOOKS_DIR).filter((f) => f.endsWith('.xlsx'));
  
  const byUnitAndLesson: Record<string, { student: boolean; teacher: boolean }> = {};
  
  for (const file of files) {
    const match = file.match(/^unit_(\d+)_lesson_(\d+)_(student|teacher)\.xlsx$/);
    if (match) {
      const [, unitNum, lessonNum, type] = match;
      const key = `${parseInt(unitNum, 10)}-${parseInt(lessonNum, 10)}`;
      if (!byUnitAndLesson[key]) {
        byUnitAndLesson[key] = { student: false, teacher: false };
      }
      byUnitAndLesson[key][type as 'student' | 'teacher'] = true;
    }
  }
  
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    files: files.sort(),
    byUnitAndLesson,
  };
}

const manifest = scanWorkbooks();
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
console.log(`Generated workbook manifest with ${manifest.files.length} files at ${OUTPUT_PATH}`);