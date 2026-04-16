"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ClassHealthCard, type ClassHealthSummary } from "./ClassHealthCard";
import { WeakFamiliesPanel, type FamilyPerformance } from "./WeakFamiliesPanel";
import { StrugglingStudentsPanel, type StudentStruggleMetrics } from "./StrugglingStudentsPanel";
import { ResetCardModal } from "./ResetCardModal";
import { BumpPriorityModal } from "./BumpPriorityModal";
import { fetchInternalMutation, fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const srs = internal as any;

interface TeacherClass {
  id: string;
  name: string;
  description: string | null;
  academicYear: string | null;
}

interface TeacherSRSDashboardClientProps {
  organizationName: string;
  classes: TeacherClass[];
  initialClassId?: string;
}

export function TeacherSRSDashboardClient({
  organizationName,
  classes,
  initialClassId,
}: TeacherSRSDashboardClientProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId ?? classes[0]?.id ?? ""
  );
  const [classHealth, setClassHealth] = useState<ClassHealthSummary | null>(null);
  const [weakFamilies, setWeakFamilies] = useState<FamilyPerformance[] | null>(null);
  const [strugglingStudents, setStrugglingStudents] = useState<StudentStruggleMetrics[] | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(classes.length > 0);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStudentId, setResetStudentId] = useState<string>("");
  const [resetStudentName, setResetStudentName] = useState<string>("");

  const [isBumpModalOpen, setIsBumpModalOpen] = useState(false);

  const loadClassData = useCallback(async (classId: string) => {
    setIsLoadingData(true);
    try {
      const [health, families, students] = await Promise.all([
        fetchInternalQuery(srs.srs.getClassSrsHealth, { classId: classId as Id<"classes"> }),
        fetchInternalQuery(srs.srs.getWeakFamilies, { classId: classId as Id<"classes"> }),
        fetchInternalQuery(srs.srs.getStrugglingStudents, { classId: classId as Id<"classes"> }),
      ]);
      setClassHealth(health);
      setWeakFamilies(families);
      setStrugglingStudents(students?.students ?? null);
    } catch (err) {
      console.error("Failed to load SRS data:", err);
      setClassHealth(null);
      setWeakFamilies(null);
      setStrugglingStudents(null);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassData(selectedClassId);
    }
  }, [selectedClassId, loadClassData]);

  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
  };

  const handleResetCard = async (problemFamilyId: string) => {
    await fetchInternalMutation(srs.srs.resetStudentCard, {
      studentId: resetStudentId as Id<"profiles">,
      problemFamilyId,
    });
    await loadClassData(selectedClassId);
  };

  const handleBumpPriority = async (problemFamilyId: string) => {
    await fetchInternalMutation(srs.srs.bumpFamilyPriority, {
      classId: selectedClassId as Id<"classes">,
      problemFamilyId,
    });
    await loadClassData(selectedClassId);
  };

  const openResetModal = (studentId: string, studentName: string) => {
    setResetStudentId(studentId);
    setResetStudentName(studentName);
    setIsResetModalOpen(true);
  };

  const openBumpModal = () => {
    setIsBumpModalOpen(true);
  };

  const familyOptions =
    weakFamilies?.map((f) => ({
      problemFamilyId: f.problemFamilyId,
      displayName: f.displayName,
    })) ?? [];

  if (classes.length === 0) {
    return (
      <main className="min-h-screen bg-muted/10 py-10">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">
            You don&apos;t have any classes yet. Create a class to start tracking SRS data.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/10 py-10">
      <div className="container mx-auto px-4 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <nav
              className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
              aria-label="Breadcrumb"
            >
              <Link href="/teacher" className="hover:text-foreground">
                Dashboard
              </Link>
              <ArrowRight className="h-3 w-3" />
              <span>SRS Practice Analytics</span>
            </nav>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {organizationName}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              SRS Practice Analytics
            </h1>
            <p className="text-muted-foreground">
              Monitor class spaced repetition practice health and intervene when needed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                  {cls.academicYear ? ` (${cls.academicYear})` : ""}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ClassHealthCard health={isLoadingData ? null : classHealth} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <WeakFamiliesPanel
            families={isLoadingData ? null : weakFamilies}
            onBumpPriority={openBumpModal}
            isLoading={isLoadingData}
          />
          <StrugglingStudentsPanel
            students={isLoadingData ? null : strugglingStudents}
            onResetCard={openResetModal}
            isLoading={isLoadingData}
          />
        </div>
      </div>

      <ResetCardModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        studentId={resetStudentId}
        studentName={resetStudentName}
        families={familyOptions}
        onReset={handleResetCard}
      />

      <BumpPriorityModal
        isOpen={isBumpModalOpen}
        onClose={() => setIsBumpModalOpen(false)}
        families={familyOptions}
        affectedStudentCount={classHealth?.totalStudents ?? 0}
        onBump={handleBumpPriority}
      />
    </main>
  );
}