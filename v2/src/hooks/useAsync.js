import { useEffect, useState } from 'react';

/**
 * useAsync — runs an async function and tracks { data, isLoading, error }.
 * Re-runs when any dep changes.
 *
 * Used by feature pages to call repositories cleanly without scattering
 * try/catch and useState everywhere.
 *
 * @param {() => Promise<any>} asyncFn
 * @param {Array<any>} deps
 */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, isLoading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    asyncFn()
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, isLoading: false, error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
