import { useCallback, useEffect, useState } from 'react';

// Runs `load(signal)` whenever it changes and tracks data / loading / error.
// `reload` re-runs it, e.g. after a mutation or from a "Try again" button.
export default function useRequest(load) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));
    load(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState((previous) => ({ ...previous, loading: false, error: error.message }));
      });
    return () => controller.abort();
  }, [load, attempt]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);

  return { ...state, reload };
}
