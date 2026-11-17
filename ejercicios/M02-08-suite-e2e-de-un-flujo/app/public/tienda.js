// Código común de la tienda: carrito en localStorage y cabecera con el usuario y el contador
export const carrito = {
  leer: () => JSON.parse(localStorage.getItem('carrito') ?? '[]'),
  guardar: (lineas) => localStorage.setItem('carrito', JSON.stringify(lineas)),
  vaciar: () => localStorage.removeItem('carrito'),
};
export const euros = (n) => n.toFixed(2).replace('.', ',') + ' €';

// Comprueba la sesión: sin sesión, vuelve al login
export async function exigirSesion() {
  const respuesta = await fetch('/api/yo');
  if (!respuesta.ok) { location.href = '/login.html'; throw new Error('sin sesión'); }
  const { usuario } = await respuesta.json();
  document.querySelector('#usuario').textContent = `Hola, ${usuario}`;
  pintarContador();
}

export function pintarContador() {
  const unidades = carrito.leer().reduce((total, l) => total + l.cantidad, 0);
  document.querySelector('#enlace-carrito').textContent = `Carrito (${unidades})`;
}
