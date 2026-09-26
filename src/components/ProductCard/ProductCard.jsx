import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiShoppingCart } from "react-icons/fi";
import { CartContext } from "../../context/CartContext";
import Notification from "../Notification/Notification";
import "./ProductCard.css";

const ProductCard = ({ id, nombre, precio, precioAnterior, img, categoria, oferta, stock }) => {
    const navigate = useNavigate();
    const { addItem } = useContext(CartContext);
    const [showNotification, setShowNotification] = useState(false);

    const precioActual = Number(precio) || 0;
    const precioOriginal = Number(precioAnterior) || 0;
    const hasStock = Number(stock) > 0;
    const tieneDescuento = oferta && precioOriginal > precioActual;
    const porcentajeOferta = tieneDescuento ? Math.round(((precioOriginal - precioActual) / precioOriginal) * 100) : 0;
    const valorCuota = precioActual / 3;

    const formatPrice = (value, decimals = 0) => Number(value).toLocaleString("es-AR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });

    const handleCardClick = () => {
        navigate(`/producto/${id}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(`/producto/${id}`);
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!hasStock) return;
        addItem({ id, nombre, precio: precioActual, img, stock }, 1);
        setShowNotification(true);
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        navigate(`/producto/${id}`);
    };

    return (
        <>
            <article
                className={`product-card ${!hasStock ? "product-card-disabled" : ""}`}
                onClick={handleCardClick}
                onKeyDown={handleKeyDown}
                role="link"
                tabIndex={0}
            >
                <div className="product-card-image">
                    <img src={img} alt={nombre} className="product-card-img" loading="lazy" />

                    <div className="product-image-footer">
                        <div className="product-image-footer-left">
                            {tieneDescuento && (
                                <span className="product-discount">
                                    {porcentajeOferta}% OFF
                                </span>
                            )}

                            <div className="product-swatches" aria-hidden="true">
                                <span className="product-swatch product-swatch-dark"></span>
                                <span className="product-swatch product-swatch-green"></span>
                                <span className="product-swatch product-swatch-light"></span>
                            </div>
                        </div>

                        <span className={`product-stock-status ${hasStock ? "available" : "unavailable"}`}>
                            <span className="stock-dot"></span>
                            {hasStock ? "En stock" : "Sin stock"}
                        </span>
                    </div>
                </div>

                <div className="product-card-content">
                    <span className="product-category">{categoria}</span>

                    <h3 className="product-title">{nombre}</h3>

                    <div className="product-price-row">
                        <span className="product-price">${formatPrice(precioActual)}</span>

                        {tieneDescuento && (
                            <span className="product-old-price">${formatPrice(precioOriginal)}</span>
                        )}
                    </div>

                    <p className="product-installments">
                        3 cuotas sin interés de ${formatPrice(valorCuota, 2)}
                    </p>

                    <div className="product-card-actions">
                        <button
                            type="button"
                            className="product-cart-button"
                            onClick={handleAddToCart}
                            disabled={!hasStock}
                        >
                            <FiShoppingCart />
                            <span>{hasStock ? "Agregar al carrito" : "Sin stock"}</span>
                        </button>

                        <button
                            type="button"
                            className="product-view-button"
                            aria-label={`Ver ${nombre}`}
                            onClick={handleQuickView}
                        >
                            <FiEye />
                        </button>
                    </div>
                </div>
            </article>

            {showNotification && (
                <Notification
                    message="Producto agregado al carrito"
                    onClose={() => setShowNotification(false)}
                />
            )}
        </>
    );
};

export default ProductCard;