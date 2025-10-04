// import React from 'react'
import styles from "../../../../../styles/dashboard/pages/settings/LearningStats.module.css";

// Material Icons
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Trophy / Rank
import StarIcon from "@mui/icons-material/Star"; // Points
import TrackChangesIcon from "@mui/icons-material/TrackChanges"; // Goals
import MenuBookIcon from "@mui/icons-material/MenuBook"; // Courses
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech"; // Certificates
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium"; // Achievements
import TimelineIcon from "@mui/icons-material/Timeline"; // Activity

const LearningStats = () => {
  return (
    <div className={styles.Profile}>
      <h5 className={styles.mainTitle}>Learning Stats</h5>

      <div className={styles.main}>
        <div className={styles.firstContainer}>
          <div className={styles.circle}>75%</div>

          <button className={styles.Continue}>Continue Learning</button>

          <div className={styles.progressContainer}>
            <div className={styles.progress} style={{borderRadius: "10px 10px 0px 0px"}}>
              <h5>Courses in Progress</h5>
              <h3>3</h3>
            </div>

            <div className={styles.progress}>
              <h5>Courses Completed</h5>
              <h3>7</h3>
            </div>

            <div className={styles.progress}>
              <h5>Total Hours</h5>
              <h3>42</h3>
            </div>

            <div className={styles.progress} style={{borderRadius: "0px 0px 10px 10px"}}>
              <h5>Certificates Earned</h5>
              <h3>2</h3>
            </div>
          </div>
        </div>

        <div className={styles.otherContainer}>
          <p className={styles.text}>Your Learning Stats & Achievements</p>

          <div className={styles.personalHead}>
            <EmojiEventsIcon className={styles.icon} style={{color: "#ed673b"}}/>
            <div className={styles.buttonContainer}>
              <h5 className={styles.small}>Current Rank</h5>
              <h3 className={styles.name}>Golden Flight</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <StarIcon className={styles.icon} style={{color: "gold"}}/>
            <div className={styles.buttonContainer}>
              <h5 className={styles.small}>Total Points</h5>
              <h3 className={styles.name}>1,240 XP</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <TrackChangesIcon className={styles.icon} style={{color: "red"}}/>
            <div className={styles.buttonContainer}>
              <h5 className={styles.small}>Goals Achieved</h5>
              <h3 className={styles.name}>5</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <MenuBookIcon className={styles.icon} style={{color: "#300dccff"}}/>
            <div className={styles.buttonContainer}>
              <h5 className={styles.small}>Courses in Progress</h5>
              <h3 className={styles.name}>3</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <MilitaryTechIcon className={styles.icon} />
            <div className={styles.buttonContainer}>
              <h5 className={styles.small}>Certificates</h5>
              <h3 className={styles.name}>2 Completed</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <WorkspacePremiumIcon className={styles.icon} style={{color: "purple"}}/>
            <div className={styles.buttonContainer}>
              <h5 className={styles.small}>Achievements</h5>
              <h3 className={styles.name}>Top Learner</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <TimelineIcon className={styles.icon} style={{color: "green"}}/>
            <div className={styles.buttonContainer}>
              <h5 className={styles.small}>Learning Activity</h5>
              <h3 className={styles.name}>High</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningStats;
