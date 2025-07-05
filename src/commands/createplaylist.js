// src/commands/createplaylist.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const PLAYLISTS_FILE = path.join(__dirname, '../../config/playlists.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createplaylist')
        .setDescription('Crea una nueva playlist')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de la nueva playlist')
                .setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply();
        const playlistName = interaction.options.getString('nombre');

        // Leer el archivo de playlists
        let playlists;
        try {
            playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf8'));
        } catch (error) {
            // Si el archivo no existe, creamos un objeto vacío
            playlists = {};
        }

        // Verificar si la playlist ya existe
        if (playlists[playlistName]) {
            return interaction.editReply(`❌ La playlist "${playlistName}" ya existe.`);
        }

        // Crear la nueva playlist
        playlists[playlistName] = [];
        
        // Guardar cambios
        try {
            fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 4));
            return interaction.editReply(`✅ Playlist "${playlistName}" creada correctamente.`);
        } catch (error) {
            console.error('Error guardando playlist:', error);
            return interaction.editReply('❌ Error al crear la playlist');
        }
    }
};