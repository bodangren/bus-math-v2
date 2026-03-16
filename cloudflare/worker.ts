interface AssetFetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface CloudflareBindings {
  ASSETS: AssetFetcher;
}

interface ExecutionContextLike {
  waitUntil?(promise: Promise<unknown>): void;
}

type VinextHandler = (
  request: Request,
  env?: CloudflareBindings,
  ctx?: ExecutionContextLike,
) => Response | Promise<Response>;

let cachedHandlerPromise: Promise<VinextHandler> | null = null;

async function loadVinextHandler(): Promise<VinextHandler> {
  cachedHandlerPromise ??= import('../dist/server/index.js').then((module) => {
    if (typeof module.default !== 'function') {
      throw new TypeError(
        'Expected dist/server/index.js to export the built Vinext request handler.',
      );
    }

    return module.default as VinextHandler;
  });

  return cachedHandlerPromise;
}

const worker = {
  async fetch(
    request: Request,
    env: CloudflareBindings,
    ctx?: ExecutionContextLike,
  ): Promise<Response> {
    try {
      const handleRequest = await loadVinextHandler();
      return await handleRequest(request, env, ctx);
    } catch {
      return env.ASSETS.fetch(request);
    }
  },
};

export default worker;
