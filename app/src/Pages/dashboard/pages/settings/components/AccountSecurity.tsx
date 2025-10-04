import styles from "../../../../../styles/dashboard/pages/settings/AcountSecurity.module.css"
import profile from "../../../../../assets/images/aminu.png"

const AccountSecurity = () => {
  return (
   <div className={styles.Profile}>
          <h4 className={styles.mainTitle}>Account Security</h4>
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
              <h4>Account Information</h4>
              <button className={styles.primary}>Update</button>
            </div>
            <table>
              <tr>
                <td>Email <span className={styles.verify}>Verified</span></td>
                <td className={styles.value}>aminumhammad00015@gmail.com</td>
              </tr>
              <tr>
                <td>Primary Phone Number <span className={styles.verify}>Verified</span></td>
                <td className={styles.value}>+2348100015498</td>
              </tr>
              <tr>
                <td>Secondary Phone Number</td>
                <td className={styles.value}>+2348100015488</td>
              </tr>

                <tr>
                <td>Password</td>
                <td className={styles.value}>*************</td>
              </tr>
            </table>
          </div>

          <div className={styles.otherInformation}>
            <div className={styles.otherHead}>
              <h4>Other Security</h4>
              <button className={styles.primary}>Update</button>
            </div>
            <table>
              <tr>
                <td>2-step verification <span className={styles.verify}>Enabled</span></td>
                {/* <td className={styles.value}>Nigeria</td> */}
                  <button className={styles.secondary}>Change</button>
              </tr>
              <tr>
                <td>Recovery Code</td>
                {/* <td className={styles.value}>Kano</td> */}
                  <button className={styles.secondary}>Generate New</button>
              </tr>
            </table>
          </div>
        </div>
  )
}

export default AccountSecurity
