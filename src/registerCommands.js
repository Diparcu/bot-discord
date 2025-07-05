// src/registerCommands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Validar variables de entorno
const validateEnv = () => {
    const requiredVars = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'DISCORD_GUILD_ID'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.error(`❌ Faltan variables de entorno: ${missing.join(', ')}`);
        console.log('Verifica tu archivo .env y asegúrate de incluir:');
        console.log('DISCORD_TOKEN=tu_token');
        console.log('DISCORD_CLIENT_ID=tu_client_id');
        console.log('DISCORD_GUILD_ID=tu_server_id');
        process.exit(1);
    }
};

// Cargar comandos desde el directorio
const loadCommands = () => {
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith('.js') && !file.startsWith('_'));

    console.log('📂 Comandos encontrados:');
    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if (!command.data) {
                console.warn(`⚠️  ${file}: Falta propiedad 'data'`);
                continue;
            }
            
            commands.push(command.data.toJSON());
            console.log(`✅  ${command.data.name.padEnd(15)} (${file})`);
        } catch (error) {
            console.error(`❌ Error cargando ${file}: ${error.message}`);
        }
    }
    return commands;
};

// Registrar comandos en Discord
const registerCommands = async (commands) => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        console.log(`\n⌛ Registrando ${commands.length} comandos en Discord...`);
        
        const data = await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID, 
                process.env.DISCORD_GUILD_ID
            ),
            { body: commands }
        );
        
        console.log(`\n✨ ${data.length} comandos registrados exitosamente!`);
        console.log(`👤 Client ID: ${process.env.DISCORD_CLIENT_ID}`);
        console.log(`🏠 Server ID: ${process.env.DISCORD_GUILD_ID}`);
    } catch (error) {
        console.error('\n❌ Error registrando comandos:');
        
        if (error.code === 50001) {
            console.error('⚠️ Falta el permiso "applications.commands" en el servidor');
        } else if (error.code === 50013) {
            console.error('⚠️ Permisos insuficientes para registrar comandos');
        } else {
            console.error(error);
        }
        
        process.exit(1);
    }
};

// Ejecución principal
(async () => {
    console.log('🚀 Iniciando registro de comandos...\n');
    validateEnv();
    
    const commands = loadCommands();
    if (commands.length === 0) {
        console.error('\n❌ No se encontraron comandos válidos para registrar');
        process.exit(1);
    }
    
    await registerCommands(commands);
})();
