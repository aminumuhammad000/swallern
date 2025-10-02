import styles from "../../../styles/dashboard/layout/WelcomeBanner.module.css";
import LeaderBoard from "../components/LeaderBoard";
const WelcomeBanner = () => {
  return (
    <div className={styles.welcomeContainer}>
    <div className={styles.welcome}>
      <div className={styles.textContainer}>
        <h2 className={styles.title}>It’s good to have you back, Aliyu.</h2>
        <p className={styles.description}>
          Every course you explore, every quiz you take, every minute you invest
          is shaping your future.
        </p>
        <div className={styles.btnContainer}>
          <button className={styles.btn}>Let’s keep going</button>
        </div>

        <div
          style={{
            marginBottom: "1px",
            fontSize: "12px",
            width: "100%",
            display: "flex",
          }}
        >
          Current Progress: <span style={{ marginLeft: "170px" }}>75%</span>
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}></div>
        </div>
      </div>
      <img
        src="https://blogger.googleusercontent.com/img/a/AVvXsEjHgPZd5yyoOra9bf5F4qaAxd30cjDAuupn-AtUtSi6eKf2cPqnlFb2cDXhyBx8wzwCNGaJoWMW1peCY4OXYfSIV5ShuNSG0-xnwC7USboTVRjEask5zFBcpAcaUpnzB_s5X1KP-edbGiO-GMMjQ-vxNodEXAyYHZJwVePj48Ya3rap5exQDslJ0RlugaGr"
        alt="Illustration"
        className={styles.image}
      />
    </div>

<LeaderBoard />
    </div>
  );
};

export default WelcomeBanner;
