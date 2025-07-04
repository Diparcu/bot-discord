// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Crear cliente con los intents necesarios
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Cargar todos los comandos dinámicamente
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  // Verificar que el comando tenga la estructura correcta
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Comando cargado: ${command.data.name}`);
  } else {
    console.log(`⚠️ El archivo ${file} no exporta un comando válido`);
  }
}

// Eventos del cliente
client.on('ready', () => {
  console.log(`🎉 Bot iniciado como ${client.user.tag}`);
  console.log(`👤 ID: ${client.user.id}`);
  console.log(`👥 Servidores: ${client.guilds.cache.size}`);
  client.user.setActivity('música', { type: 'LISTENING' });
});

client.on('warn', console.warn);
client.on('error', console.error);
client.on('disconnect', (event) => {
  console.log(`🔌 Desconectado: ${event.code} - ${event.reason}`);
  if (event.code === 1000) process.exit(0);
});

// Manejo de interacciones
client.on('interactionCreate', async (interaction) => {
  // Solo manejar comandos slash
  if (!interaction.isChatInputCommand()) return;
  
  console.log(`🔄 Comando recibido: /${interaction.commandName} [Usuario: ${interaction.user.tag}]`);
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`❌ Comando no encontrado: ${interaction.commandName}`);
    return interaction.reply({
      content: 'Comando no reconocido!',
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
    console.log(`✅ Comando completado: /${interaction.commandName}`);
  } catch (error) {
    console.error(`❌ Error en comando /${interaction.commandName}:`, error);
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Hubo un error al ejecutar el comando!',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: 'Hubo un error al ejecutar el comando!',
          ephemeral: true
        });
      }
    } catch (err) {
      console.error('❌ Error al responder:', err);
    }
  }
});

// Manejo de señales para apagado limpio
process.on('SIGINT', () => {
  console.log('\n🔴 Recibido SIGINT. Apagando...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔴 Recibido SIGTERM. Apagando...');
  client.destroy();
  process.exit(0);
});

// Iniciar sesión
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('🔑 Iniciando sesión con Discord...'))
  .catch(error => {
    console.error('❌ Error al iniciar sesión:', error);
    process.exit(1);
  });
