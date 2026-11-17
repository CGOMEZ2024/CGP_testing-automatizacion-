// Page Object de la lista de tareas: el ÚNICO sitio que sabe cómo se localiza cada elemento
export class PaginaTareas {
  constructor(page) {
    this.page = page;
    this.campoNueva = page.getByPlaceholder('Nueva tarea');
    this.botonAnadir = page.getByRole('button', { name: 'Añadir' });
    this.tareas = page.getByRole('listitem');
  }

  async abrir() {
    await this.page.goto('/');
  }

  // Añade una o varias tareas, en orden
  async anadir(...textos) {
    for (const texto of textos) {
      await this.campoNueva.fill(texto);
      await this.botonAnadir.click();
    }
  }

  async completar(texto) {
    await this.page.getByRole('checkbox', { name: `Completar ${texto}` }).check();
  }

  async borrar(texto) {
    await this.tareas.filter({ hasText: texto }).getByRole('button', { name: 'Borrar' }).click();
  }

  // Localizador del contador, para que la prueba haga sus propias aserciones
  contador(texto) {
    return this.page.getByText(texto, { exact: true });
  }
}
