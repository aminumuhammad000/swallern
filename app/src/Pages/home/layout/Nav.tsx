import style from "./Nav.module.css";
import logo from "../../../assets/logo.png"; // Assuming you have a logo image in this path
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useState } from "react";
export const Nav = () => {
  const [active, setActive] = useState("home");
  return (
    <div className={style.Nav} id="flexSpaceBetween">
      <HashLink smooth to="/">
        <img src={logo} alt="logo of swallern" className={style.logo} />
      </HashLink>
      <ul id="flexSpaceBetween" className={style.navLinks}>
        <li
          id="mediumtext"
          className={active === "home" && style.active}
          onClick={() => setActive("home")}
        >
          <HashLink smooth to="/" id="link">
            Home
          </HashLink>
        </li>
        <li
          id="mediumtext"
          className={active === "about" && style.active}
          onClick={() => setActive("about")}
        >
          <HashLink smooth to="/#about" id="link">
            About us
          </HashLink>
        </li>
        <li
          id="mediumtext"
          className={active === "contact" && style.active}
          onClick={() => setActive("contact")}
        >
          <HashLink smooth to="/#contact" id="link">
            Contact us
          </HashLink>
        </li>
        <li
          id="mediumtext"
          className={active === "faqs" && style.active}
          onClick={() => setActive("faqs")}
        >
          <HashLink to="/#faqs" id="link">
            FAQs
          </HashLink>
        </li>
      </ul>

      <button className={style.getStarted}>
        <Link to="/auth" id="link">
          Get Started Free
        </Link>
      </button>
    </div>
  );
};
