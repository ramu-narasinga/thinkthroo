export const AGENT_MODELS = [
  { label: 'Claude Sonnet 4.6', value: 'claude-sonnet-4-6' },
  { label: 'Claude Fable 5', value: 'claude-fable-5' },
  { label: 'Claude Opus 4.8', value: 'claude-opus-4-8' },
  { label: 'Claude Haiku 4.5', value: 'claude-haiku-4-5-20251001' },
] as const;

export type AgentModelValue = (typeof AGENT_MODELS)[number]['value'];
