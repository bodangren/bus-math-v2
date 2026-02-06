export interface UsernameOptions {
  preferredUsername?: string;
  firstName?: string;
  lastName?: string;
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

function capitalize(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
