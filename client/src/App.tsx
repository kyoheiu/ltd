import { Auth } from './components/Auth';
import './index.css';
import { DataProvider } from './providers/DataProvider';

function App() {
  return (
    <DataProvider>
      <Auth />
    </DataProvider>
  );
}

export default App;
