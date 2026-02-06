export interface UsernameOptions {
  preferredUsername?: string;
  firstName?: string;
  lastName?: string;
}

export interface BulkCreateStudentInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
}

export interface TeacherProfileContext {
  id: string;
  organization_id: string;
}

interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  teacherProfile: TeacherProfileContext;
}

interface ProfileInsertInput {
  id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  teacherProfile: TeacherProfileContext;
}

interface TransactionalOptions {
  students: BulkCreateStudentInput[];
  teacherProfile: TeacherProfileContext;
  usernameExists: (candidate: string) => Promise<boolean>;
  createUser: (input: CreateUserInput) => Promise<{ id: string; email: string }>;
  insertProfile: (input: ProfileInsertInput) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  passwordLength?: number;
}

interface UsernameResolutionOptions {
  exists: (candidate: string) => Promise<boolean>;
  reserved: Set<string>;
}

export function sanitizeInput(value?: string) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 50);
}

export function slugify(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 24);
}

export async function generateUniqueUsername(
  { preferredUsername, firstName, lastName }: UsernameOptions,
  { exists, reserved }: UsernameResolutionOptions,
) {
  const base =
    slugify(preferredUsername) ||
    slugify(`${firstName ?? ""}_${lastName ?? ""}`) ||
    "student";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}_${(attempt + 1).toString().padStart(2, "0")}`;

    if (reserved.has(candidate)) {
      continue;
    }

    const taken = await exists(candidate);
    if (!taken) {
      reserved.add(candidate);
      return candidate;
    }
  }

  const fallback = `${base}_${crypto.randomUUID().slice(0, 4)}`;
  reserved.add(fallback);
  return fallback;
}

export function buildDisplayName(firstName: string, lastName: string, fallback: string) {
  const formattedFirst = capitalize(firstName);
  const formattedLast = capitalize(lastName);
  const combined = [formattedFirst, formattedLast].filter(Boolean).join(" ");
  return combined || fallback;
}

export function generateRandomPassword(length = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet.charAt(byte % alphabet.length)).join("");
}

export async function bulkCreateStudentsTransactional({
  students,
  teacherProfile,
  usernameExists,
  createUser,
  insertProfile,
  deleteUser,
  passwordLength = 8,
}: TransactionalOptions) {
  const reservedUsernames = new Set<string>();
  const createdUserIds: string[] = [];
  const createdCredentials: Array<{
    username: string;
    password: string;
    displayName: string;
    email: string;
    organizationId: string;
  }> = [];

  try {
    for (const student of students) {
      const firstName = sanitizeInput(student.firstName);
      const lastName = sanitizeInput(student.lastName);
      const displayName = sanitizeInput(student.displayName);
      const preferredUsername = sanitizeInput(student.username);

      const username = await generateUniqueUsername(
        { preferredUsername, firstName, lastName },
        { exists: usernameExists, reserved: reservedUsernames },
      );
      const password = generateRandomPassword(passwordLength);
      const resolvedDisplayName = displayName || buildDisplayName(firstName, lastName, username);
      const email = `${username}@internal.domain`;

      const createdUser = await createUser({
        email,
        password,
        firstName,
        lastName,
        teacherProfile,
      });
      createdUserIds.push(createdUser.id);

      await insertProfile({
        id: createdUser.id,
        username,
        displayName: resolvedDisplayName,
        firstName,
        lastName,
        teacherProfile,
      });

      createdCredentials.push({
        username,
        password,
        displayName: resolvedDisplayName,
        email: createdUser.email,
        organizationId: teacherProfile.organization_id,
      });
    }
  } catch (error) {
    await Promise.allSettled(createdUserIds.map((id) => deleteUser(id)));
    throw error;
  }

  return createdCredentials;
}

function capitalize(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
