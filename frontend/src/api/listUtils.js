/**
 * Нормализует ответы списков бэкенда: массив или обёртка `{ items }`.
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
