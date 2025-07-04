const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Comprueba si el bot está activo'),
  async execute(interaction) {
    await interaction.reply('¡Pong! 🏓 Bot activo');
  }
};
