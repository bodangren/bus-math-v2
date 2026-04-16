"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowUp, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FamilyOption {
  problemFamilyId: string;
  displayName: string;
}

interface BumpPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  families: FamilyOption[];
  affectedStudentCount?: number;
  onBump: (problemFamilyId: string) => Promise<void>;
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function BumpPriorityModal({
  isOpen,
  onClose,
  families,
  affectedStudentCount = 0,
  onBump,
}: BumpPriorityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    firstFieldRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSelectedFamily("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily) {
      setError("Please select a problem family");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onBump(selectedFamily);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bump priority");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      />
      <div
        ref={dialogRef}
        className="relative z-50 w-full max-w-md rounded-lg bg-background p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="text-lg font-semibold flex items-center gap-2">
            <ArrowUp className="size-5" />
            Bump Family Priority
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <p id={descriptionId} className="text-sm text-muted-foreground mb-4">
          Make all cards for a problem family due immediately for all students in
          your class. This is useful when you want to revisit a topic that was
          previously taught.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="family-select" className="mb-1.5 block">
              Problem Family
            </Label>
            <select
              id="family-select"
              ref={firstFieldRef}
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              disabled={isSubmitting}
            >
              <option value="">Select a family...</option>
              {families.map((family) => (
                <option key={family.problemFamilyId} value={family.problemFamilyId}>
                  {family.displayName}
                </option>
              ))}
            </select>
          </div>

          {selectedFamily && (
            <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
              <p>
                This will affect <strong>{affectedStudentCount}</strong> student
                {affectedStudentCount !== 1 ? "s" : ""} in your class.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="size-4 inline mr-1" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFamily || isSubmitting}
            >
              {isSubmitting ? "Bumping..." : "Bump Priority"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}