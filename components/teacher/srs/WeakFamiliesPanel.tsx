"use client";

import { useState } from "react";
import { ArrowUp, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FamilyPerformance {
  problemFamilyId: string;
  displayName: string;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  totalReviews: number;
  againRate: number;
  averageRating: number;
}

interface WeakFamiliesPanelProps {
  families: FamilyPerformance[] | null;
  onBumpPriority?: (problemFamilyId: string) => void;
  isLoading?: boolean;
}

function getAgainRateColor(againRate: number): string {
  if (againRate >= 0.4) return "text-red-600 bg-red-50 border-red-200";
  if (againRate >= 0.25) return "text-amber-600 bg-amber-50 border-amber-200";
  if (againRate >= 0.15) return "text-sky-600 bg-sky-50 border-sky-200";
  return "text-emerald-600 bg-emerald-50 border-emerald-200";
}

interface ExpandedFamilyProps {
  family: FamilyPerformance;
}

function ExpandedFamilyRow({ family }: ExpandedFamilyProps) {
  return (
    <div className="bg-muted/30 p-3 text-sm">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="font-semibold text-red-600">{family.againCount}</p>
          <p className="text-xs text-muted-foreground">Again</p>
        </div>
        <div>
          <p className="font-semibold text-amber-600">{family.hardCount}</p>
          <p className="text-xs text-muted-foreground">Hard</p>
        </div>
        <div>
          <p className="font-semibold text-emerald-600">{family.goodCount}</p>
          <p className="text-xs text-muted-foreground">Good</p>
        </div>
        <div>
          <p className="font-semibold text-sky-600">{family.easyCount}</p>
          <p className="text-xs text-muted-foreground">Easy</p>
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        {family.totalReviews} total reviews &middot; Average rating: {family.averageRating.toFixed(2)}/4
      </div>
    </div>
  );
}

export function WeakFamiliesPanel({ families, onBumpPriority, isLoading }: WeakFamiliesPanelProps) {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  const toggleExpanded = (familyId: string) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(familyId)) {
        next.delete(familyId);
      } else {
        next.add(familyId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Weak Families
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!families || families.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Weak Families
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No family performance data available yet. Students need to complete some practice reviews first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4" />
          Weak Families
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Problem families sorted by Again rate (highest struggle first)
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {families.map((family) => {
          const isExpanded = expandedFamilies.has(family.problemFamilyId);
          const colorClass = getAgainRateColor(family.againRate);

          return (
            <div key={family.problemFamilyId} className="rounded-lg border">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleExpanded(family.problemFamilyId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExpanded(family.problemFamilyId);
                  }
                }}
                className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{family.displayName}</p>
                    <p className="text-xs text-muted-foreground">{family.totalReviews} reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-full px-2 py-1 text-xs font-medium border", colorClass)}>
                    {(family.againRate * 100).toFixed(0)}% Again
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg: {family.averageRating.toFixed(2)}
                  </div>
                  {onBumpPriority && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBumpPriority(family.problemFamilyId);
                      }}
                    >
                      <ArrowUp className="size-3 mr-1" />
                      Bump Priority
                    </Button>
                  )}
                </div>
              </div>
              {isExpanded && <ExpandedFamilyRow family={family} />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}