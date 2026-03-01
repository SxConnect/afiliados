# 💡 Exemplos de Uso - Sistema Afiliados

## 🎯 Casos de Uso Práticos

### 1. Sistema de Atendimento Automático

Configure respostas automáticas para perguntas frequentes:

```javascript
// 1. Validar licença
const authResponse = await fetch('http://localhost:3001/api/license/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '5511999999999' })
});

const { token } = await authResponse.json();

// 2. Adicionar regras de auto-resposta
const rules = [
  {
    trigger: 'horário',
    response: '🕐 Horário de atendimento:\nSegunda a Sexta: 9h às 18h\nSábado: 9h às 13h',
    matchType: 'contains'
  },
  {
    trigger: 'preço',
    response: '💰 Consulte nossos preços em: https://seusite.com/precos',
    matchType: 'contains'
  },
  {
    trigger: 'oi|olá|bom dia',
    response: '👋 Olá! Como posso ajudar você hoje?',
    matchType: 'regex'
  }
];

for (const rule of rules) {
  await fetch('http://localhost:3001/api/plugins/auto-responder/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'add-rule',
      params: rule
    })
  });
}

console.log('✅ Regras de auto-resposta configuradas!');
```

### 2. Campanha de Marketing Agendada

Agende mensagens para serem enviadas em horários específicos:

```javascript
// Lista de contatos
const contacts = [
  '5511999999999@s.whatsapp.net',
  '5511888888888@s.whatsapp.net',
  '5511777777777@s.whatsapp.net'
];

// Mensagem da campanha
const message = `
🎉 PROMOÇÃO ESPECIAL! 🎉

Aproveite 50% OFF em todos os produtos!

Válido apenas hoje até às 23:59h.

🛒 Acesse: https://seusite.com/promo
`;

// Agendar para daqui a 1 hora
const scheduledTime = Date.now() + (60 * 60 * 1000);

// Agendar para cada contato
for (const contact of contacts) {
  await fetch('http://localhost:3001/api/plugins/message-scheduler/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'schedule',
      params: {
        instanceId: 'minha-instancia',
        jid: contact,
        text: message,
        scheduledTime
      }
    })
  });
}

console.log(`✅ ${contacts.length} mensagens agendadas!`);
```

### 3. Sistema de Notificações de Pedidos

Envie notificações automáticas quando um pedido for realizado:

```javascript
async function notificarNovoPedido(pedido) {
  const message = `
🛍️ NOVO PEDIDO RECEBIDO!

📋 Pedido: #${pedido.id}
👤 Cliente: ${pedido.clienteNome}
💰 Valor: R$ ${pedido.valor.toFixed(2)}
📦 Itens: ${pedido.itens.length}

Status: Aguardando pagamento

Acesse o painel para mais detalhes.
  `;

  // Enviar para o vendedor
  await fetch('http://localhost:3001/api/whatsapp/send/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      instanceId: 'minha-instancia',
      jid: '5511999999999@s.whatsapp.net', // Número do vendedor
      text: message
    })
  });

  // Enviar confirmação para o cliente
  const clienteMessage = `
✅ Pedido Confirmado!

Olá ${pedido.clienteNome}!

Seu pedido #${pedido.id} foi recebido com sucesso.

💰 Valor: R$ ${pedido.valor.toFixed(2)}

Você receberá o link de pagamento em instantes.

Obrigado pela preferência! 🙏
  `;

  await fetch('http://localhost:3001/api/whatsapp/send/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      instanceId: 'minha-instancia',
      jid: pedido.clienteWhatsapp,
      text: clienteMessage
    })
  });
}

// Exemplo de uso
notificarNovoPedido({
  id: 12345,
  clienteNome: 'João Silva',
  clienteWhatsapp: '5511888888888@s.whatsapp.net',
  valor: 150.00,
  itens: ['Produto A', 'Produto B']
});
```

### 4. Envio de Mensagens com Botões Interativos

Crie menus interativos para seus clientes:

```javascript
async function enviarMenuPrincipal(clienteJid) {
  await fetch('http://localhost:3001/api/whatsapp/send/buttons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      instanceId: 'minha-instancia',
      jid: clienteJid,
      text: `
🏪 Bem-vindo à Nossa Loja!

Escolha uma das opções abaixo:
      `,
      buttons: [
        {
          type: 'reply',
          displayText: '📦 Ver Produtos',
          id: 'produtos'
        },
        {
          type: 'reply',
          displayText: '🛒 Meus Pedidos',
          id: 'pedidos'
        },
        {
          type: 'reply',
          displayText: '💬 Falar com Atendente',
          id: 'atendente'
        },
        {
          type: 'url',
          displayText: '🌐 Visitar Site',
          url: 'https://seusite.com'
        }
      ],
      footer: 'Atendimento 24/7'
    })
  });
}

enviarMenuPrincipal('5511999999999@s.whatsapp.net');
```

