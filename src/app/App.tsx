import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { router } from './routes';
import { syncAuthState } from './utils/auth';
import { NetworkStatusNotifier } from './components/NetworkStatusNotifier';


export default function App() {
  useEffect(() => {
    const unsubscribe = syncAuthState(() => {});
    return () => unsubscribe();
  }, []);

  return (
    <>
      <NetworkStatusNotifier />
      <RouterProvider router={router} />
    </>
  );
}
