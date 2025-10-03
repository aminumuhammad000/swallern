import RecomendedCourse from "./layout/RecomendedCourse";
import styles from "../../styles/dashboard/dashboard.module.css";
import NavBar from "./layout/NavBar";
import Ongoin from "./layout/Ongoin";
import SideBar from "./layout/SideBar";
import WelcomeBanner from "./layout/WelcomeBanner";
import ProfileSection from "./layout/ProfileSection";
import { useLocation } from "react-router-dom";
import Profile from "./pages/profiles/Profile";
import Courses from "./pages/courses/Courses";
import Community from "./pages/community/Community";
import Challenges from "./pages/challenges/Challenges";
import LeaderBoardPage from "./pages/leaderboard/LeaderBoardPage";
import Settings from "./pages/settings/Settings";

const Dashboard = () => {
  const location = useLocation();


  return (
    <>
      <SideBar />
      <div className={styles.main}>
        {location.pathname === "/dashboard" &&<>
        <NavBar />
        <WelcomeBanner />
        <div className={styles["content"]}>
          <div className={styles["left-content"]}>
            <div>
              <Ongoin />
              <RecomendedCourse />
            </div>

            <ProfileSection />
          </div>
        </div>
        </>}

        {location.pathname === "/dashboard/profile" &&
          <>
          <NavBar />
          <Profile />
          </>
        }

          {location.pathname === "/dashboard/courses" &&
          <>
          <NavBar />
          <Courses />
          </>
        }

          {location.pathname === "/dashboard/community" &&
          <>
          <NavBar />
          <Community />
          </>
        }

          {location.pathname === "/dashboard/challenges" &&
          <>
          <NavBar />
          <Challenges />
          </>
        }
        
           {location.pathname === "/dashboard/leaderboard" &&
          <>
          <NavBar />
          <LeaderBoardPage />
          </>
        }

           {location.pathname === "/dashboard/settings" &&
          <>
          <NavBar />
          <Settings />
          </>
        }
      </div>
    </>
  );
};

export default Dashboard;
