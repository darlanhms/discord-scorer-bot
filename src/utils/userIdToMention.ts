export function userIdToMention(id: string | string[]): string {
  if (!Array.isArray(id)) {
    id = [id];
  }

  return id.map(i => `<@${i}>`).join(' ');
}
