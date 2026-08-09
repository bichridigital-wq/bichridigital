const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PROGRAM_REMINDER_TIMEZONE = "Africa/Dakar";
export const PROGRAM_REMINDER_FALLBACK_BODY =
  "Votre émission suivie commence bientôt sur Bichridigital.";

export type ProgramReminderDevice = {
  id: string;
  expoPushToken: string;
  tokenLastFour: string | null;
};

export type EligibleProgramReminder = {
  scheduleId: string;
  programId: string;
  programName: string;
  emissionSlug: string;
  scheduledStartTime: string;
  devices: ProgramReminderDevice[];
};

export type ProgramReminderNotification = {
  requestKey: string;
  title: string;
  body: string;
  data: {
    type: "emission";
    emissionSlug: string;
    programId: string;
    scheduleId: string;
  };
};

export function isWithinProgramReminderWindow(
  scheduledStartTime: string,
  now = new Date(),
) {
  const start = Date.parse(scheduledStartTime);
  return Number.isFinite(start) && start > now.getTime() && start <= now.getTime() + 15 * 60_000;
}

export function programReminderNotification(
  schedule: EligibleProgramReminder,
): ProgramReminderNotification | null {
  const start = new Date(schedule.scheduledStartTime);
  if (
    !UUID_PATTERN.test(schedule.scheduleId) ||
    !UUID_PATTERN.test(schedule.programId) ||
    !SLUG_PATTERN.test(schedule.emissionSlug) ||
    !schedule.programName.trim() ||
    !Number.isFinite(start.getTime())
  ) return null;

  const startUtc = start.toISOString();
  let body = PROGRAM_REMINDER_FALLBACK_BODY;
  try {
    const time = new Intl.DateTimeFormat("fr-FR", {
      timeZone: PROGRAM_REMINDER_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(start).replace(":", "h");
    body = `Rendez-vous à ${time} sur Bichridigital.`;
  } catch {}

  return {
    requestKey: `program-reminder:${schedule.scheduleId}:${startUtc}`,
    title: `${schedule.programName.trim()} commence bientôt ⏰`,
    body,
    data: {
      type: "emission",
      emissionSlug: schedule.emissionSlug,
      programId: schedule.programId,
      scheduleId: schedule.scheduleId,
    },
  };
}

export type ProgramReminderCheckResult =
  | { outcome: "disabled" }
  | { outcome: "no_eligible_schedule" }
  | { outcome: "no_eligible_devices"; schedules: number }
  | { outcome: "duplicate"; duplicates: number }
  | { outcome: "processed"; processed: number; duplicates: number; requested: number; accepted: number; failed: number };

export async function runProgramReminderCheck<TClaim>(input: {
  enabled: boolean;
  getEligibleSchedules: () => Promise<EligibleProgramReminder[]>;
  claim: (notification: ProgramReminderNotification, deviceCount: number) => Promise<TClaim | null>;
  send: (claim: TClaim, notification: ProgramReminderNotification, devices: ProgramReminderDevice[]) => Promise<{ requested: number; accepted: number; failed: number }>;
}): Promise<ProgramReminderCheckResult> {
  if (!input.enabled) return { outcome: "disabled" };
  const schedules = await input.getEligibleSchedules();
  if (schedules.length === 0) return { outcome: "no_eligible_schedule" };
  const eligible = schedules.filter((schedule) => schedule.devices.length > 0);
  if (eligible.length === 0) {
    return { outcome: "no_eligible_devices", schedules: schedules.length };
  }

  let processed = 0;
  let duplicates = 0;
  let requested = 0;
  let accepted = 0;
  let failed = 0;
  for (const schedule of eligible) {
    const notification = programReminderNotification(schedule);
    if (!notification) continue;
    const claim = await input.claim(notification, schedule.devices.length);
    if (!claim) {
      duplicates += 1;
      continue;
    }
    const counts = await input.send(claim, notification, schedule.devices);
    processed += 1;
    requested += counts.requested;
    accepted += counts.accepted;
    failed += counts.failed;
  }
  if (processed === 0 && duplicates > 0) return { outcome: "duplicate", duplicates };
  if (processed === 0) return { outcome: "no_eligible_schedule" };
  return { outcome: "processed", processed, duplicates, requested, accepted, failed };
}
