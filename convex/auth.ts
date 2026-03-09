import { internalMutation, internalQuery, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { type Doc, type Id } from './_generated/dataModel';

const roleValidator = v.union(v.literal('student'), v.literal('teacher'), v.literal('admin'));
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

export const getCredentialByUsername = internalQuery({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query('auth_credentials')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique();

    if (!credential || !credential.isActive) {
      return null;
    }

    return {
      id: credential._id,
      profileId: credential.profileId,
      username: credential.username,
      role: credential.role,
      organizationId: credential.organizationId,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
      passwordHashIterations: credential.passwordHashIterations,
    };
  },
});

export const getAccountSettingsContext = internalQuery({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      return null;
    }

    const organization = await ctx.db.get(profile.organizationId);

    return {
      id: profile._id,
      username: profile.username,
      role: profile.role,
      displayName: profile.displayName ?? profile.username,
      organizationId: profile.organizationId,
      organizationName: organization?.name ?? "Your organization",
    };
  },
});

export const upsertCredentialByUsername = internalMutation({
  args: {
    username: v.string(),
    role: roleValidator,
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique();

    if (!profile) {
      return { ok: false as const, reason: 'profile_not_found' as const };
    }

    const now = Date.now();

    const existing = await ctx.db
      .query('auth_credentials')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        organizationId: profile.organizationId,
        passwordHash: args.passwordHash,
        passwordSalt: args.passwordSalt,
        passwordHashIterations: args.passwordHashIterations,
        isActive: args.isActive,
        updatedAt: now,
      });
      return { ok: true as const, updated: true as const };
    }

    await ctx.db.insert('auth_credentials', {
      profileId: profile._id,
      username: args.username,
      role: args.role,
      organizationId: profile.organizationId,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      passwordHashIterations: args.passwordHashIterations,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });

    return { ok: true as const, updated: false as const };
  },
});

export const ensureProfileByUsername = internalMutation({
  args: {
    username: v.string(),
    role: roleValidator,
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique();

    if (existingProfile) {
      return {
        ok: true as const,
        created: false as const,
        profileId: existingProfile._id,
        organizationId: existingProfile.organizationId,
      };
    }

    const now = Date.now();
    const demoOrgSlug = 'demo-org';
    const demoOrgName = 'Demo Organization';

    let organization = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', demoOrgSlug))
      .unique();

    if (!organization) {
      const organizationId = await ctx.db.insert('organizations', {
        name: demoOrgName,
        slug: demoOrgSlug,
        settings: {},
        createdAt: now,
        updatedAt: now,
      });
      organization = await ctx.db.get(organizationId);
    }

    if (!organization) {
      return { ok: false as const, reason: 'organization_not_found' as const };
    }

    const profileId = await ctx.db.insert('profiles', {
      organizationId: organization._id,
      username: args.username,
      role: args.role,
      displayName: args.displayName,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    });

    return {
      ok: true as const,
      created: true as const,
      profileId,
      organizationId: organization._id,
    };
  },
});

type TeacherProfile = Doc<'profiles'>;

function normalizeInput(value?: string): string | undefined {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().slice(0, 50);
  return normalized.length > 0 ? normalized : undefined;
}

function slugify(value?: string): string {
  if (!value) return '';
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .slice(0, 24);
}

function buildDisplayName(firstName: string | undefined, lastName: string | undefined, fallback: string): string {
  const capitalize = (v: string) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : '');
  const combined = [capitalize(firstName ?? ''), capitalize(lastName ?? '')].filter(Boolean).join(' ');
  return combined || fallback;
}

function asMetadataRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

async function getTeacherProfile(ctx: MutationCtx, teacherProfileId: Id<'profiles'>) {
  const teacher = await ctx.db.get(teacherProfileId);
  if (!teacher) {
    return { ok: false as const, reason: 'teacher_not_found' as const };
  }

  if (teacher.role !== 'teacher' && teacher.role !== 'admin') {
    return { ok: false as const, reason: 'forbidden' as const };
  }

  return { ok: true as const, teacher };
}

async function getStudentInTeacherOrg(
  ctx: MutationCtx,
  studentProfileId: Id<'profiles'>,
  teacher: TeacherProfile,
) {
  const student = await ctx.db.get(studentProfileId);
  if (!student || student.role !== 'student' || student.organizationId !== teacher.organizationId) {
    return { ok: false as const, reason: 'student_not_found' as const };
  }

  return { ok: true as const, student };
}

