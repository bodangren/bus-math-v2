interface UsernameCandidate {
  firstName?: string;
  lastName?: string;
  username?: string;
}

function slugifyUsername(value?: string): string {
  if (!value) {
    return '';
  }

  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .slice(0, 24);
}

export function buildUsernamePreview(
  candidates: UsernameCandidate[],
): string[] {
  const reserved = new Set<string>();

  return candidates.map((candidate) => {
    const base =
      slugifyUsername(candidate.username) ||
      slugifyUsername(`${candidate.firstName ?? ''}_${candidate.lastName ?? ''}`) ||
      'student';

    let username = base;
    let suffix = 2;

    while (reserved.has(username)) {
      username = `${base}_${suffix.toString().padStart(2, '0')}`;
      suffix += 1;
    }

    reserved.add(username);
    return username;
  });
}
