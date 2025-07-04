// src/commands/stop.js
const { SlashCommandBuilder } = require('discord.js');
const { stopPlayer } = require('../utils/audioPlayer'); // Ajusta según tu implementación

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detiene la reproducción de música'),
  
  async execute(interaction) {
    // Detener la reproducción
    stopPlayer(interaction.guildId);
    
    // Responder al usuario
    await interaction.reply('⏹️ Reproducción detenida');
  }
};
