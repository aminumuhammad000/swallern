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
      <h4 className={styles.mainTitle}>Learning Stats</h4>

      <div className={styles.main}>
        <div className={styles.firstContainer}>
          <div className={styles.circle}>75%</div>

          <button className={styles.Continue}>Continue Learning</button>

          <div className={styles.progressContainer}>
            <div className={styles.progress}>
              <h4>Courses in Progress</h4>
              <h1>3</h1>
            </div>

            <div className={styles.progress}>
              <h4>Courses Completed</h4>
              <h1>7</h1>
            </div>

            <div className={styles.progress}>
              <h4>Total Hours</h4>
              <h1>42</h1>
            </div>

            <div className={styles.progress}>
              <h4>Certificates Earned</h4>
              <h1>2</h1>
            </div>
          </div>
        </div>

        <div className={styles.otherContainer}>
          <p className={styles.text}>Your Learning Stats & Achievements</p>

          <div className={styles.personalHead}>
            <div><EmojiEventsIcon className={styles.icon} /></div>
            <div className={styles.buttonContainer}>
              <h4 className={styles.small}>Current Rank</h4>
              <h3 className={styles.name}>Golden Flight</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <div><StarIcon className={styles.icon} /></div>
            <div className={styles.buttonContainer}>
              <h4 className={styles.small}>Total Points</h4>
              <h3 className={styles.name}>1,240 XP</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <div><TrackChangesIcon className={styles.icon} /></div>
            <div className={styles.buttonContainer}>
              <h4 className={styles.small}>Goals Achieved</h4>
              <h3 className={styles.name}>5</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <div><MenuBookIcon className={styles.icon} /></div>
            <div className={styles.buttonContainer}>
              <h4 className={styles.small}>Courses in Progress</h4>
              <h3 className={styles.name}>3</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <div><MilitaryTechIcon className={styles.icon} /></div>
            <div className={styles.buttonContainer}>
              <h4 className={styles.small}>Certificates</h4>
              <h3 className={styles.name}>2 Completed</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <div><WorkspacePremiumIcon className={styles.icon} /></div>
            <div className={styles.buttonContainer}>
              <h4 className={styles.small}>Achievements</h4>
              <h3 className={styles.name}>Top Learner</h3>
            </div>
          </div>

          <div className={styles.personalHead}>
            <div><TimelineIcon className={styles.icon} /></div>
            <div className={styles.buttonContainer}>
              <h4 className={styles.small}>Learning Activity</h4>
              <h3 className={styles.name}>High</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningStats;
