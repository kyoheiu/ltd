import { Auth } from './components/Auth';
import './index.css';
import { DataProvider } from './providers/DataProvider';
import { DialogProvider } from './providers/DialogProvider';
import { NotificationProvider } from './providers/NotificationProvider';

function App() {
  return (
    <NotificationProvider>
      <DataProvider>
        <DialogProvider>
          <Auth />
        </DialogProvider>
      </DataProvider>
    </NotificationProvider>
  );
}

export default App;
