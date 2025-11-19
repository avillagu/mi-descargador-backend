const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process'); // Usamos funciones nativas de Node

const app = express();
app.use(cors());

app.get('/download', (req, res) => {
    const url = req.query.url;
    console.log("Procesando URL:", url);

    if (!url) return res.status(400).send('Falta la URL');

    // Cabeceras para forzar la descarga
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    res.header('Content-Type', 'video/mp4');

    // Ejecutamos yt-dlp directamente desde el sistema
    // -o - : Significa "Escribe el video en la salida estándar (stdout)"
    const ytDlp = spawn('yt-dlp', [
        url,
        '-f', 'best[ext=mp4]', // Mejor calidad MP4
        '-o', '-',             // Salida directa (streaming)
        '--no-playlist'        // Solo un video, no listas
    ]);

    // Conectar la "tubería" del video hacia el usuario
    ytDlp.stdout.pipe(res);

    // Si hay errores, mostrarlos en la consola de Render
    ytDlp.stderr.on('data', (data) => {
        console.error(`yt-dlp log: ${data}`);
    });

    ytDlp.on('close', (code) => {
        console.log(`Proceso terminado con código: ${code}`);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));

