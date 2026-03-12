interface AssetFetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface CloudflareBindings {
  ASSETS: AssetFetcher;
}

const worker = {
  async fetch(request: Request, env: CloudflareBindings): Promise<Response> {
    // Baseline Worker shell until the generated Vinext SSR entry is wired into deployment.
    return env.ASSETS.fetch(request);
  },
};

export default worker;
