import {
    CustomerCreatedEvent,
    CustomerUpdatedEvent,
    EventEntity,
    EventName,
    SubscriptionCreatedEvent,
    SubscriptionUpdatedEvent,
} from '@paddle/paddle-node-sdk';
import { createClient } from '@/utils/supabase/server-internal';

export class ProcessWebhook {
    async processEvent(eventData: EventEntity) {
        switch (eventData.eventType) {
            case EventName.SubscriptionCreated:
            case EventName.SubscriptionUpdated:
                await this.updateSubscriptionData(eventData);
                break;
            case EventName.CustomerCreated:
            case EventName.CustomerUpdated:
                await this.updateCustomerData(eventData);
                break;
        }
    }

    private async updateSubscriptionData(eventData: SubscriptionCreatedEvent | SubscriptionUpdatedEvent) {
        console.log('[updateSubscriptionData] eventData', eventData);

        const supabase = await createClient();
        const period = eventData.data.currentBillingPeriod!;
        const startsAt = new Date(period.startsAt);
        const endsAt = new Date(period.endsAt);

        const durationMs = endsAt.getTime() - startsAt.getTime();
        const monthCount = Math.round(durationMs / (1000 * 60 * 60 * 24 * 30));
        const planDurationLabel = `${monthCount}_months`;

        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                subscription_id: eventData.data.id,
                subscription_status: eventData.data.status,
                price_id: eventData.data.items[0].price?.id ?? '',
                product_id: eventData.data.items[0].price?.productId ?? '',
                scheduled_change: eventData.data.scheduledChange?.effectiveAt,
                customer_id: eventData.data.customerId,
                expires_at: endsAt.toISOString(),
                plan_duration: `${planDurationLabel}`,
            })
            .select();

        if (error) throw error;
    }

    private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {

        console.log('[updateCustomerData] eventData', eventData);

        const supabase = await createClient();
        const { error } = await supabase
            .from('customers')
            .upsert({
                customer_id: eventData.data.id,
                email: eventData.data.email,
            })
            .select();

        if (error) throw error;
    }
}