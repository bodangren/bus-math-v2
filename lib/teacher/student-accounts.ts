import type { Id } from '@/convex/_generated/dataModel';
import { PASSWORD_HASH_ITERATIONS } from '@/lib/auth/constants';
import {
  generatePasswordSalt,
  generateRandomPassword,
  hashPassword,
} from '@/lib/auth/session';

interface TeacherClaimsLike {
  role: string;
  sub: string;
}

interface StudentAccountRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
}

interface PreparedStudentAccount {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  preferredUsername?: string;
  password: string;
  passwordHash: string;
  passwordSalt: string;
  passwordHashIterations: number;
}

interface CreatedStudentAccount {
  studentId: unknown;
  username: string;
  displayName: string;
  email?: string;
}

export function isTeacherOrAdminRole(role: string | undefined): boolean {
  return role === 'teacher' || role === 'admin';
}

export function requireTeacherClaims(
  claims: TeacherClaimsLike,
  message: string,
): Response | null {
  if (isTeacherOrAdminRole(claims.role)) {
    return null;
  }

  return Response.json({ error: message }, { status: 403 });
}

export function getTeacherProfileId(claims: TeacherClaimsLike): Id<'profiles'> {
  return claims.sub as Id<'profiles'>;
}

export async function prepareStudentAccounts(
  students: StudentAccountRequest[],
): Promise<PreparedStudentAccount[]> {
  return Promise.all(
    students.map(async (student) => {
      const password = generateRandomPassword(12);
      const passwordSalt = generatePasswordSalt();
      const passwordHash = await hashPassword(
        password,
        passwordSalt,
        PASSWORD_HASH_ITERATIONS,
      );

      return {
        firstName: student.firstName,
        lastName: student.lastName,
        displayName: student.displayName,
        preferredUsername: student.username,
        password,
        passwordHash,
        passwordSalt,
        passwordHashIterations: PASSWORD_HASH_ITERATIONS,
      };
    }),
  );
}

export function toStudentMutationPayloads(
  students: PreparedStudentAccount[],
) {
  return students.map((student) => ({
    firstName: student.firstName,
    lastName: student.lastName,
    displayName: student.displayName,
    preferredUsername: student.preferredUsername,
    passwordHash: student.passwordHash,
    passwordSalt: student.passwordSalt,
    passwordHashIterations: student.passwordHashIterations,
  }));
}

export function formatStudentEmail(username: string): string {
  return `${username}@internal.domain`;
}

export function toCreatedStudentResponses(
  createdStudents: CreatedStudentAccount[],
  preparedStudents: PreparedStudentAccount[],
) {
  return createdStudents.map((student, index) => ({
    studentId: student.studentId,
    username: student.username,
    password: preparedStudents[index]!.password,
    displayName: student.displayName,
    email: student.email ?? formatStudentEmail(student.username),
  }));
}
