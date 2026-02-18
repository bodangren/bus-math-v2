import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TeacherStudentActions } from '@/components/teacher/TeacherStudentActions';

describe('TeacherStudentActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('resets password and displays returned credentials', async () => {
    const user = userEvent.setup();
    const onStudentUpdated = vi.fn();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          studentId: 'student-1',
          username: 'demo_student',
          displayName: 'Demo Student',
          password: 'Abc12345XY',
        }),
        { status: 200 },
      ),
    );

    render(
      <TeacherStudentActions
        studentId="student-1"
        username="demo_student"
        displayName="Demo Student"
        onStudentUpdated={onStudentUpdated}
      />,
    );

    await user.click(screen.getByRole('button', { name: /actions for demo student/i }));
    await user.click(screen.getByRole('menuitem', { name: /reset password/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/users/reset-student-password', expect.any(Object));
    });

    expect(screen.getByText(/new password/i)).toBeInTheDocument();
    expect(screen.getByText('Abc12345XY')).toBeInTheDocument();
    expect(onStudentUpdated).not.toHaveBeenCalled();
  });

  it('updates display name through edit workflow', async () => {
    const user = userEvent.setup();
    const onStudentUpdated = vi.fn();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          studentId: 'student-1',
          username: 'demo_student',
          displayName: 'Updated Name',
          deactivated: false,
        }),
        { status: 200 },
      ),
    );

    render(
      <TeacherStudentActions
        studentId="student-1"
        username="demo_student"
        displayName="Demo Student"
        onStudentUpdated={onStudentUpdated}
      />,
    );

    await user.click(screen.getByRole('button', { name: /actions for demo student/i }));
    await user.click(screen.getByRole('menuitem', { name: /edit details/i }));

    const input = screen.getByLabelText(/display name/i);
    await user.clear(input);
    await user.type(input, 'Updated Name');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/users/update-student', expect.any(Object));
    });

    expect(onStudentUpdated).toHaveBeenCalledWith({
      studentId: 'student-1',
      displayName: 'Updated Name',
      deactivated: false,
    });
  });

  it('deactivates student through edit workflow', async () => {
    const user = userEvent.setup();
    const onStudentUpdated = vi.fn();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          studentId: 'student-1',
          username: 'demo_student',
          displayName: 'Demo Student',
          deactivated: true,
        }),
        { status: 200 },
      ),
    );

    render(
      <TeacherStudentActions
        studentId="student-1"
        username="demo_student"
        displayName="Demo Student"
        onStudentUpdated={onStudentUpdated}
      />,
    );

    await user.click(screen.getByRole('button', { name: /actions for demo student/i }));
    await user.click(screen.getByRole('menuitem', { name: /edit details/i }));
    await user.click(screen.getByRole('button', { name: /deactivate student/i }));

    await waitFor(() => {
      expect(onStudentUpdated).toHaveBeenCalledWith({
        studentId: 'student-1',
        displayName: 'Demo Student',
        deactivated: true,
      });
    });
  });
});
