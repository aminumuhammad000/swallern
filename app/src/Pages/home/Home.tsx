import { Hero } from "./layout/Hero";
import { Nav } from "./layout/Nav";
import style from "./Home.module.css";
import About from "./layout/About";
import { Features } from "./layout/Features";
import { Team } from "./layout/Team";
import { Contact } from "./layout/Contact";
export const Home = () => {
  return (
    <div className={style.Home}>
      <Nav />
      <Hero />
      <About />
      <Features />
      <Team />
      <Contact />
    </div>
  );
};
