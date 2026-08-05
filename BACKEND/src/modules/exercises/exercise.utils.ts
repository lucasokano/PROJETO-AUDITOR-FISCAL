export function shuffle<T>(values: readonly T[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

export function pickOne<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)]!;
}

export function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}
