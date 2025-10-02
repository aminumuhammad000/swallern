import style from "./Hero.module.css";
import user from "../../../assets/images/user.png";
import aminu from "../../../assets/images/aminu.png";
import aisha from "../../../assets/images/aisha.png"
import aliyu from "../../../assets/images/aliyu.png"
import usman from "../../../assets/images/usman.png"
import abubakar from "../../../assets/images/abubakar.png";
import mustapha from "../../../assets/images/muste.png"
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
            <img src={mustapha} alt="user profile" className={style.userImage} style={{zIndex: "10"}}/>
            <img src={abubakar} alt="user profile" className={style.userImage} style={{zIndex: "9"}}/>
            <img src={usman} alt="user profile" className={style.userImage} style={{zIndex: "8"}}/>
            <img src={aisha} alt="user profile" className={style.userImage} style={{zIndex: "7"}}/>
            <img src={aliyu} alt="user profile" className={style.userImage} style={{zIndex: "6"}}/>
            <img src={aminu} alt="user profile" className={style.userImage} style={{zIndex: "5"}}/>
            <button className={style.add} style={{zIndex: "10"}}>+</button>
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
