# Imagen de la API del lab M04-07: Node 22 con su única dependencia (pg)
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.mjs ./
USER node
CMD ["node", "server.mjs"]
