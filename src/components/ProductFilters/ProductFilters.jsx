import { useEffect, useRef, useState } from "react";
import {
    FiCheck,
    FiChevronDown,
    FiSearch,
    FiSliders,
    FiTag,
    FiX
} from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import "./ProductFilters.css";

const CATEGORY_OPTIONS = [
    { value: "", label: "Todas" },
    { value: "mates", label: "Mates" },
    { value: "termos", label: "Termos" },
    { value: "accesorios", label: "Accesorios" }
];

const SORT_OPTIONS = [
    { value: "nombre", label: "Más relevantes" },
    { value: "precio-asc", label: "Menor precio" },
    { value: "precio-desc", label: "Mayor precio" }
];

const FilterDropdown = ({
    icon,
    label,
    value,
    options,
    onChange,
    ariaLabel
}) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find((option) => option.value === value) || options[0];

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleSelect = (nextValue) => {
        onChange(nextValue);
        setOpen(false);
    };

    return (
        <div
            ref={dropdownRef}
            className={`filter-control custom-dropdown ${open ? "is-open" : ""}`}
        >
            <button
                type="button"
                className="filter-dropdown-trigger"
                onClick={() => setOpen((current) => !current)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
            >
                {icon}

                <span className="filter-control-content">
                    <span>{label}</span>
                    <strong>{selectedOption.label}</strong>
                </span>

                <FiChevronDown className="filter-chevron" aria-hidden="true" />
            </button>

            {open && (
                <div className="filter-dropdown-menu" role="listbox" aria-label={ariaLabel}>
                    <div className="filter-dropdown-heading">{label}</div>

                    {options.map((option) => {
                        const selected = option.value === value;

                        return (
                            <button
                                key={option.value || "all"}
                                type="button"
                                className={`filter-dropdown-option ${selected ? "selected" : ""}`}
                                onClick={() => handleSelect(option.value)}
                                role="option"
                                aria-selected={selected}
                            >
                                <span>{option.label}</span>
                                {selected && <FiCheck aria-hidden="true" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

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
    const ofertaActual = searchParams.get("oferta") === "true";

    const handleCategoria = (value) => {
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set("categoria", value);
        } else {
            params.delete("categoria");
        }

        setSearchParams(params);
    };

    const clearSearch = () => setBusqueda("");

    const clearCategoria = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("categoria");
        setSearchParams(params);
    };

    const ofertasActivas = soloOfertas || ofertaActual;

    const categoriaLabel =
        CATEGORY_OPTIONS.find((option) => option.value === categoriaActual)?.label || "Todas";

    return (
        <section className="product-filters" aria-label="Buscar y filtrar productos">
            <div className="product-filters-header">
                <div>
                    <span className="product-filters-eyebrow">EXPLORÁ LA COLECCIÓN</span>
                    <h2>Encontrá lo que buscás</h2>
                </div>

            </div>

            <div className="product-filters-panel">
                <div className={`search-box ${busqueda ? "has-value" : ""}`}>
                    <FiSearch aria-hidden="true" />

                    <input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre..."
                        aria-label="Buscar productos por nombre"
                    />

                    {busqueda && (
                        <button
                            type="button"
                            className="search-clear"
                            onClick={clearSearch}
                            aria-label="Limpiar búsqueda"
                        >
                            <FiX aria-hidden="true" />
                        </button>
                    )}
                </div>

                <FilterDropdown
                    icon={<FiTag aria-hidden="true" />}
                    label="Categoría"
                    value={categoriaActual}
                    options={CATEGORY_OPTIONS}
                    onChange={handleCategoria}
                    ariaLabel="Filtrar por categoría"
                />

                <button
                    type="button"
                    className={`filter-offers ${ofertasActivas ? "active" : ""}`}
                    onClick={() => setSoloOfertas(!soloOfertas)}
                    aria-pressed={ofertasActivas}
                >
                    <FiTag aria-hidden="true" />
                    <span>Ofertas</span>
                </button>

                <FilterDropdown
                    icon={<FiSliders aria-hidden="true" />}
                    label="Ordenar"
                    value={orden}
                    options={SORT_OPTIONS}
                    onChange={setOrden}
                    ariaLabel="Ordenar productos"
                />
            </div>

            {(categoriaActual || ofertasActivas || busqueda) && (
                <div className="active-filters" aria-label="Filtros activos">
                    <span className="active-filters-label">Mostrando:</span>

                    {categoriaActual && (
                        <button type="button" className="active-filter" onClick={clearCategoria}>
                            {categoriaLabel}
                            <FiX aria-hidden="true" />
                        </button>
                    )}

                    {ofertasActivas && (
                        <span className="active-filter active-filter-static">Ofertas</span>
                    )}

                    {busqueda && (
                        <button type="button" className="active-filter" onClick={clearSearch}>
                            “{busqueda}”
                            <FiX aria-hidden="true" />
                        </button>
                    )}
                </div>
            )}
        </section>
    );
};

export default ProductFilters;
