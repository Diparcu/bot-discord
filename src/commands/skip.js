// src/commands/skip.js
const { SlashCommandBuilder } = require('discord.js');
const audioPlayer = require('../utils/audioPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta a la siguiente canción'),
    
    async execute(interaction) {
        const skipped = audioPlayer.skip(interaction.guildId);
        if (skipped) {
            await interaction.reply('⏭️ Saltando a la siguiente canción...');
        } else {
            await interaction.reply('❌ No hay reproducción en curso');
        }
    }
};

