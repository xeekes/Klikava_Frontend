import { useCallback, useEffect, useState } from "react";

export const usePanelQuery = (queryFn, deps = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || "Request failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, isLoading, error, reload, setData };
};

export const usePanelMutation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (action) => {
    setIsSubmitting(true);
    setError(null);

    try {
      return await action();
    } catch (err) {
      setError(err.message || "Request failed");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, error, run, setError };
};
