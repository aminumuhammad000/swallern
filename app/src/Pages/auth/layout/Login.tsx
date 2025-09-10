// import React from 'react'
import styles from "./Register.module.css";
import google from "../../../assets/icons/google.png";
const Login = () => {
  return (
    <div className={styles.Register}>
      <h3>Welcome back</h3>
      <p className={styles.description}>
        Log in to continue your learning journey.
      </p>
      <form action="" className={styles.form}>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="email"
          required
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="password"
          required
        />
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            name=""
            id=""
            className={styles.checkbox}
            required
          />
          <p> Remember Me</p>
        </div>

        <p>_________________or_________________</p>
        <img src={google} alt="google login" className={styles.google} />
        <button type="submit" className={styles.primary}>
          Log In
        </button>
      </form>
      <p className={styles.haveAccount}>
        Don’t have an account?<span className={styles.login}> Sign up</span>
      </p>
      <p className={styles.forget}>Forgot Password?</p>
    </div>
  );
};

export default Login;
