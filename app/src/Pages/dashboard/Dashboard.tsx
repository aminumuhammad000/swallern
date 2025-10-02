import RecomendedCourse from "./layout/RecomendedCourse";
import styles from "../../styles/dashboard/dashboard.module.css";
import NavBar from "./layout/NavBar";
import Ongoin from "./layout/Ongoin";
import SideBar from "./layout/SideBar";
import WelcomeBanner from "./layout/WelcomeBanner";
import ProfileSection from "./layout/ProfileSection";

const Dashboard = () => {
  return (
    <>
      <SideBar />
      <div className={styles.main}>
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
        
      </div>
    </>
  );
};

export default Dashboard;
