import { useData } from '../../providers/DataProvider';
import { shapesMap } from '../Icons';

import styles from './index.module.css';

export const Tab = () => {
  const { selectedTab, setSelectedTab } = useData();
  return (
    <div className={styles.wrapper}>
      {Array.from(shapesMap).map(([dot, icon]) => {
        const num = Number(dot);
        return (
          <button
            key={dot}
            type="button"
            className={styles.button}
            data-selected={num === selectedTab}
            onClick={() => setSelectedTab(num)}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
};
