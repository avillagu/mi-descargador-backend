const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process'); // <--- IMPORTANTE: Usamos esto, no librerías externas

const app = express();
app.use(cors());

// ==========================================
// 🟢 NUEVA RUTA PARA UPTIMEROBOT
// Esto evita que el robot reciba error 404
// ==========================================
app.get('/', (req, res) => {
    res.status(200).send('¡Hola! El servidor está activo y funcionando. 🤖✅');
});

// ==========================================
// 📺 RUTA DE DESCARGA
// ==========================================
app.get('/download', (req, res) => {
    const url = req.query.url;
    console.log("1. Recibida petición para:", url);

    if (!url) return res.status(400).send('Falta la URL');

    // Configurar cabeceras para que el navegador sepa que es un archivo
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    res.header('Content-Type', 'video/mp4');

    // EJECUCIÓN DE COMANDO NATIVO
    // Esto crea un proceso hijo en el sistema (como si escribieras en la terminal)
    const ytDlp = spawn('yt-dlp', [
        url,
        '-f', 'best[ext=mp4]/best', // Intenta MP4, si no, el mejor disponible
        '-o', '-',                  // '-' significa: Manda los datos a la pantalla (stdout), no al disco
        '--no-playlist'
    ]);

    // Aquí está la magia: Conectamos la salida del comando con la respuesta al usuario
    if (ytDlp.stdout) {
        ytDlp.stdout.pipe(res);
    } else {
        console.error("Error: No se pudo crear el stream de salida");
        res.status(500).send("Error interno del servidor");
        return;
    }

    // Loguear errores si ocurren en el proceso
    ytDlp.stderr.on('data', (data) => {
        // yt-dlp manda información de progreso por stderr, así que lo vemos en los logs
        console.log(`Progreso/Log: ${data}`);
    });

    ytDlp.on('close', (code) => {
        console.log(`Proceso terminado con código: ${code}`);
        if (code !== 0 && !res.headersSent) {
             // Si falló y no hemos enviado nada aún
            res.status(500).send('La descarga falló.');
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
