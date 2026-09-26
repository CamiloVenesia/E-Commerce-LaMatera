# La Matera

E-commerce de productos materos desarrollado con React, Vite y Firebase.

La aplicación permite explorar mates, termos y accesorios, gestionar un carrito persistente y completar compras mediante un checkout conectado con Firestore.

---

## Demo

Próximamente.

---

## Capturas

Próximamente se agregarán capturas del proyecto:

- Home
- Catálogo
- Detalle de producto
- Carrito
- Checkout

---

## Funcionalidades

### Home

- Hero principal.
- Beneficios de la tienda.
- Categorías destacadas.
- Productos en oferta.
- Banner editorial.

### Catálogo

- Listado de productos desde Firestore.
- Navegación por categorías (Mates, Termos, Accesorios).
- Búsqueda por nombre, sin distinguir mayúsculas ni acentos.
- Filtro por productos en oferta.
- Filtro por disponibilidad de stock.
- Ordenamiento por nombre y precio.
- Estados de carga, error y resultados vacíos.

### Detalle de producto

- Vista completa del producto con imagen, descripción y precio.
- Selector de cantidad limitado por el stock disponible.
- Aviso de stock bajo o producto sin stock.
- Feedback al agregar al carrito.

### Carrito

- Agregar productos sin superar el stock.
- Modificar cantidades.
- Eliminar productos y vaciar el carrito.
- Persistencia mediante `localStorage`.
- Resumen de compra.

### Checkout

- Formulario de datos del comprador con validación por campo.
- Resumen del pedido.
- Confirmación de compra con número de orden.
- Creación de órdenes en Firestore.

### Control de stock

El proceso de compra utiliza una transacción de Firestore (`runTransaction`).

El flujo:

1. Se lee el stock actual de cada producto del carrito.
2. Se verifica que haya stock suficiente para todos.
3. Se descuenta el stock.
4. Se genera la orden.

Todo ocurre en una única operación atómica: si algún paso falla, no se guarda nada. Esto evita órdenes sin descuento de stock y descuentos sin orden.

### Interfaz y accesibilidad

- Diseño responsive pensado para mobile, tablet y desktop.
- Sistema de diseño propio con variables CSS.
- Navegación con teclado y link para saltar al contenido.
- Etiquetas ARIA en controles interactivos.
- Respeto a `prefers-reduced-motion`.

---

## Tecnologías utilizadas

- React 18
- Vite
- React Router
- Context API
- Firebase Firestore
- CSS con variables y sistema propio de diseño
- React Icons

---

## Estructura del proyecto

```text
src/
├── components/
│   ├── Navbar/
│   ├── CartWidget/
│   ├── Footer/
│   ├── Home/
│   ├── ItemListContainer/
│   ├── Item/
│   ├── ItemDetail/
│   ├── Contador/
│   ├── Cart/
│   ├── Checkout/
│   ├── Loader/
│   ├── Notification/
│   └── NotFound/
│
├── context/
│   └── CartContext.jsx
│
├── assets/
│
├── firebaseConfig.js
├── formatPrice.js
├── App.jsx
└── main.jsx
```

---

## Modelo de datos (Firestore)

### Colección `productos`

Cada producto contiene:

- `nombre`
- `precio`
- `categoria` (`mates`, `termos` o `accesorios`)
- `descripcion`
- `img`
- `stock`
- `oferta`

Ejemplo:

```js
{
  nombre: "Mate Imperial",
  precio: 250,
  categoria: "mates",
  descripcion: "Mate artesanal",
  img: "url-de-la-imagen",
  stock: 10,
  oferta: false
}
```

### Colección `ordenes`

Cada compra genera un documento con:

- `buyer`
- `items`
- `total`
- `fecha`
- `estado`

Ejemplo:

```js
{
  buyer: {
    name: "Nombre Apellido",
    email: "email@ejemplo.com",
    phone: "341 000 0000",
    address: "Calle 123"
  },

  items: [
    { id: "abc123", nombre: "Mate Imperial", precio: 250, cantidad: 2 }
  ],

  total: 500,

  fecha: timestamp,

  estado: "confirmada"
}
```

---

## Decisiones técnicas

### Manejo del carrito

Se utiliza Context API para administrar el estado global del carrito:

- productos seleccionados;
- cantidades;
- persistencia en `localStorage`;
- operaciones de agregar, actualizar, eliminar y vaciar.

### Base de datos

Firebase Firestore se utiliza como base de datos para:

- catálogo de productos;
- stock;
- órdenes de compra.

### Catálogo

Los productos se consultan una sola vez y la categoría, la búsqueda, los filtros y el orden se aplican del lado del cliente. Esto hace que cambiar de categoría sea instantáneo y evita índices compuestos en Firestore.

### Consistencia del stock

El checkout vuelve a validar el stock contra Firestore dentro de la transacción antes de generar la orden, así que el carrito nunca puede confirmar una compra por más unidades de las disponibles.

---

## Configuración de Firebase

La conexión a Firebase se configura en `src/firebaseConfig.js` con las credenciales de tu propio proyecto de Firebase.

Las reglas de seguridad de Firestore deben permitir:

- leer la colección `productos`;
- actualizar el campo `stock` de los productos;
- crear documentos en la colección `ordenes`.

---

## Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

Ingresar al proyecto:

```bash
cd E-commerceLaMatera
```

Instalar dependencias:

```bash
npm install
```

---

## Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

Otros comandos:

```bash
npm run build
```

Genera la versión de producción.

```bash
npm run preview
```

Previsualiza el build.

```bash
npm run lint
```

Analiza el código con ESLint.

---

## Mejoras futuras

- Calcular el total de la orden con los precios guardados en Firestore.
- Mover las imágenes de productos a archivos propios del proyecto.
- Página de confirmación de orden con ruta propia.
- Envío de email de confirmación.
- Integración con un medio de pago.

---

## Deploy

Próximamente.

---

## Autor

Camilo

Desarrollador web freelance

Rosario, Argentina