### 5. Sistema de Lembretes

Configure lembretes automáticos para seus clientes:

```javascript
async function agendarLembrete(clienteJid, mensagem, diasAntecedencia) {
  const dataLembrete = Date.now() + (diasAntecedencia * 24 * 60 * 60 * 1000);

  await fetch('http://localhost:3001/api/plugins/message-scheduler/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'schedule',
      params: {
        instanceId: 'minha-instancia',
        jid: clienteJid,
        text: mensagem,
        scheduledTime: dataLembrete
      }
    })
  });
}

// Lembrete de consulta
agendarLembrete(
  '5511999999999@s.whatsapp.net',
  `
⏰ LEMBRETE DE CONSULTA

Olá! Você tem uma consulta agendada para amanhã às 14h.

📍 Local: Clínica Saúde
👨‍⚕️ Dr. João Silva

Por favor, chegue 15 minutos antes.

Para cancelar ou reagendar, responda esta mensagem.
  `,
  1 // 1 dia antes
);
```

### 6. Integração com Webhook

Receba mensagens em tempo real:

```javascript
// Configurar webhook
await fetch('http://localhost:3001/api/whatsapp/webhook/configure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    instanceId: 'minha-instancia',
    webhookUrl: 'https://seu-servidor.com/webhook',
    events: ['messages', 'status']
  })
});

// No seu servidor, receba as mensagens:
app.post('/webhook', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'message') {
    const { key, message, pushName } = data;
    const messageText = message.conversation || '';
    const senderJid = key.remoteJid;

    console.log(`📩 Mensagem de ${pushName}: ${messageText}`);

    // Processar com auto-responder
    await fetch('http://localhost:3001/api/plugins/auto-responder/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        action: 'process-message',
        params: {
          instanceId: 'minha-instancia',
          jid: senderJid,
          messageText
        }
      })
    });
  }

  res.json({ success: true });
});
```

### 7. Monitoramento de Quota

Verifique sua quota antes de enviar mensagens em massa:

```javascript
async function verificarQuotaAntesDeCampanha(quantidadeMensagens) {
  const response = await fetch('http://localhost:3001/api/metrics/quota', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const { quota } = await response.json();

  if (quota.available < quantidadeMensagens) {
    console.error(`❌ Quota insuficiente!`);
    console.log(`   Disponível: ${quota.available}`);
    console.log(`   Necessário: ${quantidadeMensagens}`);
    console.log(`   Faça upgrade do seu plano!`);
    return false;
  }

  console.log(`✅ Quota suficiente para enviar ${quantidadeMensagens} mensagens`);
  return true;
}

// Antes de enviar campanha
if (await verificarQuotaAntesDeCampanha(1000)) {
  // Enviar campanha
  console.log('Iniciando campanha...');
}
```

### 8. Envio de Imagens com Legenda

Envie imagens promocionais:

```javascript
async function enviarPromocaoComImagem(clienteJid) {
  await fetch('http://localhost:3001/api/whatsapp/send/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      instanceId: 'minha-instancia',
      jid: clienteJid,
      url: 'https://seusite.com/imagens/promo-black-friday.jpg',
      caption: `
🔥 BLACK FRIDAY 🔥

Até 70% OFF em produtos selecionados!

⏰ Apenas hoje!

🛒 Acesse: https://seusite.com/black-friday
      `
    })
  });
}

enviarPromocaoComImagem('5511999999999@s.whatsapp.net');
```

## 🔧 Dicas de Boas Práticas

### 1. Sempre Verifique Quota
```javascript
async function enviarComVerificacao(jid, text) {
  const quotaResponse = await fetch('http://localhost:3001/api/metrics/quota', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { quota } = await quotaResponse.json();
  
  if (quota.available <= 0) {
    throw new Error('Quota esgotada');
  }
  
  return await enviarMensagem(jid, text);
}
```

### 2. Trate Erros Adequadamente
```javascript
async function enviarMensagemSegura(jid, text) {
  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/send/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        instanceId: 'minha-instancia',
        jid,
        text
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.error('Erro ao enviar:', data.error);
      return null;
    }

    return data.messageId;
  } catch (error) {
    console.error('Erro de rede:', error);
    return null;
  }
}
```

### 3. Use Delays Entre Mensagens
```javascript
async function enviarEmMassa(contatos, mensagem) {
  for (let i = 0; i < contatos.length; i++) {
    await enviarMensagem(contatos[i], mensagem);
    
    // Aguarda 2 segundos entre cada envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Enviado ${i + 1}/${contatos.length}`);
  }
}
```

## 📚 Recursos Adicionais

- [Documentação da API](./API_DOCUMENTATION.md)
- [Guia de Instalação](./GUIA_INSTALACAO.md)
- [Documentação PAPI](../Documentação da papi)

## 🆘 Suporte

Para mais exemplos ou dúvidas, consulte a documentação completa ou entre em contato com o suporte.
