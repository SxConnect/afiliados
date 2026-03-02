/**
 * Mercado Pago Provider
 * Handles Mercado Pago API integration
 */

const axios = require('axios');
const crypto = require('crypto');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class MercadoPagoProvider {
    constructor() {
        this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        this.webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
        this.baseURL = 'https://api.mercadopago.com';
        this.logger = getLogger();
    }

    /**
     * Validate webhook signature
     */
    validateSignature(payload, signature) {
        try {
            const hmac = crypto.createHmac('sha256', this.webhookSecret);
            hmac.update(JSON.stringify(payload));
            const expectedSignature = hmac.digest('hex');

            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            this.logger.error('Error validating signature', { error: error.message });
            return false;
        }
    }

    /**
     * Get payment details
     */
    async getPayment(paymentId) {
        try {
            const response = await axios.get(
                `${this.baseURL}/v1/payments/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            this.logger.error('Error getting payment', {
                error: error.message,
                paymentId
            });
            throw error;
        }
    }

    /**
     * Get subscription details
     */
    async getSubscription(subscriptionId) {
        try {
            const response = await axios.get(
                `${this.baseURL}/preapproval/${subscriptionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            this.logger.error('Error getting subscription', {
                error: error.message,
                subscriptionId
            });
            throw error;
        }
    }

    /**
     * Create subscription
     */
    async createSubscription(data) {
        try {
            const response = await axios.post(
                `${this.baseURL}/preapproval`,
                {
                    reason: data.reason,
                    auto_recurring: {
                        frequency: 1,
                        frequency_type: data.billingCycle === 'monthly' ? 'months' : 'years',
                        transaction_amount: data.amount,
                        currency_id: data.currency || 'BRL'
                    },
                    back_url: data.backUrl,
                    payer_email: data.payerEmail,
                    external_reference: data.externalReference
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            this.logger.error('Error creating subscription', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId) {
        try {
            const response = await axios.put(
                `${this.baseURL}/preapproval/${subscriptionId}`,
                {
                    status: 'cancelled'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            this.logger.error('Error cancelling subscription', {
                error: error.message,
                subscriptionId
            });
            throw error;
        }
    }

    /**
     * Process webhook event
     */
    async processWebhook(event) {
        try {
            const { type, data } = event;

            switch (type) {
                case 'payment':
                    return await this.processPaymentEvent(data.id);

                case 'subscription_preapproval':
                    return await this.processSubscriptionEvent(data.id);

                default:
                    this.logger.warn('Unknown webhook type', { type });
                    return { processed: false, reason: 'Unknown type' };
            }
        } catch (error) {
            this.logger.error('Error processing webhook', { error: error.message });
            throw error;
        }
    }

    /**
     * Process payment event
     */
    async processPaymentEvent(paymentId) {
        const payment = await this.getPayment(paymentId);

        return {
            processed: true,
            type: 'payment',
            externalId: payment.id,
            status: payment.status,
            amount: payment.transaction_amount,
            currency: payment.currency_id,
            paymentMethod: payment.payment_method_id,
            paidAt: payment.date_approved,
            externalReference: payment.external_reference,
            metadata: payment.metadata
        };
    }

    /**
     * Process subscription event
     */
    async processSubscriptionEvent(subscriptionId) {
        const subscription = await this.getSubscription(subscriptionId);

        return {
            processed: true,
            type: 'subscription',
            externalId: subscription.id,
            status: subscription.status,
            amount: subscription.auto_recurring.transaction_amount,
            currency: subscription.auto_recurring.currency_id,
            nextBillingDate: subscription.next_payment_date,
            externalReference: subscription.external_reference,
            metadata: subscription.metadata
        };
    }
}

module.exports = MercadoPagoProvider;
