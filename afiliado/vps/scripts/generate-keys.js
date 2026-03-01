const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Gerar par de chaves RSA
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Criar diretório de chaves
const keysDir = path.join(__dirname, '..', 'keys');
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
}

// Salvar chaves
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

console.log('Chaves geradas com sucesso!');
console.log('Chave pública salva em: keys/public.pem');
console.log('Chave privada salva em: keys/private.pem');
console.log('\nIMPORTANTE: Copie a chave pública para o Core Engine');
