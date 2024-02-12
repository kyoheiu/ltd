import { IconLogout } from "@tabler/icons-react";
import logo from "../../../logo.png";
import { Outlet } from "react-router-dom";
import { useItems } from "../../contexts/ItemsProvider";
import { useCallback, useState } from "react";
import { Suit } from "../../types";
import styles from "./index.module.css";

export const SYMBOL_SIZE = 18;

export const Header: React.FC = () => {
  const { addItem } = useItems();
  const [value, setValue] = useState("");

  const onSubmitNewItem = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      addItem(value, Suit.Spade);
      setValue("");
    },
    [value, addItem]
  );

  return (
    <>
      <div className={styles.headerWrapper}>
        <div className={styles.topWrapper}>
          <a href="/">
            <img src={logo} className={styles.logo} alt="ltd" />
          </a>
          <button>
            <IconLogout className={styles.logOut} />
          </button>
        </div>

        <form onSubmit={onSubmitNewItem}>
          <input
            className={styles.input}
            id="submit-form"
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            placeholder="+"
          />
        </form>
      </div>
      <Outlet />
    </>
  );
};
