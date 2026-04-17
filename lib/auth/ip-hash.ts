import { createHash } from 'crypto';

export function hashIpAddress(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}
