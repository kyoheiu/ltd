import { List } from './components/List';
import { LogInForm } from './components/LoginForm';
import './index.css';
import { DataProvider, useData } from './providers/DataProvider';

function App() {
  const { items } = useData();
  console.log("items:", items)

  return (
    <DataProvider>{items ? <List /> : <LogInForm />}</DataProvider>
  );
}

export default App;
