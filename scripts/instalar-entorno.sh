#!/usr/bin/env bash
# Instala las dependencias del curso al crear el Codespace (postCreateCommand).
set -euo pipefail
cd "$(dirname "$0")/.."

# Dependencias de Node fijadas en package-lock.json
npm ci

# Chromium de Playwright con las librerías del sistema que necesita
npx playwright install --with-deps chromium

# Librerías que Cypress necesita para su navegador y Xvfb
sudo apt-get update -qq
sudo apt-get install -y -qq xvfb libgtk-3-0 libgbm1 libnotify4 libnss3 libxss1 libasound2 libxtst6 xauth >/dev/null
npx cypress install

echo "Entorno listo. Compruébalo con: npm run verificar"
