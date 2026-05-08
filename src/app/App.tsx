import { RouterProvider } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { router } from './routes';
import { syncAuthState } from './utils/auth';
import { NetworkStatusNotifier } from './components/NetworkStatusNotifier';
import { SplashScreen } from './components/SplashScreen';


export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const unsubscribe = syncAuthState(() => {});
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, []);

return (
  <>
    {showSplash ? (
      <SplashScreen isVisible={showSplash} />
    ) : (
      <>
        <NetworkStatusNotifier />
        <RouterProvider router={router} />
      </>
    )}
  </>
);
}
