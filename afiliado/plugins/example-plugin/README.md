# Plugin de Exemplo

Plugin de demonstração para o sistema Afiliado Pro.

## Funcionalidades

- Contador de execuções
- Armazenamento local
- API de estatísticas

## Uso

```javascript
const plugin = await pluginManager.getPlugin('example-plugin');
const result = await plugin.execute({ param: 'value' });
console.log(result);
```

## Métodos

### execute(params)
Executa o plugin com os parâmetros fornecidos.

### getStats()
Retorna estatísticas de uso do plugin.

## Requisitos

- Plano: Base ou superior
- Permissões: storage.local
