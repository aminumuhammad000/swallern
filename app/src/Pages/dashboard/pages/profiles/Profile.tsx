// import React from 'react'
import styles from "../../../../styles/dashboard/pages/profiles/Profile.module.css";
import profile from "../../../../assets/images/aminu.png";
import { useState } from "react";
import AccountSecurity from "../settings/components/AccountSecurity";
import NotificationSettings from "../settings/components/NotificationSettings";
import LearningStats from "../settings/components/LearningStats";
import History from "../settings/components/History";

const Profile = () => {
  const [active, setActive] = useState("profile");

  const handleClickNav = (e: any) => {
    setActive(e);
  };
  return (
    <div className={styles.Profile}>
      <h1 className={styles.title}>Account Settings</h1>
      <div className={styles.mainContainer}>
        <div className={styles.side}>
          <ul>
            <li
              className={active === "profile" && styles.active}
              onClick={() => handleClickNav("profile")}
            >
              My Profile
            </li>
            <li
              className={active === "Security" && styles.active}
              onClick={() => handleClickNav("Security")}
            >
              Security
            </li>
            <li
              className={active === "notification" && styles.active}
              onClick={() => handleClickNav("notification")}
            >
              Notification
            </li>
            <li
              className={active === "history" && styles.active}
              onClick={() => handleClickNav("history")}
            >
              Activity History
            </li>
            <li
              className={active === "stats" && styles.active}
              onClick={() => handleClickNav("stats")}
            >
              Learning Stats
            </li>
            <li
              className={active === "billing" && styles.active}
              onClick={() => handleClickNav("billing")}
            >
              Billing
            </li>
            <li id="delete" onClick={() => handleClickNav("delete")}>
              Delete Account
            </li>
          </ul>
        </div>

        {active === "profile" && (
          <div className={styles.main}>
            <h4 className={styles.mainTitle}>My Profile</h4>
            <div className={styles.profileCard}>
              <div className={styles.details}>
                <img src={profile} alt="profile" />
                <div>
                  <h4 className={styles.name}>Aminu Muhammad</h4>
                  <p className={styles.username}>@aminu_amee</p>
                </div>
              </div>

              <button className={styles.primary}>Update</button>
            </div>

            <div className={styles.personalInformation}>
              <div className={styles.personalHead}>
                <h4>Personal Information</h4>
                <button className={styles.primary}>Update</button>
              </div>
              <table>
                <tr>
                  <td>Full Name</td>
                  <td className={styles.value}>Aminu Muhammad</td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td className={styles.value}>Male</td>
                </tr>
                <tr>
                  <td>Date of Birth</td>
                  <td className={styles.value}>01/jan/2002</td>
                </tr>
              </table>
            </div>

            <div className={styles.otherInformation}>
              <div className={styles.otherHead}>
                <h4>Other Information</h4>
                <button className={styles.primary}>Update</button>
              </div>
              <table>
                <tr>
                  <td>Nationality</td>
                  <td className={styles.value}>Nigeria</td>
                </tr>
                <tr>
                  <td>City</td>
                  <td className={styles.value}>Kano</td>
                </tr>
                <tr>
                  <td>Address</td>
                  <td className={styles.value}>Zoo Road</td>
                </tr>
                <tr>
                  <td>Short Bio</td>
                </tr>
                <p className={styles.bio}>
                  Loves turning ideas into beautiful, functional web
                  experiences. Always exploring new tools, learning fast, and
                  sharing tips with the community.
                </p>
              </table>
            </div>
          </div>
        )}

        {active === "Security" && <>
          <AccountSecurity />

      </>}

         {active === "notification" && <>
          <NotificationSettings />
      </>}

         {active === "history" && <>
          <History />
      </>}

         {active === "stats" && <>
          <LearningStats />
      </>}


         {active === "billing" && <>
          <h1>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Mollitia praesentium assumenda laudantium quam nostrum. Doloremque error, tempora voluptatem nobis quis aliquid ex repudiandae velit unde explicabo perferendis sapiente, non amet?</h1>
      </>}

          {active === "delete" && <>
          <h1>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Mollitia praesentium assumenda laudantium quam nostrum. Doloremque error, tempora voluptatem nobis quis aliquid ex repudiandae velit unde explicabo perferendis sapiente, non amet?</h1>
      </>}
      </div>

      
    </div>
  );
};

export default Profile;
