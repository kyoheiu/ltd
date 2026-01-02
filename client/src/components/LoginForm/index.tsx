import { useData } from '../../providers/DataProvider';

export const LoginForm = () => {
  const { handleLogin } = useData();

  return (
    <form id="login-form" method="post" action={handleLogin}>
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
        <button type="submit">log in</button>
      </p>
    </form>
  );
};
