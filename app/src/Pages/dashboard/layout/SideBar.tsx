import styles from "../../../styles/dashboard/layout/SideBar.module.css";
import logo from "../../../assets/whitelogo.png";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import ForumIcon from "@mui/icons-material/Forum";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";

const SideBar = () => {
    const [active, setActive] = useState("dashboard")
  return (
    <div className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="Swallern Logo" className={styles.logoImage} />
        <span className={styles.logo}>wallern</span>
      </div>
      <ul>
        <li
          className={active === "dashboard" ? styles.active : ""}
          onClick={() => setActive("dashboard")}
        >
          <DashboardIcon /> &nbsp; Dashboard
        </li>
        <li
          className={active === "courses" ? styles.active : ""}
          onClick={() => setActive("courses")}
        >
          <SchoolIcon /> &nbsp; Courses
        </li>
        <li
          className={active === "community" ? styles.active : ""}
          onClick={() => setActive("community")}
        >
          <ForumIcon /> &nbsp; Community
        </li>
        <li
          className={active === "challenges" ? styles.active : ""}
          onClick={() => setActive("challenges")}
        >
          <TrackChangesIcon /> &nbsp; Challenges
        </li>
        <li
          className={active === "leaderboard" ? styles.active : ""}
          onClick={() => setActive("leaderboard")}
        >
          <EmojiEventsIcon /> &nbsp; Leader Board
        </li>
        <li
          className={active === "settings" ? styles.active : ""}
          onClick={() => setActive("settings")}
        >
          <SettingsIcon /> &nbsp; Settings
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
