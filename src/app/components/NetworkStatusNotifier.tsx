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
      window.alert(NETWORK_ERROR_MESSAGE);
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
    <div className="fixed top-0 left-0 right-0 z-[9999] border-b border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>{NETWORK_ERROR_MESSAGE}</span>
      </div>
    </div>
  );
}
