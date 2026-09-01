export function formatPayload(payload?: string) {
  if (!payload?.trim()) return "No payload available";

  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
}
