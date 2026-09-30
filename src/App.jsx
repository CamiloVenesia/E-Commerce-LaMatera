import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";

import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import ItemListContainer from "./components/ItemListContainer/ItemListContainer";
import ItemDetailContainer from "./components/ItemDetailContainer/ItemDetailContainer";
import ItemDetail from "./components/ItemDetail/ItemDetail";
import Cart from "./components/Cart/Cart";
import Checkout from "./components/Checkout/Checkout";
import NotFound from "./components/NotFound/NotFound";
import Footer from "./components/Footer/Footer";
import Admin from "./components/Admin/Admin";

import "./App.css";

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });
    }, [pathname]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />

            <CartProvider>
                <div className="app">
                    <a href="#contenido" className="skip-link">
                        Saltar al contenido
                    </a>

                    <Navbar />

                    <main id="contenido" className="main-content" tabIndex={-1}>
                        <Routes>
                            <Route path="/" element={<Home />} />

                            <Route
                                path="/productos"
                                element={<ItemListContainer />}
                            />

                            <Route
                                path="/categoria/:categoria"
                                element={<ItemListContainer />}
                            />

                            <Route
                                path="/producto/:id"
                                element={<ItemDetailContainer />}
                            />

                            <Route
                                path="/detalle/:id"
                                element={<ItemDetail />}
                            />

                            <Route path="/cart" element={<Cart />} />

                            <Route path="/checkout" element={<Checkout />} />

                            <Route path="/admin" element={<Admin />} />

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;