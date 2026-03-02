/**
 * Webhook Handler
 * Processes webhook events and updates database
 */

const { getInstance: getQueries } = require('../../../shared/database/queries');
const { getInstance: getLogger } = require('../../../shared/utils/logger');

class WebhookHandler {
    constructor() {
        this.queries = getQueries();
        this.logger = getLogger();
        this.gracePeriodDays = 3;
    }

    /**
     * Handle payment event
     */
    async handlePayment(paymentData) {
        try {
            const { externalId, status, amount, externalReference } = paymentData;

            // Check if payment already processed (idempotency)
            const existingPayment = await this.queries.findPaymentByExternalId(externalId);
            if (existingPayment) {
                this.logger.info('Payment already processed', { externalId });
                return { success: true, duplicate: true };
            }

            // Find subscription by external reference
            const subscription = await this.queries.findSubscriptionByExternalId(externalReference);
            if (!subscription) {
                this.logger.warn('Subscription not found', { externalReference });
                return { success: false, error: 'Subscription not found' };
            }

            // Create payment record
            await this.queries.create('payments', {
                subscription_id: subscription.id,
                user_id: subscription.user_id,
                provider: 'mercadopago',
                external_id: externalId,
                status: this.mapPaymentStatus(status),
                amount,
                currency: paymentData.currency || 'BRL',
                payment_method: paymentData.paymentMethod,
                paid_at: status === 'approved' ? new Date() : null,
                metadata: paymentData.metadata || {}
            });

            // Update subscription and license if payment approved
            if (status === 'approved') {
                await this.activateSubscription(subscription);
            } else if (status === 'rejected' || status === 'cancelled') {
                await this.handleFailedPayment(subscription);
            }

            this.logger.info('Payment processed', { externalId, status });

            return { success: true };

        } catch (error) {
            this.logger.error('Error handling payment', { error: error.message });
            throw error;
        }
    }

    /**
     * Handle subscription event
     */
    async handleSubscription(subscriptionData) {
        try {
            const { externalId, status, nextBillingDate } = subscriptionData;

            // Find subscription
            const subscription = await this.queries.findSubscriptionByExternalId(externalId);
            if (!subscription) {
                this.logger.warn('Subscription not found', { externalId });
                return { success: false, error: 'Subscription not found' };
            }

            // Update subscription
            await this.queries.update('subscriptions', subscription.id, {
                status: this.mapSubscriptionStatus(status),
                next_billing_date: nextBillingDate,
                metadata: subscriptionData.metadata || {}
            });

            // Update license based on subscription status
            if (status === 'authorized' || status === 'active') {
                await this.activateSubscription(subscription);
            } else if (status === 'cancelled' || status === 'paused') {
                await this.deactivateSubscription(subscription);
            }

            this.logger.info('Subscription processed', { externalId, status });

            return { success: true };

        } catch (error) {
            this.logger.error('Error handling subscription', { error: error.message });
            throw error;
        }
    }

    /**
     * Activate subscription and license
     */
    async activateSubscription(subscription) {
        try {
            // Calculate expiration date
            const expirationDate = new Date();
            if (subscription.billing_cycle === 'monthly') {
                expirationDate.setMonth(expirationDate.getMonth() + 1);
            } else {
                expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            }

            // Update license
            await this.queries.update('licenses', subscription.license_id, {
                status: 'active',
                activation_date: new Date(),
                expiration_date: expirationDate,
                grace_period_end: null
            });

            // Reset quota
            await this.queries.update('licenses', subscription.license_id, {
                quota_used: 0,
                quota_reset_at: new Date()
            });

            // Update subscription
            await this.queries.update('subscriptions', subscription.id, {
                status: 'active'
            });

            this.logger.info('Subscription activated', {
                subscriptionId: subscription.id,
                licenseId: subscription.license_id
            });

        } catch (error) {
            this.logger.error('Error activating subscription', { error: error.message });
            throw error;
        }
    }

    /**
     * Deactivate subscription
     */
    async deactivateSubscription(subscription) {
        try {
            // Update license to suspended
            await this.queries.update('licenses', subscription.license_id, {
                status: 'suspended'
            });

            // Update subscription
            await this.queries.update('subscriptions', subscription.id, {
                status: 'cancelled',
                cancelled_at: new Date()
            });

            this.logger.info('Subscription deactivated', {
                subscriptionId: subscription.id,
                licenseId: subscription.license_id
            });

        } catch (error) {
            this.logger.error('Error deactivating subscription', { error: error.message });
            throw error;
        }
    }

    /**
     * Handle failed payment
     */
    async handleFailedPayment(subscription) {
        try {
            // Set grace period
            const gracePeriodEnd = new Date();
            gracePeriodEnd.setDate(gracePeriodEnd.getDate() + this.gracePeriodDays);

            await this.queries.update('licenses', subscription.license_id, {
                grace_period_end: gracePeriodEnd
            });

            this.logger.warn('Payment failed, grace period set', {
                subscriptionId: subscription.id,
                gracePeriodEnd
            });

            // TODO: Send notification email

        } catch (error) {
            this.logger.error('Error handling failed payment', { error: error.message });
            throw error;
        }
    }

    /**
     * Map payment status
     */
    mapPaymentStatus(status) {
        const statusMap = {
            'approved': 'approved',
            'pending': 'pending',
            'rejected': 'rejected',
            'cancelled': 'cancelled',
            'refunded': 'refunded',
            'in_process': 'pending'
        };

        return statusMap[status] || 'pending';
    }

    /**
     * Map subscription status
     */
    mapSubscriptionStatus(status) {
        const statusMap = {
            'authorized': 'active',
            'active': 'active',
            'paused': 'paused',
            'cancelled': 'cancelled',
            'pending': 'pending'
        };

        return statusMap[status] || 'pending';
    }
}

module.exports = WebhookHandler;
