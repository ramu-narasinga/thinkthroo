import { CheckoutEventsTimePeriod } from '@paddle/paddle-js';

export function parseSDKResponse<T>(response: T): T {
    return JSON.parse(JSON.stringify(response));
}

export const ErrorMessage = 'Something went wrong, please try again later';

export function getErrorMessage() {
    return { error: ErrorMessage, data: [], hasMore: false, totalRecords: 0 };
}

export function getPaymentReason(origin: string) {
    if (origin === 'web' || origin === 'subscription_charge') {
        return 'New';
    } else {
        return 'Renewal of ';
    }
}

const BillingCycleMap = {
    day: 'daily',
    week: 'weekly',
    month: 'monthly',
    year: 'yearly',
};

const CustomBillingCycleMap = {
    day: 'days',
    week: 'weeks',
    month: 'months',
    year: 'years',
};

export function formatBillingCycle({ frequency, interval }: CheckoutEventsTimePeriod) {
    if (frequency === 1) {
        return BillingCycleMap[interval];
    } else {
        return `every ${frequency} ${CustomBillingCycleMap[interval]}`;
    }
}