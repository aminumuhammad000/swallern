import style from "./Nav.module.css";
import logo from "../../../assets/logo.png";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export const Nav = () => {
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (section: string) => {
    setActive(section);
    setMenuOpen(false); // close menu after click
  };

  return (
    <div className={style.Nav} id="flexSpaceBetween">
      {/* Logo */}
      <HashLink smooth to="/">
        <img src={logo} alt="logo of swallern" className={style.logo} />
      </HashLink>

      {/* Desktop Nav */}
      <ul id="flexSpaceBetween" className={style.navLinks}>
        <li
          id="mediumtext"
          className={active === "home" ? style.active : ""}
          onClick={() => setActive("home")}
        >
          <HashLink smooth to="/" className="link" id="link">
            Home
          </HashLink>
        </li>
        <li
          id="mediumtext"
          className={active === "about" ? style.active : ""}
          onClick={() => setActive("about")}
        >
          <HashLink smooth to="/#about" className="link" id="link">
            About us
          </HashLink>
        </li>
        <li
          id="mediumtext"
          className={active === "contact" ? style.active : ""}
          onClick={() => setActive("contact")}
        >
          <HashLink smooth to="/#contact" className="link" id="link">
            Contact us
          </HashLink>
        </li>
        <li
          id="mediumtext"
          className={active === "faqs" ? style.active : ""}
          onClick={() => setActive("faqs")}
        >
          <HashLink to="/#faqs" className="link" id="link">
            FAQs
          </HashLink>
        </li>
      </ul>

      {/* Desktop Button */}
      <button className={style.getStarted}>
        <Link to="/auth" className="link" id="link">
          Get Started Free
        </Link>
      </button>

      {/* Hamburger for mobile */}
      <div className={style.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <CloseIcon style={{color: "white"}}/> : <MenuIcon />}
      </div>

      {/* Fullscreen Mobile Menu */}
      {menuOpen && (
        <div className={style.mobileMenu}>
          <ul>
            <li onClick={() => handleNavClick("home")}>
              <HashLink smooth to="/" id="link" style={{color: "white"}}>Home</HashLink>
            </li>
            <li onClick={() => handleNavClick("about")}>
              <HashLink smooth to="/#about" id="link" style={{color: "white"}}>About us</HashLink>
            </li>
            <li onClick={() => handleNavClick("contact")}>
              <HashLink smooth to="/#contact" id="link" style={{color: "white"}}>Contact us</HashLink>
            </li>
            <li onClick={() => handleNavClick("faqs")}>
              <HashLink smooth to="/#faqs" id="link" style={{color: "white"}}>FAQs</HashLink>
            </li>
            <li>
              <Link to="/auth" className={style.getStartedMobile}>
                Get Started Free
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
