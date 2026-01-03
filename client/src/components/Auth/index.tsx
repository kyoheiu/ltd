import { useData } from '../../providers/DataProvider';
import { Footer } from '../Footer';
import { Header } from '../Header';
import { List } from '../List';
import { LoginForm } from '../LoginForm';

import styles from './index.module.css';

export const Auth = () => {
  const { items } = useData();
  return (
    <div className={styles.wrapper}>
      <Header />
      {items ? <List /> : <LoginForm />}
      <Footer />
    </div>
  );
};
