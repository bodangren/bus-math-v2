"use client";

import {
  type ChangeEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Users, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TeacherCredentialsSheet } from "./TeacherCredentialsSheet";

interface StudentImport {
  firstName: string;
  lastName: string;
  username: string;
}

interface BulkCreateResponse {
  totalCreated: number;
  students: Array<{
    username: string;
    password: string;
    displayName: string;
    email: string;
  }>;
}

type Step = "input" | "review" | "submitting" | "success";

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function TeacherBulkImportDialog() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("input");
  const [inputText, setInputText] = useState("");
  const [students, setStudents] = useState<StudentImport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkCreateResponse | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const closeDialog = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep("input");
    setInputText("");
    setStudents([]);
    setError(null);
    setResult(null);
  };

  const handleParse = () => {
    const lines = inputText.split("\n").filter((line) => line.trim().length > 0);
    const parsed: StudentImport[] = lines.map((line) => {
      // Try comma first, then space
      let parts = line.split(",").map((p) => p.trim());
      if (parts.length < 2) {
        parts = line.split(/\s+/).map((p) => p.trim());
      }

      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      
      // Generate a suggested username: first.last (lowercase, alphanumeric)
      const suggestedUsername = `${firstName}.${lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "")
        .replace(/^\.+|\.+$/g, "");

      return {
        firstName,
        lastName,
        username: suggestedUsername,
      };
    });

    if (parsed.length === 0) {
      setError("No valid student names found.");
      return;
    }

    setStudents(parsed);
    setStep("review");
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    setStep("submitting");

    try {
      const response = await fetch("/api/users/bulk-create-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error ?? "Unable to create students.");
        setStep("review");
        return;
      }

      setResult(payload as BulkCreateResponse);
      setStep("success");
    } catch {
      setError("Unable to connect to the server. Please try again.");
      setStep("review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (index: number, newUsername: string) => {
    const updated = [...students];
    updated[index].username = newUsername;
    setStudents(updated);
  };

  if (!isMounted) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={() => {
          setIsOpen(true);
          resetForm();
        }}
      >
        <Users className="size-4" aria-hidden="true" />
        Bulk Import
      </Button>

      {isOpen &&
        createPortal(
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur"
            onMouseDown={(e) => e.target === e.currentTarget && closeDialog()}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 id={titleId} className="text-xl font-semibold tracking-tight text-foreground">
                    {step === "success" ? "Import Successful" : "Bulk Import Students"}
                  </h2>
                  <p id={descriptionId} className="text-sm text-muted-foreground">
                    {step === "input" && "Paste student names (one per line). Format: 'First Last' or 'First, Last'"}
                    {step === "review" && "Review and customize usernames before creating accounts."}
                    {step === "submitting" && "Creating student accounts and profiles..."}
                    {step === "success" && `Successfully created ${result?.totalCreated} student accounts.`}
                  </p>
                </div>

                {step === "input" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="import-textarea">Student Names</Label>
                      <textarea
                        id="import-textarea"
                        className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Ada Lovelace&#10;Charles Babbage&#10;Grace Hopper"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
                      <Button onClick={handleParse} disabled={!inputText.trim()}>Next: Review</Button>
                    </div>
                  </div>
                )}

                {step === "review" && (
                  <div className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted border-b">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">Name</th>
                            <th className="px-4 py-2 text-left font-medium">Proposed Username</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {students.map((student, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{student.firstName} {student.lastName}</td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono text-xs"
                                  value={student.username}
                                  onChange={(e) => handleUsernameChange(index, e.target.value)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Creation Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setStep("input")} disabled={isSubmitting}>Back</Button>
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : `Create ${students.length} Accounts`}
                      </Button>
                    </div>
                  </div>
                )}

                {step === "submitting" && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse">Processing batch...</p>
                  </div>
                )}

                {step === "success" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-md border border-green-100">
                      <CheckCircle2 className="size-5" />
                      <p className="text-sm font-medium">All accounts created successfully.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="size-4" />
                        <span>Credentials Generated</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The next step is to generate a printable credentials sheet for your students.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button onClick={closeDialog}>Close</Button>
                      <Button 
                        variant="default" 
                        className="bg-primary"
                        onClick={() => setShowCredentials(true)}
                      >
                        View Credentials Sheet
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showCredentials && result && (
        <TeacherCredentialsSheet 
          students={result.students}
          onClose={() => setShowCredentials(false)}
        />
      )}
    </>
  );
}
