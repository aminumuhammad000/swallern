// import React from "react";
import styles from "./About.module.css";
import about from "../../../assets/images/about.png";
import students from "../../../assets/images/students.png";
import vidoe from "../../../assets/images/video.png";
import CheckIcon from "@mui/icons-material/Check";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import ComputerIcon from "@mui/icons-material/Computer";

const About = () => {
  return (
    <div className={styles.About}>
      <div className={styles.descriptionContainer}>
        <div>
          <div className={styles.pageTitle}>
            <div className={styles.textTitle}></div>
            About Us
            <div className={styles.textTitle}></div>
          </div>

          <h1 className={styles.headingTitle}>
            Where Speed Meets <span>Wisdom</span>
          </h1>
          <p className={styles.aboutDescription}>
            The name <b>Swallern</b> is inspired by the swallow bird fast,
            agile, and free combined with learn. ”We built Swallern to make
            learning feel just like that: light, exciting, and filled with
            movement.
          </p>

          <p className={styles.aboutDescription}>
            Too many platforms focus on information overload. We focus on real
            transformation helping young people learn fast, stay engaged, and
            grow into their best selves.
          </p>

          <p className={styles.aboutDescription}>
            From Nigeria to Nairobi, from first-time learners to rising creators
            Swallern is here to guide your journey.
          </p>
        </div>

        <div className={styles.imageContainer}>
          <img src={about} alt="about image" />
        </div>
      </div>

      <div className={styles.missionContainer}>
        <div className={styles.videoContianer}>
          <img src={students} alt="" className={styles.students} />
          {/* <video src=""></video> */}
          <img src={vidoe} alt="" className={styles.video} />
        </div>

        <div className={styles.missionAndvisionContainer}>
          <div className={styles.mission}>
            <h2 className={styles.missionTitle}>
              <span className={styles.iconContainer}>
                <CheckIcon />
              </span>
              Mission
            </h2>
            <p>
              To empower Africa’s youth with joyful, real-world skill learning
              that’s fast, fun, and community first.
            </p>
          </div>

          <div className={styles.vision}>
            <h2 className={styles.visiomTitle}>
              <span className={styles.iconContainer}>
                <CheckIcon />
              </span>
              Vision
            </h2>
            <p>
              To unlock every learner’s potential through a platform that makes
              growth simple, social, and sustainable.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.audienceContainer}>
        <div className={styles.container}>
          <SchoolIcon className={styles.icon} sx={{ fontSize: 50 }} />
          <div>
            <h5 className={styles.audienceTitle}>Age Group</h5>
            <p className={styles.audienceText}>
              14–35 yearsYouthful, curious, and ready to grow.
            </p>
          </div>
        </div>

        <div className={styles.container}>
          <PublicIcon className={styles.icon} sx={{ fontSize: 50 }} />
          <div>
            <h5 className={styles.audienceTitle}>Region</h5>
            <p className={styles.audienceText}>
              Africa-first, open to the world. Rooted in community, built for
              everyone.
            </p>
          </div>
        </div>

        <div className={styles.container}>
          <ComputerIcon className={styles.icon} sx={{ fontSize: 50 }} />
          <div>
            <h5 className={styles.audienceTitle}>Skill Level</h5>
            <p className={styles.audienceText}>
              Beginner to Intermediate No experience needed. Just bring your
              drive.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.learnMoreContainer}>
        <button className={styles.learnMore}>Learn More</button>
      </div>
    </div>
  );
};

export default About;
