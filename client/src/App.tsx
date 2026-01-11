import { Auth } from './components/Auth';
import './index.css';
import { AuthProvider } from './providers/AuthProvider';
import { DataProvider } from './providers/DataProvider';
import { DialogProvider } from './providers/DialogProvider';
import { NotificationProvider } from './providers/NotificationProvider';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <DataProvider>
          <DialogProvider>
            <Auth />
          </DialogProvider>
        </DataProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
