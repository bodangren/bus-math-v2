import { cookies } from 'next/headers';

import { SESSION_COOKIE_NAME, getAuthJwtSecret } from '@/lib/auth/constants';
import { verifySessionToken } from '@/lib/auth/session';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

type SupabaseLikeUser = {
  id: string;
  email: string | null;
  user_metadata: {
    username: string;
    role: 'student' | 'teacher' | 'admin';
  };
};

type SupabaseLikeSession = {
  user: SupabaseLikeUser;
  access_token: string;
};

function toUser(claims: {
  sub: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
}): SupabaseLikeUser {
  return {
    id: claims.sub,
    email: null,
    user_metadata: {
      username: claims.username,
      role: claims.role,
    },
  };
}

export async function createClient() {
  const cookieStore = await cookies();

  const getClaims = async () => {
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token, getAuthJwtSecret());
  };

  const auth = {
    getUser: async () => {
      const claims = await getClaims();
      return {
        data: {
          user: claims ? toUser(claims) : null,
        },
        error: null,
      };
    },
    getSession: async () => {
      const claims = await getClaims();
      return {
        data: {
          session: claims
            ? ({ user: toUser(claims), access_token: '' } as SupabaseLikeSession)
            : null,
        },
        error: null,
      };
    },
    getClaims: async () => {
      const claims = await getClaims();
      return {
        data: {
          claims: claims
            ? {
                sub: claims.sub,
                username: claims.username,
                role: claims.role,
                organization_id: claims.organizationId ?? null,
              }
            : null,
        },
        error: null,
      };
    },
  };

  const from = (table: string) => {
    if (table !== 'profiles') {
      throw new Error(`Unsupported table in auth shim: ${table}`);
    }

    return {
      select: () => ({
        eq: (column: string, value: string) => ({
          maybeSingle: async () => {
            if (column !== 'id') {
              return { data: null, error: { message: `Unsupported where column: ${column}` } };
            }

            const profile = await fetchInternalQuery(internal.activities.getProfileById, {
              profileId: value,
            });
            if (!profile) {
              return { data: null, error: null };
            }

            return {
              data: {
                id: profile.id,
                organization_id: profile.organizationId,
                username: profile.username,
                role: profile.role,
                display_name: profile.displayName,
              },
              error: null,
            };
          },
          single: async () => {
            const result = await (from('profiles').select('*').eq(column, value).maybeSingle());
            if (!result.data) {
              return { data: null, error: { message: 'Profile not found' } };
            }
            return result;
          },
        }),
      }),
    };
  };

  return {
    auth,
    from,
  };
}
