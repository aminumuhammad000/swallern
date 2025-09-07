// import React from 'react'
import styles from "./Team.module.css";
import profile from "../../../assets/images/profile.png";
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
    profileImage: profile,
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
    profileImage: profile,
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
      facebook: "https://facebook.com/usman",
      instagram: "https://instagram.com/usman",
      twitter: "https://twitter.com/usman",
    },
  },
  {
    profileImage: profile,
    name: "Aliyu Usman",
    position: "Lead Developer",
    bio: "Architect of scalable systems and technical solutions. Guides the dev team to build robust and reliable products.",
    social: {
      facebook: "https://facebook.com/aliyu",
      instagram: "https://instagram.com/aliyu",
      twitter: "https://twitter.com/aliyu",
    },
  },
  {
    profileImage: profile,
    name: "Ghali Sani Muhamad",
    position: "Product / Brand Designer",
    bio: "Designs with empathy and clarity, turning vision into visual identity. Crafts user-friendly interfaces and strong brand presence.",
    social: {
      facebook: "https://facebook.com/ghali",
      instagram: "https://instagram.com/ghali",
      twitter: "https://twitter.com/ghali",
    },
  },
  {
    profileImage: profile,
    name: "Abubakar Ascap",
    position: "Social Media Manager",
    bio: "Drives engagement and builds communities around Swallern. Skilled at creating meaningful online conversations.",
    social: {
      facebook: "https://facebook.com/ascap",
      instagram: "https://instagram.com/ascap",
      twitter: "https://twitter.com/ascap",
    },
  },
];

export const Team = () => {
  return (
    <div className={styles.Team}>
      <div className={styles.pageTitle}>
        <div className={styles.textTitle}></div>
        Our Team
        <div className={styles.textTitle}></div>
      </div>
      <div className={styles.decoration}></div>
      <div className={styles.decoration2}></div>
      <div className={styles.decoration3}></div>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>The Energy Behind Swallern</h2>
          <p className={styles.description}>
            Swallern is more than a platform it’s a movement. And behind that
            movement is a team of builders, creators, learners, and leaders who
            believe in one thing
          </p>
        </div>
      </div>

      <div className={styles.teamContainer}>
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
