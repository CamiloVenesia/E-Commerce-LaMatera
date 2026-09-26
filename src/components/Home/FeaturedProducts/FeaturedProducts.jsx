import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { Link } from "react-router-dom";

import { db } from "../../../firebaseConfig";
import "./FeaturedProducts.css";


const FeaturedProducts = () => {

    const [products, setProducts] = useState([]);


    useEffect(() => {

        const getProducts = async () => {

            try {

                const productsQuery = query(
                    collection(db, "productos"),
                    limit(4)
                );


                const snapshot = await getDocs(productsQuery);


                const productsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));


                setProducts(productsData);


            } catch (error) {

                console.error(
                    "Error cargando productos destacados:",
                    error
                );

            }

        };


        getProducts();

    }, []);



    return (

        <section className="featured-products">


            <header className="featured-header">

                <span>
                    Selección La Matera
                </span>


                <h2>
                    Productos destacados
                </h2>


                <p>
                    Algunos de nuestros favoritos para acompañar
                    cada momento.
                </p>

            </header>



            <div className="products-grid">


                {
                    products.map((product) => (

                        <article
                            className="featured-card"
                            key={product.id}
                        >


                            <div className="featured-image">


                                {
                                    product.oferta && (

                                        <span className="badge">
                                            Oferta
                                        </span>

                                    )
                                }


                                {
                                    product.stock === 0 && (

                                        <span className="badge stock">
                                            Sin stock
                                        </span>

                                    )
                                }



                                <img
                                    src={product.img}
                                    alt={product.nombre}
                                />


                            </div>




                            <div className="featured-info">


                                <span className="category">
                                    {product.categoria}
                                </span>



                                <h3>
                                    {product.nombre}
                                </h3>



                                <p className="price">
                                    ${product.precio}
                                </p>



                                <Link
                                    to={`/producto/${product.id}`}
                                    className="featured-button"
                                >
                                    Ver producto →
                                </Link>


                            </div>



                        </article>

                    ))
                }


            </div>



            <Link
                to="/productos"
                className="all-products-button"
            >
                Ver todos los productos →
            </Link>


        </section>

    );

};


export default FeaturedProducts;