# Guia de Deploy

## Deploy da VPS

### Opção 1: VPS Tradicional (DigitalOcean, AWS, etc)

```bash
# 1. Conectar ao servidor
ssh user@your-vps-ip

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clonar repositório
git clone <repo-url>
cd afiliado/vps

# 4. Instalar dependências
npm install --production

# 5. Gerar chaves
npm run generate-keys

# 6. Configurar PM2
sudo npm install -g pm2
pm2 start server.js --name afiliado-vps
pm2 startup
pm2 save

# 7. Configurar Nginx
sudo apt-get install nginx
```

### Nginx Config
```nginx
server {
    listen 80;
    server_name api.afiliado.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Opção 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

```bash
# Build e deploy
docker build -t afiliado-vps .
docker run -d -p 3000:3000 --name afiliado-vps afiliado-vps
```

## Deploy do Executável Desktop

### Windows

```bash
cd ui
npm run electron:build
```

O instalador estará em `ui/dist/Afiliado Pro Setup.exe`

### Distribuição

1. Upload para servidor de distribuição
2. Gerar hash SHA256
3. Criar arquivo de versão

```json
{
  "version": "1.0.0",
  "url": "https://downloads.afiliado.com/v1.0.0/setup.exe",
  "sha256": "...",
  "releaseNotes": "..."
}
```

## Atualização Automática

### Electron Auto-Updater

```javascript
// electron/main.js
const { autoUpdater } = require('electron-updater');

autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://updates.afiliado.com'
});

autoUpdater.checkForUpdatesAndNotify();
```

## Monitoramento

### VPS

```bash
# Instalar ferramentas
sudo apt-get install htop
pm2 install pm2-logrotate

# Monitorar
pm2 monit
pm2 logs afiliado-vps
```

### Logs

```javascript
// Winston logger
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Backup

### Banco de Dados (Futuro)

```bash
# Backup diário
0 2 * * * pg_dump afiliado > /backups/afiliado-$(date +\%Y\%m\%d).sql
```

### Chaves

```bash
# Backup seguro das chaves
tar -czf keys-backup.tar.gz vps/keys/
gpg -c keys-backup.tar.gz
```

## Segurança

### SSL/TLS

```bash
# Certbot (Let's Encrypt)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.afiliado.com
```

### Firewall

```bash
# UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Rate Limiting

```javascript
// Express rate limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

## Checklist de Deploy

- [ ] VPS configurada e rodando
- [ ] Chaves geradas e seguras
- [ ] SSL/TLS configurado
- [ ] Firewall ativo
- [ ] Monitoramento configurado
- [ ] Backups automáticos
- [ ] Rate limiting ativo
- [ ] Logs estruturados
- [ ] Executável testado
- [ ] Atualização automática funcionando
