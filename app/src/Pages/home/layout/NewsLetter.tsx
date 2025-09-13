// import React from 'react'
import styles from "./NewsLetter.module.css";
import logo from "../../../assets/logo.png";
import { Link } from "react-router-dom";

export const NewsLetter = () => {
  return (
    <div className={styles.NewsLetter}>
      <img src={logo} alt="logo" className={styles.logo} />
      <button className={styles.getStarted}>
        <Link to="/auth" id="link">
          Get Started with Swallern
        </Link>
      </button>

      <div className={styles.container}>
        <div className={styles.update}>
          <img src={logo} alt="logo" className={styles.smallLogo} />
          <div>
            <h3 className={styles.title}>Stay Updated</h3>
            <p className={styles.description}>
              Get the latest tips, new features, and early access straight to
              your inbox.
            </p>
          </div>
        </div>

        <div className={styles.inputContainer}>
          <input type="email" placeholder="Enter Your Email" />
          <button className={styles.Subscribe}>Subscribe</button>
        </div>
      </div>
    </div>
  );
};
