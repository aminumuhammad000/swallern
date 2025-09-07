// import React from "react";
import styles from "./Features.module.css";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import BarChartIcon from "@mui/icons-material/BarChart";
import QuizIcon from "@mui/icons-material/Quiz";
import GroupIcon from "@mui/icons-material/Group";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import map from "../../../assets/images/map.png";

const features = [
  {
    icon: <MenuBookIcon style={{ color: "white" }} />,
    title: "Learning Paths",
    description: "Step-by-step skill tracks tailored to your goals.",
  },
  {
    icon: <SportsEsportsIcon style={{ color: "white" }} />,
    title: "Gamification",
    description: "Earn points, badges, and level up as you learn.",
  },
  {
    icon: <BarChartIcon style={{ color: "white" }} />,
    title: "Progress Tracking",
    description: "See your growth with smart visual dashboards.",
  },
  {
    icon: <QuizIcon style={{ color: "white" }} />,
    title: "Micro-Quizzes",
    description: "Quick tests to reinforce what you just learned.",
  },
  {
    icon: <GroupIcon style={{ color: "white" }} />,
    title: "Community Support",
    description: "Learn together with peers, mentors, and groups.",
  },
  {
    icon: <WorkspacePremiumIcon style={{ color: "white" }} />,
    title: "Certificates",
    description: "Get proof of your skills when you complete a path.",
  },
  {
    icon: <PersonSearchIcon style={{ color: "white" }} />,
    title: "Personalized Learning",
    description: "AI suggests content that fits your learning style.",
  },
  {
    icon: <CloudDownloadIcon style={{ color: "white" }} />,
    title: "Offline Access",
    description: "Download lessons and learn without internet.",
  },
  {
    icon: <PhoneIphoneIcon style={{ color: "white" }} />,
    title: "Mobile-Friendly",
    description: "Built to work seamlessly on any device.",
  },
];

export const Features = () => {
  return (
    <div className={styles.Features}>
      <div className={styles.container}>
        <div className={styles.featureContainer}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              {feature.icon}
              <div>
                <h3 className={styles.title}>{feature.title}</h3>
                <p className={styles.description}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.imageContainer}>
          <img src={map} alt="map image" className={styles.map} />
        </div>
      </div>
      <div className={styles.btnConatiner}>
        <button className={styles.btn}>Start Learning Now</button>
      </div>
    </div>
  );
};
