import { Category } from "../types";
import { stylesAll } from "./Suits";

export const Nav = ({
  setCategory,
}: {
  setCategory: React.Dispatch<React.SetStateAction<Category>>;
}) => {
  const onClickNav = (_e: React.MouseEvent, index: number) => {
    setCategory(index);
  };

  return (
    <div>
      {stylesAll.map((style, index) => (
        <button
          onClick={(e) => onClickNav(e, index)}
          key={`nav-${index}`}
          style={{ color: style.color }}
        >
          {style.sign}
        </button>
      ))}
    </div>
  );
};
