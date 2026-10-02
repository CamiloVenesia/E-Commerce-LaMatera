import "./Categories.css";
import { Link } from "react-router-dom";

import matesImg from "../../../assets/home-mates.jpg";
import termosImg from "../../../assets/home-termos.jpg";
import accesoriosImg from "../../../assets/home-accesorios.jpg";


const categories = [
    {
        title: "Mates",
        description: "Diseños únicos y artesanales",
        image: matesImg,
        link: "/productos?categoria=mates"
    },
    {
        title: "Termos",
        description: "Mantienen la temperatura ideal",
        image: termosImg,
        link: "/productos?categoria=termos"
    },
    {
        title: "Accesorios",
        description: "Accesorios para disfrutar una experiencia completa.",
        image: accesoriosImg,
        link: "/productos?categoria=accesorios"
    }
];


function Categories() {

    return (

        <section className="categories">

            <div className="section-header">

                <span>
                    Nuestra colección
                </span>

                <h2>
                    Explorá nuestros productos
                </h2>

            </div>


            <div className="category-grid">

                {categories.map((category) => (

                    <Link
                        to={category.link}
                        className="category-card"
                        key={category.title}
                    >

                        <img
                            src={category.image}
                            alt={category.title}
                        />


                        <div className="category-overlay">

                            <h3>
                                {category.title}
                            </h3>


                            <p>
                                {category.description}
                            </p>


                            <span>
                                Explorar {category.title.toLowerCase()} →
                            </span>

                        </div>

                    </Link>

                ))}

            </div>

        </section>

    );

}


export default Categories;