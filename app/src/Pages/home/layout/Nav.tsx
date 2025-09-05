import style from './Nav.module.css';
import logo from '../../../assets/logo.png'; // Assuming you have a logo image in this path
export const Nav = () => {
  return (
    <div className={style.Nav} id='flexSpaceBetween'>
        <img src={logo} alt="logo of swallern" className={style.logo}/>
        <ul id='flexSpaceBetween' className={style.navLinks}>
            <li id='mediumtext' className={style.active}>Home</li>
            <li id='mediumtext'>About us</li>
            <li id='mediumtext'>Contact us</li>
            <li id='mediumtext'>FAQs</li>
        </ul>

        <button className={style.getStarted}>Get Started Free</button>
    </div>
  )
}
