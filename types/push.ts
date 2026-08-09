export type PushPlatform = "ios" | "android";
export type PushRuntimeEnvironment = "development-build" | "production";

export type PushPreferences = {
  notificationsEnabled: boolean;
  notifyNewVideos: boolean;
  notifyLiveStarts: boolean;
  notifyFollowedEmissions: boolean;
  followedEmissionSlugs: string[];
};

export type RegisterPushDeviceInput = {
  installationId: string;
  expoPushToken: string;
  platform: PushPlatform;
  runtimeEnvironment: PushRuntimeEnvironment;
  appVersion: string | null;
  deviceName: string | null;
  locale: string | null;
  timezone: string | null;
  preferences: PushPreferences;
};

export type PushOwnershipInput = {
  installationId: string;
  expoPushToken: string;
};

export type PushProgramSubscriptionInput = PushOwnershipInput & {
  programId: string;
};

export type PushProgramSubscriptionList = {
  programIds: string[];
};

export type PushNavigationData = {
  type: "profile" | "live" | "emission" | "video";
  emissionSlug?: string;
  videoId?: string;
  programId?: string;
  scheduleId?: string;
};

export type PushDeviceAdmin = {
  id: string;
  tokenLastFour: string | null;
  platform: PushPlatform;
  appVersion: string | null;
  deviceName: string | null;
  locale: string | null;
  timezone: string | null;
  preferences: PushPreferences;
  isActive: boolean;
  lastSeenAt: string;
  lastRegisteredAt: string;
  disabledReason: string | null;
  lastDeliveryError: string | null;
};

export type PushAdminStats = {
  total: number;
  active: number;
  disabled: number;
  ios: number;
  android: number;
  notificationsEnabled: number;
  lastRegistration: string | null;
  lastDeliveryError: string | null;
};

export type PushDeliveryAdmin = {
  id: string;
  tokenLastFour: string | null;
  ticketStatus: string | null;
  ticketErrorCode: string | null;
  receiptStatus: string | null;
  receiptErrorCode: string | null;
  createdAt: string;
  notificationType: string | null;
};

export type PushActionState = {
  success: boolean;
  message: string;
};
