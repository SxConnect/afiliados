const PAPIService = require('../../src/services/PAPIService');

class MessageSchedulerPlugin {
    constructor() {
        this.schedules = new Map();
        this.timers = new Map();
    }

    async execute(action, params) {
        switch (action) {
            case 'schedule':
                return await this.scheduleMessage(params);
            case 'list':
                return this.listSchedules();
            case 'cancel':
                return this.cancelSchedule(params.scheduleId);
            default:
                throw new Error(`Ação desconhecida: ${action}`);
        }
    }

    async scheduleMessage(params) {
        const { instanceId, jid, text, scheduledTime } = params;
        const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const delay = scheduledTime - Date.now();

        if (delay <= 0) {
            throw new Error('Horário agendado deve ser no futuro');
        }

        // Cria o agendamento
        const schedule = {
            id: scheduleId,
            instanceId,
            jid,
            text,
            scheduledTime,
            status: 'pending',
            createdAt: Date.now()
        };

        this.schedules.set(scheduleId, schedule);

        // Configura o timer
        const timer = setTimeout(async () => {
            try {
                await PAPIService.sendText(instanceId, jid, text);
                schedule.status = 'sent';
                schedule.sentAt = Date.now();
            } catch (error) {
                schedule.status = 'failed';
                schedule.error = error.message;
            }
        }, delay);

        this.timers.set(scheduleId, timer);

        return {
            success: true,
            scheduleId,
            scheduledTime,
            message: 'Mensagem agendada com sucesso'
        };
    }

    listSchedules() {
        const schedules = Array.from(this.schedules.values());

        return {
            success: true,
            schedules: schedules.map(s => ({
                id: s.id,
                jid: s.jid,
                text: s.text.substring(0, 50) + '...',
                scheduledTime: s.scheduledTime,
                status: s.status,
                createdAt: s.createdAt
            })),
            total: schedules.length
        };
    }

    cancelSchedule(scheduleId) {
        const schedule = this.schedules.get(scheduleId);

        if (!schedule) {
            throw new Error('Agendamento não encontrado');
        }

        if (schedule.status !== 'pending') {
            throw new Error('Apenas agendamentos pendentes podem ser cancelados');
        }

        // Cancela o timer
        const timer = this.timers.get(scheduleId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(scheduleId);
        }

        schedule.status = 'cancelled';
        schedule.cancelledAt = Date.now();

        return {
            success: true,
            message: 'Agendamento cancelado'
        };
    }
}

module.exports = new MessageSchedulerPlugin();
