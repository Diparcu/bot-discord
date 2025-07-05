// src/commands/playlists.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const PLAYLISTS_FILE = path.join(__dirname, '../../config/playlists.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlists')
        .setDescription('Muestra todas las playlists o canciones de una playlist')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de la playlist (opcional)')
                .setRequired(false)),
    
    async execute(interaction) {
        await interaction.deferReply();

        // Leer el archivo de playlists
        let playlists;
        try {
            playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf8'));
        } catch (error) {
            console.error('Error leyendo playlists:', error);
            return interaction.editReply('❌ Error al cargar las playlists');
        }

        const playlistName = interaction.options.getString('nombre');
        
        // Si se especificó una playlist
        if (playlistName) {
            if (!playlists[playlistName]) {
                return interaction.editReply(`❌ No existe la playlist "${playlistName}"`);
            }
            
            let response = `📋 Canciones en "${playlistName}":\n`;
            playlists[playlistName].forEach((track, index) => {
                response += `${index + 1}. ${track}\n`;
            });
            return interaction.editReply(response);
        }
        
        // Mostrar todas las playlists
        const playlistNames = Object.keys(playlists);
        if (playlistNames.length === 0) {
            return interaction.editReply('ℹ️ No hay playlists guardadas');
        }

        let response = '📚 Playlists disponibles:\n';
        playlistNames.forEach(name => {
            response += `- ${name} (${playlists[name].length} canciones)\n`;
        });
        interaction.editReply(response);
    }
};