// import { useEffect, useState } from "react";
import styles from "./Team.module.css";
import profile from "../../../assets/images/profile.png";
import aliyu from "../../../assets/images/aliyu.png";
import ghali from "../../../assets/images/ghali.png";
import salafi from "../../../assets/images/salafi.jpeg";
import aisha from "../../../assets/images/aisha.png";
import abubakar from "../../../assets/images/abubakar.png";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";

type TeamMember = {
  profileImage: string;
  name: string;
  position: string;
  bio: string;
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
};

const team: TeamMember[] = [
  {
    profileImage: profile,
    name: "Aminu Muhammad",
    position: "Founder / Fullstack Developer",
    bio: "Visionary, builder, and the heartbeat of Swallern’s mission. Leads product direction and development with passion and precision.",
    social: {
      facebook: "https://facebook.com/aminu",
      instagram: "https://instagram.com/aminu",
      twitter: "https://twitter.com/aminu",
    },
  },
  {
    profileImage: aisha,
    name: "Aisha Muhammad Garba",
    position: "Project Manager",
    bio: "Strategic thinker who keeps the team aligned and focused. Expert in planning, coordination, and delivering projects on time.",
    social: {
      facebook: "https://facebook.com/aisha",
      instagram: "https://instagram.com/aisha",
      twitter: "https://twitter.com/aisha",
    },
  },
  {
    profileImage: aliyu,
    name: "Aliyu Usman",
    position: "Lead Developer",
    bio: "Driving backend architecture, database design, and scalable solutions with innovation, precision, and leadership.",
    social: {
      facebook: "https://facebook.com/aliyu",
      instagram: "https://www.instagram.com/itzhaydar2/",
      twitter: "https://x.com/itzhaydar",
    },
  },
  {
    profileImage: salafi,
    name: "Abdullahtif Yusuf",
    position: "Marketing Specialist",
    bio: "Creative storyteller driving Swallern’s brand voice. Passionate about connecting people to products that matter.",
    social: {
      facebook: "https://facebook.com/abdullahtif",
      instagram: "https://instagram.com/abdullahtif",
      twitter: "https://twitter.com/abdullahtif",
    },
  },
  {
    profileImage: profile,
    name: "Usman Umar",
    position: "Marketing Specialist / Frontend Developer",
    bio: "Blends creativity and code to craft engaging experiences. Skilled in both outreach and design-focused frontend development.",
    social: {
      facebook: "https://web.facebook.com/aliyu.usmanabdullahi.5",
      instagram: "https://instagram.com/usman",
      twitter: "https://twitter.com/usman",
    },
  },
  {
    profileImage: ghali,
    name: "Ghali Sani Muhamad",
    position: "UI/UX Designer",
    bio: "As the lead UI/UX Design team of the Swallern project, I design digital products with usability at their core, driven by a passion to make online skill learning intuitive and engaging. I am committed to using my design skills to improve user experiences and advance digital literacy.",
    social: {
      facebook: "https://facebook.com/ghali",
      instagram: "https://www.instagram.com/ghali_na_mahamman/",
      twitter: "https://x.com/ghali_s_/",
    },
  },
  {
    profileImage: abubakar,
    name: "Abubakar Ascap",
    position: "Social Media Manager",
    bio: "Drives engagement and builds communities around Swallern. Skilled at creating meaningful online conversations.",
    social: {
      facebook: "https://facebook.com/ascap",
      instagram: "https://instagram.com/ascap",
      twitter: "https://twitter.com/ascap",
    },
  },
  {
    profileImage: profile,
    name: "Mustapha Hussain",
    position: "Ui/UX Designer",
    bio: "Designs with empathy and clarity, turning vision into visual identity. Crafts user-friendly interfaces and strong brand presence.",
    social: {
      facebook: "https://facebook.com/ascap",
      instagram: "https://instagram.com/ascap",
      twitter: "https://twitter.com/ascap",
    },
  },
];

export const Team = () => {
  // ...existing code...

  return (
    <div className={styles.Team}>
      <div className={styles.pageTitle}>
        <div className={styles.textTitle}></div>
        Our Team
        <div className={styles.textTitle}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>The Energy Behind Swallern</h2>
          <p className={styles.description}>
            Swallern is more than a platform it’s a movement. And behind that
            movement is a team of builders, creators, learners, and leaders who
            believe in one thing.
          </p>
        </div>
      </div>

      {/* ✅ Team Grid for Desktop / Slider for Mobile */}
      <div
        className={styles.teamContainer}
      >
        {team.map((member, index) => (
          <div key={index} className={styles.memberCard}>
            <div className={styles.imageContainer}>
              <img
                src={member.profileImage}
                alt={`${member.name} profile`}
                className={styles.memberProfile}
              />
            </div>
            <h4 className={styles.name}>{member.name}</h4>
            <div className={styles.bioContainer}>
              <h5 className={styles.position}>{member.position}</h5>
              <p className={styles.bio}>{member.bio}</p>
              <div className={styles.socialMedia}>
                <a href={member.social.facebook} className={styles.link}>
                  <FacebookIcon className={styles.icon} />
                </a>
                <a href={member.social.instagram} className={styles.link}>
                  <InstagramIcon className={styles.icon} />
                </a>
                <a href={member.social.twitter} className={styles.link}>
                  <TwitterIcon className={styles.icon} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
