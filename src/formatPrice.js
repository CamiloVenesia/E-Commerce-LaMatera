export const formatPrice = (value) =>
    `$${Number(value).toLocaleString("es-AR", {
        maximumFractionDigits: 2,
    })}`;