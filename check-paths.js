// check-paths.js
const fs = require('fs');
const path = require('path');

const MUSIC_BASE_PATHS = [
    '/HDD4TB1/home/jfuser/Musica',
    '/HDD4TB2/home/jfuser/Musica',
    '/HDD4TB3/home/jfuser/Musica'
];

console.log('Verificando rutas de música:');
MUSIC_BASE_PATHS.forEach(basePath => {
    const exists = fs.existsSync(basePath);
    console.log(`- ${basePath}: ${exists ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    
    if (exists) {
        try {
            const stats = fs.statSync(basePath);
            console.log(`  Tipo: ${stats.isDirectory() ? 'Directorio' : 'Archivo'}`);
            console.log(`  Permisos: ${(stats.mode & 0o777).toString(8)}`);
            
            // Intentar leer contenido
            try {
                const files = fs.readdirSync(basePath);
                console.log(`  Contiene ${files.length} archivos/carpetas`);
            } catch (readError) {
                console.error('  Error leyendo contenido:', readError.message);
            }
        } catch (statError) {
            console.error('  Error obteniendo stats:', statError.message);
        }
    }
});
