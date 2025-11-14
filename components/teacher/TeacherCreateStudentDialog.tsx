"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateStudentResponse {
  username: string;
  password: string;
  displayName: string;
  email: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  displayName: string;
}

const DEFAULT_FORM_STATE: FormState = {
  firstName: "",
  lastName: "",
  displayName: "",
};

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function TeacherCreateStudentDialog() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateStudentResponse | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (!focusable.length) {
          return;
        }

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

    setTimeout(() => {
      firstFieldRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const closeDialog = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  };

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error ?? "Unable to create student.");
        return;
      }

      setResult(payload as CreateStudentResponse);
      setFormState(DEFAULT_FORM_STATE);
    } catch {
      setError("Unable to create student right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        className="gap-2"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(true);
          setResult(null);
          setError(null);
        }}
      >
        <UserPlus className="size-4" aria-hidden="true" />
        Create Student
      </Button>

      {isMounted &&
        isOpen &&
        createPortal(
          <div
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur"
            onMouseDown={handleOverlayClick}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg"
            >
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <h2 id={titleId} className="text-xl font-semibold tracking-tight text-foreground">
                    Create a student account
                  </h2>
                  <p id={descriptionId} className="text-sm text-muted-foreground">
                    Usernames are generated from the student name or a sequential ID. Passwords are
                    random and shown once. Share them securely with your class.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="student-first-name">First name</Label>
                    <Input
                      id="student-first-name"
                      name="firstName"
                      ref={firstFieldRef}
                      value={formState.firstName}
                      onChange={handleChange("firstName")}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-last-name">Last name</Label>
                    <Input
                      id="student-last-name"
                      name="lastName"
                      value={formState.lastName}
                      onChange={handleChange("lastName")}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-display-name">Display name (optional)</Label>
                  <Input
                    id="student-display-name"
                    name="displayName"
                    value={formState.displayName}
                    onChange={handleChange("displayName")}
                    placeholder="E.g., Preferred name"
                  />
                </div>

                {error ? (
                  <Alert variant="destructive" role="alert">
                    <AlertTitle>Unable to create student</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {result ? (
                  <Alert role="status" aria-live="polite">
                    <AlertTitle>Student created</AlertTitle>
                    <AlertDescription>
                      <p className="text-sm text-muted-foreground">
                        Provide these credentials to the student. They can log in immediately.
                      </p>
                      <dl className="mt-3 space-y-1 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-muted-foreground">Username</dt>
                          <dd className="font-mono text-foreground">{result.username}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-muted-foreground">Password</dt>
                          <dd className="font-mono text-foreground">{result.password}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-muted-foreground">Display name</dt>
                          <dd className="font-medium text-foreground">{result.displayName}</dd>
                        </div>
                      </dl>
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeDialog}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" aria-busy={isSubmitting} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create student account"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
