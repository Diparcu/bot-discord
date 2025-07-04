const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const path = require('path');
const audioPlayer = require('../utils/audioPlayer');
const local = require('../sources/local'); // Importación corregida

const MUSIC_BASE_PATHS = [
    '/HDD4TB1/home/jfuser/Musica',
    '/HDD4TB2/home/jfuser/Musica',
    '/HDD4TB3/home/jfuser/Musica'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Reproduce una canción aleatoria')
        .addStringOption(option =>
            option.setName('servidor')
                .setDescription('Nombre del servidor (opcional)')
                .setRequired(false)),
    
    async execute(interaction) {
        await interaction.deferReply();
        
        const serverName = interaction.options.getString('servidor');
        let trackObject;
        let randomTrackPath;
        let sourceName = "aleatoria";
        let trackName;
        
        try {
            if (serverName) {
                const tracks = await local.getLocalTracks(serverName) || [];
                if (!tracks || tracks.length === 0) {
                    return interaction.editReply(`❌ No se encontraron pistas en: ${serverName}`);
                }
                const randomEntry = tracks[Math.floor(Math.random() * tracks.length)];
                trackObject = randomEntry;
                randomTrackPath = randomEntry.path;
                
                try {
                    trackName = randomEntry.bufferName.toString('utf8').replace(/�/g, "'");
                } catch (error) {
                    console.warn('Error decodificando nombre, usando nombre de archivo');
                    trackName = path.basename(randomTrackPath);
                }
            } 
            else {
                const allTracks = await local.getAllTracks() || [];
                if (!allTracks || allTracks.length === 0) {
                    return interaction.editReply('❌ No se encontraron pistas en ningún servidor');
                }
                
                trackObject = allTracks[Math.floor(Math.random() * allTracks.length)];
                randomTrackPath = trackObject.path;
                
                // Manejo mejorado de sourceName
                let foundSource = false;
                for (const basePath of MUSIC_BASE_PATHS) {
                    if (randomTrackPath && randomTrackPath.startsWith(basePath)) {
                        const relativePath = path.relative(basePath, path.dirname(randomTrackPath));
                        sourceName = relativePath.split(path.sep)[0] || "desconocido";
                        foundSource = true;
                        break;
                    }
                }
                if (!foundSource) sourceName = "desconocido";
                
                try {
                    trackName = trackObject.bufferName.toString('utf8').replace(/�/g, "'");
                } catch (error) {
                    console.warn('Error decodificando nombre, usando nombre de archivo');
                    trackName = path.basename(randomTrackPath);
                }
            }
            
            // Verificar que tenemos una ruta válida
            if (!randomTrackPath || typeof randomTrackPath !== 'string') {
                throw new Error('La ruta del track seleccionado es inválida');
            }
            
            const canal = interaction.member.voice.channel;
            if (!canal) {
                return interaction.editReply('❌ Debes estar en un canal de voz.');
            }
            
            const connection = joinVoiceChannel({
                channelId: canal.id,
                guildId: canal.guild.id,
                adapterCreator: canal.guild.voiceAdapterCreator
            });
            
            await interaction.editReply(`🎲 Reproduciendo aleatorio: **${trackName}** (de ${sourceName})`);
            audioPlayer.playTracks(interaction.guildId, connection, [randomTrackPath], interaction);
            
        } catch (error) {
            console.error('Error en comando /random:', error);
            interaction.editReply(`❌ Error: ${error.message}`);
        }
    }
};