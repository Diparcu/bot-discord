const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const { createAudioResource } = require('@discordjs/voice');

const MUSIC_BASE_PATHS = [
    '/HDD4TB1/home/jfuser/Musica',
    '/HDD4TB2/home/jfuser/Musica',
    '/HDD4TB3/home/jfuser/Musica'
];

// Función para normalizar nombres de archivo problemáticos
const normalizeFileName = (name) => {
    // Intenta reparar caracteres mal codificados
    const repaired = name
        .replace(/\x92|\xE2\x80\x99/g, "'")  // Apostrofes mal codificados
        .replace(/\xE2\x80\x93|\x96/g, '-')   // Guiones mal codificados
        .replace(/\xE2\x80\x9C|\xE2\x80\x9D/g, '"') // Comillas mal codificadas
        .replace(/\xE2\x80\xA6/g, '...')      // Puntos suspensivos
        .replace(/[\x00-\x1F\x7F]/g, '');     // Eliminar caracteres de control
    
    return repaired;
};

// Función mejorada para buscar archivos de audio
const findAudioFiles = async (dir) => {
    const results = [];
    
    try {
        const files = await readdir(dir, { encoding: 'buffer' });
        
        for (const fileBuffer of files) {
            try {
                // Usar el buffer directamente para construir la ruta
                const fileName = fileBuffer.toString('binary'); // Usar binary para preservar bytes
                const filePath = path.join(dir, fileName);
                
                // Verificar si el archivo existe
                if (!fs.existsSync(filePath)) {
                    console.warn(`⚠️ Archivo no encontrado: ${fileBuffer.toString('hex')}`);
                    continue;
                }
                
                const fileStat = await stat(filePath);
                
                if (fileStat.isDirectory()) {
                    const subFiles = await findAudioFiles(filePath);
                    results.push(...subFiles);
                } else {
                    const ext = path.extname(fileName).toLowerCase();
                    if (['.mp3', '.wav', '.ogg', '.flac'].includes(ext)) {
                        // Guardar tanto la ruta como el nombre original en buffer
                        results.push({
                            path: filePath,
                            bufferName: fileBuffer
                        });
                    }
                }
            } catch (fileError) {
                console.warn(`⚠️ Error procesando archivo: ${fileBuffer.toString('hex')}`);
            }
        }
    } catch (dirError) {
        console.error(`Error leyendo directorio: ${dir}`, dirError);
    }
    
    return results;
};

// Buscar por nombre de servidor (carpeta)
const getLocalTracks = async (serverName) => {
    const tracks = [];
    
    for (const basePath of MUSIC_BASE_PATHS) {
        const serverPath = path.join(basePath, serverName);
        
        try {
            // Verificar si el directorio existe
            if (!fs.existsSync(serverPath)) {
                continue;
            }
            
            const stats = await stat(serverPath);
            if (stats.isDirectory()) {
                const serverTracks = await findAudioFiles(serverPath);
                tracks.push(...serverTracks);
            }
        } catch (error) {
            console.error(`Error accediendo a ${serverPath}:`, error);
        }
    }
    
    return tracks;
};

// Obtener todas las pistas en todas las rutas
const getAllTracks = async () => {
    const allTracks = [];
    
    for (const basePath of MUSIC_BASE_PATHS) {
        try {
            // Verificar si la ruta base existe
            if (!fs.existsSync(basePath)) {
                continue;
            }
            
            const stats = await stat(basePath);
            if (stats.isDirectory()) {
                const baseTracks = await findAudioFiles(basePath);
                allTracks.push(...baseTracks);
            }
        } catch (error) {
            console.error(`Error accediendo a ${basePath}:`, error);
        }
    }
    
    return allTracks;
};

// Buscar por nombre de archivo (para playlist)
const findTrackByName = async (fileName) => {
    const normalizedFileName = normalizeFileName(fileName);
    
    for (const basePath of MUSIC_BASE_PATHS) {
        try {
            const files = await findAudioFiles(basePath);
            const found = files.find(file => {
                const baseName = path.basename(file.path);
                return normalizeFileName(baseName) === normalizedFileName;
            });
            
            if (found) return found;
        } catch (error) {
            console.error(`Error buscando en ${basePath}:`, error);
        }
    }
    return null;
};

// Crear recurso de audio
const getLocalResource = (filePath) => {
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
};

// Exporta todas las funciones
module.exports = {
    getLocalTracks,
    getAllTracks,
    findTrackByName,
    getLocalResource
};