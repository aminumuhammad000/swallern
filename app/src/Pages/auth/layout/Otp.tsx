// import React from 'react'
import styles from "./Otp.module.css";
import { useDispatch } from "react-redux";
import { goToPage } from "../../../features/navigation/navigationSlice";
import { type AppDispatch } from "../../../store/store";

const OTP = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className={styles.Register}>
      <h3>Check your email</h3>
      <p className={styles.description}>
        We’ve sent a 6-digit code to youremail@example.com
      </p>
      <form action="" className={styles.form}>
        <input
          type="text"
          name="otp"
          id="emaotpil"
          placeholder="enter otp here"
          required
        />
        <button
          type="submit"
          className={styles.primary}
          onClick={() => dispatch(goToPage("otp"))}
        >
          Verify Code
        </button>
        {/* <button className={styles.secondary}>Continue as Guest</button> */}
      </form>
    </div>
  );
};

export default OTP;
