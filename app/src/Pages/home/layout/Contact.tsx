// import React from "react";
import styles from "./Contact.module.css";

// ✅ Material Icons
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

export const Contact = () => {
  return (
    <div className={styles.Contact} id="contact">
      <div className={styles.pageTitle}>
        <div className={styles.textTitle}></div>
        Contact Us
        <div className={styles.textTitle}></div>
      </div>

      <div className={styles.titleContainer}>
        <h2 className={styles.title}>Get in Touch</h2>
        <p className={styles.description}>
          We’d love to hear from you whether you have a question, feedback,
          partnership idea, or just want to say hi.
        </p>
      </div>

      <div className={styles.container}>
        {/* Left Section */}
        <div className={styles.left}>
          <h2>contact details</h2>
          <p>Have a question? call us or email us we're happy to help!</p>

          <div className={styles.contactItem}>
            <EmailIcon className={styles.icon} />
            <span>swallern@gmail.com.com</span>
          </div>

          <div className={styles.contactItem}>
            <PhoneIcon className={styles.icon} />
            <span>+2348100015498</span>
          </div>

          <div className={styles.address}>
            {/* No. 14 Innovation Hub Road,
            <br />
            Abuja, Nigeria */}
          </div>

          <div className={styles.socials}>
            <a href="https://www.facebook.com/61552012307241/posts/1059828829023223/?substory_index=1059828829023223&mibextid=rS40aB7S9Ucbxw6v" target="blank" style={{textDecoration: "none", color: "white"}}><FacebookIcon /></a>
            <InstagramIcon />
            <TwitterIcon />
          </div>
        </div>

        {/* Right Section */}
        <div className={styles.right}>
          <form>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input type="text" placeholder="Enter your name" />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input type="email" placeholder="enter your email" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Subject</label>
              <input
                type="text"
                placeholder="write subject here"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Message</label>
              <textarea placeholder="enter the message here"></textarea>
            </div>

            <button type="submit" className={styles.button}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
