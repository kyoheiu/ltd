import { IconLogout } from "@tabler/icons-react";
import logo from "../../logo.png";
import { Outlet } from "react-router-dom";

export const SYMBOL_SIZE = 18;

export const Header: React.FC = () => {
  return (
    <>
      <div>
        <div>
          <a href="/">
            <img src={logo} alt="ltd" />
          </a>
          <button onClick={() => {}}>
            <IconLogout size={SYMBOL_SIZE} />
          </button>
        </div>

        <form>
          <input
            id="submit-form"
            type="text"
            onChange={() => {}}
            placeholder="+"
          />
        </form>
      </div>
      <Outlet />
    </>
  );
};
