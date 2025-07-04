// src/registerCommands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 1. Leer manualmente el archivo .env
const envPath = path.resolve(__dirname, '../../bot-musica/.env');
console.log(`Leyendo .env desde: ${envPath}`);

let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Error leyendo .env:', error.message);
  process.exit(1);
}

// 2. Parsear manualmente las variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

console.log('Variables encontradas:', Object.keys(envVars));

// 3. Obtener variables específicas
const token = envVars.DISCORD_TOKEN;
const clientId = envVars.DISCORD_CLIENT_ID;
const guildId = envVars.DISCORD_GUILD_ID;

// 4. Validar que existen
if (!token) {
  console.error('❌ DISCORD_TOKEN no encontrado en .env');
  console.log('Contenido de .env:', envContent);
  process.exit(1);
}
if (!clientId) throw new Error('DISCORD_CLIENT_ID no definido en .env');
if (!guildId) throw new Error('DISCORD_GUILD_ID no definido en .env');

// 5. Registrar comandos
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js') && !file.startsWith('_'));

for (const file of commandFiles) {
  try {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
      commands.push(command.data.toJSON());
      console.log(`✅ Cargado: ${command.data.name}`);
    } else {
      console.warn(`⚠️ Comando sin 'data': ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error cargando ${file}:`, error.message);
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos...`);
    
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(`✨ ${data.length} comandos registrados exitosamente!`);
    console.log('📌 Servidor ID:', guildId);
    console.log('👤 Client ID:', clientId);
  } catch (error) {
    console.error('❌ Error registrando comandos:', error);
    
    if (error.code === 50001) {
      console.error('⚠️ Falta el permiso "applications.commands" en el servidor');
    }
  }
})();
