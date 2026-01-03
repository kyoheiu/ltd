import { Auth } from './components/Auth';
import './index.css';
import { DataProvider } from './providers/DataProvider';
import { DialogProvider } from './providers/DialogProvider';

function App() {
  return (
    <DataProvider>
      <DialogProvider>
        <Auth />
      </DialogProvider>
    </DataProvider>
  );
}

export default App;
