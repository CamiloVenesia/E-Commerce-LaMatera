import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import { db } from "../../firebaseConfig";
import CategoryHeader from "../CategoryHeader/CategoryHeader";
import ProductFilters from "../ProductFilters/ProductFilters";
import ProductCard from "../ProductCard/ProductCard";
import Loader from "../Loader/Loader";
import "./ItemListContainer.css";

const normalize = (text = "") => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const ItemListContainer = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [orden, setOrden] = useState("nombre");
    const [soloOfertas, setSoloOfertas] = useState(false);
    const [searchParams] = useSearchParams();

    const categoria = searchParams.get("categoria");
    const oferta = searchParams.get("oferta");

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const consulta = query(collection(db, "productos"), orderBy("nombre"));
                const snapshot = await getDocs(consulta);

                setProductos(snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })));
            } catch (err) {
                console.error("Error cargando productos:", err);
                setError("No pudimos cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        obtenerProductos();
    }, []);

    const visibles = useMemo(() => {
        const termino = normalize(busqueda.trim());

        const filtrados = productos.filter((producto) => (
            (!categoria || producto.categoria === categoria) &&
            (!oferta || producto.oferta === true) &&
            (!termino || normalize(producto.nombre).includes(termino)) &&
            (!soloOfertas || producto.oferta === true)
        ));

        if (orden === "precio-asc") {
            return [...filtrados].sort((a, b) => a.precio - b.precio);
        }

        if (orden === "precio-desc") {
            return [...filtrados].sort((a, b) => b.precio - a.precio);
        }

        return [...filtrados].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }, [productos, categoria, oferta, busqueda, orden, soloOfertas]);

    const heroImage = useMemo(() => {

        const productoHero = productos.find((producto) => (
            (!categoria || producto.categoria === categoria) &&
            (!oferta || producto.oferta === true) &&
            producto.img
        ));

        return productoHero?.img || productos.find((producto) => producto.img)?.img || null;

    }, [productos, categoria, oferta]);

    return (
        <main className="products-container">

            <CategoryHeader
                categoria={categoria}
                image={heroImage}
            />

            <ProductFilters
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                soloOfertas={soloOfertas}
                setSoloOfertas={setSoloOfertas}
                orden={orden}
                setOrden={setOrden}
            />

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <div className="products-grid">
                    <Loader />
                </div>
            ) : (
                <>
                    <p className="products-count">
                        {visibles.length} {visibles.length === 1 ? "producto" : "productos"}
                    </p>

                    {visibles.length > 0 ? (
                        <div className="products-grid">
                            {visibles.map((producto) => (
                                <ProductCard
                                    key={producto.id}
                                    id={producto.id}
                                    nombre={producto.nombre}
                                    precio={producto.precio}
                                    precioAnterior={producto.precioAnterior ?? producto.precioOriginal ?? null}
                                    img={producto.img}
                                    images={producto.images}
                                    categoria={producto.categoria}
                                    oferta={producto.oferta}
                                    stock={producto.stock}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="products-empty">
                            <h2>No encontramos productos</h2>
                            <p>Probá cambiando los filtros.</p>
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default ItemListContainer;