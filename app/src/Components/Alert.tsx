// import React from 'react'
import styles from "../styles/components/Alert.module.css";

const Alert = () => {
  return (
    <div className={styles.Alert}>
        <button>X</button>
      <div className={styles.iconContainer}>icon</div>

      <p>Are you Sure you Want Delete Account</p>

      <div>
        <button className={styles.primary}>Cancel</button>
        <button>Confirm</button>
      </div>
    </div>
  );
};

export default Alert;
