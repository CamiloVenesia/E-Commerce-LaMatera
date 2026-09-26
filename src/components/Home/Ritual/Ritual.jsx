import "./Ritual.css";

import mateImg from "../../../assets/categoria-mates.jpg";
import termoImg from "../../../assets/categoria-termos.jpg";
import accesoriosImg from "../../../assets/categoria-accesorios.jpg";

import { Link } from "react-router-dom";


const Ritual = () => {

    const steps = [
        {
            title: "Elegí tu mate",
            text: "Diseños artesanales para disfrutar cada cebada.",
            image: mateImg,
            link: "/categoria/mates",
        },
        {
            title: "Sumá tu termo",
            text: "Manteniendo siempre la temperatura ideal.",
            image: termoImg,
            link: "/categoria/termos",
        },
        {
            title: "Completá el ritual",
            text: "Accesorios para una experiencia completa.",
            image: accesoriosImg,
            link: "/categoria/accesorios",
        },
    ];


    return (

        <section className="ritual">

            <div className="ritual-header">

                <span className="ritual-eyebrow">
                    CREÁ TU EXPERIENCIA
                </span>


                <h2>
                    Todo lo que necesitás
                    <br />
                    para disfrutar cada momento.
                </h2>


                <p>
                    Combiná nuestros productos y creá
                    tu propio momento matero.
                </p>

            </div>



            <div className="ritual-container">


                {steps.map((step, index) => (

                    <div
                        className="ritual-step"
                        key={step.title}
                    >


                        <div className="ritual-number">
                            0{index + 1}
                        </div>


                        <div className="ritual-image">

                            <img
                                src={step.image}
                                alt={step.title}
                            />

                        </div>



                        <h3>
                            {step.title}
                        </h3>


                        <p>
                            {step.text}
                        </p>


                        <Link
                            to={step.link}
                            className="ritual-link"
                        >
                            Explorar →
                        </Link>


                    </div>

                ))}


            </div>



            <Link
                to="/productos"
                className="ritual-button"
            >
                Armar mi equipo →
            </Link>


        </section>

    );

};


export default Ritual;