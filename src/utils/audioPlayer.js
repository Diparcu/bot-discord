const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { getLocalResource } = require('../sources/local');

function playTracks(connection, pistas, interaction) {
  const player = createAudioPlayer();
  connection.subscribe(player);

  let index = 0;
  const playNext = () => {
    if (index >= pistas.length) {
      connection.destroy();
      return;
    }
    const pista = pistas[index++];
    try {
      const recurso = getLocalResource(pista.path);
      player.play(recurso);
      interaction.followUp(`🎶 Reproduciendo: ${pista.path}`);
    } catch (err) {
      interaction.followUp(`❌ Error: ${err.message}`);
      console.error(err);
      playNext();
    }
  };

  player.on(AudioPlayerStatus.Idle, playNext);
  player.on('error', err => {
    console.error('AudioPlayer error:', err);
    playNext();
  });

  playNext();
}

module.exports = { playTracks };
