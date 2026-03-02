// Script para iniciar servidor de teste com variáveis de ambiente
require('dotenv').config();

// Verificar se as variáveis estão carregadas
console.log('🔧 Configurando servidor de teste...');
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ Faltando'}`);
console.log(`LICENSE_SECRET: ${process.env.LICENSE_SECRET ? '✅ Configurado' : '❌ Faltando'}`);

// Se não estiver configurado, usar valores de teste
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-for-load-testing';
}
if (!process.env.LICENSE_SECRET) {
    process.env.LICENSE_SECRET = 'test-license-secret-for-load-testing';
}
if (!process.env.PORT) {
    process.env.PORT = '3000';
}

console.log('✅ Variáveis configuradas');
console.log('🚀 Iniciando servidor...\n');

// Iniciar o servidor
require('./server.js');
