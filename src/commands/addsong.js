// src/commands/addsong.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const PLAYLISTS_FILE = path.join(__dirname, '../../config/playlists.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addsong')
        .setDescription('Agrega una canción a una playlist')
        .addStringOption(option =>
            option.setName('playlist')
                .setDescription('Nombre de la playlist')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('cancion')
                .setDescription('Nombre de la canción a agregar')
                .setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply();
        const playlistName = interaction.options.getString('playlist');
        const songName = interaction.options.getString('cancion');

        // Leer el archivo de playlists
        let playlists;
        try {
            playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf8'));
        } catch (error) {
            console.error('Error leyendo playlists:', error);
            return interaction.editReply('❌ Error al cargar las playlists');
        }

        // Verificar si la playlist existe
        if (!playlists[playlistName]) {
            return interaction.editReply(`❌ La playlist "${playlistName}" no existe. Crea primero la playlist con /createplaylist o elige una existente.`);
        }

        // Agregar la canción si no está ya en la playlist
        if (!playlists[playlistName].includes(songName)) {
            playlists[playlistName].push(songName);
            
            // Guardar cambios
            try {
                fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 4));
                return interaction.editReply(`✅ Canción "${songName}" agregada a la playlist "${playlistName}"`);
            } catch (error) {
                console.error('Error guardando playlist:', error);
                return interaction.editReply('❌ Error al guardar la playlist');
            }
        } else {
            return interaction.editReply(`ℹ️ La canción "${songName}" ya está en la playlist "${playlistName}"`);
        }
    }
};