import styles from "../../../styles/dashboard/layout/Ongoin.module.css";
import ComputerIcon from "@mui/icons-material/Computer";

const Ongoin = () => {
  return (
    <div className={styles.box}>
      <h3>Ongoing Lessons</h3>
      <div className={styles.lesson}>
        <div className={styles.content}>
        <ComputerIcon style={{ fontSize: 40, color: "#ED673B" }} />
        <span>
          Web Development
          <br />
          <small>Build websites and web apps using code.</small>
        </span>
        <button>Resume</button>
        </div>
      
        <progress className={styles.progress} value={40} max={100}></progress>
      </div>
      
    </div>
  );
};

export default Ongoin;
