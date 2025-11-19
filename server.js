const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para descargar
app.get('/download', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send('Falta la URL');
    }

    try {
        // Configuración de la descarga
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        
        // Ejecutar la descarga y enviar directamente al usuario (streaming)
        // Esto evita guardar archivos en el servidor para hacerlo más simple
        await youtubedl(url, {
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
            output: '-', // Salida directa al flujo de datos
            format: 'mp4'
        }, { stdio: ['ignore', 'pipe', 'ignore'] }).then(output => {
            output.stdout.pipe(res);
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar el video');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));