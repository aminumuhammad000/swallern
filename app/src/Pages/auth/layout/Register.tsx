// import React from 'react'
import styles from "./Register.module.css";
import google from "../../../assets/icons/google.png";
import { useDispatch } from "react-redux";
import { goToPage } from "../../../features/navigation/navigationSlice";
import { type AppDispatch } from "../../../store/store";

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className={styles.Register}>
      <h3>Sign Up or Guest Access</h3>
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
          <p>
            By continuing, you accept our <a href="">Terms</a> and <br />
            <span>
              <a href="#">Privacy Policy.</a>
            </span>
          </p>
        </div>

        <p>_________________or_________________</p>
        <img src={google} alt="google login" className={styles.google} />
        <button type="submit" className={styles.primary}>
          Join Swallern
        </button>
        <button className={styles.secondary}>Continue as Guest</button>
      </form>
      <p className={styles.haveAccount}>
        Already have account?{" "}
        <span
          className={styles.login}
          onClick={() => dispatch(goToPage("login"))}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Register;
