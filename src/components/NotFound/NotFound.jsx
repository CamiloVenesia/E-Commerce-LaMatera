import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import "./NotFound.css";


function NotFound() {
    return (
        <div className="not-found">
            <span className="not-found-eyebrow">Error 404</span>

            <h1 className="not-found-title">
                Esta página no existe.
            </h1>

            <p className="not-found-text">
                Puede que el link esté mal escrito o que el producto ya
                no esté disponible.
            </p>

            <div className="not-found-actions">
                <Link to="/" className="not-found-btn not-found-btn-primary">
                    Ir al inicio
                    <FiArrowRight />
                </Link>

                <Link
                    to="/productos"
                    className="not-found-btn not-found-btn-secondary"
                >
                    Ver productos
                </Link>
            </div>
        </div>
    );
}


export default NotFound;