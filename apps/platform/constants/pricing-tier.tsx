import { BadgeCheck, Sparkles, ThumbsUp } from "lucide-react";

export interface Tier {
  name: string;
  id: 'free' | 'pro' | 'elite';
  Icon: any;
  description: string;
  features: string[];
  featured: boolean;
  priceId: Record<string, string>;
}

export const freePricingTier: Tier = {
  name: 'Free',
  id: 'free',
  Icon: <ThumbsUp />,
  description: 'Single payment of',
  features: [
    'Cobebase Architecture',
    'Think Throo CLI',
    'Best Practices'
  ],
  featured: false,
  priceId: {
    '3months': '',
    '6months': '',
    '12months': '',
  },
};

export const PricingTier: Tier[] = [
  {
    name: 'Pro',
    id: 'pro',
    Icon: <BadgeCheck />,
    description: 'Single payment of',
    features: [
      'Cobebase Architecture',
      'Think Throo CLI',
      'Best Practices',
      'Production Grade Projects',
    ],
    featured: false,
    priceId: {
      '3months': 'pri_01jtt26qk629dqqh41xywpyh3y',
      '6months': 'pri_01jtt2e8cr192ywg4174qd26kr',
      '12months': 'pri_01jtt2eyvncwm38qe12ha0azdy',
    },
  },
  {
    name: 'Elite',
    id: 'elite',
    Icon: <Sparkles />,
    description: 'Single payment of',
    features: [
      'Cobebase Architecture',
      'Think Throo CLI',
      'Best Practices',
      'Production Grade Projects',
      'Build From Scratch'
    ],
    featured: true,
    priceId: {
      '3months': 'pri_01jtt2h3f4116ee8npba17hfda',
      '6months': 'pri_01jtt2hv9tz3jyaa349b57hz65',
      '12months': 'pri_01jtt2mgw71xaphdqw19p6ddhy',
    },
  },
];
