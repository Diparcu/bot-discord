// src/sources/local.js
const fs = require('fs');
const path = require('path');
const { createAudioResource } = require('@discordjs/voice');

const MUSIC_DIRS = [
  '/HDD4TB3/home/jfuser/Musica',
  '/HDD4TB2/home/jfuser/Musica',
  '/HDD4TB1/home/jfuser/Musica'
];

function findFile(filename) {
  for (const dir of MUSIC_DIRS) {
    const fullPath = path.join(dir, filename);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

function getLocalResource(filename) {
  const file = findFile(filename);
  if (!file) throw new Error(`Archivo no encontrado en ninguna carpeta: ${filename}`);
  return createAudioResource(file);
}

module.exports = { getLocalResource, MUSIC_DIRS };
