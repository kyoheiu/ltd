import { useData } from '../../providers/DataProvider';

export const LogInForm = () => {
  const { formAction } = useData();

  return (
    <form id="login-form" method="post" action={formAction}>
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
