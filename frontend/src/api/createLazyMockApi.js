/*
 * Shared lazy mock proxy used by API facades in dev builds without VITE_API_BASE_URL.
 * Mock modules are loaded via dynamic import so production bundles can exclude them.
 */

/**
 * Builds a proxy object that delegates each method to a lazily imported mock implementation.
 * @param {string[]} methodNames
 * @param {() => Promise<Record<string, (...args: unknown[]) => unknown>>} resolveMockImpl
 * @returns {Record<string, (...args: unknown[]) => Promise<unknown>>}
 */
export const createLazyMockApi = (methodNames, resolveMockImpl) => {
  /** @type {Promise<Record<string, (...args: unknown[]) => unknown>>|null} */
  let mockImplPromise = null;

  /**
   * Resolves the mock implementation once per session.
   * @returns {Promise<Record<string, (...args: unknown[]) => unknown>>}
   */
  const resolve = () => {
    if (!mockImplPromise) {
      mockImplPromise = resolveMockImpl();
    }
    return mockImplPromise;
  };

  return Object.fromEntries(
    methodNames.map((methodName) => [
      methodName,
      async (...args) => (await resolve())[methodName](...args),
    ]),
  );
};
