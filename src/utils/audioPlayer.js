const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

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
    const recurso = createAudioResource(require('path').join(__dirname, '../../canciones', pista.path));
    player.play(recurso);
    interaction.followUp(`🎶 Reproduciendo: ${pista.path}`);
  };

  player.on(AudioPlayerStatus.Idle, playNext);
  player.on('error', err => {
    console.error('Error en track:', err);
    playNext();
  });

  playNext();
}

module.exports = { playTracks };
