import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { NETWORK_ERROR_MESSAGE } from '../utils/api';

export function NetworkStatusNotifier() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-white px-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-gray-600">
          <WifiOff className="h-7 w-7" />
        </div>
        <p className="text-base font-medium leading-7 text-gray-800">
          {NETWORK_ERROR_MESSAGE}
        </p>
      </div>
    </div>
  );
}
