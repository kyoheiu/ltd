import { useAuth } from '../../providers/AuthProvider';
import { Footer } from '../Footer';
import { Header } from '../Header';
import { List } from '../List';
import { LoginForm } from '../LoginForm';

import styles from './index.module.css';

export const Auth = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className={styles.wrapper}>
      <Header />
      {isAuthenticated ? <List /> : <LoginForm />}
      <Footer />
    </div>
  );
};
