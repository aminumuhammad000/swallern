import styles from "../../../styles/dashboard/layout/ProfileSection.module.css";
const ProfileSection = () => {
  return (
    <div className={styles.container}>
        <div className={styles.sectionHeader}>
            <p className={styles.sectionTitle}>Explore</p>
            <p className={styles.categoryTitle}>Challenges</p>
            <div className={styles.Challengescontainer}>
                <div className={styles.challenge} style={{backgroundColor: "#ed673b9f"}}>
                    <h3 className={styles.icon} style={{backgroundColor: "#ed673b"}}>1</h3>
                    <div>
                    <p className={styles.description}>Complete 3 Lessons Today</p>
                    <div className={styles.details}>
                         <span className={styles.small}>20 XP</span>
                        <span className={styles.small}>24h</span>
                    </div>
                    </div>
                </div>

                <div className={styles.challenge} style={{backgroundColor: "#5C7ECA9f"}}>
                    <h3 className={styles.icon} style={{backgroundColor: "#5C7ECA"}}>1</h3>
                    <div>
                    <p className={styles.description}>Complete 3 Lessons Today</p>
                    <div className={styles.details}>
                        <span className={styles.small}>20 XP</span>
                        <span className={styles.small}>24h</span>
                    </div>
                    </div>
                </div>

                <div className={styles.challenge} style={{backgroundColor: "#0080009f"}}>
                    <h3 className={styles.icon} style={{backgroundColor: "#008000"}}>1</h3>
                    <div>
                    <p className={styles.description}>Complete 3 Lessons Today</p>
                    <div className={styles.details}>
                        <span className={styles.small}>20 XP</span>
                        <span className={styles.small}>24h</span>
                    </div>
                    </div>
                </div>
                <p className={styles.seeMore}>Explore more </p>
            </div>
            <p className={styles.categoryTitle}>Communities</p>
            <div className={styles.Communitiescontainer}>
                <div className={styles.community}>
                  <div>
                    <h5 className={styles.title}>Web Developers Hub</h5>
                    <span className={styles.small}>1,245 members</span>
                </div>
                    <button className={styles.joinTeam}>join</button>
                </div>
                 <div className={styles.community}>
                  <div>
                    <h5 className={styles.title}>Web Developers Hub</h5>
                    
                    <span className={styles.small}>1,245 members</span>
                    </div>

                    <button className={styles.joinTeam}>join</button>
                </div>
                
            </div>
        </div>
    <div className={styles.profile}>
      <img
        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhRV5VQUQVbik5_P7yOsSe8i2oS4wj90qqoMJ3CkVsUXw3lUTXnAy6rkyJLK3L_Eoq9wkoued-VKxvVvUgwU2T-WbR6k_iEx8AZTUjlAV5dQiRzG7e4MUBEwGbboieVuKrWGXU0nLrEt6l7cADMoyBz-nMcBNCN0QX9PdRQwOjAGLv8b_3rMGc2yX0dBLkK/s320/1747126702929.jfif"
        alt="Aliyu"
        className={styles.avatar}
      />
      <h4 className={styles.name}>Aliyu Usman</h4>
      <p className={styles.skill}>Backend Engineer</p>
      <button className={styles.viewProfile}>View Profile</button>
      <div className={styles.connections}>
        <div>
          <strong className={styles.value}>200</strong>
      
          <span className={styles.cName}>Connections</span>
        </div>
        <div>
          <strong className={styles.value}>5</strong>
  
          <span className={styles.cName}> Level </span>
        </div>
        <div>
          <strong className={styles.value}>10</strong>
    
          <span className={styles.cName}>Courses</span>
        </div>
      </div>
      <p className={styles.bio}>
        PHP & SQL specialist, with experience in Node.js and Python.
      </p>
    </div>
    </div>
  );
};

export default ProfileSection;
