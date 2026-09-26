import { Link } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";
import { useContext } from "react";

import { CartContext } from "../../context/CartContext";

import "./CartWidget.css";


function CartWidget() {
    const { getTotalQuantity } = useContext(CartContext);

    const quantity = getTotalQuantity();


    return (
        <Link
            to="/cart"
            className="cart-widget-link"
            aria-label={
                quantity > 0
                    ? `Carrito con ${quantity} productos`
                    : "Carrito vacío"
            }
        >
            <span className="cart-widget-container">
                <FiShoppingBag className="nav-cart" />

                {quantity > 0 && (
                    <span className="cart-widget-counter">
                        {quantity > 99 ? "99+" : quantity}
                    </span>
                )}
            </span>
        </Link>
    );
}


export default CartWidget;