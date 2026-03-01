# Perguntas Frequentes (FAQ)

## Geral

### O que é o Afiliado Pro?
Sistema desktop profissional para criação e gestão de conteúdo para afiliados, com arquitetura híbrida, plugins modulares e controle de quota.

### Quais sistemas operacionais são suportados?
- Windows 10/11 (disponível)
- macOS (em desenvolvimento)
- Linux (planejado)

### Preciso de internet para usar?
Sim, para funcionalidades completas. No modo offline, apenas recursos básicos do plano Free estão disponíveis.

### Como funciona o sistema de licenças?
Cada licença é vinculada ao fingerprint da sua máquina. Para usar em outro computador, é necessário desativar a licença atual.

---

## Planos e Preços

### Qual a diferença entre os planos?
- **Free**: 10 vídeos/mês, sem plugins
- **Base**: 100 vídeos/mês, 1 plugin
- **Growth**: 500 vídeos/mês, 3 plugins, analytics
- **Pro**: 10.000 vídeos/mês, todos plugins, white label

### Posso mudar de plano?
Sim, a qualquer momento. Upgrade é imediato, downgrade ocorre no próximo ciclo.

### O que acontece se eu exceder minha quota?
Você pode comprar quota adicional (pay-as-you-go) ou fazer upgrade do plano.

### Há desconto para pagamento anual?
Sim, 2 meses grátis no pagamento anual.

---

## Plugins

### Como instalo plugins?
Plugins são ativados remotamente através da página de Plugins no app. Basta ter o plano adequado.

### Posso criar meus próprios plugins?
Sim! Veja [PLUGINS.md](PLUGINS.md) para documentação completa.

### Plugins funcionam offline?
Não, plugins requerem validação remota.

### Como publico um plugin no marketplace?
O marketplace estará disponível em Q3 2024. Cadastre-se na lista de espera.

---

## Segurança

### Meus dados estão seguros?
Sim. Dados são armazenados localmente. Apenas informações de validação são enviadas para a VPS.

### Como funciona a validação remota?
A cada ação importante, o Core consulta a VPS para verificar permissões e quota. Tudo é criptografado.

### Posso usar em múltiplos computadores?
Depende do plano. Free e Base: 1 dispositivo. Growth: 2 dispositivos. Pro: 5 dispositivos.

### O que é fingerprint da máquina?
Um hash único gerado a partir das características do seu computador, usado para vincular a licença.

---

## Técnico

### Qual porta o Core usa?
Porta dinâmica, escolhida automaticamente ao iniciar.

### Posso usar minha própria API de LLM?
Sim! Configure suas chaves Groq/OpenAI nas Settings.

### Como faço backup dos meus dados?
Dados são armazenados em `%APPDATA%/afiliado`. Faça backup desta pasta.

### O app consome muitos recursos?
Não. Core em Go é extremamente eficiente. Uso médio: ~100MB RAM, <1% CPU.

---

## Problemas Comuns

### App não abre
1. Verifique se não há outra instância rodando
2. Tente executar como administrador
3. Reinstale o aplicativo

### Erro de validação
1. Verifique sua conexão com internet
2. Tente fazer logout e login novamente
3. Entre em contato com suporte

### Quota não atualiza
1. Aguarde alguns segundos (sincronização)
2. Recarregue a página
3. Faça logout e login

### Plugin não ativa
1. Verifique se seu plano permite
2. Verifique conexão com internet
3. Tente desativar e ativar novamente

---

## Desenvolvimento

### Como contribuo com o projeto?
Veja [CONTRIBUTING.md](../CONTRIBUTING.md) para diretrizes.

### Onde reporto bugs?
Abra uma issue no GitHub com o template de bug report.

### Como sugiro features?
Abra uma issue no GitHub com o template de feature request.

### Posso ver o código fonte?
Sim, o projeto é open source (MIT License).

---

## Suporte

### Como entro em contato?
- Email: support@afiliado.com
- GitHub Issues: Para bugs e features
- Discord: (em breve)

### Qual o tempo de resposta?
- Free: 48-72h (comunidade)
- Base: 24-48h (email)
- Growth: 12-24h (prioritário)
- Pro: 4-8h (dedicado)

### Há documentação?
Sim! Veja a pasta `/docs` para documentação completa.

### Onde encontro tutoriais?
- Documentação oficial
- YouTube (em breve)
- Academy (planejado para 2025)

---

## Pagamentos

### Quais formas de pagamento aceitas?
- Cartão de crédito
- Boleto bancário
- PIX
- PayPal (internacional)

### Posso cancelar a qualquer momento?
Sim, sem multas. Acesso continua até o fim do período pago.

### Há reembolso?
Sim, 7 dias de garantia para novos usuários.

### Como funciona o faturamento?
Cobrança automática no mesmo dia de cada mês.

---

## Outros

### Posso usar para fins comerciais?
Sim, todos os planos permitem uso comercial.

### Há limite de projetos?
Não, apenas limite de vídeos gerados por mês.

### Posso revender o software?
Não, mas temos programa de afiliados (Q3 2024).

### O software será sempre pago?
O plano Free sempre existirá com funcionalidades básicas.

---

Não encontrou sua resposta? Abra uma issue ou entre em contato!
