module.exports = {
    name: 'Plugin de Exemplo',
    version: '1.0.0',

    async init(context) {
        console.log('Plugin de exemplo inicializado');
        this.context = context;
        this.storage = context.api.storage;
    },

    async execute(params) {
        console.log('Executando plugin com params:', params);

        // Exemplo de uso do storage
        const data = await this.storage.get('example-data') || { count: 0 };
        data.count++;
        await this.storage.set('example-data', data);

        return {
            success: true,
            message: 'Plugin executado com sucesso',
            count: data.count
        };
    },

    async getStats() {
        const data = await this.storage.get('example-data') || { count: 0 };
        return {
            totalExecutions: data.count
        };
    },

    async destroy() {
        console.log('Plugin de exemplo destruído');
    }
};
