'use client';

import { useState, type ReactNode } from 'react';
import { Loader2, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface StudentAccountUpdate {
  studentId: string;
  displayName: string;
  deactivated: boolean;
}

interface TeacherStudentActionsProps {
  studentId: string;
  username: string;
  displayName: string;
  onStudentUpdated: (update: StudentAccountUpdate) => void;
}

interface ResetPasswordResponse {
  studentId: string;
  username: string;
  displayName: string;
  password: string;
}

interface UpdateStudentResponse {
  studentId: string;
  username: string;
  displayName: string;
  deactivated: boolean;
}

function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-lg border border-border bg-background shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3 px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

export function TeacherStudentActions({
  studentId,
  username,
  displayName,
  onStudentUpdated,
}: TeacherStudentActionsProps) {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<ResetPasswordResponse | null>(null);

  const [editDisplayName, setEditDisplayName] = useState(displayName);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function performResetPassword() {
    setIsResetDialogOpen(true);
    setResetLoading(true);
    setResetError(null);
    setCredentials(null);

    try {
      const response = await fetch('/api/users/reset-student-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      const payload = (await response.json()) as ResetPasswordResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? `HTTP ${response.status}`);
      }

      setCredentials(payload);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  }

  async function performUpdateStudent(update: { displayName?: string; deactivate?: boolean }) {
    setEditLoading(true);
    setEditError(null);

    try {
      const response = await fetch('/api/users/update-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          ...update,
        }),
      });

      const payload = (await response.json()) as UpdateStudentResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? `HTTP ${response.status}`);
      }

      onStudentUpdated({
        studentId: payload.studentId,
        displayName: payload.displayName,
        deactivated: payload.deactivated,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Failed to update student');
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Actions for ${displayName}`}
            className="h-8 px-2"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={performResetPassword}>Reset Password</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setEditDisplayName(displayName);
              setEditError(null);
              setIsEditDialogOpen(true);
            }}
          >
            Edit Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isResetDialogOpen && (
        <DialogShell
          title={`Reset Password: ${displayName}`}
          onClose={() => setIsResetDialogOpen(false)}
        >
          {resetLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Resetting password...
            </div>
          )}

          {resetError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {resetError}
            </p>
          )}

          {credentials && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Share this temporary credential with the student.
              </p>
              <dl className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-foreground">Username</dt>
                  <dd className="text-foreground">{credentials.username}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-foreground">New Password</dt>
                  <dd className="font-mono text-foreground">{credentials.password}</dd>
                </div>
              </dl>
            </div>
          )}
        </DialogShell>
      )}

      {isEditDialogOpen && (
        <DialogShell title={`Edit Student: ${displayName}`} onClose={() => setIsEditDialogOpen(false)}>
          <div className="space-y-2">
            <Label htmlFor={`display-name-${studentId}`}>Display Name</Label>
            <Input
              id={`display-name-${studentId}`}
              value={editDisplayName}
              onChange={(event) => setEditDisplayName(event.target.value)}
              placeholder={username}
            />
          </div>

          {editError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {editError}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => performUpdateStudent({ displayName: editDisplayName.trim() })}
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => performUpdateStudent({ deactivate: true })}
              disabled={editLoading}
            >
              Deactivate Student
            </Button>
          </div>
        </DialogShell>
      )}
    </>
  );
}
