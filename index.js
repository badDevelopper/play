const express = require('express');
const { chromium } = require('playwright');
const fetch = require('node-fetch');
const yts = require('yt-search');
const fs = require('fs'); // Importando o módulo fs padrão
const { writeFile, unlink } = require('fs').promises; // Importando funções assíncronas de fs.promises
const path = require('path');
const axios = require('axios');
const app = express();
const port = 3000;
const ytdl = require("@distube/ytdl-core")


async function getVideoSize(videoUrl) {
  const info = await ytdl.getInfo(videoUrl);

  const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });

  const videoSizeInBytes = format.contentLength;

  const videoSizeInMegabytes = (videoSizeInBytes / (1024 * 1024)).toFixed(2);

  return videoSizeInMegabytes;
}

async function getAudioSize(videoUrl) {
  const info = await ytdl.getInfo(videoUrl);

  const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

  const audioSizeInBytes = format.contentLength;

  const audioSizeInMegabytes = (audioSizeInBytes / (1024 * 1024)).toFixed(2);

  return audioSizeInMegabytes;
}



app.get('/api/play', async (req, res) => {
  try {
      const searchTerm = req.query.nome_url;

      if (!searchTerm) {
          return res.status(400).send('Nenhum termo de pesquisa fornecido.');
      }

      const searchResults = await yts(searchTerm);

      if (searchResults && searchResults.videos.length > 0) {
          const firstVideo = searchResults.videos[0];
          const videoUrl = `https://www.youtube.com/watch?v=${firstVideo.videoId}`;

          res.header('Content-Disposition', 'attachment; filename="video.mp4"');

          ytdl(videoUrl, { format: 'mp4', filter: 'videoandaudio', }).pipe(res);
      } else {
          res.status(404).send('Nenhum vídeo encontrado para o termo de pesquisa.');
      }
  } catch (error) {
      console.log('Erro:', error.message);
      res.status(500).send('Erro ao reproduzir áudio.');
  }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
