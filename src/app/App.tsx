import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { router } from './routes';
import { syncAuthState } from './utils/auth';


export default function App() {
  useEffect(() => {
    const unsubscribe = syncAuthState(() => {});
    return () => unsubscribe();
  }, []);

  return <RouterProvider router={router} />;
}
