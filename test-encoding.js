const fs = require('fs');
const path = require('path');

const testPath = '/HDD4TB2/home/jfuser/Musica/XTC/2019 - XTC as The Dukes of Stratosphear - Psurroundabout Ride';

function hexDump(buffer) {
    return buffer.toString('hex').match(/.{1,2}/g).join(' ');
}

async function testDirectory(dirPath) {
    try {
        const files = await fs.promises.readdir(dirPath, { encoding: 'buffer' });
        
        console.log(`\nContenido de: ${dirPath}`);
        console.log('='.repeat(80));
        
        for (const fileBuffer of files) {
            const hex = hexDump(fileBuffer);
            const asString = fileBuffer.toString('utf8');
            const normalized = asString.replace(/�/g, "'");
            
            console.log(`- Hex: ${hex}`);
            console.log(`  UTF-8: ${asString}`);
            
            if (normalized !== asString) {
                console.log(`  Normalizado: ${normalized}`);
            }
            
            console.log('-'.repeat(40));
        }
    } catch (error) {
        console.error(`Error leyendo directorio: ${error.message}`);
    }
}

// Probar varios directorios problemáticos
testDirectory(testPath);
testDirectory('/HDD4TB2/home/jfuser/Musica/');
