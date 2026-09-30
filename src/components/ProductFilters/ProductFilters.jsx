import { FiSearch } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import "./ProductFilters.css";

const ProductFilters = ({
    busqueda,
    setBusqueda,
    soloOfertas,
    setSoloOfertas,
    orden,
    setOrden
}) => {

    const [searchParams, setSearchParams] = useSearchParams();

    const categoriaActual = searchParams.get("categoria") || "";


    const handleCategoria = (e) => {

        const params = new URLSearchParams(searchParams);
        const value = e.target.value;

        if (value) {
            params.set("categoria", value);
        } else {
            params.delete("categoria");
        }

        setSearchParams(params);
    };


    return(

        <section className="product-filters">

            <div className="search-box">

                <FiSearch />

                <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar productos..."
                />

            </div>


            <select
                className="filter-select"
                value={categoriaActual}
                onChange={handleCategoria}
                aria-label="Filtrar por categoría"
            >

                <option value="">
                    Categoría
                </option>

                <option value="mates">
                    Mates
                </option>

                <option value="termos">
                    Termos
                </option>

                <option value="accesorios">
                    Accesorios
                </option>

            </select>


            <button
                className={`filter-offers ${soloOfertas ? "active" : ""}`}
                onClick={() => setSoloOfertas(!soloOfertas)}
            >
                Ofertas
            </button>


            <select
                className="filter-select filter-sort"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                aria-label="Ordenar productos"
            >

                <option value="nombre">
                    Más relevantes
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