import { Link } from "react-router-dom";
import {
    FiArrowUpRight,
    FiInstagram,
    FiMail,
} from "react-icons/fi";

import "./Footer.css";


function Footer() {
    const currentYear = new Date().getFullYear();


    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    return (
        <footer className="footer">

            <div className="footer-container">

                <div className="footer-main">

                    <div className="footer-brand">

                        <Link
                            to="/"
                            className="footer-logo"
                            onClick={scrollToTop}
                        >
                            La Matera
                        </Link>

                        <p className="footer-description">
                            Una selección de productos para disfrutar
                            el mate como parte de todos los días.
                        </p>

                        <div className="footer-socials">
                            <a
                                href="#"
                                className="footer-social"
                                aria-label="Instagram"
                            >
                                <FiInstagram />
                            </a>

                            <a
                                href="mailto:info@lamatera.com"
                                className="footer-social"
                                aria-label="Enviar un email"
                            >
                                <FiMail />
                            </a>
                        </div>

                    </div>


                    <div className="footer-column">

                        <h3 className="footer-heading">
                            Comprar
                        </h3>

                        <Link
                            to="/categoria/mates"
                            className="footer-link"
                        >
                            Mates
                        </Link>

                        <Link
                            to="/categoria/termos"
                            className="footer-link"
                        >
                            Termos
                        </Link>

                        <Link
                            to="/categoria/accesorios"
                            className="footer-link"
                        >
                            Accesorios
                        </Link>

                        <Link
                            to="/"
                            className="footer-link"
                            onClick={scrollToTop}
                        >
                            Ver productos
                        </Link>

                    </div>


                    <div className="footer-column">

                        <h3 className="footer-heading">
                            Ayuda
                        </h3>

                        <a
                            href="mailto:info@lamatera.com"
                            className="footer-link"
                        >
                            Contacto
                        </a>

                        <span className="footer-link footer-link-disabled">
                            Envíos
                        </span>

                        <span className="footer-link footer-link-disabled">
                            Preguntas frecuentes
                        </span>

                    </div>


                    <div className="footer-column footer-contact-column">

                        <span className="footer-eyebrow">
                            ¿Tenés alguna consulta?
                        </span>

                        <a
                            href="mailto:info@lamatera.com"
                            className="footer-email"
                        >
                            info@lamatera.com
                            <FiArrowUpRight />
                        </a>

                        <p className="footer-contact-text">
                            Estamos para ayudarte con tu compra.
                        </p>

                    </div>

                </div>


                <div className="footer-bottom">

                    <p>
                        © {currentYear} La Matera.
                        Todos los derechos reservados.
                    </p>

                    <button
                        type="button"
                        className="footer-top-button"
                        onClick={scrollToTop}
                    >
                        Volver arriba
                        <FiArrowUpRight />
                    </button>

                </div>

            </div>

        </footer>
    );
}


export default Footer;