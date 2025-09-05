import { Hero } from "./layout/Hero";
import { Nav } from "./layout/Nav";
import style from "./Home.module.css";
export const Home = () => {
  return (
    <div className={style.Home}>
      <Nav />
      <Hero />
    </div>
  );
};
