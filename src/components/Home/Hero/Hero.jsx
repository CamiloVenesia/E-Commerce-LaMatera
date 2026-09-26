import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import "./Hero.css";

import heroImage from "../../../assets/hero-matera.jpg";

const Hero = () => {
  return (
    <section className="hero">

      <div className="hero-content">

        <span className="hero-tag">
          Mates · Termos · Accesorios
        </span>

        <h1>
          El mate,
          <br />
          llevado a otro nivel.
        </h1>

        <p>
          Productos seleccionados para acompañar tus momentos,
          desde la tradición y el diseño.
        </p>

        <div className="hero-actions">

          <Link to="/productos" className="hero-button">
            Ver productos
            <FiArrowRight />
          </Link>

          <Link to="/ofertas" className="hero-button-secondary">
            Ver ofertas
          </Link>

        </div>

      </div>


      <div className="hero-image">

        <img
          src={heroImage}
          alt="Mate artesanal La Matera"
        />

      </div>


    </section>
  );
};

export default Hero;