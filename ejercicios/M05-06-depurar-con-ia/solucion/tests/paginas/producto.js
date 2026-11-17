// Page Object de la ficha de producto: los localizadores y las acciones, en un solo sitio
export class PaginaProducto {
  constructor(page) {
    this.page = page;
    this.nombre = page.getByRole('heading', { level: 1 });
    this.precio = page.getByTestId('precio');
    this.cantidad = page.getByLabel('Cantidad');
    this.botonAnadir = page.getByRole('button', { name: 'Añadir al carrito' });
    this.articulos = page.getByTestId('articulos');
    this.total = page.getByTestId('total');
  }

  async abrir() {
    await this.page.goto('/producto.html');
  }

  async anadirAlCarrito(unidades = 1) {
    await this.cantidad.fill(String(unidades));
    await this.botonAnadir.click();
  }
}
