const productos = [
  {
    id: 1,
    nombre: "Camiseta Biodegradable",
    precio: 35.0,
    categoria: "ropa",
    imagen:
      "https://ciclico.com.co/cdn/shop/files/Camiseta_gris_conexiones_espalda1.webp?v=1742312327&width=600"
  },
  {
    id: 2,
    nombre: "Pantalón Sostenible",
    precio: 50.0,
    categoria: "ropa",
    imagen:
      "https://sientochenta.com/cdn/shop/files/pantalon-Olu.png?v=1697519247&width=600"
  },
  {
    id: 3,
    nombre: "Zapatos Ecológicos",
    precio: 80.0,
    categoria: "ropa",
    imagen:
      "https://www.clotsybrand.com/cdn/shop/files/desglose-caracteristicas.webp?v=1741188399&width=1080"
  },
  {
    id: 4,
    nombre: "Gorra Reciclada",
    precio: 20.0,
    categoria: "accesorios",
    imagen:
      "https://www.kupa.co/cdn/shop/files/cholon-pesquero-gorro-estampado-manchas-granate-rojo-rosado-kupa.jpg?v=1709741952&width=1440"
  },
  {
    id: 5,
    nombre: "Mochila Biodegradable",
    precio: 60.0,
    categoria: "accesorios",
    imagen:
      "https://www.kupa.co/cdn/shop/files/MiniCocuy-dinosaurios-manchas-verdes-dino--maleta-nino-nina-adulto-colegio-colores-tierra-anyurasi-park.jpg?v=1738676692&width=1440"
  },
  {
    id: 6,
    nombre: "sumapaz chaqueta",
    precio: 239.9,
    categoria: "ropa",
    imagen:
      "https://www.kupa.co/cdn/shop/products/Sumapaz_Prisma-10.jpg?v=1678825139&width=1440"
  },
  {
    id: 7,
    nombre: "Chaqueta Acolchada Sumapaz",
    precio: 359.9,
    categoria: "ropa",
    imagen:
      "https://www.kupa.co/cdn/shop/files/PiensoEnTi-17.jpg?v=1738676393&width=1440"
  }
];

let carrito = new Map();

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const contenedorPayPal = document.getElementById("paypal-button-container");

function filtrarPorCategoria() {
  const seleccion = document.getElementById("categoria").value;
  const productosFiltrados =
    seleccion === "todos"
      ? productos
      : productos.filter((p) => p.categoria === seleccion);

  contenedorProductos.innerHTML = "";

  productosFiltrados.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" width="200">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  if (carrito.has(id)) {
    carrito.get(id).cantidad++;
  } else {
    carrito.set(id, { ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  cantidadCarrito.textContent = cantidadTotal;
  contenedorPayPal.style.display = carrito.size > 0 ? "block" : "none";
}

function eliminarDelCarrito(id) {
  if (!carrito.has(id)) return;

  let item = carrito.get(id);
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.delete(id);
  }

  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  if (carrito.size === 0) return;

  if (confirm("¿Seguro que quieres vaciar el carrito?")) {
    carrito.clear();
    guardarCarrito();
    actualizarCarrito();
  }
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(Array.from(carrito.entries())));
}

function cargarCarrito() {
  const data = localStorage.getItem("carrito");
  if (data) {
    carrito = new Map(JSON.parse(data));
    actualizarCarrito();
  }
}

// Botón PayPal
if (window.paypal) {
  paypal
    .Buttons({
      createOrder: function (data, actions) {
        const total = Array.from(carrito.values()).reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0
        );
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: total.toFixed(2)
              }
            }
          ]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert(`¡Gracias ${details.payer.name.given_name}, tu pago fue exitoso! 🌱`);
          vaciarCarrito();
        });
      },
      onError: function (err) {
        console.error("Error con PayPal:", err);
        alert("Hubo un problema con el pago. Intenta de nuevo.");
      }
    })
    .render("#paypal-button-container");
}

// Inicialización
filtrarPorCategoria();
cargarCarrito();
