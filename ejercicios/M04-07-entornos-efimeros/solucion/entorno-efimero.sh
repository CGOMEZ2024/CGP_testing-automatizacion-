#!/usr/bin/env bash
# Solución del reto del lab M04-07: crea el entorno, ejecuta las pruebas y lo destruye SIEMPRE.
# Uso, desde la carpeta del ejercicio: bash solucion/entorno-efimero.sh
set -u
cd "$(dirname "$0")/.." # la carpeta del ejercicio, se lance desde donde se lance

# Pase lo que pase a partir de aquí (pruebas en rojo, Ctrl+C), al salir se borra el entorno
trap 'echo "→ Destruyendo el entorno"; docker compose down -v' EXIT

echo "→ Creando el entorno"
docker compose up -d --wait || exit 1

echo "→ Ejecutando las pruebas"
npx playwright test # su código de salida es el del script
