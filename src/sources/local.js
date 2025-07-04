// src/sources/local.js
const path = require('path');
const { createAudioResource } = require('@discordjs/voice');

function getLocalResource(filename) {
  const ruta = path.join(__dirname, '../../canciones', filename);
  return createAudioResource(ruta);
}

module.exports = { getLocalResource };
