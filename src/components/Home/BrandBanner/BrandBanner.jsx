import { Link } from "react-router-dom";

import "./BrandBanner.css";

import bannerImg from "../../../assets/home-historia.jpg";
import matesImg from "../../../assets/home-historia2.jpg";


const BrandBanner = () => {

    return (

        <section className="brand-banner">


            <header className="brand-banner-header">

                <span className="brand-banner-eyebrow">
                    NUESTRA HISTORIA
                </span>


                <h2>
                    El mate es más que una bebida.
                </h2>

            </header>



            <article className="brand-story brand-story-first">


                <div className="brand-story-image">

                    <img
                        src={bannerImg}
                        alt="Mate artesanal de La Matera"
                        loading="lazy"
                    />

                </div>



                <div className="brand-story-content">

                    <span className="brand-story-kicker">
                        EL COMIENZO DE LA MATERA
                    </span>


                    <h3>
                        Una pasión por el mate, elegida pieza por pieza.
                    </h3>


                    <p>
                        La Matera nació de una idea simple: volver a disfrutar
                        del mate como lo que siempre fue, un momento para
                        compartir, conversar y hacer una pausa. Por eso
                        recorremos distintos talleres y trabajamos con
                        artesanos que mantienen viva la tradición, seleccionando
                        cada mate uno por uno.
                    </p>


                    <p>
                        Buscamos piezas que tengan algo especial: una buena
                        calabaza, materiales nobles, terminaciones cuidadas y
                        diseños que respeten la esencia del mate. No elegimos
                        por cantidad, sino por calidad, para que cada producto
                        que llega a La Matera sea realmente uno que elegiríamos
                        para nosotros.
                    </p>


                    <Link
                        to="/productos"
                        className="brand-story-button"
                    >
                        Conocé La Matera →
                    </Link>

                </div>


            </article>



            <article className="brand-story brand-story-second">


                <div className="brand-story-content">

                    <span className="brand-story-kicker">
                        EL DETALLE NATURAL
                    </span>


                    <h3>
                        Cada mate tiene una historia propia.
                    </h3>


                    <p>
                        Cada calabaza nace distinta, con su propia forma,
                        textura y carácter. Esa naturaleza irrepetible es parte
                        de lo que hace especial al mate y convierte cada pieza
                        en un objeto para disfrutar durante años.
                    </p>


                    <Link
                        to="/productos?categoria=mates"
                        className="brand-story-button"
                    >
                        Conocé nuestros mates →
                    </Link>

                </div>



                <div className="brand-story-image">

                    <img
                        src={matesImg}
                        alt="Mates artesanales de La Matera"
                        loading="lazy"
                    />

                </div>


            </article>


        </section>

    );

};


export default BrandBanner;