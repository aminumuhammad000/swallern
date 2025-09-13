// import React from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store/store";
import styles from "./Auth.module.css";
import OTP from "./layout/Otp";
import Interest from "./layout/Interest";
import Purpose from "./layout/Purpose";
import Welcome from "./layout/Welcome";
import Experience from "./layout/Experience";
import Register from "./layout/Register";
import Login from "./layout/Login";
import Forget from "./layout/Forget";

const Auth = () => {
  // const dispatch = useDispatch<AppDispatch>();
  const currentPage = useSelector(
    (state: RootState) => state.navigation.currentPage
  );

  return (
    <div className={styles.Auth}>
      {currentPage === "welcome" && <Welcome />}
      {currentPage === "purpose" && <Purpose />}
      {currentPage === "interest" && <Interest />}
      {currentPage === "experience" && <Experience />}
      {currentPage === "register" && <Register />}
      {currentPage === "forget" && <Forget />}
      {currentPage === "login" && <Login />}
      {currentPage === "otp" && <OTP />}
    </div>
  );
};

export default Auth;
