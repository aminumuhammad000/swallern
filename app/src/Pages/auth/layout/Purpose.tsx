// import React from 'react'
import styles from "./Purpose.module.css";
import { useDispatch } from "react-redux";
import { goToPage } from "../../../features/navigation/navigationSlice";
import { type AppDispatch } from "../../../store/store";

const Purpose = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className={styles.Purpose}>
      <h2 className={styles.title}>What do you want to achieve?</h2>
      <ul className={styles.navLink}>
        <li>
          <span>Learn a tech skill</span>
          <input type="checkbox" name="purpose" id="" />
        </li>
        <li>
          <span>Career Growth</span>
          <input type="checkbox" name="purpose" id="" />
        </li>
        <li>
          <span>Personal Development</span>
          <input type="checkbox" name="purpose" id="" />
        </li>
        <li>
          <span>Academic Learning</span>
          <input type="checkbox" name="purpose" id="" />
        </li>
        <li>
          <span>Build a Project</span>
          <input type="checkbox" name="purpose" id="" />
        </li>
        <li>
          <span>Curiosity/Fun</span>
          <input type="checkbox" name="purpose" id="" />
        </li>
      </ul>

      <button
        className={styles.button}
        onClick={() => dispatch(goToPage("interest"))}
      >
        Continue
      </button>
    </div>
  );
};

export default Purpose;
