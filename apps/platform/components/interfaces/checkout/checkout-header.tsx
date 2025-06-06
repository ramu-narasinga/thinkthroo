import { Button } from '@thinkthroo/ui/components/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function CheckoutHeader() {
  return (
    <div className={'flex gap-4'}>
      <Link href={'/'}>
        <Button variant={'secondary'} className={'h-[32px] border-border w-[32px] p-0 rounded-[4px]'}>
          <ChevronLeft />
        </Button>
      </Link>
      <Image src={'/logo.svg'} alt={'ThinkThroo'} width={25} height={25} />
    </div>
  );
}