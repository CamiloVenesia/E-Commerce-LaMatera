// src/context/CartContext.jsx
import { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Agrega un producto al carrito (sin superar el stock)
  const addItem = (item, quantity) => {
    const maxQuantity = item.stock ?? Infinity;

    setCart((prev) => {
      const exists = prev.find((prod) => prod.id === item.id);

      if (exists) {
        return prev.map((prod) =>
          prod.id === item.id
            ? {
                ...prod,
                quantity: Math.min(prod.quantity + quantity, maxQuantity),
              }
            : prod
        );
      }

      return [...prev, { ...item, quantity: Math.min(quantity, maxQuantity) }];
    });
  };

  // Cambia la cantidad de un producto ya agregado
  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((prod) =>
        prod.id === id
          ? {
              ...prod,
              quantity: Math.max(1, Math.min(quantity, prod.stock ?? Infinity)),
            }
          : prod
      )
    );
  };

  // Remueve un producto del carrito
  const removeItem = (id) => {
    setCart((prev) => prev.filter((prod) => prod.id !== id));
  };

  // Vacía el carrito
  const clearCart = () => {
    setCart([]);
  };

  // Calcula la cantidad total de productos
  const getTotalQuantity = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Calcula el precio total de la compra
  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotalQuantity,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};