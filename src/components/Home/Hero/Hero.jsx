import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import "./Hero.css";

import bannerHome from "../../../assets/banner-home.jpg";


const Hero = () => {

    return (

        <section
            className="hero"
            style={{
                backgroundImage: `url(${bannerHome})`
            }}
        >

            <div className="hero-overlay" />

            <div className="hero-content">

                <div className="hero-tag">

                    <span className="hero-tag-line" />

                    <span>
                        Mates · Termos · Accesorios
                    </span>

                </div>


                <h1>
                    El mate,
                    <br />
                    llevado a otro nivel.
                </h1>


                <p>
                    Productos seleccionados para acompañar tus mejores
                    momentos, desde la tradición y el diseño.
                </p>


                <div className="hero-actions">

                    <Link
                        to="/productos"
                        className="hero-button"
                    >
                        Ver productos

                        <FiArrowRight />

                    </Link>


                    <Link
                        to="/productos?oferta=true"
                        className="hero-button-secondary"
                    >
                        Ver ofertas
                    </Link>

                </div>

            </div>

        </section>

    );

};


export default Hero;