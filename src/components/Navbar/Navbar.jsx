import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FiMenu,
    FiX,
    FiSearch
} from "react-icons/fi";

import CartWidget from "../CartWidget/CartWidget";
import logo from "../../assets/LaMateraLogo.png";

import "./Navbar.css";


function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [navbarHidden, setNavbarHidden] = useState(false);

    const lastScrollY = useRef(0);
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const categoria = params.get("categoria");
    const oferta = params.get("oferta");


    useEffect(() => {

        const handleScroll = () => {

            const currentScrollY = window.scrollY;

            if (menuOpen) {
                setNavbarHidden(false);
                lastScrollY.current = currentScrollY;
                return;
            }

            if (currentScrollY <= 20) {
                setNavbarHidden(false);
            }
            else if (currentScrollY > lastScrollY.current + 8) {
                setNavbarHidden(true);
            }
            else if (currentScrollY < lastScrollY.current - 8) {
                setNavbarHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };


        window.addEventListener(
            "scroll",
            handleScroll,
            { passive: true }
        );


        return () => {
            window.removeEventListener(
                "scroll",
                handleScroll
            );
        };

    }, [menuOpen]);


    const closeMenu = () => {
        setMenuOpen(false);
    };


    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        setNavbarHidden(false);
    };


    const isActive = (section) => {
        switch (section) {
            case "inicio":
                return location.pathname === "/";

            case "productos":
                return (
                    location.pathname === "/productos" &&
                    !categoria &&
                    oferta !== "true"
                ) ||
                    location.pathname.startsWith("/producto/") ||
                    location.pathname.startsWith("/detalle/");

            case "mates":
                return (
                    location.pathname === "/productos" && categoria === "mates"
                ) || location.pathname === "/categoria/mates";

            case "termos":
                return (
                    location.pathname === "/productos" && categoria === "termos"
                ) || location.pathname === "/categoria/termos";

            case "accesorios":
                return (
                    location.pathname === "/productos" && categoria === "accesorios"
                ) || location.pathname === "/categoria/accesorios";

            case "ofertas":
                return (
                    location.pathname === "/productos" && oferta === "true"
                );

            default:
                return false;
        }
    };


    return (

        <header
            className={`navbar ${navbarHidden ? "navbar-hidden" : ""}`}
        >

            <div className="navbar-container">


                <Link
                    to="/"
                    className="navbar-logo"
                    onClick={closeMenu}
                    aria-label="La Matera - Inicio"
                >

                    <img
                        src={logo}
                        alt="La Matera"
                    />

                </Link>


                <button
                    className="navbar-toggle"
                    onClick={toggleMenu}
                    aria-label="Abrir menú"
                    aria-expanded={menuOpen}
                >

                    {menuOpen
                        ?
                        <FiX />
                        :
                        <FiMenu />
                    }

                </button>


                <nav
                    className={`navbar-links ${menuOpen ? "open" : ""}`}
                    aria-label="Navegación principal"
                >

                    <Link
                        to="/"
                        className={isActive("inicio") ? "active" : ""}
                        aria-current={isActive("inicio") ? "page" : undefined}
                        onClick={closeMenu}
                    >
                        Inicio
                    </Link>


                    <Link
                        to="/productos"
                        className={isActive("productos") ? "active" : ""}
                        aria-current={isActive("productos") ? "page" : undefined}
                        onClick={closeMenu}
                    >
                        Productos
                    </Link>


                    <Link
                        to="/productos?categoria=mates"
                        className={isActive("mates") ? "active" : ""}
                        aria-current={isActive("mates") ? "page" : undefined}
                        onClick={closeMenu}
                    >
                        Mates
                    </Link>


                    <Link
                        to="/productos?categoria=termos"
                        className={isActive("termos") ? "active" : ""}
                        aria-current={isActive("termos") ? "page" : undefined}
                        onClick={closeMenu}
                    >
                        Termos
                    </Link>


                    <Link
                        to="/productos?categoria=accesorios"
                        className={isActive("accesorios") ? "active" : ""}
                        aria-current={isActive("accesorios") ? "page" : undefined}
                        onClick={closeMenu}
                    >
                        Accesorios
                    </Link>


                    <Link
                        to="/productos?oferta=true"
                        className={isActive("ofertas") ? "active" : ""}
                        aria-current={isActive("ofertas") ? "page" : undefined}
                        onClick={closeMenu}
                    >
                        Ofertas
                    </Link>

                </nav>


                <div className="navbar-actions">

                    <Link
                        to="/productos"
                        className="navbar-action"
                        aria-label="Buscar productos"
                        onClick={closeMenu}
                    >
                        <FiSearch />
                    </Link>


                    <div className="navbar-cart">
                        <CartWidget />
                    </div>

                </div>


            </div>

        </header>

    );

}


export default Navbar;
