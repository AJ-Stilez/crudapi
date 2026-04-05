export enum AccessType {
  ADMIN = 'admin',
  USER = 'user',
  SUPER_ADMIN = 'super_admin',
  GUARD = 'guard',
}

export type AuthData = {
  userId: string; // the actual user id
  authId: string; // the mongoose id on the auth model
  accessType: AccessType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
};
