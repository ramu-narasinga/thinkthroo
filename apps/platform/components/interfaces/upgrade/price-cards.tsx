import { freePricingTier, PricingTier, Tier } from '@/constants/pricing-tier';
import { IBillingFrequency } from '@/constants/billing-frequency';
import { FeaturesList } from '@/components/interfaces/upgrade/features-list';
import { PriceAmount } from '@/components/interfaces/upgrade/price-amount';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PriceTitle } from '@/components/interfaces/upgrade/price-title';
import { Separator } from '@/components/ui/separator';
import { FeaturedCardGradient } from '@/components/interfaces/upgrade/featured-card-gradient';
import Link from 'next/link';

interface Props {
  loading: boolean;
  frequency: IBillingFrequency;
  priceMap: Record<string, string>;
}

export function PriceCards({ loading, frequency, priceMap }: Props) {

  return (
    <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-4">

      <div key={freePricingTier.id} className={cn('rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden border-2 border-muted')}>
        <div className={cn('flex gap-5 flex-col rounded-lg rounded-b-none pricing-card-border')}>
          {/* {tier.featured && <FeaturedCardGradient />} */}
          <PriceTitle tier={freePricingTier} />
          <PriceAmount
            loading={loading}
            tier={freePricingTier}
            priceMap={priceMap}
            value={frequency.value}
            priceSuffix={frequency.priceSuffix}
          />
          <div className={'px-8'}>
            <Separator className={'bg-border'} />
          </div>
          {/* <div className={'px-8 text-[16px] leading-[24px]'}>{getDescription(freePricingTier)}</div> */}
        </div>
        <div className={'px-8 mt-8'}>
          <Button className={'w-full'} variant={'default'} asChild={true}>
            <Link href={`/signin`}>Get started</Link>
          </Button>
        </div>
        <FeaturesList tier={freePricingTier} />
      </div>

      {PricingTier.map((tier) => (
        <div key={tier.id} className={cn('rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden border-2 border-muted')}>
          <div className={cn('flex gap-5 flex-col rounded-lg rounded-b-none pricing-card-border')}>
            {/* {tier.featured && <FeaturedCardGradient />} */}
            <PriceTitle tier={tier} />
            <PriceAmount
              loading={loading}
              tier={tier}
              priceMap={priceMap}
              value={frequency.value}
              priceSuffix={frequency.priceSuffix}
            />
            <div className={'px-8'}>
              <Separator className={'bg-border'} />
            </div>
            {/* <div className={'px-8 text-[16px] leading-[24px]'}>{getDescription(tier)}</div> */}
          </div>
          <div className={'px-8 mt-8'}>
            <Button className={'w-full'} variant={'default'} asChild={true}>
              <Link href={`/checkout/${tier.priceId[frequency.value]}?accessFor=${frequency.label}`}>Get started</Link>
            </Button>
          </div>
          <FeaturesList tier={tier} />
        </div>
      ))}
    </div>
  );
}