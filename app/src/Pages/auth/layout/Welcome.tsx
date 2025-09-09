// import React from 'react'
import styles from "./Welcome.module.css";
import logo from "../../../assets/logo.png";
const Welcome = () => {
  return (
    <div className={styles.Welcome}>
      <img src={logo} alt="logo" className={styles.image} />
      <h1 className={styles.title}>
        Welcome to swallern Where Speed Meets Wisdom
      </h1>
      <p className={styles.description}>
        Let’s get you ready to learn fast and grow wise.
      </p>
      <button className={styles.button}>Let’s Begin</button>
    </div>
  );
};

export default Welcome;
