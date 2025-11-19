const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());

app.get('/download', (req, res) => {
    const url = req.query.url;
    console.log("Recibida petición para:", url);

    if (!url) {
        return res.status(400).send('Falta la URL');
    }

    // Le decimos al navegador que esto es un archivo para descargar
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    res.header('Content-Type', 'video/mp4');

    try {
        // Usamos .exec para iniciar el proceso de inmediato (Streaming)
        // Esto envía los datos "gota a gota" a tu navegador
        const subprocess = youtubedl.exec(url, {
            output: '-',
            format: 'best[ext=mp4]', // Intentar MP4 directo
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        }, { 
            stdio: ['ignore', 'pipe', 'ignore'] // Conectar tuberías
        });

        // Conectar la salida del video directo a la respuesta del usuario
        subprocess.stdout.pipe(res);

        // Manejo de errores básico
        subprocess.stdout.on('error', (err) => {
            console.error('Error en el stream:', err);
        });

    } catch (error) {
        console.error('Error general:', error);
        if (!res.headersSent) {
            res.status(500).send('Error al procesar el video');
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
