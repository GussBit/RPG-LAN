/**
 * Script de Inicialização RPG-LAN
 * Salve este arquivo como 'start.js' na raiz do projeto (e:\RPG-LAN\)
 * Para rodar: node start.js
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 1. Função para obter o IP da rede local (IPv4)
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Pula interfaces internas (localhost) e não-IPv4
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const ip = getLocalIp();
console.log(`\n📡 \x1b[36mIP Local Detectado: ${ip}\x1b[0m`);

// 2. Configurar o .env do Frontend
// Isso garante que variáveis de ambiente estejam atualizadas com o IP atual.
// Nota: Seu código atual (MobCard.jsx) já usa window.location.hostname de forma inteligente,
// mas isso é útil caso você adicione novas funcionalidades que dependam de env vars.
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const envContent = `VITE_API_URL=http://${ip}:3333\n`;

try {
    // Escreve ou sobrescreve o arquivo .env
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log(`✅ \x1b[32mArquivo frontend/.env configurado.\x1b[0m`);
} catch (err) {
    console.error('❌ Erro ao configurar .env:', err);
}

// 3. Rodar Backend e Frontend em paralelo
console.log('\n🚀 \x1b[33mIniciando servidores...\x1b[0m\n');

// Inicia o Backend
// Definimos o 'cwd' (current working directory) para 'backend' para que ele ache o db.json corretamente
const backend = spawn('node', ['server.js'], { 
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit', // Mostra o log do backend no terminal principal
    shell: true 
});

// Inicia o Frontend
// O argumento '-- --host' diz ao Vite para expor o servidor na rede (0.0.0.0)
const frontend = spawn('npm', ['run', 'dev', '--', '--host'], { 
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit', // Mostra o log do frontend no terminal principal
    shell: true 
});

// Tratamento para fechar os processos filhos quando você der Ctrl+C no script principal
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando RPG-LAN...');
    backend.kill();
    frontend.kill();
    process.exit();
});
