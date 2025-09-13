// Interest.tsx
import React from "react";
import styles from "./Interest.module.css";
import {
  Language,
  PhoneIphone,
  BarChart,
  Memory,
  Brush,
  Security,
  Cloud,
  Campaign,
  Token,
  SmartToy,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { goToPage } from "../../../features/navigation/navigationSlice";
import { type AppDispatch } from "../../../store/store";

type Course = {
  title: string;
  description: string;
  icon: React.ElementType;
};

const courses: Course[] = [
  {
    title: "Web Development",
    description: "Build modern websites and apps.",
    icon: Language,
  },
  {
    title: "Mobile App Development",
    description: "Create Android & iOS apps.",
    icon: PhoneIphone,
  },
  {
    title: "Data Science",
    description: "Analyze data for insights.",
    icon: BarChart,
  },
  {
    title: "Machine Learning",
    description: "Train models to make predictions.",
    icon: Memory,
  },
  {
    title: "UI/UX Design",
    description: "Design user-friendly interfaces.",
    icon: Brush,
  },
  {
    title: "Cybersecurity",
    description: "Protect systems from attacks.",
    icon: Security,
  },
  {
    title: "Cloud Computing",
    description: "Deploy apps on the cloud.",
    icon: Cloud,
  },
  {
    title: "Digital Marketing",
    description: "Promote brands online.",
    icon: Campaign,
  },
  {
    title: "Blockchain",
    description: "Build decentralized apps.",
    icon: Token,
  },
  {
    title: "AI Engineering",
    description: "Develop intelligent systems.",
    icon: SmartToy,
  },
];

const Interest = () => {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className={styles.Interest}>
      <h2 className={styles.title}>Pick Your Interests</h2>
      <p className={styles.description}>
        Choose the skills you’re most excited to learn. This helps Swallern
        personalize your learning path and recommend the right courses for you.
      </p>
      <p className={styles.note}>
        <span></span>You can select more than one!
      </p>

      <ul className={styles.courses}>
        {courses.map((course, index) => {
          const Icon = course.icon;
          return (
            <li key={index} className={styles.courseCard}>
              <div className={styles.titleContainer}>
                <Icon className={styles.icon} />

                <div>
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseDescription}>
                    {course.description}
                  </p>
                </div>
              </div>
              <input type="checkbox" name="course" id="course" />
            </li>
          );
        })}
      </ul>

      <button
        className={styles.button}
        onClick={() => dispatch(goToPage("experience"))}
      >
        Continue
      </button>
    </div>
  );
};

export default Interest;
