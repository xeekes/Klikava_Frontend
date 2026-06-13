/* Типизированная ошибка неудачного HTTP-запроса; содержит код статуса и тело ответа. */

/**
 * Представляет ответ API с кодом не 2xx и структурированными метаданными.
 */
export class ApiError extends Error {
  /**
   * @param {number} status Код HTTP-статуса
   * @param {string} message Текст ошибки для пользователя
   * @param {unknown} [data] Распарсенное тело ответа, если доступно
   */
  constructor(status, message, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
