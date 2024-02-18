import { Category } from "../../types";
import { stylesAll } from "../Suits";
import styles from "./index.module.css";

export const Nav = ({
  category,
  setCategory,
}: {
  category: Category;
  setCategory: React.Dispatch<React.SetStateAction<Category>>;
}) => {
  const onClickNav = (_e: React.MouseEvent, index: number) => {
    setCategory(index);
  };

  return (
    <div className={styles.navWrapper}>
      {stylesAll.map((style, index) => (
        <button
          onClick={(e) => onClickNav(e, index)}
          key={`nav-${index}`}
          style={{
            color: style.color,
            borderBottom: category === index ? "1px solid" : "none",
          }}
        >
          {style.sign}
        </button>
      ))}
    </div>
  );
};
