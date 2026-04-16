"use client";

import { RefreshCw, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StudentStruggleMetrics {
  studentId: string;
  username: string;
  displayName?: string | null;
  overdueCards: number;
  totalCards: number;
  totalReviews: number;
  againRate: number;
  lastActive: number | null;
}

interface StrugglingStudentsPanelProps {
  students: StudentStruggleMetrics[] | null;
  onResetCard?: (studentId: string, studentName: string) => void;
  isLoading?: boolean;
}

function formatLastActive(timestamp: number | null): string {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

function getStruggleLevel(overdueCards: number, againRate: number): { label: string; className: string } {
  if (overdueCards >= 10 || againRate >= 0.4) {
    return { label: "Critical", className: "text-red-600 bg-red-50 border-red-200" };
  }
  if (overdueCards >= 5 || againRate >= 0.25) {
    return { label: "At Risk", className: "text-amber-600 bg-amber-50 border-amber-200" };
  }
  if (overdueCards >= 2 || againRate >= 0.15) {
    return { label: "Needs Attention", className: "text-sky-600 bg-sky-50 border-sky-200" };
  }
  return { label: "On Track", className: "text-emerald-600 bg-emerald-50 border-emerald-200" };
}

export function StrugglingStudentsPanel({
  students,
  onResetCard,
  isLoading,
}: StrugglingStudentsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-4" />
            Struggling Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-4" />
            Struggling Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No students with struggling cards right now. Great news!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="size-4" />
          Struggling Students
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Students with overdue cards, sorted by overdue count
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {students.map((student) => {
            const struggle = getStruggleLevel(student.overdueCards, student.againRate);
            const displayName = student.displayName ?? student.username;

            return (
              <div
                key={student.studentId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">@{student.username}</p>
                  </div>
                  <div
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium border",
                      struggle.className
                    )}
                  >
                    {struggle.label}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-red-600">{student.overdueCards}</p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{student.totalCards}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{(student.againRate * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Again Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{formatLastActive(student.lastActive)}</p>
                    <p className="text-xs text-muted-foreground">Last Active</p>
                  </div>
                  {onResetCard && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResetCard(student.studentId, displayName)}
                    >
                      <RefreshCw className="size-3 mr-1" />
                      Reset Card
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}