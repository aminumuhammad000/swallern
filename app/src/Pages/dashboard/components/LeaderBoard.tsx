import styles from "../../../styles/dashboard/components/LeaderBoard.module.css";
import StarIcon from "@mui/icons-material/Star";
import profile from "../../../assets/images/profile.jfif"


const LeaderBoard = () => {
  const leaders = [
    { name: "Aminu", points: 1098, rank: 3, color: "#F15229", height: "50px" }, // tallest
    { name: "Aminu", points: 2022, rank: 2, color: "#50B848", height: "65px" }, // medium
    { name: "Aminu", points: 2087, rank: 1, color: "#4A90E2", height: "80px" }, // shortest
  ];

  return (
    <div className={styles.leaderboardCard}>
      <div className={styles.title}>
        <h3>LeaderBoard</h3>
      </div>
      <div  className={styles.pointsContainer}>
      {leaders.map((leader, index) => (
        <ul key={index}>
          <li key={index} className={styles.points} style={{backgroundColor: leader.color}}>  <StarIcon key={index} style={{ color: "gold", fontSize: 20 }} /> {leader.points}</li>
        </ul>
      ))}
      </div>

      <div className={styles.leaderContainer}>
        {leaders.map((leader, index) => <div className={styles.leader} key={index}>
          <img src={profile} alt="" className={styles.profile}/>
          <p className={styles.name}><StarIcon key={index} style={{ color: "gold", fontSize: 16 }} />{leader.name}<StarIcon key={index} style={{ color: "gold", fontSize: 16 }} /></p>
          <div className={styles.rankContainer} style={{ backgroundColor: leader.color, height: leader.height }}>
            <span>{leader.rank}</span>
          </div>
        </div>)}
      </div>
    </div>
  );
};

export default LeaderBoard;
