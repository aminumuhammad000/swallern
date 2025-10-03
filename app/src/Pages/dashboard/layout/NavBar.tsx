import { useState } from "react";
import styles from "../../../styles/dashboard/layout/NavBar.module.css";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import StarIcon from "@mui/icons-material/Star";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.topbar}>
      <TextField
        className={styles.search}
        placeholder="Search"
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <div className={styles.stats}>
        <span className={styles.iconContainer}>
          <StarIcon style={{ color: "#FFD700", verticalAlign: "middle" }} /> 2081
        </span>
        <span className={styles.iconContainer}>
          <WhatshotIcon style={{ color: "#FF5722", verticalAlign: "middle" }} /> 7
        </span>
        <span className={styles.iconContainer}>
          <FavoriteIcon style={{ color: "#E91E63", verticalAlign: "middle" }} /> 3
        </span>
        <span className={styles.iconContainer}>
          <NotificationsIcon style={{ color: "#5b67cf", verticalAlign: "middle" }} />
        </span>
        <span>
          <a href="profile.html" className={styles.profileLink}>
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhRV5VQUQVbik5_P7yOsSe8i2oS4wj90qqoMJ3CkVsUXw3lUTXnAy6rkyJLK3L_Eoq9wkoued-VKxvVvUgwU2T-WbR6k_iEx8AZTUjlAV5dQiRzG7e4MUBEwGbboieVuKrWGXU0nLrEt6l7cADMoyBz-nMcBNCN0QX9PdRQwOjAGLv8b_3rMGc2yX0dBLkK/s320/1747126702929.jfif"
              alt="Aliyu"
              className={styles.profileIcon}
            />
          </a>
        </span>
        <span
          className={styles.dropdown}
          onClick={() => setOpen((prev) => !prev)}
          style={{ cursor: "pointer" }}
        >
          <ArrowDropDownIcon />
          {open && (
            <div className={styles.dropdownMenu}>
              <Link to="/dashboard/profile" className={styles.Link}>
              <div className={styles.dropdownItem}>
               <AccountCircleIcon style={{ marginRight: "8px" }} /> Profile
              </div>
              </Link>
              <div className={styles.dropdownItem} style={{color: "red"}}>
                <LogoutIcon style={{ marginRight: "8px", color: "red"}} /> Logout
              </div>
            </div>
          )}
        </span>
      </div>
    </div>
  );
};

export default NavBar;
