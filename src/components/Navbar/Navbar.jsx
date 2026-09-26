import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

import CartWidget from "../CartWidget/CartWidget";
import logo from "../../assets/LogoLaMatera.png";

import "./Navbar.css";


function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);


    const closeMenu = () => {
        setMenuOpen(false);
    };


    return (

        <header className="navbar">

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
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Abrir menú"
                >

                    {
                        menuOpen
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



                <div className="navbar-cart">

                    <CartWidget />

                </div>



            </div>


        </header>

    );

}


export default Navbar;