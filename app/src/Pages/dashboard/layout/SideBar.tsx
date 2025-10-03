import styles from "../../../styles/dashboard/layout/SideBar.module.css";
import logo from "../../../assets/whitelogo.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import ForumIcon from "@mui/icons-material/Forum";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";
import { Link } from "react-router-dom";

const SideBar = () => {
  const [active, setActive] = useState("dashboard");
  return (
    <div className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="Swallern Logo" className={styles.logoImage} />
        <span className={styles.logo}>wallern</span>
      </div>
      <ul>
        <Link to="/dashboard" className={styles.Link}>
          <li
            className={active === "dashboard" ? styles.active : ""}
            onClick={() => setActive("dashboard")}
          >
            <DashboardIcon /> &#160; Dashboard
          </li>
        </Link>

        <Link to="/dashboard/courses" className={styles.Link}>
          <li
            className={active === "courses" ? styles.active : ""}
            onClick={() => setActive("courses")}
          >
            <SchoolIcon /> &#160; Courses
          </li>
        </Link>

        <Link to="/dashboard/community" className={styles.Link}>
          <li
            className={active === "community" ? styles.active : ""}
            onClick={() => setActive("community")}
          >
            <ForumIcon /> &#160; Community
          </li>
        </Link>

        <Link to="/dashboard/challenges" className={styles.Link}>
          <li
            className={active === "challenges" ? styles.active : ""}
            onClick={() => setActive("challenges")}
          >
            <TrackChangesIcon /> &#160; Challenges
          </li>
        </Link>

        <Link to="/dashboard/leaderboard" className={styles.Link}>
          <li
            className={active === "leaderboard" ? styles.active : ""}
            onClick={() => setActive("leaderboard")}
          >
            <EmojiEventsIcon /> &#160; Leader Board
          </li>
        </Link>

        <Link to="/dashboard/settings" className={styles.Link}>
          <li
            className={active === "settings" ? styles.active : ""}
            onClick={() => setActive("settings")}
          >
            <SettingsIcon /> &#160; Settings
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default SideBar;
