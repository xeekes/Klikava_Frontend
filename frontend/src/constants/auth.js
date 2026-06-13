/* Идентификаторы сценариев авторизации и ключи localStorage для сессии и верификации. */

/** Именованные режимы авторизации при регистрации и восстановлении пароля. */
export const AUTH_FLOW = {
  REGISTER: "register",
  RECOVER: "recover",
};

/** Ключи localStorage для токена авторизации и состояния верификации. */
export const AUTH_STORAGE_KEYS = {
  TOKEN: "auth_token",
  VERIFICATION_ID: "auth_verification_id",
  EMAIL_OR_PHONE: "auth_email_or_phone",
};
