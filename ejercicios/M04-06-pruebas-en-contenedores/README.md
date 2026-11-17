# M04-06 — Pruebas en contenedores

Ejercicio del lab [Pruebas en contenedores](../../labs/M04-ci-cd-testing-continuo/06-lab-pruebas-en-contenedores.md):
un tablón de avisos (`app/`, puerto 3406) y su suite de Playwright, cada uno en su contenedor con Docker Compose
(proyecto `m04-06`). El `compose.yaml` de partida tiene un error que se corrige en el lab.

```bash
cd ejercicios/M04-06-pruebas-en-contenedores
# Ejecuta la suite en el contenedor de pruebas (levanta la app si hace falta)
docker compose run --rm pruebas
# Apaga y borra los contenedores
docker compose down
# Solución
docker compose -f solucion/compose.yaml run --rm pruebas
docker compose -f solucion/compose.yaml down
```
