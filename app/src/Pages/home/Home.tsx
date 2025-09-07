import { Hero } from "./layout/Hero";
import { Nav } from "./layout/Nav";
import style from "./Home.module.css";
import About from "./layout/About";
export const Home = () => {
  return (
    <div className={style.Home}>
      <Nav />
      <Hero />
      <About />
    </div>
  );
};
