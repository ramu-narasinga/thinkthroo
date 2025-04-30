import { BadgeCheck, Sparkles, ThumbsUp } from "lucide-react";

export interface Tier {
  name: string;
  id: 'free' | 'starter' | 'pro' | 'advanced';
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
    name: 'Starter',
    id: 'starter',
    Icon: <ThumbsUp />,
    description: 'Single payment of',
    features: [
      'Cobebase Architecture',
      'Think Throo CLI',
      'Best Practices',
    ],
    featured: false,
    priceId: {
      '3months': 'pri_01jt0p96czzd5vqehnyhj0ts2n',
      '6months': 'pri_01jt0peprephe4z3h2wq3gsrsf',
      '12months': 'pri_01jt0pgq8x10r5w658ghdmbt2t',
    },
  },
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
      '3months': 'pri_01jt0qfryc2b2pjee7rv5v55cf',
      '6months': 'pri_01jt0qjjpj1ehmf8pcwp5ap4vn',
      '12months': 'pri_01jt0qska1wqgcc2m5vrxr0b1t',
    },
  },
  {
    name: 'Advanced',
    id: 'advanced',
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
      '3months': 'pri_01jt0qw2sctq6f5k0e19sm14ad',
      '6months': 'pri_01jt0qzz0884253ssk99qm3vah',
      '12months': 'pri_01jt0r2g51enbpvzdcd68egwd7',
    },
  },
];
