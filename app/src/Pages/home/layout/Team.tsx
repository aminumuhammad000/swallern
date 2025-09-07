// import React from 'react'
import styles from "./Team.module.css";

export const Team = () => {
  return (
    <div className={styles.Team}>
      <div className={styles.pageTitle}>
        <div className={styles.textTitle}></div>
        Our Team
        <div className={styles.textTitle}></div>
      </div>
      <div className={styles.decoration}></div>
      <div className={styles.decoration2}></div>
      <div className={styles.decoration3}></div>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>The Energy Behind Swallern</h2>
          <p className={styles.description}>
            Swallern is more than a platform it’s a movement. And behind that
            movement is a team of builders, creators, learners, and leaders who
            believe in one thing
          </p>
        </div>
      </div>

      <div className={styles.teamContainer}></div>
    </div>
  );
};
