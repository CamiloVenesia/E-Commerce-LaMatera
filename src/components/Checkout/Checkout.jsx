import { useState, useContext } from "react";

import { Link } from "react-router-dom";

import {
    collection,
    doc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";

import { FiCheck } from "react-icons/fi";



import { CartContext } from "../../context/CartContext";

import { db } from "../../firebaseConfig";

import { formatPrice } from "../../formatPrice";



import "./Checkout.css";





class SinStockError extends Error {

    constructor(productos) {

        super("Sin stock");

        this.productos = productos;

    }

}





function Field({ label, name, type, value, onChange, error, autoComplete }) {

    return (

        <label className="checkout-field">

            <span className="checkout-label">{label}</span>



            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                aria-invalid={Boolean(error)}
                className={error ? "invalid" : ""}
                required
            />



            {error && (
                <span className="checkout-field-error">{error}</span>
            )}

        </label>

    );

}





function Checkout() {

    const { cart, clearCart, getCartTotal } = useContext(CartContext);



    const [order, setOrder] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);

    const [errors, setErrors] = useState({});



    const [formData, setFormData] = useState({

        name: "",

        email: "",

        confirmEmail: "",

        phone: "",

        address: "",

    });





    const handleChange = (e) => {

        const { name, value } = e.target;



        setFormData((prev) => ({ ...prev, [name]: value }));

        setErrors((prev) => ({ ...prev, [name]: undefined }));

    };





    const validate = () => {

        const newErrors = {};



        if (
            formData.email.trim().toLowerCase() !==
            formData.confirmEmail.trim().toLowerCase()
        ) {

            newErrors.confirmEmail = "Los emails no coinciden.";

        }



        if (!/^[0-9+\s()-]{6,}$/.test(formData.phone.trim())) {

            newErrors.phone = "Ingresá un teléfono válido.";

        }



        return newErrors;

    };





    const handleSubmit = async (e) => {

        e.preventDefault();

        setError(null);



        const validationErrors = validate();



        if (Object.keys(validationErrors).length > 0) {

            setErrors(validationErrors);

            return;

        }



        setLoading(true);



        try {

            const total = getCartTotal();

            const orderRef = doc(collection(db, "ordenes"));



            await runTransaction(db, async (transaction) => {

                // 1. Leer primero todos los productos.

                // Firestore exige que las lecturas de la transacción

                // ocurran antes de las escrituras.

                const lecturas = [];



                for (const item of cart) {

                    const productoRef = doc(
                        db,
                        "productos",
                        item.id
                    );



                    const itemRef = doc(
                        db,
                        "ordenes",
                        orderRef.id,
                        "items",
                        item.id
                    );



                    const snap = await transaction.get(productoRef);



                    lecturas.push({
                        item,
                        productoRef,
                        itemRef,
                        snap,
                    });

                }



                // 2. Verificar stock real en Firestore.

                const sinStock = lecturas.filter(

                    ({ item, snap }) =>
                        !snap.exists() ||
                        !Number.isInteger(snap.data().stock) ||
                        snap.data().stock < item.quantity

                );



                if (sinStock.length > 0) {

                    throw new SinStockError(

                        sinStock.map(({ item }) => item.nombre)

                    );

                }



                // 3. Crear la orden principal.

                // No guardamos un total enviado por el cliente.

                // Los importes de cada producto se guardan en sus

                // respectivos documentos de items.

                transaction.set(orderRef, {

                    buyer: {

                        name: formData.name.trim(),

                        email: formData.email.trim().toLowerCase(),

                        phone: formData.phone.trim(),

                        address: formData.address.trim(),

                    },

                    fecha: serverTimestamp(),

                    estado: "confirmada",

                });



                // 4. Para cada producto:

                //    - crear el item de la orden;

                //    - descontar el stock;

                //    - guardar el ID de la orden que provocó el descuento.

                lecturas.forEach(
                    ({ item, productoRef, itemRef, snap }) => {

                        const producto = snap.data();

                        const cantidad = Number(item.quantity);

                        const nuevoStock =
                            Number(producto.stock) - cantidad;



                        transaction.set(itemRef, {

                            productoId: item.id,

                            nombre: producto.nombre,

                            precio: Number(producto.precio),

                            cantidad,

                        });



                        transaction.update(productoRef, {

                            stock: nuevoStock,

                            ultimaOrdenId: orderRef.id,

                        });

                    }
                );

            });



            setOrder({

                id: orderRef.id,

                total,

                email: formData.email.trim().toLowerCase(),

            });



            clearCart();



        } catch (err) {

            if (err instanceof SinStockError) {

                setError({

                    message: `No hay stock suficiente de: ${err.productos.join(
                        ", "
                    )}.`,

                    cartLink: true,

                });

            } else {

                console.error("Error al crear la orden:", err);

                setError({

                    message:
                        "No pudimos procesar la orden. Intentá nuevamente.",

                });

            }

        } finally {

            setLoading(false);

        }

    };





    if (order) {

        return (

            <div className="checkout-success">

                <span className="checkout-success-icon">

                    <FiCheck />

                </span>



                <h1 className="checkout-success-title">

                    ¡Gracias por tu compra!

                </h1>



                <p className="checkout-success-text">

                    Recibimos tu pedido y ya lo estamos preparando.

                </p>



                <div className="checkout-ticket">

                    <span>Número de orden</span>

                    <strong>{order.id}</strong>

                    <span className="checkout-ticket-total">

                        Total: {formatPrice(order.total)}

                    </span>

                </div>



                <p className="checkout-success-text">

                    Vamos a contactarte a <strong>{order.email}</strong> por

                    cualquier novedad de tu pedido.

                </p>



                <Link to="/productos" className="checkout-submit">

                    Seguir comprando

                </Link>

            </div>

        );

    }





    if (cart.length === 0) {

        return (

            <div className="checkout-success">

                <h1 className="checkout-success-title">

                    No hay nada para comprar

                </h1>



                <p className="checkout-success-text">

                    Tu carrito está vacío.

                </p>



                <Link to="/productos" className="checkout-submit">

                    Ver productos

                </Link>

            </div>

        );

    }





    return (

        <div className="checkout-container">



            <h1 className="checkout-title">Finalizar compra</h1>



            <div className="checkout-layout">



                <form onSubmit={handleSubmit} className="checkout-form">



                    <h2 className="checkout-section-title">

                        Tus datos

                    </h2>



                    <Field
                        label="Nombre y apellido"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                    />



                    <div className="checkout-row">

                        <Field
                            label="Email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />



                        <Field
                            label="Confirmar email"
                            name="confirmEmail"
                            type="email"
                            autoComplete="email"
                            value={formData.confirmEmail}
                            onChange={handleChange}
                            error={errors.confirmEmail}
                        />

                    </div>



                    <div className="checkout-row">

                        <Field
                            label="Teléfono"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                        />



                        <Field
                            label="Dirección"
                            name="address"
                            type="text"
                            autoComplete="street-address"
                            value={formData.address}
                            onChange={handleChange}
                            error={errors.address}
                        />

                    </div>



                    {error && (

                        <div className="checkout-error" role="alert">

                            {error.message}



                            {error.cartLink && (

                                <Link to="/cart">

                                    Volver al carrito

                                </Link>

                            )}

                        </div>

                    )}



                    <button
                        type="submit"
                        className="checkout-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Procesando..."
                            : "Confirmar compra"}

                    </button>



                </form>



                <aside className="checkout-summary">

                    <h2 className="checkout-section-title">

                        Tu pedido

                    </h2>



                    <ul className="checkout-summary-items">

                        {cart.map((item) => (

                            <li
                                key={item.id}
                                className="checkout-summary-item"
                            >

                                <div className="checkout-summary-image">

                                    {item.img && (

                                        <img
                                            src={item.img}
                                            alt=""
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />

                                    )}



                                    <span className="checkout-summary-qty">

                                        {item.quantity}

                                    </span>

                                </div>



                                <span className="checkout-summary-name">

                                    {item.nombre}

                                </span>



                                <span className="checkout-summary-price">

                                    {formatPrice(
                                        item.precio * item.quantity
                                    )}

                                </span>

                            </li>

                        ))}

                    </ul>



                    <dl className="checkout-summary-rows">

                        <div className="checkout-summary-row">

                            <dt>Envío</dt>

                            <dd className="checkout-free">

                                Gratis

                            </dd>

                        </div>



                        <div className="checkout-summary-row checkout-summary-total">

                            <dt>Total</dt>

                            <dd>

                                {formatPrice(getCartTotal())}

                            </dd>

                        </div>

                    </dl>



                    <Link to="/cart" className="checkout-edit-link">

                        Editar carrito

                    </Link>

                </aside>



            </div>

        </div>

    );

}





export default Checkout;