"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExportData } from "@/hooks/useStudy";

function downloadFile(data: string, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]) {
  const escapeCell = (cell: string | number | null | undefined) => {
    if (cell == null) return "";
    const str = String(cell);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  return [headers.map(escapeCell).join(","), ...rows.map(row => row.map(escapeCell).join(","))].join("\n");
}

export function ExportPage() {
  const exportData = useExportData();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownloadJSON = () => {
    if (!exportData) return;
    setIsDownloading("json");
    try {
      const filename = `bus-math-study-data-${new Date().toISOString().split("T")[0]}.json`;
      downloadFile(JSON.stringify(exportData, null, 2), filename, "application/json");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadCSV = () => {
    if (!exportData) return;
    setIsDownloading("csv");
    try {
      const termMasteryCSV = toCSV(
        ["termSlug", "masteryScore", "proficiencyBand", "seenCount", "correctCount", "incorrectCount", "lastReviewedAt"],
        exportData.termMastery.map(t => [
          t.termSlug,
          t.masteryScore,
          t.proficiencyBand,
          t.seenCount,
          t.correctCount,
          t.incorrectCount,
          t.lastReviewedAt,
        ])
      );
      const studySessionsCSV = toCSV(
        ["activityType", "startedAt", "endedAt", "itemsSeen", "itemsCorrect", "itemsIncorrect", "durationSeconds"],
        exportData.studySessions.map(s => [
          s.activityType,
          s.startedAt,
          s.endedAt,
          s.results?.itemsSeen,
          s.results?.itemsCorrect,
          s.results?.itemsIncorrect,
          s.results?.durationSeconds,
        ])
      );
      const combinedCSV = `=== Term Mastery ===\n${termMasteryCSV}\n\n=== Study Sessions ===\n${studySessionsCSV}`;
      const filename = `bus-math-study-data-${new Date().toISOString().split("T")[0]}.csv`;
      downloadFile(combinedCSV, filename, "text/csv");
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          <header>
            <Card className="border-primary/20 bg-background">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Export
                </Badge>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Export Study Data
                </h1>
                <CardDescription className="max-w-2xl text-base">
                  Download your study data in JSON or CSV format for backup or analysis.
                </CardDescription>
              </CardHeader>
            </Card>
          </header>

          <section aria-label="Export options">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/60 bg-background">
                <CardHeader className="pb-2">
                  <FileJson className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">JSON Export</CardTitle>
                </CardHeader>
                <CardDescription className="px-6 pb-4">
                  Full export including preferences, term mastery, due reviews, and study sessions.
                </CardDescription>
                <CardContent>
                  <Button 
                    onClick={handleDownloadJSON} 
                    disabled={!exportData || isDownloading === "json"}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading === "json" ? "Downloading..." : "Download JSON"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-background">
                <CardHeader className="pb-2">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">CSV Export</CardTitle>
                </CardHeader>
                <CardDescription className="px-6 pb-4">
                  Tabular export of term mastery and study sessions for spreadsheet analysis.
                </CardDescription>
                <CardContent>
                  <Button 
                    onClick={handleDownloadCSV} 
                    disabled={!exportData || isDownloading === "csv"}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading === "csv" ? "Downloading..." : "Download CSV"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
