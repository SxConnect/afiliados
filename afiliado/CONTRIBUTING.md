# Guia de Contribuição

## Como Contribuir

Agradecemos seu interesse em contribuir! Este documento fornece diretrizes para contribuições.

## Código de Conduta

- Seja respeitoso
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia

## Tipos de Contribuição

### Reportar Bugs
- Use o template de issue
- Descreva o comportamento esperado
- Descreva o comportamento atual
- Passos para reproduzir
- Screenshots se aplicável

### Sugerir Features
- Descreva o problema que resolve
- Descreva a solução proposta
- Alternativas consideradas
- Contexto adicional

### Pull Requests
- Fork o repositório
- Crie uma branch (`git checkout -b feature/MinhaFeature`)
- Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
- Push para a branch (`git push origin feature/MinhaFeature`)
- Abra um Pull Request

## Padrões de Código

### Go
```go
// Comentário descritivo
func MinhaFuncao(param string) error {
    if param == "" {
        return errors.New("param vazio")
    }
    return nil
}
```

### TypeScript/React
```typescript
// Componente funcional
export function MeuComponente({ prop }: Props) {
  const [state, setState] = useState('');
  
  return <div>{state}</div>;
}
```

### Commits
```
Add: Nova funcionalidade
Fix: Correção de bug
Update: Atualização de código
Refactor: Refatoração
Docs: Documentação
Test: Testes
```

## Testes

### Go
```bash
go test ./...
```

### TypeScript
```bash
npm test
```

## Documentação

- Documente funções públicas
- Atualize README se necessário
- Adicione exemplos quando relevante

## Processo de Review

1. Automated checks devem passar
2. Code review por mantenedor
3. Aprovação necessária para merge
4. Squash and merge preferencial

## Dúvidas?

Abra uma issue com a tag `question`
