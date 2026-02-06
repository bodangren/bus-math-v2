import { describe, expect, it } from "vitest";

import {
  bulkCreateStudentsTransactional,
  buildDisplayName,
  generateUniqueUsername,
  type BulkCreateStudentInput,
  sanitizeInput,
  slugify,
} from "./logic";

describe("bulk-create-students logic", () => {
  it("sanitizes and truncates input values", () => {
    expect(sanitizeInput("  Alice   ")).toBe("Alice");
    expect(sanitizeInput("x".repeat(80))).toHaveLength(50);
    expect(sanitizeInput(undefined)).toBe("");
  });

  it("slugifies preferred username and strips accents", () => {
    expect(slugify("Élodie Marie")).toBe("elodie_marie");
  });

  it("creates unique usernames with incremental suffixes", async () => {
    const reserved = new Set<string>(["alice", "alice_02"]);

    const username = await generateUniqueUsername(
      { preferredUsername: "Alice" },
      {
        exists: async (candidate) => candidate === "alice_03",
        reserved,
      },
    );

    expect(username).toBe("alice_04");
  });

  it("builds display name from first and last names", () => {
    expect(buildDisplayName("maria", "chen", "fallback")).toBe("Maria Chen");
    expect(buildDisplayName("", "", "fallback")).toBe("fallback");
  });

  it("creates profiles for all students in a single batch", async () => {
    const createdUsers: string[] = [];
    const insertedProfiles: string[] = [];
    const students: BulkCreateStudentInput[] = [
      { firstName: "Ava", lastName: "Lee" },
      { firstName: "Ben", lastName: "Ng" },
    ];

    const result = await bulkCreateStudentsTransactional({
      students,
      teacherProfile: { id: "teacher-1", organization_id: "org-1" },
      usernameExists: async () => false,
      createUser: async ({ email }) => {
        const id = `user-${createdUsers.length + 1}`;
        createdUsers.push(id);
        return { id, email };
      },
      insertProfile: async ({ id }) => {
        insertedProfiles.push(id);
      },
      deleteUser: async () => undefined,
      passwordLength: 10,
    });

    expect(result).toHaveLength(2);
    expect(insertedProfiles).toEqual(["user-1", "user-2"]);
    expect(result[0]?.organizationId).toBe("org-1");
  });

  it("rolls back previously created auth users when profile creation fails", async () => {
    const deletedUsers: string[] = [];
    const students: BulkCreateStudentInput[] = [
      { firstName: "Ava", lastName: "Lee" },
      { firstName: "Ben", lastName: "Ng" },
    ];

    await expect(
      bulkCreateStudentsTransactional({
        students,
        teacherProfile: { id: "teacher-1", organization_id: "org-1" },
        usernameExists: async () => false,
        createUser: async ({ email }) => {
          if (email.startsWith("ben_ng")) {
            return { id: "user-2", email };
          }
          return { id: "user-1", email };
        },
        insertProfile: async ({ id }) => {
          if (id === "user-2") {
            throw new Error("insert failed");
          }
        },
        deleteUser: async (id) => {
          deletedUsers.push(id);
        },
      }),
    ).rejects.toThrow("insert failed");

    expect(deletedUsers.sort()).toEqual(["user-1", "user-2"]);
  });
});
