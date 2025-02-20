export function isStringArray(item: unknown): item is string[] {
  return Array.isArray(item) && item.every((x) => typeof x === 'string')
}
