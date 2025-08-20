# Etapa de build (NestJS)
FROM node:current-alpine3.22 AS builder

WORKDIR /app
RUN npm install -g npm@latest @nestjs/cli
COPY package*.json ./
RUN npm i --omit=dev
COPY . .
RUN npm run build
RUN npm cache clean --force

# Etapa final (runtime)
FROM node:current-alpine3.22

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./

# Copiamos plantillas de email si existen
RUN mkdir -p src/services/email/templates
COPY --from=builder /app/src/services/email/templates ./src/services/email/templates

USER node

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
