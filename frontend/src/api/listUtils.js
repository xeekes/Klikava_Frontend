/**
 * Normalizes backend list responses: array or wrapper `{ items }`.
 * @param {Array<object>|{ items?: Array<object> }|null|undefined} payload
 * @returns {Array<object>}
 */
export const getListItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  return [];
};
