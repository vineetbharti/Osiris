import { useCallback, useEffect, useState } from 'react';
import { fleetRepo } from '../../data/repositories';

/**
 * useFleet — hook for the fleet feature.
 * Wraps the repository so components don't import it directly.
 */
export function useFleet() {
  const [vessels, setVessels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await fleetRepo.listVessels();
      setVessels(list);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const searchByImo = useCallback(async (imo) => {
    return fleetRepo.searchByImo(imo);
  }, []);

  const addVessel = useCallback(
    async (vessel) => {
      const added = await fleetRepo.addVessel(vessel);
      await refresh();
      return added;
    },
    [refresh]
  );

  const removeVessel = useCallback(
    async (imo) => {
      await fleetRepo.removeVessel(imo);
      await refresh();
    },
    [refresh]
  );

  return { vessels, isLoading, error, refresh, searchByImo, addVessel, removeVessel };
}
