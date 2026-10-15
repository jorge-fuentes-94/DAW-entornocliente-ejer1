// js/main.js
import { Carrito } from './carrito.js';

const API_URL = 'https://jsonblob.com/api/jsonBlob/01a13dea-75bd-7714-a2ec-e054d9767465';

const tbody = document.getElementById('lista-productos');
const resumen = document.getElementById('resumen-productos');
const totalEl = document.getElementById('total');
const estado = document.getElementById('estado');

async function cargarDatos() {
  const respuesta = await fetch(API_URL);
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al cargar productos`);
  return respuesta.json();
}

// 1) Crear elementos en el DOM
function pintarProductos(carrito) {
  carrito.obtenerProductos().forEach(p => {
    const fila = document.createElement('tr');
    fila.dataset.sku = p.sku;

    const celdaNombre = document.createElement('td');
    celdaNombre.innerHTML = `<strong></strong><br><small></small>`;
    celdaNombre.querySelector('strong').textContent = p.title;
    celdaNombre.querySelector('small').textContent = `Ref: ${p.sku}`;

    const celdaCantidad = document.createElement('td');
    const menos = crearBoton('−', 'restar');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.value = p.quantity;
    const mas = crearBoton('+', 'sumar');
    celdaCantidad.append(menos, input, mas);

    const celdaPrecio = document.createElement('td');
    celdaPrecio.textContent = `${p.price.toFixed(2)} ${carrito.currency}`;

    const celdaSubtotal = document.createElement('td');
    celdaSubtotal.className = 'subtotal';
    celdaSubtotal.textContent = `0.00 ${carrito.currency}`;

    fila.append(celdaNombre, celdaCantidad, celdaPrecio, celdaSubtotal);
    tbody.append(fila);
  });
}

function crearBoton(texto, accion) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = texto;
  boton.dataset.accion = accion;
  return boton;
}

// 3) Transformar el DOM tras cada cambio
function actualizarVista(carrito, sku) {
  const info = carrito.obtenerInformacionProducto(sku);
  const fila = tbody.querySelector(`tr[data-sku="${sku}"]`);
  fila.querySelector('input').value = info.quantity;
  const subtotal = (Math.round(info.price * 100) * info.quantity / 100).toFixed(2);
  fila.querySelector('.subtotal').textContent = `${subtotal} ${carrito.currency}`;

  const { total, currency, products } = carrito.obtenerCarrito();
  resumen.replaceChildren();
  products.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.quantity} × ${p.title} — ${p.subtotal} ${currency}`;
    resumen.append(li);
  });
  totalEl.textContent = `${total} ${currency}`;
}

// 2) Escuchar eventos (delegación en el tbody)
function escucharEventos(carrito) {
  tbody.addEventListener('click', e => {
    const accion = e.target.dataset.accion;
    if (!accion) return;
    const sku = e.target.closest('tr').dataset.sku;
    const actual = carrito.obtenerInformacionProducto(sku).quantity;
    const nueva = accion === 'sumar' ? actual + 1 : Math.max(0, actual - 1);
    carrito.actualizarUnidades(sku, nueva);
    actualizarVista(carrito, sku);
  });

  tbody.addEventListener('change', e => {
    if (e.target.tagName !== 'INPUT') return;
    const sku = e.target.closest('tr').dataset.sku;
    try {
      carrito.actualizarUnidades(sku, e.target.value);
    } catch {
      // valor no válido: se restaura el último correcto
    }
    actualizarVista(carrito, sku);
  });
}

async function iniciar() {
  try {
    const datos = await cargarDatos();
    const carrito = new Carrito(datos.products, datos.currency);
    pintarProductos(carrito);
    escucharEventos(carrito);
    estado.remove();
  } catch (error) {
    estado.textContent = 'No se han podido cargar los productos. Inténtalo más tarde.';
    console.error(error);
  }
}

iniciar();