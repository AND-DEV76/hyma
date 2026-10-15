# Etapa 1: Compilar la aplicación React con Node.js
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor web Nginx
FROM nginx:alpine

# Copiar la configuración personalizada para soportar React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build compilado
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
