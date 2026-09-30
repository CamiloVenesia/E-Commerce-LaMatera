import { Link, useParams } from "react-router-dom";

import { useEffect, useState, useContext } from "react";

import { doc, getDoc } from "firebase/firestore";

import {
    FiShoppingBag,
    FiCreditCard,
    FiCheck,
    FiChevronDown,
    FiMinus,
    FiPlus,
} from "react-icons/fi";

import { db } from "../../firebaseConfig";

import { CartContext } from "../../context/CartContext";

import Loader from "../Loader/Loader";

import Notification from "../Notification/Notification";

import "./ItemDetail.css";


const money = (value) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
    }).format(value);


function ItemDetail() {
    const { id } = useParams();

    const { cart, addItem } = useContext(CartContext);

    const [result, setResult] = useState({
        id: null,
        product: null,
        loading: true,
        error: null,
    });

    const [activeImage, setActiveImage] = useState(0);

    const [failedImages, setFailedImages] = useState([]);

    const [quantity, setQuantity] = useState(1);

    const [added, setAdded] = useState(false);

    const [showNotification, setShowNotification] = useState(false);


    useEffect(() => {
        let cancelled = false;

        setResult({
            id,
            product: null,
            loading: true,
            error: null,
        });

        setActiveImage(0);
        setFailedImages([]);
        setQuantity(1);
        setAdded(false);
        setShowNotification(false);


        async function fetchProduct() {
            try {
                const snapshot = await getDoc(
                    doc(db, "productos", id)
                );

                if (!cancelled) {
                    setResult({
                        id,
                        product: snapshot.exists()
                            ? {
                                ...snapshot.data(),
                                id: snapshot.id,
                            }
                            : null,
                        loading: false,
                        error: snapshot.exists()
                            ? null
                            : "No encontramos este producto.",
                    });
                }
            } catch (error) {
                console.error("Error al cargar producto:", error);

                if (!cancelled) {
                    setResult({
                        id,
                        product: null,
                        loading: false,
                        error:
                            "No pudimos cargar el producto. Intentá nuevamente más tarde.",
                    });
                }
            }
        }


        fetchProduct();


        return () => {
            cancelled = true;
        };
    }, [id]);


    if (result.loading || result.id !== id) {
        return (
            <div
                className="lm-detail-state"
                role="status"
            >
                <Loader />
                <span>Cargando producto…</span>
            </div>
        );
    }


    if (result.error || !result.product) {
        return (
            <div className="lm-detail-state">
                <h1>
                    {result.error || "Producto no disponible"}
                </h1>

                <Link to="/productos">
                    Volver a productos
                </Link>
            </div>
        );
    }


    const producto = result.product;

    const price = Number(producto.precio);

    const validPrice =
        producto.precio !== null &&
        producto.precio !== "" &&
        Number.isFinite(price) &&
        price >= 0;

    const oldPrice = Number(producto.precioAnterior);

    const discount =
        Boolean(producto.oferta) &&
        validPrice &&
        Number.isFinite(oldPrice) &&
        oldPrice > price;

    const percentage = discount
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

    const stock = Number.isFinite(Number(producto.stock))
        ? Math.max(0, Math.floor(Number(producto.stock)))
        : 0;

    const inCart =
        Number(
            cart.find(
                (item) => item.id === producto.id
            )?.quantity
        ) || 0;

    const available = Math.max(
        0,
        stock - inCart
    );

    const selectedQuantity = Math.min(
        quantity,
        available
    );


    /*
     * GALERÍA DE IMÁGENES
     *
     * El administrador guarda actualmente:
     *
     * images: [
     *   {
     *     publicId: "...",
     *     url: "https://..."
     *   },
     *   ...
     * ]
     *
     * También mantenemos compatibilidad con
     * productos antiguos que puedan tener:
     *
     * imagenes: ["https://...", "..."]
     *
     * o incluso objetos con url.
     */


    const firestoreImages = Array.isArray(producto.images)
        ? producto.images
            .map((image) => {
                if (typeof image === "string") {
                    return image;
                }

                if (
                    image &&
                    typeof image.url === "string"
                ) {
                    return image.url;
                }

                return null;
            })
            .filter(Boolean)
        : [];


    const legacyImages = Array.isArray(producto.imagenes)
        ? producto.imagenes
            .map((image) => {
                if (typeof image === "string") {
                    return image;
                }

                if (
                    image &&
                    typeof image.url === "string"
                ) {
                    return image.url;
                }

                return null;
            })
            .filter(Boolean)
        : [];


    /*
     * La imagen principal antigua está en producto.img.
     *
     * Después agregamos las imágenes de la galería.
     *
     * Set evita mostrar dos veces la misma imagen.
     */

    const images = [
        producto.img,
        ...firestoreImages,
        ...legacyImages,
    ].filter(
        (src) =>
            typeof src === "string" &&
            src.trim()
    );


    const uniqueImages = [
        ...new Set(images),
    ];


    const currentImage =
        uniqueImages[activeImage] ||
        uniqueImages[0];


    const specs = [
        ["Material", producto.material],
        ["Origen", producto.origen],
        ["Capacidad", producto.capacidad],
    ].filter(
        ([, value]) =>
            typeof value === "string" ||
            typeof value === "number"
    );


    function handleAdd() {
        if (
            !validPrice ||
            selectedQuantity < 1
        ) {
            return;
        }

        addItem(
            {
                ...producto,
                precio: price,
                stock,
            },
            selectedQuantity
        );

        setAdded(true);

        setShowNotification(true);

        setQuantity(1);
    }


    return (
        <article className="lm-detail">

            <nav
                className="lm-detail-breadcrumb"
                aria-label="Ubicación"
            >
                <Link to="/">
                    Inicio
                </Link>

                <span aria-hidden="true">
                    /
                </span>

                <Link to="/productos">
                    Productos
                </Link>

                {producto.categoria && (
                    <>
                        <span aria-hidden="true">
                            /
                        </span>

                        <Link
                            to={`/categoria/${encodeURIComponent(
                                producto.categoria
                            )}`}
                        >
                            {producto.categoria}
                        </Link>
                    </>
                )}

                <span aria-hidden="true">
                    /
                </span>

                <span aria-current="page">
                    {producto.nombre}
                </span>
            </nav>


            <div className="lm-detail-grid">

                <section
                    className="lm-detail-gallery"
                    aria-label="Imágenes del producto"
                >

                    {uniqueImages.length > 0 && (
                        <div
                            className="lm-detail-thumbnails"
                            aria-label="Seleccionar imagen"
                        >

                            {uniqueImages.map(
                                (src, index) => (
                                    <button
                                        key={src}
                                        type="button"
                                        className={`lm-detail-thumb ${
                                            index === activeImage
                                                ? "is-active"
                                                : ""
                                        }`}
                                        aria-label={`Ver imagen ${
                                            index + 1
                                        } de ${
                                            producto.nombre
                                        }`}
                                        aria-pressed={
                                            index === activeImage
                                        }
                                        onClick={() =>
                                            setActiveImage(
                                                index
                                            )
                                        }
                                    >

                                        {failedImages.includes(
                                            src
                                        ) ? (
                                            <span>
                                                Imagen{" "}
                                                {index + 1}
                                            </span>
                                        ) : (
                                            <img
                                                src={src}
                                                alt=""
                                                loading="lazy"
                                                onError={() =>
                                                    setFailedImages(
                                                        (prev) =>
                                                            prev.includes(
                                                                src
                                                            )
                                                                ? prev
                                                                : [
                                                                    ...prev,
                                                                    src,
                                                                ]
                                                    )
                                                }
                                            />
                                        )}

                                    </button>
                                )
                            )}

                        </div>
                    )}


                    <div className="lm-detail-photo">

                        {currentImage &&
                        !failedImages.includes(
                            currentImage
                        ) ? (
                            <img
                                className="lm-detail-main-image"
                                src={currentImage}
                                alt={`${producto.nombre} — imagen ${
                                    activeImage + 1
                                }`}
                                onError={() =>
                                    setFailedImages(
                                        (prev) =>
                                            prev.includes(
                                                currentImage
                                            )
                                                ? prev
                                                : [
                                                    ...prev,
                                                    currentImage,
                                                ]
                                    )
                                }
                            />
                        ) : (
                            <div className="lm-detail-fallback">
                                La Matera
                                <span>
                                    Imagen no disponible
                                </span>
                            </div>
                        )}


                        {discount && (
                            <span className="lm-detail-offer">
                                {percentage}% OFF
                            </span>
                        )}


                        {uniqueImages.length > 1 && (
                            <span className="lm-detail-image-count">
                                {activeImage + 1} /{" "}
                                {uniqueImages.length}
                            </span>
                        )}

                    </div>

                </section>


                <div className="lm-detail-info">

                    <p className="lm-detail-category">
                        {producto.categoria ||
                            "La Matera"}
                    </p>


                    <h1>
                        {producto.nombre}
                    </h1>


                    <div className="lm-detail-pricing">

                        <div className="lm-detail-price-row">

                            {discount && (
                                <del>
                                    {money(oldPrice)}
                                </del>
                            )}

                            <strong>
                                {validPrice
                                    ? money(price)
                                    : "Precio no disponible"}
                            </strong>

                            {discount && (
                                <span className="lm-detail-saving">
                                    {percentage}% OFF
                                </span>
                            )}

                        </div>


                        {validPrice && (
                            <p className="lm-detail-installments">

                                <FiCreditCard
                                    aria-hidden="true"
                                />

                                <span>
                                    3 cuotas sin interés de{" "}
                                    <strong>
                                        {money(price / 3)}
                                    </strong>
                                </span>

                            </p>
                        )}

                    </div>


                    <p
                        className={`lm-detail-stock ${
                            stock === 0
                                ? "is-empty"
                                : ""
                        }`}
                    >
                        <span aria-hidden="true" />

                        {stock === 0
                            ? "Sin stock por el momento"
                            : stock <= 3
                                ? `Últimas ${stock} unidades`
                                : "En stock"}
                    </p>


                    {producto.descripcion && (
                        <p className="lm-detail-intro">
                            {producto.descripcion}
                        </p>
                    )}


                    <div className="lm-detail-purchase">

                        {available > 0 && (
                            <div
                                className="lm-detail-quantity"
                                role="group"
                                aria-label="Cantidad"
                            >

                                <button
                                    type="button"
                                    aria-label="Disminuir cantidad"
                                    disabled={
                                        selectedQuantity <= 1
                                    }
                                    onClick={() =>
                                        setQuantity(
                                            selectedQuantity - 1
                                        )
                                    }
                                >
                                    <FiMinus />
                                </button>


                                <output
                                    aria-live="polite"
                                    aria-label="Cantidad seleccionada"
                                >
                                    {selectedQuantity}
                                </output>


                                <button
                                    type="button"
                                    aria-label="Aumentar cantidad"
                                    disabled={
                                        selectedQuantity >=
                                        available
                                    }
                                    onClick={() =>
                                        setQuantity(
                                            selectedQuantity + 1
                                        )
                                    }
                                >
                                    <FiPlus />
                                </button>

                            </div>
                        )}


                        <button
                            type="button"
                            className="lm-detail-add"
                            disabled={
                                !validPrice ||
                                available === 0
                            }
                            onClick={handleAdd}
                        >
                            <FiShoppingBag
                                aria-hidden="true"
                            />

                            {stock === 0
                                ? "Sin stock"
                                : available === 0
                                    ? "Stock disponible en tu carrito"
                                    : "Agregar al carrito"}
                        </button>

                    </div>


                    {inCart > 0 && (
                        <p className="lm-detail-cart-note">
                            Ya tenés {inCart}{" "}
                            {inCart === 1
                                ? "unidad"
                                : "unidades"}{" "}
                            en tu carrito.
                        </p>
                    )}


                    {added && (
                        <p
                            className="lm-detail-added"
                            role="status"
                        >
                            <FiCheck
                                aria-hidden="true"
                            />

                            Producto agregado.

                            <Link to="/cart">
                                Ver carrito
                            </Link>
                        </p>
                    )}


                    <div className="lm-detail-accordions">

                        <details open>

                            <summary>
                                Información del producto

                                <FiChevronDown
                                    aria-hidden="true"
                                />
                            </summary>

                            <div className="lm-detail-panel">

                                {producto.descripcion ? (
                                    <p>
                                        {producto.descripcion}
                                    </p>
                                ) : (
                                    <p>
                                        {producto.nombre}
                                        {producto.categoria
                                            ? ` · ${producto.categoria}`
                                            : ""}
                                    </p>
                                )}


                                {specs.length > 0 && (
                                    <dl>

                                        {specs.map(
                                            ([
                                                label,
                                                value,
                                            ]) => (
                                                <div
                                                    key={label}
                                                >
                                                    <dt>
                                                        {label}
                                                    </dt>

                                                    <dd>
                                                        {value}
                                                    </dd>
                                                </div>
                                            )
                                        )}

                                    </dl>
                                )}

                            </div>

                        </details>


                        {validPrice && (
                            <details>

                                <summary>
                                    Cuotas sin interés

                                    <FiChevronDown
                                        aria-hidden="true"
                                    />
                                </summary>

                                <div className="lm-detail-panel">

                                    <p>
                                        3 cuotas sin
                                        interés de{" "}
                                        {money(
                                            price / 3
                                        )}
                                        . Precio total
                                        del producto:{" "}
                                        {money(price)}.
                                    </p>

                                </div>

                            </details>
                        )}


                        {typeof producto.envio ===
                            "string" &&
                            producto.envio && (
                                <details>

                                    <summary>
                                        Información de envío

                                        <FiChevronDown
                                            aria-hidden="true"
                                        />
                                    </summary>

                                    <div className="lm-detail-panel">

                                        <p>
                                            {
                                                producto.envio
                                            }
                                        </p>

                                    </div>

                                </details>
                            )}


                        {typeof producto.cuidados ===
                            "string" &&
                            producto.cuidados && (
                                <details>

                                    <summary>
                                        Cuidados

                                        <FiChevronDown
                                            aria-hidden="true"
                                        />
                                    </summary>

                                    <div className="lm-detail-panel">

                                        <p>
                                            {
                                                producto.cuidados
                                            }
                                        </p>

                                    </div>

                                </details>
                            )}

                    </div>


                    <Link
                        className="lm-detail-back"
                        to="/productos"
                    >
                        ← Seguir explorando
                    </Link>

                </div>

            </div>


            {showNotification && (
                <Notification
                    message="Producto agregado al carrito"
                    onClose={() =>
                        setShowNotification(false)
                    }
                />
            )}

        </article>
    );
}


export default ItemDetail;