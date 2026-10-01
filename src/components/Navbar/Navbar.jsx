import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiMenu,
    FiX,
    FiSearch,
    FiUser
} from "react-icons/fi";

import CartWidget from "../CartWidget/CartWidget";
import logo from "../../assets/LogoLaMatera.png";

import "./Navbar.css";


function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [navbarHidden, setNavbarHidden] = useState(false);

    const lastScrollY = useRef(0);


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


    return (

        <header
            className={`navbar ${navbarHidden ? "navbar-hidden" : ""}`}
        >

            <div className="navbar-container">


                <Link
                    to="/"
                    className="navbar-logo"
                    onClick={closeMenu}
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
                >

                    <Link
                        to="/"
                        onClick={closeMenu}
                    >
                        Inicio
                    </Link>


                    <Link
                        to="/productos"
                        onClick={closeMenu}
                    >
                        Productos
                    </Link>


                    <Link
                        to="/productos?categoria=mates"
                        onClick={closeMenu}
                    >
                        Mates
                    </Link>


                    <Link
                        to="/productos?categoria=termos"
                        onClick={closeMenu}
                    >
                        Termos
                    </Link>


                    <Link
                        to="/productos?categoria=accesorios"
                        onClick={closeMenu}
                    >
                        Accesorios
                    </Link>


                    <Link
                        to="/productos?oferta=true"
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


                    <Link
                        to="/admin"
                        className="navbar-action"
                        aria-label="Acceso a administración"
                        onClick={closeMenu}
                    >
                        <FiUser />
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