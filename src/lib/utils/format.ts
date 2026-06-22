export function formatBytes(sizeBytes: number): string {
  if (sizeBytes >= 1024 * 1024) return `${(sizeBytes / 1024 / 1024).toFixed(2)}MB`;
  return `${(sizeBytes / 1024).toFixed(2)}KB`;
}
