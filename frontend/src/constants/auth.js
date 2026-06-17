/* Authorization script identifiers and localStorage keys for session and verification. */

/** Named authorization modes for registration and password recovery. */
export const AUTH_FLOW = {
  REGISTER: "register",
  RECOVER: "recover",
};

/** localStorage keys for authorization token and verification state. */
export const AUTH_STORAGE_KEYS = {
  TOKEN: "auth_token",
  VERIFICATION_ID: "auth_verification_id",
  EMAIL_OR_PHONE: "auth_email_or_phone",
};
