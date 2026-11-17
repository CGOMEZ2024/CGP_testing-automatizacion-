// Un pedido: solo guarda datos y los devuelve. No tiene lógica propia.
export class Pedido {
  constructor(id, cliente, lineas = []) {
    this._id = id;
    this._cliente = cliente;
    this._lineas = lineas;
  }

  get id() { return this._id; }
  get cliente() { return this._cliente; }
  get lineas() { return this._lineas; }
}
