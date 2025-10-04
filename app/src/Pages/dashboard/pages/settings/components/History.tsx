// import React from 'react'
import styles from "../../../../../styles/dashboard/pages/settings/History.module.css"
const History = () => {
  return (
    <div className={styles.Profile}>
          <h4 className={styles.mainTitle}>Activity History</h4>
           
          <div className={styles.main}>
             <ul className={styles.historyNav}>
                <li className={styles.active}>All</li>
                <li>Recent</li>
            </ul>
          <div className={styles.personalInformation} style={{backgroundColor: "#ed673b50"}}>
            <div className={styles.personalHead}>
              <h5>2025-08-09 | 14:32</h5>
              <p className={styles.description}>Created account on Swallern.</p>
            </div>
            <button className={styles.primary}>Delete</button>
          </div>

               <div className={styles.personalInformation} style={{backgroundColor: "#d1a69734"}}>
            <div className={styles.personalHead}>
              <h5>2025-08-09 | 14:32</h5>
              <p className={styles.description}>Completed first course: Intro to Web Development.</p>
            </div>
            <button className={styles.primary}>Delete</button>
          </div>

               <div className={styles.personalInformation} style={{backgroundColor: "#00800034"}}>
            <div className={styles.personalHead}>
              <h5>2025-08-09 | 14:32</h5>
              <p className={styles.description}>Joined Web Developers Hub community.</p>
            </div>
            <button className={styles.primary}>Delete</button>
          </div>

               <div className={styles.personalInformation} style={{backgroundColor: "#FFFF0034"}}>
            <div className={styles.personalHead}>
              <h5>2025-08-09 | 14:32</h5>
              <p className={styles.description}>Changed account password.</p>
            </div>
            <button className={styles.primary}>Delete</button>
          </div>

               <div className={styles.personalInformation} style={{backgroundColor: "#FFA50034"}}>
            <div className={styles.personalHead}>
              <h5>2025-08-09 | 14:32</h5>
              <p className={styles.description}>Earned Golden Flight rank with 1,000 XP.</p>
            </div>
            <button className={styles.primary}>Delete</button>
          </div>

               <div className={styles.personalInformation} style={{backgroundColor: "#0000FF34"}}>
            <div className={styles.personalHead}>
              <h5>2025-08-09 | 14:32</h5>
              <p className={styles.description}>Created account on Swallern.</p>
            </div>
            <button className={styles.primary}>Delete</button>
          </div>


          </div>
        </div>
  )
}

export default History
