import type { CompletePhaseRequest, CompletePhaseResponse } from '@/types/api';

export class PhaseCompletionError extends Error {
  status?: number;
  details?: unknown;
  transient: boolean;

  constructor(message: string, options?: { status?: number; details?: unknown }) {
    super(message);
    this.name = 'PhaseCompletionError';
    this.status = options?.status;
    this.details = options?.details;
    this.transient = isTransientStatus(options?.status);
  }
}

function isTransientStatus(status?: number): boolean {
  if (!status) return true;
  if (status >= 500 && status < 600) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === 'string' && record.error.length > 0) {
      return record.error;
    }
  }

  return fallback;
}

export async function completePhaseRequest(
  payload: CompletePhaseRequest,
): Promise<CompletePhaseResponse> {
  const response = await fetch('/api/phases/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  let responsePayload: unknown = null;
  try {
    responsePayload = await response.json();
  } catch {
    responsePayload = null;
  }

  if (!response.ok) {
    throw new PhaseCompletionError(
      extractMessage(responsePayload, `HTTP error! status: ${response.status}`),
      { status: response.status, details: responsePayload },
    );
  }

  return (responsePayload ?? {}) as CompletePhaseResponse;
}
