// import React from 'react'
import styles from "./Forget.module.css";
import { useDispatch } from "react-redux";
import { goToPage } from "../../../features/navigation/navigationSlice";
import { type AppDispatch } from "../../../store/store";

const Forget = () => {
  const dispatch = useDispatch<AppDispatch>();
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
        <button
          type="submit"
          className={styles.primary}
          onClick={() => dispatch(goToPage("otp"))}
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default Forget;
