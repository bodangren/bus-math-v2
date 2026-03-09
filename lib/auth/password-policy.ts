type UserRole = "student" | "teacher" | "admin";

export function getPasswordRequirementText(role: UserRole): string {
  if (role === "student") {
    return "Use at least 6 characters.";
  }

  return "Use at least 8 characters with at least one letter and one number.";
}

export function validatePasswordForRole(role: UserRole, password: string): string | null {
  const trimmedPassword = password.trim();

  if (role === "student") {
    if (trimmedPassword.length < 6) {
      return "New password must be at least 6 characters long.";
    }

    return null;
  }

  if (trimmedPassword.length < 8) {
    return "New password must be at least 8 characters long.";
  }

  if (!/[A-Za-z]/.test(trimmedPassword) || !/[0-9]/.test(trimmedPassword)) {
    return "New password must include at least one letter and one number.";
  }

  return null;
}
