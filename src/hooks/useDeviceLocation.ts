import { useCallback, useState } from 'react';
import { openLocationSettings, requestLocationPermission } from '../helpers/location';

export type DeviceLocationStatus = 'idle' | 'loading' | 'granted' | 'denied';

export interface Coords {
  latitude: number;
  longitude: number;
}

// Shared by HomeScreen and SpaceListScreen so both gate their "Spaces Near
// You" list the same way, independently — each re-checks permission and
// re-reads the current position on its own rather than passing coordinates
// through navigation params.
export const useDeviceLocation = () => {
  const [status, setStatus] = useState<DeviceLocationStatus>('idle');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const requestLocation = useCallback(async (): Promise<Coords | null> => {
    setStatus('loading');
    const result = await requestLocationPermission();

    if (!result.granted) {
      setCanAskAgain(result.canAskAgain);
      setStatus('denied');
      return null;
    }

    const next = { latitude: result.latitude, longitude: result.longitude };
    setCoords(next);
    setStatus('granted');
    return next;
  }, []);

  const handleGatePress = useCallback(() => {
    if (canAskAgain) {
      requestLocation();
    } else {
      openLocationSettings();
    }
  }, [canAskAgain, requestLocation]);

  return { status, coords, canAskAgain, requestLocation, handleGatePress };
};
