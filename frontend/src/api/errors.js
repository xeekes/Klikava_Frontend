/* Typed HTTP Request Failed Error; contains the status code and response body. */

/**
 * Represents an API response with non-2xx code and structured metadata.
 */
export class ApiError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} message Error text for the user
   * @param {unknown} [data] Parsed response body, if available
   */
  constructor(status, message, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
