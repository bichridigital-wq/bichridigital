const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function normalizeLocalProgramIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 100) throw new TypeError("invalid_programs");
  return [...new Set(value.map((id) => {
    if (typeof id !== "string" || !UUID_PATTERN.test(id)) throw new TypeError("invalid_programs");
    return id;
  }))];
}

export function hasCompleteDeviceProof(input: Record<string, unknown>) {
  const hasInstallation = input.installationId !== undefined;
  const hasToken = input.expoPushToken !== undefined;
  if (hasInstallation !== hasToken) throw new TypeError("incomplete_device_proof");
  return hasInstallation;
}
