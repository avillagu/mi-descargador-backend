FROM node:18-alpine

# 1. Instalar Python, FFmpeg y CURL (necesarios para descargar)
RUN apk add --no-cache python3 py3-pip ffmpeg curl

# 2. Descargar e instalar yt-dlp MANUALMENTE (La forma más segura)
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

# 3. Configurar la App
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
