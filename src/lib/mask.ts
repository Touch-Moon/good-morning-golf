export function maskName(name: string): string {
  const trimmed = name.trim();
  const chars = [...trimmed];
  if (chars.length <= 1) return trimmed;
  if (chars.length === 2) return chars[0] + "*";
  return chars[0] + "*".repeat(chars.length - 2) + chars[chars.length - 1];
}

export function maskNameList(csv: string): string {
  return csv
    .split(",")
    .map((n) => maskName(n))
    .filter(Boolean)
    .join(", ");
}
