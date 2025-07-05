// src/commands/play.js
const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const local = require('../sources/local');
const audioPlayer = require('../utils/audioPlayer');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción específica')
        .addStringOption(option =>
            option.setName('cancion')
                .setDescription('Nombre de la canción')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('numero')
                .setDescription('Número de la canción si hay múltiples resultados')
                .setRequired(false)),
    
    async execute(interaction) {
        await interaction.deferReply();
        const songName = interaction.options.getString('cancion');
        const trackNumber = interaction.options.getInteger('numero') || 1;

        // Buscar la canción
        const tracks = await local.findTrackByName(songName);
        if (!tracks || tracks.length === 0) {
            return interaction.editReply('❌ No se encontró la canción');
        }

        // Si hay múltiples resultados
        if (tracks.length > 1) {
            if (trackNumber < 1 || trackNumber > tracks.length) {
                let response = `🔍 Se encontraron ${tracks.length} canciones:\n`;
                tracks.slice(0, 10).forEach((track, index) => {
                    const name = track.bufferName.toString('utf8').replace(/�/g, "'");
                    response += `${index + 1}. ${name}\n`;
                });
                response += `\nPor favor selecciona un número entre 1 y ${tracks.length}`;
                return interaction.editReply(response);
            }
        }

        const selectedTrack = tracks[trackNumber - 1];
        const trackPath = selectedTrack.path;
        
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.editReply('❌ Debes estar en un canal de voz');
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        await interaction.editReply(`🎵 Reproduciendo: ${path.basename(trackPath)}`);
        audioPlayer.playTracks(interaction.guildId, connection, [trackPath], interaction);
    }
};