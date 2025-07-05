// src/commands/stop.js
const { SlashCommandBuilder } = require('discord.js');
const { stopPlayer } = require('../utils/audioPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la reproducción de música'),
    
    async execute(interaction) {
        const guildId = interaction.guildId;
        const stopped = stopPlayer(guildId);
        
        if (stopped) {
            await interaction.reply('⏹️ Reproducción detenida');
        } else {
            await interaction.reply('❌ No hay reproducción en curso');
        }
    }
};