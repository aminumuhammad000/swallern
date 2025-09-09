// import React from "react";
import styles from "./Auth.module.css";
import Interest from "./layout/Interest";
// import Purpose from "./layout/Purpose";
// import Welcome from "./layout/Welcome";
const Auth = () => {
  return (
    <div className={styles.Auth}>
      {/* <Welcome /> */}
      {/* <Purpose /> */}
      <Interest />
    </div>
  );
};

export default Auth;
