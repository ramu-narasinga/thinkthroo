import { serverDB } from '@/database';
import { daemonRuntimes } from '@/database/schemas';

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ttd_${hex}`;
}

export async function registerRuntime(userId: string, name: string): Promise<{ runtimeId: string; apiKey: string }> {
  const rawKey = generateApiKey();
  const hashedKey = await sha256Hex(rawKey);

  const [runtime] = await serverDB
    .insert(daemonRuntimes)
    .values({
      userId,
      name: name.trim(),
      apiKey: hashedKey,
      status: 'offline',
    })
    .returning();

  return { runtimeId: runtime.id, apiKey: rawKey };
}
