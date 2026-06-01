export type TwoFaProviderType = "TOTP" | "SMS" | "EMAIL" | "BACKUP_CODE";

export type JwtScope =
  | "SYS_ADMIN"
  | "TENANT_ADMIN"
  | "CUSTOMER_USER"
  | "REFRESH_TOKEN"
  | "PRE_VERIFICATION_TOKEN"
  | "MFA_CONFIGURATION_TOKEN";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtPair {
  token: string;
  refreshToken: string;
  scope?: JwtScope;
}

export interface TwoFaProviderInfo {
  type: TwoFaProviderType;
  default?: boolean;
  isDefault?: boolean;
  contact?: string | null;
  minVerificationCodeSendPeriod?: number;
}

export interface ThingsboardUser {
  id: { id: string; entityType: string };
  tenantId: { id: string; entityType: string };
  customerId?: { id: string; entityType: string };
  email: string;
  firstName?: string;
  lastName?: string;
  authority?: string;
}

export interface ThingsboardErrorResponse {
  status: number;
  message: string;
  errorCode?: number;
  timestamp?: number;
  resetToken?: string;
}

export interface AuthContext {
  baseUrl: string;
  token: string;
  refreshToken: string;
  authHeader: string;
  issuedAtIso: string;
  expiresHint: string;
}

export interface AuthFailure {
  ok: false;
  stage: "login" | "2fa_verify" | "2fa_login" | "refresh";
  status: number;
  reason: string;
}

export type AuthSuccess = AuthContext & { ok: true };

export type AuthResult = AuthSuccess | AuthFailure;

export interface LoginCredentials {
  username: string;
  password: string;
  totpCode?: string;
  allowHttpForLocalDev?: boolean;
}

export interface PendingTwoFaSession {
  baseUrl: string;
  preVerificationToken: string;
  refreshToken: string;
  providers: TwoFaProviderInfo[];
  selectedProvider: TwoFaProviderType;
}

export interface StoredSession extends AuthContext {
  user?: ThingsboardUser;
}
