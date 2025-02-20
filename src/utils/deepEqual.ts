export function deepEqual(a: any, b: any): boolean {
  if (typeof a === 'object' && typeof b === 'object') {
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false
    }

    return Object.keys(a)
      .map((key) => deepEqual(a[key], b[key]))
      .every((res) => res === true)
  }

  return a === b
}
