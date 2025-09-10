// import React from 'react'
import styles from "./Forget.module.css";
const Forget = () => {
  return (
    <div className={styles.Register}>
      <h3>Reset your password</h3>
      <p className={styles.description}>
        Enter the email you used to register.
      </p>
      <form action="" className={styles.form}>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="email"
          required
        />
        <button type="submit" className={styles.primary}>
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default Forget;
