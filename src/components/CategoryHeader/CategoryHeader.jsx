import { FiCreditCard, FiLock, FiStar, FiTruck, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";

import fondoMates from "../../assets/fondo-mates.jpg";
import fondoTermos from "../../assets/fondo-termos.jpg";
import fondoAccesorios from "../../assets/fondo-accesorios.jpg";
import fondoProductos from "../../assets/fondo-productos.jpg";

import "./CategoryHeader.css";

const CategoryHeader = ({ categoria, oferta = false }) => {
    const data = {
        mates: {
            title: "Mates",
            text: "Tradición, diseño y calidad en cada detalle. Descubrí nuestra selección de mates artesanales para acompañar tus mejores momentos.",
            image: fondoMates
        },
        termos: {
            title: "Termos",
            text: "Diseños pensados para conservar la temperatura ideal y acompañarte durante todo el día, estés donde estés.",
            image: fondoTermos
        },
        accesorios: {
            title: "Accesorios",
            text: "Todo lo necesario para completar tu equipo matero y disfrutar cada momento con comodidad y estilo.",
            image: fondoAccesorios
        },
        ofertas: {
            title: "Ofertas",
            text: "Oportunidades especiales para encontrar tus productos favoritos de La Matera a un precio especial.",
            image: fondoProductos
        }
    };

    const key = oferta ? "ofertas" : categoria;

    const info = data[key] || {
        title: "Todos los productos",
        text: "Descubrí nuestra selección de mates, termos y accesorios elegidos para acompañar tus mejores momentos.",
        image: fondoProductos
    };

    return (
        <section className="category-header">
            <div className="category-hero">
                <div className="category-breadcrumb" aria-label="Migas de pan">
                    <Link to="/">
                        <FiHome />
                        Inicio
                    </Link>

                    <span aria-hidden="true">›</span>

                    <span>{info.title}</span>
                </div>

                <div className="category-hero-image">
                    <img
                        src={info.image}
                        alt={info.title}
                    />
                </div>

                <div className="category-hero-content">
                    <span className="category-eyebrow">
                        La Matera
                    </span>

                    <h1>{info.title}</h1>

                    <p>{info.text}</p>

                    <div className="category-benefits">
                        <div className="category-benefit">
                            <FiTruck />
                            <div>
                                <strong>Envíos</strong>
                                <span>A todo el país</span>
                            </div>
                        </div>

                        <div className="category-benefit">
                            <FiCreditCard />
                            <div>
                                <strong>Cuotas</strong>
                                <span>Sin interés</span>
                            </div>
                        </div>

                        <div className="category-benefit">
                            <FiLock />
                            <div>
                                <strong>Compra</strong>
                                <span>Segura</span>
                            </div>
                        </div>

                        <div className="category-benefit">
                            <FiStar />
                            <div>
                                <strong>Ofertas</strong>
                                <span>Exclusivas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryHeader;
