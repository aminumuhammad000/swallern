// import React from 'react'
import styles from "./Footer.module.css";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";

export const Footer = () => {
  return (
    <div className={styles.Footer}>
      <div className={styles.container}>
        <div className={styles.contact}>
          <h3>contact details</h3>
          <p>Have a question? call us or email us we're happy to help!</p>

          <a href="#" className={styles.a}>
            hello@swallern.com
          </a>
          <a href="#" className={styles.a}>
            08100015498
          </a>
          <a href="#" className={styles.a}>
            No. 14 Innovation Hub Road, Abuja, Nigeria
          </a>
        </div>

        <div className={styles.Link}>
          <h4>Usefull Link</h4>
          <ul>
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
            <li>
              <a href="#">FAQs</a>
            </li>
          </ul>
        </div>

        <div className={styles.follow}>
          <h4>Follow Us</h4>
          <div className={styles.socialMedia}>
            <a href="#" className={styles.link}>
              <FacebookIcon className={styles.icon} />
            </a>
            <a href="#" className={styles.link}>
              <InstagramIcon className={styles.icon} />
            </a>
            <a href="#" className={styles.link}>
              <TwitterIcon className={styles.icon} />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.buttom}>
        <p>© 2025 Swallern Learn Fast. Grow Wise. All rights reserved.</p>

        <ul className={styles.nav}>
          <li>
            <a href="#">Privacy</a>
          </li>
          <li>
            <a href="#">Term of Services</a>
          </li>
          <li>
            <a href="#">Site Map</a>
          </li>
        </ul>
      </div>
    </div>
  );
};
