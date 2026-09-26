import { useContext } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiArrowRight, FiShoppingBag } from "react-icons/fi";

import { CartContext } from "../../context/CartContext";
import { formatPrice } from "../../formatPrice";
import Contador from "../Contador/Contador";

import "./Cart.css";


const Cart = () => {
    const {
        cart,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalQuantity,
        getCartTotal,
    } = useContext(CartContext);

    const totalQuantity = getTotalQuantity();
    const total = getCartTotal();


    if (cart.length === 0) {
        return (
            <div className="cart-empty">
                <span className="cart-empty-icon">
                    <FiShoppingBag />
                </span>

                <h1 className="cart-empty-title">
                    Tu carrito está vacío
                </h1>

                <p className="cart-empty-text">
                    Todavía no agregaste productos. Mirá lo que tenemos
                    para vos.
                </p>

                <Link to="/productos" className="cart-primary-btn">
                    Ver productos
                    <FiArrowRight />
                </Link>
            </div>
        );
    }


    return (
        <div className="cart-container">

            <header className="cart-header">
                <h1 className="cart-title">Carrito</h1>

                <p className="cart-count">
                    {totalQuantity}{" "}
                    {totalQuantity === 1 ? "producto" : "productos"}
                </p>
            </header>


            <div className="cart-layout">

                <ul className="cart-items">
                    {cart.map((item) => (
                        <li key={item.id} className="cart-item">

                            <Link
                                to={`/detalle/${item.id}`}
                                className="cart-item-image"
                            >
                                {item.img && (
                                    <img
                                        src={item.img}
                                        alt={item.nombre}
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                )}
                            </Link>


                            <div className="cart-item-info">
                                <Link
                                    to={`/detalle/${item.id}`}
                                    className="cart-item-name"
                                >
                                    {item.nombre}
                                </Link>

                                <span className="cart-item-price">
                                    {formatPrice(item.precio)}
                                </span>

                                <button
                                    type="button"
                                    className="cart-item-remove"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <FiTrash2 />
                                    Eliminar
                                </button>
                            </div>


                            <div className="cart-item-quantity">
                                <Contador
                                    initial={item.quantity}
                                    stock={item.stock}
                                    onCountChange={(quantity) =>
                                        updateQuantity(item.id, quantity)
                                    }
                                />
                            </div>


                            <span className="cart-item-subtotal">
                                {formatPrice(item.precio * item.quantity)}
                            </span>

                        </li>
                    ))}
                </ul>


                <aside className="cart-summary">
                    <h2 className="cart-summary-title">Resumen</h2>

                    <dl className="cart-summary-rows">
                        <div className="cart-summary-row">
                            <dt>Subtotal</dt>
                            <dd>{formatPrice(total)}</dd>
                        </div>

                        <div className="cart-summary-row">
                            <dt>Envío</dt>
                            <dd className="cart-summary-free">Gratis</dd>
                        </div>

                        <div className="cart-summary-row cart-summary-total">
                            <dt>Total</dt>
                            <dd>{formatPrice(total)}</dd>
                        </div>
                    </dl>

                    <Link to="/checkout" className="cart-primary-btn">
                        Continuar compra
                        <FiArrowRight />
                    </Link>

                    <Link to="/productos" className="cart-secondary-link">
                        Seguir comprando
                    </Link>

                    <button
                        type="button"
                        className="cart-clear-btn"
                        onClick={clearCart}
                    >
                        Vaciar carrito
                    </button>
                </aside>

            </div>
        </div>
    );
};


export default Cart;