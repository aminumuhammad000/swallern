// import React from 'react'
import styles from "../../../../../styles/dashboard/pages/settings/Notification.module.css";

const NotificationSettings = () => {
  return (
    <div className={styles.Profile}>
          <h4 className={styles.mainTitle}>Notification Settings</h4>
          <p className={styles.description}>We May Still  send you a notification about you account outside of your notification settings</p>
        
          <div className={styles.main}>
          <div className={styles.personalInformation}>
            <div className={styles.personalHead}>
              <h4>Enable Desktop Notification</h4>
              <button className={styles.primary}></button>
            </div>
            <p className={styles.text}>Get pop-up alerts directly on your computer, even when you’re not on Swallern.</p>
          </div>

              <div className={styles.personalInformation}>
            <div className={styles.personalHead}>
              <h4>Enable Email Notification</h4>
              <button className={styles.primary}></button>
            </div>
            <p className={styles.text}>Receive important s and reminders straight to your inbox</p>
          </div>

              <div className={styles.personalInformation}>
            <div className={styles.personalHead}>
              <h4>Enable Notification Sound</h4>
              <button className={styles.primary}></button>
            </div>
            <p className={styles.text}>Play a sound whenever you receive a new alert or message.</p>
          </div>

              <div className={styles.personalInformation}>
            <div className={styles.personalHead}>
              <h4>Announcement & Updates</h4>
              <button className={styles.primary}></button>
            </div>
          </div>

              <div className={styles.personalInformation}>
            <div className={styles.personalHead}>
              <h4>Push Notification Time-out</h4>
            </div>
         <select name="time" id="time" className={styles.select}>
            <option value="5s">5 seconds</option>
            <option value="10s">10 seconds</option>
            <option value="15s">15 seconds</option>
            <option value="20s">20 seconds</option>
            <option value="30s">30 seconds</option>
         </select>
          </div>
          </div>
        </div>
  )
}

export default NotificationSettings
