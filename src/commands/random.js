const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const path = require('path');
const audioPlayer = require('../utils/audioPlayer');
const local = require('../sources/local');

const MUSIC_BASE_PATHS = [
    '/HDD4TB1/home/jfuser/Musica',
    '/HDD4TB2/home/jfuser/Musica',
    '/HDD4TB3/home/jfuser/Musica'
];

// Función para obtener múltiples pistas aleatorias
const getRandomTracks = async (serverName, count) => {
    let tracks = [];
    
    if (serverName) {
        const serverTracks = await local.getLocalTracks(serverName) || [];
        if (serverTracks.length === 0) return [];
        
        // Mezclar aleatoriamente y tomar las primeras 'count'
        tracks = serverTracks
            .map(track => track.path)
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    } else {
        const allTracks = await local.getAllTracks() || [];
        if (allTracks.length === 0) return [];
        
        // Mezclar aleatoriamente y tomar las primeras 'count'
        tracks = allTracks
            .map(track => track.path)
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }
    
    return tracks;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Reproduce canciones aleatorias continuamente')
        .addStringOption(option =>
            option.setName('servidor')
                .setDescription('Nombre del servidor (opcional)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Número de canciones (0 = infinito)')
                .setRequired(false)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const serverName = interaction.options.getString('servidor');
        const cantidad = interaction.options.getInteger('cantidad') || 10; // Default 10 canciones
        const isInfinite = cantidad === 0;
        
        try {
            const canal = interaction.member.voice.channel;
            if (!canal) {
                return interaction.editReply('❌ Debes estar en un canal de voz.');
            }
            
            const connection = joinVoiceChannel({
                channelId: canal.id,
                guildId: canal.guild.id,
                adapterCreator: canal.guild.voiceAdapterCreator
            });
            
            // Obtener pistas aleatorias
            const tracks = await getRandomTracks(serverName, isInfinite ? 100 : cantidad);
            
            if (tracks.length === 0) {
                return interaction.editReply('❌ No se encontraron pistas para reproducir.');
            }
            
            // Mensaje informativo
            const sourceName = serverName || "todos los servidores";
            const modeMessage = isInfinite ? 
                `♾️ Reproduciendo canciones aleatorias infinitas de ${sourceName}` : 
                `🎲 Reproduciendo ${tracks.length} canciones aleatorias de ${sourceName}`;
            
            await interaction.editReply(modeMessage);
            
            // Configurar modo infinito si es necesario
            const options = {
                infinite: isInfinite,
                source: serverName || "all"
            };
            
            // Iniciar reproducción
            audioPlayer.playTracks(interaction.guildId, connection, tracks, interaction, options);
            
        } catch (error) {
            console.error('Error en comando /random:', error);
            interaction.editReply(`❌ Error: ${error.message}`);
        }
    }
};