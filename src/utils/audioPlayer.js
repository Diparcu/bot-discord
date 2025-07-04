const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const { getLocalResource } = require('../sources/local');

const players = new Map();

function playTracks(guildId, connection, pistas, interaction, options = {}) {
    // Filtrar pistas inválidas y asegurar que sean strings
    let queue = pistas
        .filter(p => p && typeof p === 'string' && p.trim() !== '')
        .map(p => p.trim());
    
    if (queue.length === 0) {
        interaction.followUp('❌ No hay pistas válidas para reproducir');
        return;
    }

    if (options.shuffle) {
        // Mejor método de mezcla
        queue = queue
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    const player = createAudioPlayer();
    connection.subscribe(player);
    players.set(guildId, { connection, player, queue });

    const next = () => {
        if (queue.length === 0) {
            cleanup(guildId);
            return;
        }
        
        const pista = queue.shift();
        try {
            const recurso = getLocalResource(pista);
            player.play(recurso);
            
            const trackName = path.basename(pista);
            interaction.followUp(`🎶 Reproduciendo: ${trackName}`);
        } catch (err) {
            console.error('Error en recurso de audio:', err);
            interaction.followUp(`❌ Error en pista: ${err.message}`);
            next(); // Saltar a la siguiente pista
        }
    };

    player.on(AudioPlayerStatus.Idle, next);
    player.on('error', err => {
        console.error('Error audioPlayer:', err);
        next();
    });

    next();
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

// Exporta como objeto para evitar problemas de referencia
module.exports = {
    playTracks,
    stopPlayer,
    players
};