FROM node:18-alpine

# Instalar Python y FFmpeg (necesarios para descargar videos)
RUN apk add --no-cache python3 ffmpeg

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]