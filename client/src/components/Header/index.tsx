import logo from '../../assets/logo.png';
import { useData } from '../../providers/DataProvider';
import { IconLogout } from '../Icons';

import styles from './index.module.css';

export const Header = () => {
  const { items, handleLogout } = useData();

  return (
    <div className={styles.wrapper}>
      <img src={logo} alt="ltd logo" width="20px" height="auto" />
      {!!items && (
        <button type="button" className={styles.button} onClick={handleLogout}>
          <IconLogout />
        </button>
      )}
    </div>
  );
};
