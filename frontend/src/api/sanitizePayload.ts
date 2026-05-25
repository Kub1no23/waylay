function sanitizePayload<T extends Record<string, any>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== ""),
  ) as Partial<T>;
}

export default sanitizePayload;
