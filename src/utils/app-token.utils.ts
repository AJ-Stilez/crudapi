export enum AppTokenPurpose {
  RESET_ACCOUNT_REQUEST = 'reset_account_request',
  NEW_ACCOUNT_CREATED = 'new_account_created',
  INITIATE_NEW_ACCOUNT = 'initiate_new_account',
  REQUEST_PHONE_VALIDATION = 'request_phone_validation',
  RESET_ACCOUNT_PIN = 'reset_account_pin',
  ESTATE_ACCESS_CODE = 'estate_access_code',
  GUARD_REGISTRATION = 'guard_registration',
  CHANGE_ACCOUNT_PASSWORD = 'change_account_password',
  UPDATE_USER_IDENTIFIER = 'update_user_identifier',
  GUARD_FIRST_TIME_VERIFICATION = 'guard_first_time_verification',
  ACP_OTP_REQUEST = 'acp_otp_request', // For OTP request/verification flow
  ACP_AUTH = 'acp_auth', // For long-lived device authentication token
}

export type AppTokenErrorGen = {
  tokenNotFoundErrorMessage?: string;
  codeDoesNotMatchErrorMessage?: string;
};

export type IdentifierType = 'email' | 'userId';
