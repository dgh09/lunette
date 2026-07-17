# syntax=docker/dockerfile:1
# Imagen del backend Medusa 2 de Lunette.
# `medusa build` compila la app a .medusa/server; ese directorio es una app Node
# autónoma con sus propios scripts (predeploy = db:migrate, start = medusa start).

# ---- builder: compila y prepara las deps de producción del build ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app
# toolchain para dependencias nativas (se queda solo en esta etapa)
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# genera .medusa/server (no requiere base de datos)
RUN npx medusa build
# instala las deps de producción DENTRO del build, aquí donde hay toolchain
WORKDIR /app/.medusa/server
RUN npm install --omit=dev

# ---- runner: imagen final solo con runtime ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
# el build ya trae node_modules instalados desde la etapa builder
COPY --from=builder /app/.medusa/server ./
EXPOSE 9000
# db:migrate es idempotente; para la demo (1 réplica) se corre al arrancar.
# El seed NO va aquí (no es idempotente): se ejecuta una vez aparte.
CMD ["sh", "-c", "npm run predeploy && npm run start"]
