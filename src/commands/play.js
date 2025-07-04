// src/commands/play.js
const { joinVoiceChannel } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');
const { playTracks } = require('../utils/audioPlayer');
const { getLocalTracks, findTrackByName } = require('../sources/local');
const fs = require('fs');
const path = require('path');

const PLAYLISTS_PATH = path.join(__dirname, '../../config/playlists.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce música')
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Servidor, playlist o canción')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('shuffle')
                .setDescription('Mezclar las pistas')
                .setRequired(false)),
    
    async execute(interaction) {
        const nombre = interaction.options.getString('nombre');
        const shuffle = interaction.options.getBoolean('shuffle') || false;
        
        let pistas = [];
        let sourceName = nombre;


	pistas = pistas.map(track => {
	  if (typeof track !== 'string') {
	    console.warn(`⚠️ Pista no es string:`, track);
	    return String(track); // Convertir a string
	  }
	  return track;
	});


        try {
            // Verificar si es una playlist
            if (fs.existsSync(PLAYLISTS_PATH)) {
                const playlists = JSON.parse(fs.readFileSync(PLAYLISTS_PATH));
                if (playlists[nombre]) {
                    // Buscar las rutas completas de las canciones
                    pistas = playlists[nombre]
                        .map(fileName => findTrackByName(fileName))
                        .filter(Boolean);
                    
                    if (pistas.length === 0) {
                        return interaction.reply(`❌ Playlist vacía o canciones no encontradas: ${nombre}`);
                    }
                    
                    sourceName = `Playlist: ${nombre}`;
                }
            }
            
            // Si no es playlist, buscar como servidor
            if (pistas.length === 0) {
                pistas = getLocalTracks(nombre);
                if (pistas.length === 0) {
                    // Intentar buscar como archivo individual
                    const trackPath = findTrackByName(nombre);
                    if (trackPath) {
                        pistas = [trackPath];
                        sourceName = path.basename(trackPath);
                    } else {
                        return interaction.reply(`❌ No se encontró: ${nombre}`);
                    }
                } else {
                    sourceName = `Servidor: ${nombre}`;
                }
            }
            
            // Aplicar shuffle si se solicitó
            if (shuffle) {
                for (let i = pistas.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pistas[i], pistas[j]] = [pistas[j], pistas[i]];
                }
            }
            
            // Conectar al canal de voz
            const canal = interaction.member.voice.channel;
            if (!canal) {
                return interaction.reply('❌ Debes estar en un canal de voz.');
            }
            
            const connection = joinVoiceChannel({
                channelId: canal.id,
                guildId: canal.guild.id,
                adapterCreator: canal.guild.voiceAdapterCreator
            });
            
            // Reproducir
            await interaction.reply(`▶️ Reproduciendo: ${sourceName}${shuffle ? ' (mezclado)' : ''}`);
            playTracks(interaction.guildId, connection, pistas, interaction);
            
        } catch (error) {
            console.error('Error en /play:', error);
            interaction.reply(`❌ Error: ${error.message}`);
        }
    }
};
