import { Toggle } from '@/components/interfaces/upgrade/toggle';
import { PriceCards } from '@/components/interfaces/upgrade/price-cards';
import { useEffect, useState } from 'react';
import { BillingFrequency, IBillingFrequency } from '@/constants/billing-frequency';
import { Environments, initializePaddle, Paddle } from '@paddle/paddle-js';
import { usePaddlePrices } from '@/hooks/use-paddle-prices';

interface Props {
    country: string;
}

export function Pricing({ country }: Props) {
    const [frequency, setFrequency] = useState<IBillingFrequency>(BillingFrequency[0]);
    const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

    const { prices, loading } = usePaddlePrices(paddle, country);

    useEffect(() => {

        try {

            if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && process.env.NEXT_PUBLIC_PADDLE_ENV) {
                initializePaddle({
                    token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
                    environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
                }).then((paddle) => {
                    if (paddle) {
                        setPaddle(paddle);
                    }
                });
            }
        } catch (error) {
            console.error("Error initializing Paddle:", error);
        }
    }, []);

    return (
        <div className="mx-auto max-w-7xl relative px-[32px] flex flex-col items-center justify-between">
            <Toggle frequency={frequency} setFrequency={setFrequency} />
            <PriceCards frequency={frequency} loading={loading} priceMap={prices} />
        </div>
    );
}