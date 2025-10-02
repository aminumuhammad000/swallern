import styles from "../../../styles/dashboard/layout/Explore.module.css";

const Explore = () => {
  return (
   
            <div className={styles["explore-section"]}>
              <div className={styles["explore-sub"]}>
                <h2> Explore</h2>
                <h4>Challenges</h4>
                <div className={`${styles["challenge"]} ${styles["orange"]}`}>
                  <i className="fa fa-bolt"></i> Complete 3 Lessons Today{" "}
                  <span>20XP</span>
                </div>
                <div className={`${styles["challenge"]} ${styles["blue"]}`}>
                  <i className="fa fa-calendar"></i> Log in 5 Days in a Row{" "}
                  <span>20XP</span>
                </div>
                <div className={`${styles["challenge"]} ${styles["green"]}`}>
                  <i className="fa fa-comments"></i> Join a Community Discussion{" "}
                  <span>20XP</span>
                </div>
              </div>

              <div className={styles["explore-sub"]}>
                <h4>Communities</h4>
                <div className={`${styles["community"]} ${styles["red"]}`}>
                  <i className="fa fa-code"></i> Web Developers Hub{" "}
                  <span>1,245 members</span>
                </div>
                <div className={`${styles["community"]} ${styles["purple"]}`}>
                  <i className="fa fa-rocket"></i> Productivity Powerhouse{" "}
                  <span>1,256 members</span>
                </div>
              </div>
            </div>
  )
}

export default Explore
