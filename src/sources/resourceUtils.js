const { createAudioResource } = require('@discordjs/voice');
const path = require('path');

module.exports = {
    createLocalResource: (filePath) => {
        try {
            return createAudioResource(filePath, {
                metadata: {
                    title: path.basename(filePath)
                }
            });
        } catch (error) {
            console.error(`Error creando recurso para: ${filePath}`, error);
            throw new Error(`Formato no soportado o archivo corrupto: ${path.basename(filePath)}`);
        }
    }
};