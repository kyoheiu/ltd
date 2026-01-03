import packageJson from '../../../package.json';

import styles from './index.module.css';

export const Footer = () => {
  return <div className={styles.footer}>ltd v{packageJson.version}</div>;
};
