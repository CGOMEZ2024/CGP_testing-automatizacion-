# M04-07 — Entornos efímeros

Ejercicio del lab [Entornos efímeros](../../labs/M04-ci-cd-testing-continuo/07-lab-entornos-efimeros.md):
una API de libros (`app/`, puerto 3407) sobre PostgreSQL 17 con datos de semilla (`db/semilla.sql`),
levantada con Docker Compose (proyecto `m04-07`), y dos pruebas de API con Playwright.

```bash
cd ejercicios/M04-07-entornos-efimeros
# Crea el entorno, ejecuta las pruebas y lo destruye (con su volumen)
docker compose up -d --wait
npx playwright test
docker compose down -v
# Solución del reto: el mismo ciclo, con destrucción garantizada
bash solucion/entorno-efimero.sh
```

`solucion/entorno-efimero.yml` es el workflow con la base de datos como `services:` del job.
