import { useData } from '../../providers/DataProvider';
import { Header } from '../Header';
import { List } from '../List';
import { LoginForm } from '../LoginForm';

export const Auth = () => {
  const { items } = useData();
  return (
    <>
      <Header />
      {items ? <List /> : <LoginForm />}
    </>
  );
};
