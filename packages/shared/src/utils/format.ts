export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function formatCount(count: number): string {
  if (count < 10000) return String(count);
  const wan = count / 10000;
  return wan % 1 === 0 ? `${wan}万` : `${wan.toFixed(1)}万`;
}
