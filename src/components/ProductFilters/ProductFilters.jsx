import { FiSearch } from "react-icons/fi";
import "./ProductFilters.css";

const ProductFilters = ({
    busqueda,
    setBusqueda,
    soloOfertas,
    setSoloOfertas,
    orden,
    setOrden
}) => {

    return(
        <section className="product-filters">

            <div className="search-box">

                <FiSearch/>

                <input
                    value={busqueda}
                    onChange={(e)=>setBusqueda(e.target.value)}
                    placeholder="Buscar productos..."
                />

            </div>


            <button
                className={soloOfertas ? "active":""}
                onClick={()=>setSoloOfertas(!soloOfertas)}
            >
                Ofertas
            </button>


            <select
                value={orden}
                onChange={(e)=>setOrden(e.target.value)}
            >
                <option value="nombre">
                    Nombre A-Z
                </option>

                <option value="precio-asc">
                    Menor precio
                </option>

                <option value="precio-desc">
                    Mayor precio
                </option>

            </select>

        </section>
    );
};

export default ProductFilters;