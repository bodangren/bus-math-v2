export function coerceNullableString(value: string | null | undefined): string | null {
  return value ?? null;
}

export function getOrCreateMapEntry<K, V>(map: Map<K, V>, key: K, create: () => V): V {
  const existing = map.get(key);
  if (existing !== undefined) {
    return existing;
  }

  const created = create();
  map.set(key, created);
  return created;
}
