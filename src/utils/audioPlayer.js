const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { getLocalResource } = require('../sources/local');
const path = require('path');

const players = new Map(); // guildId -> { connection, player, queue, currentIndex }

function playTracks(guildId, connection, pistas, interaction, options = {}) {
    // Filtrar pistas válidas
    let queue = pistas.filter(p => p && typeof p === 'string' && p.trim() !== '');
    
    if (queue.length === 0) {
        interaction.followUp('❌ No hay pistas válidas para reproducir');
        return;
    }

    // Obtener o crear el reproductor
    let playerInfo = players.get(guildId);
    if (!playerInfo) {
        const player = createAudioPlayer();
        connection.subscribe(player);
        playerInfo = {
            connection,
            player,
            queue: [],
            currentIndex: -1
        };
        players.set(guildId, playerInfo);
    }

    // Agregar nuevas pistas a la cola
    playerInfo.queue.push(...queue);

    // Configurar manejadores de eventos si es la primera vez
    if (!playerInfo.eventHandlersSet) {
        playerInfo.player.on(AudioPlayerStatus.Idle, () => {
            playNext(guildId, interaction);
        });
        
        playerInfo.player.on('error', err => {
            console.error('Error audioPlayer:', err);
            interaction.followUp(`❌ Error en pista: ${err.message}`);
            playNext(guildId, interaction);
        });
        
        playerInfo.eventHandlersSet = true;
    }

    // Si no se está reproduciendo nada, comenzar
    if (playerInfo.player.state.status === AudioPlayerStatus.Idle) {
        playNext(guildId, interaction);
    }

    interaction.followUp(`✅ Se agregaron ${queue.length} canciones a la cola`);
}

function playNext(guildId, interaction) {
    const playerInfo = players.get(guildId);
    if (!playerInfo || playerInfo.queue.length === 0) return;

    playerInfo.currentIndex++;
    
    // Si llegamos al final de la cola
    if (playerInfo.currentIndex >= playerInfo.queue.length) {
        cleanup(guildId);
        return;
    }

    const pista = playerInfo.queue[playerInfo.currentIndex];
    try {
        const recurso = getLocalResource(pista);
        playerInfo.player.play(recurso);
        
        const trackName = path.basename(pista);
        interaction.followUp(`🎶 Reproduciendo: ${trackName}`);
    } catch (err) {
        console.error('Error en recurso de audio:', err);
        interaction.followUp(`❌ Error en pista: ${err.message}`);
        playNext(guildId, interaction); // Saltar a la siguiente
    }
}

function skip(guildId, interaction) {
    const playerInfo = players.get(guildId);
    if (!playerInfo) return false;

    if (playerInfo.player.state.status === AudioPlayerStatus.Playing) {
        playerInfo.player.stop();
        return true;
    }
    return false;
}

function stopPlayer(guildId) {
    const data = players.get(guildId);
    if (!data) return false;
    data.player.stop(true);
    data.connection.destroy();
    players.delete(guildId);
    return true;
}

function cleanup(guildId) {
    const data = players.get(guildId);
    if (!data) return;
    data.connection.destroy();
    players.delete(guildId);
}

function getQueue(guildId) {
    const playerInfo = players.get(guildId);
    return playerInfo ? playerInfo.queue : [];
}

function getCurrentIndex(guildId) {
    const playerInfo = players.get(guildId);
    return playerInfo ? playerInfo.currentIndex : -1;
}

module.exports = { 
    playTracks, 
    skip, 
    stopPlayer, 
    players, 
    getQueue,
    getCurrentIndex
};