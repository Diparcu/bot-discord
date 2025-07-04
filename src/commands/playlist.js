// src/commands/playlist.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { findTrackByName } = require('../sources/local');

const PLAYLISTS_PATH = path.join(__dirname, '../../config/playlists.json');

// Cargar o inicializar playlists
let playlists = {};
if (fs.existsSync(PLAYLISTS_PATH)) {
    playlists = JSON.parse(fs.readFileSync(PLAYLISTS_PATH));
} else {
    fs.writeFileSync(PLAYLISTS_PATH, JSON.stringify(playlists, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Gestiona tus playlists')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Añade canción a playlist')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('Nombre de la playlist')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('cancion')
                        .setDescription('Nombre de la canción')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Elimina canción de playlist')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('Nombre de la playlist')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('cancion')
                        .setDescription('Nombre de la canción')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Muestra canciones en playlist')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('Nombre de la playlist')
                        .setRequired(true))),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const playlistName = interaction.options.getString('playlist');
        const songName = interaction.options.getString('cancion');
        
        // Inicializar playlist si no existe
        if (!playlists[playlistName]) {
            playlists[playlistName] = [];
        }
        
        switch (subcommand) {
            case 'add': {
                // Verificar si la canción existe
                const trackPath = findTrackByName(songName);
                if (!trackPath) {
                    return interaction.reply(`❌ Canción no encontrada: ${songName}`);
                }
                
                // Añadir si no existe
                if (!playlists[playlistName].includes(songName)) {
                    playlists[playlistName].push(songName);
                    fs.writeFileSync(PLAYLISTS_PATH, JSON.stringify(playlists, null, 2));
                    await interaction.reply(`✅ Añadida a ${playlistName}: ${songName}`);
                } else {
                    await interaction.reply(`⚠️ La canción ya existe en: ${playlistName}`);
                }
                break;
            }
                
            case 'remove': {
                const index = playlists[playlistName].indexOf(songName);
                if (index !== -1) {
                    playlists[playlistName].splice(index, 1);
                    fs.writeFileSync(PLAYLISTS_PATH, JSON.stringify(playlists, null, 2));
                    await interaction.reply(`✅ Eliminada de ${playlistName}: ${songName}`);
                } else {
                    await interaction.reply(`⚠️ Canción no encontrada en: ${playlistName}`);
                }
                break;
            }
                
            case 'list': {
                const songs = playlists[playlistName];
                if (songs.length === 0) {
                    await interaction.reply(`📋 ${playlistName} está vacía`);
                } else {
                    const list = songs.map((song, i) => `${i+1}. ${song}`).join('\n');
                    await interaction.reply(`📋 Playlist ${playlistName}:\n${list}`);
                }
                break;
            }
        }
    }
};
