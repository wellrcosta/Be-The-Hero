import { useEffect, useState } from 'react';

import { LoginScreen } from './src/screens/LoginScreen';
import { CasesScreen } from './src/screens/CasesScreen';
import { getAccessToken } from './src/lib/api';

export default function App() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      setLoggedIn(Boolean(token));
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  if (!loggedIn) {
    return <LoginScreen onLoggedIn={() => setLoggedIn(true)} />;
  }

  return <CasesScreen onLoggedOut={() => setLoggedIn(false)} />;
}
