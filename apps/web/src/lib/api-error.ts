export async function getErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (json?.message) {
      return Array.isArray(json.message) ? json.message.join(', ') : String(json.message);
    }
  } catch {
    // ignore
  }
  return text || `HTTP ${res.status}`;
}
