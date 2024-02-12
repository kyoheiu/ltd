import { IconLogin } from "@tabler/icons-react";
import logo from "../../logo.png";
import { useItems } from "../contexts/ItemsProvider";
import { useNavigate } from "react-router-dom";

const SYMBOL_SIZE = 18;

export const Login = () => {
  const { state, isLoadedItem } = useItems();
  const navigate = useNavigate();

  if (isLoadedItem && !!state) navigate("/");
  return (
    <div>
      <img src={logo} alt="ltd" />
      <div>
        <form id="login-form" method="post" action="api/ldaplogin">
          <div>
            <input type="text" name="username" placeholder="DN" required />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              required
            />
          </div>
          <p>
            <button>
              <IconLogin size={SYMBOL_SIZE} />
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