// Scalability note: this function does up to 50 sequential index reads per student.
// In low-collision environments (unique names) it typically resolves on attempt 1.
// In high-collision environments (e.g., 100 students all named "john_smith") worst-case
// is 50 reads/student → ~5,000 reads for a full batch. Convex does not support
// multi-key index reads so sequential probing is currently unavoidable.
async function generateUniqueUsername(
  ctx: MutationCtx,
  opts: { preferredUsername?: string; firstName?: string; lastName?: string },
  reserved: Set<string>,
) {
  const base =
    slugify(opts.preferredUsername) ||
    slugify(`${opts.firstName ?? ''}_${opts.lastName ?? ''}`) ||
    `student_${randomToken(4)}`;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}_${(attempt + 1).toString().padStart(2, '0')}`;
    if (reserved.has(candidate)) continue;

    const existing = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', candidate))
      .unique();

    if (!existing) {
      reserved.add(candidate);
      return candidate;
    }
  }

  const fallback = `student_${randomToken(6)}`;
  reserved.add(fallback);
  return fallback;
}

function randomToken(length = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]).join('');
}

const createStudentArgsValidator = v.object({
  preferredUsername: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  displayName: v.optional(v.string()),
  passwordHash: v.string(),
  passwordSalt: v.string(),
  passwordHashIterations: v.number(),
});

export const createStudentAccount = internalMutation({
  args: {
    teacherProfileId: v.id('profiles'),
    student: createStudentArgsValidator,
  },
  handler: async (ctx, args) => {
    const teacherResult = await getTeacherProfile(ctx, args.teacherProfileId);
    if (!teacherResult.ok) {
      return teacherResult;
    }

    const teacher = teacherResult.teacher;
    const now = Date.now();
    const firstName = normalizeInput(args.student.firstName);
    const lastName = normalizeInput(args.student.lastName);
    const preferredUsername = normalizeInput(args.student.preferredUsername);
    const requestedDisplayName = normalizeInput(args.student.displayName);
    const username = await generateUniqueUsername(
      ctx,
      { preferredUsername, firstName, lastName },
      new Set<string>(),
    );
    const displayName = requestedDisplayName ?? buildDisplayName(firstName, lastName, username);

    const profileId = await ctx.db.insert('profiles', {
      organizationId: teacher.organizationId,
      username,
      role: 'student',
      displayName,
      metadata: {
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        createdBy: teacher._id,
        isDeactivated: false,
        accountStatus: 'active',
      },
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('auth_credentials', {
      profileId,
      username,
      role: 'student',
      organizationId: teacher.organizationId,
      passwordHash: args.student.passwordHash,
      passwordSalt: args.student.passwordSalt,
      passwordHashIterations: args.student.passwordHashIterations,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ok: true as const,
      studentId: profileId,
      username,
      displayName,
      organizationId: teacher.organizationId,
    };
  },
});

export const bulkCreateStudentAccounts = internalMutation({
  args: {
    teacherProfileId: v.id('profiles'),
    students: v.array(createStudentArgsValidator),
  },
  handler: async (ctx, args) => {
    const teacherResult = await getTeacherProfile(ctx, args.teacherProfileId);
    if (!teacherResult.ok) {
      return teacherResult;
    }

    if (args.students.length === 0 || args.students.length > 100) {
      return { ok: false as const, reason: 'invalid_batch' as const };
    }

    const teacher = teacherResult.teacher;
    const now = Date.now();
    const reservedUsernames = new Set<string>();
    const createdStudents: Array<{
      studentId: unknown;
      username: string;
      displayName: string;
      email: string;
    }> = [];

    for (const student of args.students) {
      const firstName = normalizeInput(student.firstName);
      const lastName = normalizeInput(student.lastName);
      const preferredUsername = normalizeInput(student.preferredUsername);
      const requestedDisplayName = normalizeInput(student.displayName);

      const username = await generateUniqueUsername(
        ctx,
        { preferredUsername, firstName, lastName },
        reservedUsernames,
      );
      const displayName = requestedDisplayName ?? buildDisplayName(firstName, lastName, username);

      const profileId = await ctx.db.insert('profiles', {
        organizationId: teacher.organizationId,
        username,
        role: 'student',
        displayName,
        metadata: {
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          createdBy: teacher._id,
          isDeactivated: false,
          accountStatus: 'active',
        },
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert('auth_credentials', {
        profileId,
        username,
        role: 'student',
        organizationId: teacher.organizationId,
        passwordHash: student.passwordHash,
        passwordSalt: student.passwordSalt,
        passwordHashIterations: student.passwordHashIterations,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      createdStudents.push({
        studentId: profileId,
        username,
        displayName,
        email: `${username}@internal.domain`,
      });
    }

    return {
      ok: true as const,
      totalCreated: createdStudents.length,
      organizationId: teacher.organizationId,
      students: createdStudents,
    };
  },
});

export const updateStudentAccount = internalMutation({
  args: {
    teacherProfileId: v.id('profiles'),
    studentProfileId: v.id('profiles'),
    displayName: v.optional(v.string()),
    deactivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.displayName === undefined && args.deactivate === undefined) {
      return { ok: false as const, reason: 'invalid_input' as const };
    }

    const teacherResult = await getTeacherProfile(ctx, args.teacherProfileId);
    if (!teacherResult.ok) {
      return teacherResult;
    }
    const teacher = teacherResult.teacher;

    const studentResult = await getStudentInTeacherOrg(ctx, args.studentProfileId, teacher);
    if (!studentResult.ok) {
      return studentResult;
    }
    const student = studentResult.student;

    const now = Date.now();
    const credential = await ctx.db
      .query('auth_credentials')
      .withIndex('by_profile', (q) => q.eq('profileId', student._id))
      .unique();

    if (args.deactivate !== undefined) {
      if (!credential) {
        return { ok: false as const, reason: 'credential_not_found' as const };
      }

      await ctx.db.patch(credential._id, {
        isActive: !args.deactivate,
        updatedAt: now,
      });
    }

    const requestedDisplayName = normalizeInput(args.displayName);
    const nextDisplayName = requestedDisplayName ?? student.displayName ?? student.username;
    const existingMetadata = asMetadataRecord(student.metadata);
    const nextDeactivated =
      args.deactivate ?? (credential ? !credential.isActive : Boolean(existingMetadata.isDeactivated));

    const nextMetadata: Record<string, unknown> = {
      ...existingMetadata,
      isDeactivated: nextDeactivated,
      accountStatus: nextDeactivated ? 'deactivated' : 'active',
      lastStudentProfileUpdateAt: new Date(now).toISOString(),
      lastStudentProfileUpdateBy: teacher._id,
    };

    if (args.deactivate === true) {
      nextMetadata.deactivatedAt = new Date(now).toISOString();
      nextMetadata.deactivatedBy = teacher._id;
    }

    if (args.deactivate === false) {
      nextMetadata.reactivatedAt = new Date(now).toISOString();
      nextMetadata.reactivatedBy = teacher._id;
    }

    await ctx.db.patch(student._id, {
      displayName: nextDisplayName,
      metadata: nextMetadata,
      updatedAt: now,
    });

    return {
      ok: true as const,
      studentId: student._id,
      username: student.username,
      displayName: nextDisplayName,
      deactivated: nextDeactivated,
    };
  },
});

export const resetStudentPassword = internalMutation({
  args: {
    teacherProfileId: v.id('profiles'),
    studentProfileId: v.id('profiles'),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
  },
  handler: async (ctx, args) => {
    const teacherResult = await getTeacherProfile(ctx, args.teacherProfileId);
    if (!teacherResult.ok) {
      return teacherResult;
    }
    const teacher = teacherResult.teacher;

    const studentResult = await getStudentInTeacherOrg(ctx, args.studentProfileId, teacher);
    if (!studentResult.ok) {
      return studentResult;
    }
    const student = studentResult.student;
    const now = Date.now();

    const existingCredential = await ctx.db
      .query('auth_credentials')
      .withIndex('by_profile', (q) => q.eq('profileId', student._id))
      .unique();

    if (existingCredential) {
      await ctx.db.patch(existingCredential._id, {
        passwordHash: args.passwordHash,
        passwordSalt: args.passwordSalt,
        passwordHashIterations: args.passwordHashIterations,
        role: 'student',
        organizationId: teacher.organizationId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert('auth_credentials', {
        profileId: student._id,
        username: student.username,
        role: 'student',
        organizationId: teacher.organizationId,
        passwordHash: args.passwordHash,
        passwordSalt: args.passwordSalt,
        passwordHashIterations: args.passwordHashIterations,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingMetadata = asMetadataRecord(student.metadata);
    await ctx.db.patch(student._id, {
      metadata: {
        ...existingMetadata,
        lastPasswordResetAt: new Date(now).toISOString(),
        lastPasswordResetBy: teacher._id,
      },
      updatedAt: now,
    });

    return {
      ok: true as const,
      studentId: student._id,
      username: student.username,
      displayName: student.displayName ?? student.username,
    };
  },
});

export const changeOwnPassword = internalMutation({
  args: {
    profileId: v.id("profiles"),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      return { ok: false as const, reason: "profile_not_found" as const };
    }

    const credential = await ctx.db
      .query("auth_credentials")
      .withIndex("by_profile", (q) => q.eq("profileId", args.profileId))
      .unique();

    if (!credential || !credential.isActive) {
      return { ok: false as const, reason: "credential_not_found" as const };
    }

    const now = Date.now();

    await ctx.db.patch(credential._id, {
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      passwordHashIterations: args.passwordHashIterations,
      updatedAt: now,
    });

    const existingMetadata = asMetadataRecord(profile.metadata);
    await ctx.db.patch(profile._id, {
      metadata: {
        ...existingMetadata,
        lastPasswordChangedAt: new Date(now).toISOString(),
      },
      updatedAt: now,
    });

    return {
      ok: true as const,
      profileId: profile._id,
      username: profile.username,
      role: profile.role,
    };
  },
});
