# M03-06 — Un mock desde el contrato

Ejercicio del laboratorio [Un mock desde el contrato](../../labs/M03-testing-apis/06-lab-mock-desde-el-contrato.md).

- `contrato/openapi.yaml` — contrato OpenAPI de la API de pedidos, con ejemplos. El backend no existe.
- `cliente/cliente.mjs` — cliente que muestra un pedido (punto de partida: no mira el código de estado).
- `solucion/` — cliente que trata 404 y otros errores, y contrato con la respuesta 500 del reto.

```bash
# Terminal 1: levanta el mock a partir del contrato en el puerto 3306
cd ejercicios/M03-06-mock-desde-el-contrato
npx prism mock contrato/openapi.yaml -p 3306
```

```bash
# Terminal 2: ejecuta el cliente contra el mock
cd ejercicios/M03-06-mock-desde-el-contrato
node cliente/cliente.mjs 1042
PREFER=code=404 node solucion/cliente/cliente.mjs 1042
```
