import { useData } from '../../providers/DataProvider';

import styles from './index.module.css';

export const LoginForm = () => {
  const { handleLogin } = useData();

  return (
    <form id="login-form" action={handleLogin}>
      <div className={styles.wrapper}>
        <div className={styles.input__wrapper}>
          <input
            className={styles.input}
            type="text"
            name="username"
            placeholder="dn"
            required
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="password"
            required
          />
        </div>
        <button type="submit" className={styles.button}>
          Log In
        </button>
      </div>
    </form>
  );
};
