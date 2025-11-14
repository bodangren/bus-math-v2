"use client";

import { useCallback, useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentDashboardRow } from "./TeacherDashboardContent";
import { buildCsvFilename, studentRowsToCsv } from "./csvUtils";

interface TeacherCsvExportButtonProps {
  students: StudentDashboardRow[];
}

export function TeacherCsvExportButton({ students }: TeacherCsvExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(() => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const csv = studentRowsToCsv(students);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = buildCsvFilename();
      anchor.style.display = "none";

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, students]);

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      aria-label="Export student progress to CSV"
      aria-busy={isExporting}
      onClick={handleExport}
    >
      <FileDown className="size-4" aria-hidden="true" />
      {isExporting ? "Preparing..." : "Export CSV"}
    </Button>
  );
}
