// import React from "react";
import styles from "./Experience.module.css";
import { useDispatch } from "react-redux";
import { goToPage } from "../../../features/navigation/navigationSlice";
import { type AppDispatch } from "../../../store/store";

const Experience = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className={styles.Experience}>
      <h2 className={styles.title}>What’s your current experience?</h2>
      <ul className={styles.level}>
        <li>
          <h4>Beginner</h4>
          <input type="radio" name="experience" id="experience" />
        </li>
        <li>
          <h4>Intermediate</h4>
          <input type="radio" name="experience" id="experience" />
        </li>
        <li>
          <h4>Advanced</h4>
          <input type="radio" name="experience" id="experience" />
        </li>
      </ul>

      <button
        className={styles.button}
        onClick={() => dispatch(goToPage("register"))}
      >
        Continue
      </button>
    </div>
  );
};

export default Experience;
