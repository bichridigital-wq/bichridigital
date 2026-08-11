export type AccountProfile = {
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountMeResponse = {
  user: { id: string; email: string | null };
  profile: AccountProfile;
};

export type UpdateAccountProfileInput = {
  displayName?: string;
  avatarUrl?: string | null;
};

export type LinkDeviceInput = {
  installationId: string;
  expoPushToken: string;
};

export type DeviceLinkOutcome =
  | "linked"
  | "already_linked"
  | "unlinked"
  | "already_unlinked";

export type UserProgramSubscription = {
  userId: string;
  programId: string;
  createdAt: string;
};
