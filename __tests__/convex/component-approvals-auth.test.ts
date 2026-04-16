import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getComponentApprovalHandler,
  getComponentVersionHashHandler,
  getReviewQueueHandler,
  getComponentReviewsHandler,
  getUnresolvedReviewsHandler,
  getAuditSummaryHandler,
  submitComponentReviewHandler,
  resolveReviewHandler,
} from '@/convex/component_approvals';
vi.mock('@/lib/component-approval/version-hashes', () => ({
  computeComponentVersionHash: vi.fn().mockResolvedValue('mock-hash'),
}));

const mockGetUserIdentity = vi.fn();
const mockQuery = vi.fn();
const mockWithIndex = vi.fn();
const mockFilter = vi.fn();
const mockCollect = vi.fn();
const mockFirst = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn().mockResolvedValue('new_id_123');
const mockPatch = vi.fn().mockResolvedValue(undefined);
const mockGet = vi.fn().mockResolvedValue({ _id: 'review_123' });

function createMockCtx(role: string | null = null, authenticated = true) {
  mockGetUserIdentity.mockResolvedValue(
    authenticated ? { email: 'test@example.com' } : null
  );

  mockFirst.mockResolvedValue(null);
  mockCollect.mockResolvedValue([]);
  mockOrder.mockReturnValue({ collect: mockCollect });
  mockFilter.mockReturnValue({ collect: mockCollect });
  const chainableEq = {
    eq: () => chainableEq,
  };
  mockWithIndex.mockImplementation((_indexName: string, handler: (q: unknown) => unknown) => {
    handler({ eq: () => chainableEq });
    return { first: mockFirst, order: mockOrder, filter: mockFilter, collect: mockCollect };
  });
  mockQuery.mockReturnValue({
    withIndex: mockWithIndex,
    filter: mockFilter,
    collect: mockCollect,
  });

  const profileQuery = {
    withIndex: vi.fn().mockImplementation((_idx: string, handler: (q: unknown) => unknown) => {
      handler({ eq: () => chainableEq });
      return { unique: vi.fn().mockResolvedValue(role ? { role } : null) };
    }),
  };

  return {
    auth: { getUserIdentity: mockGetUserIdentity },
    db: {
      query: (table: string) => {
        if (table === 'profiles') {
          return profileQuery as unknown as ReturnType<typeof mockQuery>;
        }
        return mockQuery(table);
      },
      insert: mockInsert,
      patch: mockPatch,
      get: mockGet,
    },
  };
}

describe('convex/component_approvals query auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getComponentApprovalHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);
      await expect(
        getComponentApprovalHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects student role', async () => {
      const ctx = createMockCtx('student');
      await expect(
        getComponentApprovalHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects teacher role', async () => {
      const ctx = createMockCtx('teacher');
      await expect(
        getComponentApprovalHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('allows admin role', async () => {
      const ctx = createMockCtx('admin');
      await expect(
        getComponentApprovalHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).resolves.toBeNull();
    });
  });

  describe('getComponentVersionHashHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);
      await expect(
        getComponentVersionHashHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects student role', async () => {
      const ctx = createMockCtx('student');
      await expect(
        getComponentVersionHashHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects teacher role', async () => {
      const ctx = createMockCtx('teacher');
      await expect(
        getComponentVersionHashHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });
  });

  describe('getReviewQueueHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);
      await expect(getReviewQueueHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('rejects student role', async () => {
      const ctx = createMockCtx('student');
      await expect(getReviewQueueHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('rejects teacher role', async () => {
      const ctx = createMockCtx('teacher');
      await expect(getReviewQueueHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('allows admin role', async () => {
      const ctx = createMockCtx('admin');
      await expect(getReviewQueueHandler(ctx as never, {})).resolves.toEqual([]);
    });
  });

  describe('getComponentReviewsHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);
      await expect(
        getComponentReviewsHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects student role', async () => {
      const ctx = createMockCtx('student');
      await expect(
        getComponentReviewsHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects teacher role', async () => {
      const ctx = createMockCtx('teacher');
      await expect(
        getComponentReviewsHandler(ctx as never, { componentType: 'activity', componentId: 'test' }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });
  });

  describe('getUnresolvedReviewsHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);
      await expect(getUnresolvedReviewsHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('rejects student role', async () => {
      const ctx = createMockCtx('student');
      await expect(getUnresolvedReviewsHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('rejects teacher role', async () => {
      const ctx = createMockCtx('teacher');
      await expect(getUnresolvedReviewsHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('allows admin role', async () => {
      const ctx = createMockCtx('admin');
      await expect(getUnresolvedReviewsHandler(ctx as never, {})).resolves.toEqual([]);
    });
  });

  describe('getAuditSummaryHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);
      await expect(getAuditSummaryHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('rejects student role', async () => {
      const ctx = createMockCtx('student');
      await expect(getAuditSummaryHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('rejects teacher role', async () => {
      const ctx = createMockCtx('teacher');
      await expect(getAuditSummaryHandler(ctx as never, {})).rejects.toThrow(
        'Unauthorized: admin role required',
      );
    });

    it('allows admin role and returns empty summary', async () => {
      const ctx = createMockCtx('admin');
      await expect(getAuditSummaryHandler(ctx as never, {})).resolves.toEqual({});
    });
  });

  describe('submitComponentReviewHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);
      await expect(
        submitComponentReviewHandler(ctx as never, {
          componentType: 'activity',
          componentId: 'test',
          componentVersionHash: 'mock-hash',
          status: 'approved',
          issueCategories: [],
        }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects student role', async () => {
      const ctx = createMockCtx('student');
      await expect(
        submitComponentReviewHandler(ctx as never, {
          componentType: 'activity',
          componentId: 'test',
          componentVersionHash: 'mock-hash',
          status: 'approved',
          issueCategories: [],
        }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects teacher role', async () => {
      const ctx = createMockCtx('teacher');
      await expect(
        submitComponentReviewHandler(ctx as never, {
          componentType: 'activity',
          componentId: 'test',
          componentVersionHash: 'mock-hash',
          status: 'approved',
          issueCategories: [],
        }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('allows admin role', async () => {
      const ctx = createMockCtx('admin');
      await expect(
        submitComponentReviewHandler(ctx as never, {
          componentType: 'activity',
          componentId: 'test',
          componentVersionHash: 'mock-hash',
          status: 'approved',
          issueCategories: [],
        }),
      ).resolves.toEqual({ reviewId: expect.any(String) });
    });
  });

  describe('resolveReviewHandler', () => {
    it('rejects unauthenticated callers', async () => {
      const ctx = createMockCtx(null, false);
      await expect(
        resolveReviewHandler(ctx as never, { reviewId: 'review_123' as never }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects student role', async () => {
      const ctx = createMockCtx('student');
      await expect(
        resolveReviewHandler(ctx as never, { reviewId: 'review_123' as never }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('rejects teacher role', async () => {
      const ctx = createMockCtx('teacher');
      await expect(
        resolveReviewHandler(ctx as never, { reviewId: 'review_123' as never }),
      ).rejects.toThrow('Unauthorized: admin role required');
    });

    it('allows admin role', async () => {
      const ctx = createMockCtx('admin');
      await expect(
        resolveReviewHandler(ctx as never, { reviewId: 'review_123' as never }),
      ).resolves.toEqual({ success: true });
    });
  });
});
