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
      '3months': process.env.NEXT_PUBLIC_PRO_3M!,
      '6months': process.env.NEXT_PUBLIC_PRO_6M!,
      '12months': process.env.NEXT_PUBLIC_PRO_12M!,
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
      '3months': process.env.NEXT_PUBLIC_ELITE_3M!,
      '6months': process.env.NEXT_PUBLIC_ELITE_6M!,
      '12months': process.env.NEXT_PUBLIC_ELITE_12M!,
    },
  },
];
