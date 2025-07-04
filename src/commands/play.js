const fs = require('fs');
const path = require('path');
const { joinVoiceChannel } = require('@discordjs/voice');
const { playTracks } = require('../utils/audioPlayer');

module.exports = {
  name: 'play',
  async execute(interaction) {
    const nombreLista = interaction.options.getString('nombre');
    const listasPath = path.join(__dirname, '../../config/playlists.json');

    if (!fs.existsSync(listasPath)) {
      return interaction.reply('❌ playlists.json no existe.');
    }

    const listas = JSON.parse(fs.readFileSync(listasPath, 'utf8'));
    const pistas = listas[nombreLista];

    if (!pistas || pistas.length === 0) {
      return interaction.reply(`❌ No encontré la lista "${nombreLista}".`);
    }

    const canal = interaction.member.voice.channel;
    if (!canal) {
      return interaction.reply('❌ Debes estar en un canal de voz para reproducir.');
    }

    const connection = joinVoiceChannel({
      channelId: canal.id,
      guildId: canal.guild.id,
      adapterCreator: canal.guild.voiceAdapterCreator
    });

    await interaction.reply(`▶️ Reproduciendo lista: **${nombreLista}**`);
    playTracks(connection, pistas, interaction);
  }
};
