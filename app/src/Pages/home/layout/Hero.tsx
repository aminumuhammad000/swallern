import style from "./Hero.module.css";
import user from "../../../assets/images/user.png";
import user2 from "../../../assets/images/user.png";
import user3 from "../../../assets/images/profile.png"
import aliyu from "../../../assets/images/aliyu.png"
import StarIcon from "@mui/icons-material/Star";

// import { use } from "react";

export const Hero = () => {
  return (
    <div className={style.Hero}>
      <div>
        <h1 className={style.title}>
          Learn Fast. Grow Wise.{" "}
          <span className={style.color}>Build What Matters</span>
        </h1>
        <p className={style.description}>
          Swallern is an empowering platform for young creators to gain
          real-world skills, collaborate with teams, and turn learning into
          action. with fun, purpose, and impact.
        </p>
        <div className={style.buttons}>
          <button className={style.primary}>Start Your Learning Journey</button>
          <button className={style.secondary}>Explore Swallern</button>
        </div>

        <div className={style.testimonials}>
          <div className={style.imagesContainer}>
            <img src={user3} alt="user profile" className={style.userImage} />
            <img src={user2} alt="user profile" className={style.userImage} />
            <img src={aliyu} alt="user profile" className={style.userImage} />
            <img src={user3} alt="user profile" className={style.userImage} />
            <img src={aliyu} alt="user profile" className={style.userImage} />
            <img src={user3} alt="user profile" className={style.userImage} />
            <button className={style.add}>+</button>
          </div>
          <div>
            <p>
              <div className={style.starContainer}>
                <StarIcon fontSize="small" style={{ color: "gold" }} />
                <StarIcon fontSize="small" style={{ color: "gold" }} />
                <StarIcon fontSize="small" style={{ color: "gold" }} />
                <StarIcon fontSize="small" style={{ color: "gold" }} />
                <StarIcon fontSize="small" style={{ color: "gold" }} />
                {/* <StarIcon fontSize="small" style={{ color: "gold" }} /> */}
                <span> (4.7)</span>
              </div>
            </p>
            <p className={style.reviewText}>200+ Reviews on our courses</p>
          </div>
        </div>
      </div>

      <div className={style.circleContainer}>
        <div className={style.circle}>
          <img src={user} alt="user image" className={style.image} />
        </div>
        <div className={style.courseBox}>
          <h2 className={style.courseNumber}>5+</h2>
          <p>Digital Courses</p>
        </div>

        <div className={style.courseCard}>
          <h3>Web Design Beginner Course</h3>
          <button className={style.join}>Join Now</button>
        </div>
      </div>
    </div>
  );
};
