import "./Newsletter.css";


const Newsletter = () => {


    return (

        <section className="newsletter">


            <div className="newsletter-content">


                <span className="newsletter-eyebrow">
                    COMUNIDAD LA MATERA
                </span>



                <h2>
                    Sé parte de La Matera
                </h2>



                <p>
                    Recibí novedades, lanzamientos
                    y ofertas especiales directamente
                    en tu correo.
                </p>



                <form className="newsletter-form">


                    <input
                        type="email"
                        placeholder="Tu email"
                        aria-label="Email"
                    />



                    <button type="submit">
                        Suscribirme →
                    </button>


                </form>



                <small>
                    No enviamos spam. Solo compartimos
                    novedades importantes.
                </small>


            </div>


        </section>

    );


};


export default Newsletter;