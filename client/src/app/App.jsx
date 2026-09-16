import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers.jsx';
import { router } from './routes.jsx';

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
