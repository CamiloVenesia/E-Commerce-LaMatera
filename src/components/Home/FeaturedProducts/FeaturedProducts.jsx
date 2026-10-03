import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { Link } from "react-router-dom";

import { db } from "../../../firebaseConfig";
import ProductCard from "../../ProductCard/ProductCard";

import "./FeaturedProducts.css";


const FeaturedProducts = () => {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const getProducts = async () => {

            try {

                const productsQuery = query(
                    collection(db, "productos")
                );

                const snapshot = await getDocs(productsQuery);


                const productsData = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .filter((product) => product.oferta === true)
                    .slice(0, 4);


                setProducts(productsData);


            } catch (error) {

                console.error(
                    "Error cargando productos en oferta:",
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        getProducts();

    }, []);


    return (

        <section className="featured-products">

            <header className="featured-header">

                <span>
                    Ofertas La Matera
                </span>


                <h2>
                    Productos en oferta
                </h2>


                <p>
                    Aprovechá nuestras promociones y encontrá tus
                    productos favoritos al mejor precio.
                </p>

            </header>


            {loading ? (

                <div className="featured-loading">
                    Cargando ofertas...
                </div>

            ) : products.length > 0 ? (

                <div className="featured-products-grid">

                    {products.map((product) => (

                        <ProductCard
                            key={product.id}
                            id={product.id}
                            nombre={product.nombre}
                            precio={product.precio}
                            precioAnterior={
                                product.precioAnterior ??
                                product.precioOriginal ??
                                null
                            }
                            img={product.img}
                            images={product.images}
                            categoria={product.categoria}
                            oferta={product.oferta}
                            stock={product.stock}
                        />

                    ))}

                </div>

            ) : (

                <div className="featured-empty">

                    <h3>
                        No hay ofertas disponibles
                    </h3>

                    <p>
                        Volvé pronto para descubrir nuevas promociones.
                    </p>

                </div>

            )}


            <Link
                to="/productos?oferta=true"
                className="all-offers-button"
            >
                Ver todas las ofertas →
            </Link>


        </section>

    );

};


export default FeaturedProducts;