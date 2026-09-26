import "./BrandBanner.css";

import bannerImg from "../../../assets/banner-matera.jpg";


function BrandBanner(){

    return(

        <section className="brand-banner">


            <div className="brand-banner-image">

                <img
                    src={bannerImg}
                    alt="Cultura del mate"
                />

            </div>



            <div className="brand-banner-content">


                <span>
                    NUESTRA HISTORIA
                </span>



                <h2>
                    El mate es más que una bebida.
                </h2>



                <p>
                    Es una pausa, una charla y un momento compartido.
                    En La Matera seleccionamos productos pensados para
                    acompañar cada ritual.
                </p>



                <button>
                    Conocé La Matera →
                </button>


            </div>


        </section>

    );

}


export default BrandBanner;