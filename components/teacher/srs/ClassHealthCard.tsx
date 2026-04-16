"use client";

import { Brain, AlertCircle, CalendarClock, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ClassHealthSummary {
  totalStudents: number;
  studentsWithCards: number;
  averageRetentionRate: number;
  overdueCardCount: number;
  cardsDueToday: number;
  totalCards: number;
  classId: string;
}

interface ClassHealthCardProps {
  health: ClassHealthSummary | null;
}

export function ClassHealthCard({ health }: ClassHealthCardProps) {
  if (!health) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Class Health</CardTitle>
          <Brain className="size-4 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">--</div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card aria-live="polite">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Class Health</CardTitle>
        <Brain className="size-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold">{health.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold">{health.averageRetentionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Retention Rate</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="size-4 text-red-600" aria-hidden="true" />
            <div>
              <p className="text-xl font-semibold text-red-700">{health.overdueCardCount}</p>
              <p className="text-xs text-red-600">Overdue Cards</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
            <CalendarClock className="size-4 text-sky-600" aria-hidden="true" />
            <div>
              <p className="text-xl font-semibold text-sky-700">{health.cardsDueToday}</p>
              <p className="text-xs text-sky-600">Due Today</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {health.studentsWithCards} of {health.totalStudents} students have started SRS practice
          &middot; {health.totalCards} total cards
        </div>
      </CardContent>
    </Card>
  );
}