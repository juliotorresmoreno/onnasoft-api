# Etapa de build
FROM node:current-alpine3.22 AS builder

WORKDIR /app
RUN npm install -g npm
COPY package*.json ./
RUN npm install -g @nestjs/cli
RUN npm i --omit=dev
RUN npm cache clean --force

COPY . .
RUN npm run build

# Etapa final
FROM node:current-alpine3.22

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
RUN mkdir -p src/services/email/templates
COPY --from=builder /app/src/services/email/templates ./src/services/email/templates

USER node

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
