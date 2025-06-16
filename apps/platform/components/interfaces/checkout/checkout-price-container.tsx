import { CheckoutPriceAmount } from '@/components/interfaces/checkout/checkout-price-amount';
import { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';
import { formatMoney } from '@/utils/paddle/parse-money';
import { Skeleton } from '@thinkthroo/ui/components/skeleton';
import { formatBillingCycle } from '@/utils/paddle/data-helpers';
import { useSearchParams } from 'next/navigation';

interface Props {
  checkoutData: CheckoutEventsData | null;
}

export function CheckoutPriceContainer({ checkoutData }: Props) {
  const recurringTotal = checkoutData?.recurring_totals?.total;
  const billingCycle = checkoutData?.items.find((item) => item.billing_cycle)?.billing_cycle;

  const searchParams = useSearchParams()
  const accessFor = searchParams.get('accessFor')

  return (
    <>
      <div className={'text-base leading-[20px] font-semibold'}>Order summary</div>
      <CheckoutPriceAmount checkoutData={checkoutData} />
      {recurringTotal !== undefined ? (
        billingCycle && (
          <div className={'pt-4 text-base leading-[20px] font-medium text-muted-foreground'}>
            then {formatMoney(recurringTotal, checkoutData?.currency_code)} {formatBillingCycle(billingCycle)}
          </div>
        )
      ) : (
        <div className={'pt-4 text-base leading-[20px] font-medium text-muted-foreground'}>
          One time payment of {formatMoney(checkoutData?.totals.total, checkoutData?.currency_code)} {accessFor ? `for ${accessFor} access.` : ''}
        </div>
      )}
    </>
  );
}