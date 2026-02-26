import { useState, useEffect, useCallback, useMemo } from "react";
const __basePath = "";
function withBasePath(p) {
  return p;
}
function stripBasePath(p) {
  return p;
}
function createRouterEvents() {
  const listeners = /* @__PURE__ */ new Map();
  return {
    on(event, handler) {
      if (!listeners.has(event))
        listeners.set(event, /* @__PURE__ */ new Set());
      listeners.get(event).add(handler);
    },
    off(event, handler) {
      listeners.get(event)?.delete(handler);
    },
    emit(event, ...args) {
      listeners.get(event)?.forEach((handler) => handler(...args));
    }
  };
}
const routerEvents = createRouterEvents();
function resolveUrl(url) {
  if (typeof url === "string")
    return url;
  let result = url.pathname ?? "/";
  if (url.query) {
    const params = new URLSearchParams(url.query);
    result += `?${params.toString()}`;
  }
  return result;
}
function applyNavigationLocale(url, locale) {
  if (!locale || typeof window === "undefined")
    return url;
  const defaultLocale = window.__VINEXT_DEFAULT_LOCALE__;
  if (locale === defaultLocale)
    return url;
  if (url.startsWith(`/${locale}/`) || url === `/${locale}`)
    return url;
  return `/${locale}${url.startsWith("/") ? url : `/${url}`}`;
}
function isExternalUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}
function isHashOnlyChange(href) {
  if (href.startsWith("#"))
    return true;
  if (typeof window === "undefined")
    return false;
  try {
    const current = new URL(window.location.href);
    const next = new URL(href, window.location.href);
    return current.pathname === next.pathname && current.search === next.search && next.hash !== "";
  } catch {
    return false;
  }
}
function scrollToHash(hash) {
  if (!hash || hash === "#") {
    window.scrollTo(0, 0);
    return;
  }
  const el = document.getElementById(hash.slice(1));
  if (el)
    el.scrollIntoView({ behavior: "auto" });
}
function saveScrollPosition() {
  const state = window.history.state ?? {};
  window.history.replaceState({ ...state, __vinext_scrollX: window.scrollX, __vinext_scrollY: window.scrollY }, "");
}
function restoreScrollPosition(state) {
  if (state && typeof state === "object" && "__vinext_scrollY" in state) {
    const { __vinext_scrollX: x, __vinext_scrollY: y } = state;
    requestAnimationFrame(() => window.scrollTo(x, y));
  }
}
let _ssrContext = null;
let _getSSRContext = () => _ssrContext;
let _setSSRContextImpl = (ctx) => {
  _ssrContext = ctx;
};
function _registerRouterStateAccessors(accessors) {
  _getSSRContext = accessors.getSSRContext;
  _setSSRContextImpl = accessors.setSSRContext;
}
function setSSRContext(ctx) {
  _setSSRContextImpl(ctx);
}
function extractRouteParamNames(pattern) {
  const names = [];
  const bracketMatches = pattern.matchAll(/\[{1,2}(?:\.\.\.)?([\w-]+)\]{1,2}/g);
  for (const m of bracketMatches) {
    names.push(m[1]);
  }
  if (names.length > 0)
    return names;
  const colonMatches = pattern.matchAll(/:([\w-]+)[+*]?/g);
  for (const m of colonMatches) {
    names.push(m[1]);
  }
  return names;
}
function getPathnameAndQuery() {
  if (typeof window === "undefined") {
    const _ssrCtx = _getSSRContext();
    if (_ssrCtx) {
      const query2 = {};
      for (const [key, value] of Object.entries(_ssrCtx.query)) {
        query2[key] = Array.isArray(value) ? value.join(",") : value;
      }
      return { pathname: _ssrCtx.pathname, query: query2, asPath: _ssrCtx.asPath };
    }
    return { pathname: "/", query: {}, asPath: "/" };
  }
  const pathname = stripBasePath(window.location.pathname);
  const query = {};
  const nextData = window.__NEXT_DATA__;
  if (nextData && nextData.query && nextData.page) {
    const routeParamNames = extractRouteParamNames(nextData.page);
    for (const key of routeParamNames) {
      const value = nextData.query[key];
      if (typeof value === "string") {
        query[key] = value;
      } else if (Array.isArray(value)) {
        query[key] = value.join(",");
      }
    }
  }
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of params) {
    query[key] = value;
  }
  const asPath = pathname + window.location.search;
  return { pathname, query, asPath };
}
let _navInProgress = false;
async function navigateClient(url) {
  if (typeof window === "undefined")
    return;
  const win = window;
  const root = win.__VINEXT_ROOT__;
  if (!root) {
    window.location.href = url;
    return;
  }
  if (_navInProgress)
    return;
  _navInProgress = true;
  try {
    const res = await fetch(url, { headers: { Accept: "text/html" } });
    if (!res.ok) {
      window.location.href = url;
      return;
    }
    const html = await res.text();
    const match = html.match(/<script>window\.__NEXT_DATA__\s*=\s*(.*?)<\/script>/);
    if (!match) {
      window.location.href = url;
      return;
    }
    const nextData = JSON.parse(match[1]);
    const { pageProps } = nextData.props;
    win.__NEXT_DATA__ = nextData;
    let pageModuleUrl = nextData.__vinext?.pageModuleUrl;
    if (!pageModuleUrl) {
      const moduleMatch = html.match(/import\("([^"]+)"\);\s*\n\s*const PageComponent/);
      const altMatch = html.match(/await import\("([^"]+pages\/[^"]+)"\)/);
      pageModuleUrl = moduleMatch?.[1] ?? altMatch?.[1] ?? void 0;
    }
    if (!pageModuleUrl) {
      window.location.href = url;
      return;
    }
    const pageModule = await import(
      /* @vite-ignore */
      pageModuleUrl
    );
    const PageComponent = pageModule.default;
    if (!PageComponent) {
      window.location.href = url;
      return;
    }
    const React = (await import("react")).default;
    let AppComponent = win.__VINEXT_APP__;
    const appModuleUrl = nextData.__vinext?.appModuleUrl;
    if (!AppComponent && appModuleUrl) {
      try {
        const appModule = await import(
          /* @vite-ignore */
          appModuleUrl
        );
        AppComponent = appModule.default;
        win.__VINEXT_APP__ = AppComponent;
      } catch {
      }
    }
    let element;
    if (AppComponent) {
      element = React.createElement(AppComponent, {
        Component: PageComponent,
        pageProps
      });
    } else {
      element = React.createElement(PageComponent, pageProps);
    }
    root.render(element);
  } catch (err) {
    console.error("[vinext] Client navigation failed:", err);
    routerEvents.emit("routeChangeError", err, url);
    window.location.href = url;
  } finally {
    _navInProgress = false;
  }
}
function useRouter() {
  const [{ pathname, query, asPath }, setState] = useState(getPathnameAndQuery);
  useEffect(() => {
    const onPopState = (e) => {
      setState(getPathnameAndQuery());
      navigateClient(window.location.pathname + window.location.search).then(() => {
        restoreScrollPosition(e.state);
      });
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    const onNavigate = ((_e) => {
      setState(getPathnameAndQuery());
    });
    window.addEventListener("vinext:navigate", onNavigate);
    return () => window.removeEventListener("vinext:navigate", onNavigate);
  }, []);
  const push = useCallback(async (url, _as, options) => {
    const resolved = applyNavigationLocale(resolveUrl(url), options?.locale);
    if (isExternalUrl(resolved)) {
      window.location.assign(resolved);
      return true;
    }
    if (isHashOnlyChange(resolved)) {
      const hash2 = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
      window.history.pushState({}, "", resolved.startsWith("#") ? resolved : withBasePath(resolved));
      scrollToHash(hash2);
      setState(getPathnameAndQuery());
      window.dispatchEvent(new CustomEvent("vinext:navigate"));
      return true;
    }
    saveScrollPosition();
    const full = withBasePath(resolved);
    routerEvents.emit("routeChangeStart", resolved);
    window.history.pushState({}, "", full);
    if (!options?.shallow) {
      await navigateClient(full);
    }
    setState(getPathnameAndQuery());
    routerEvents.emit("routeChangeComplete", resolved);
    const hash = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
    if (hash) {
      scrollToHash(hash);
    } else if (options?.scroll !== false) {
      window.scrollTo(0, 0);
    }
    window.dispatchEvent(new CustomEvent("vinext:navigate"));
    return true;
  }, []);
  const replace = useCallback(async (url, _as, options) => {
    const resolved = applyNavigationLocale(resolveUrl(url), options?.locale);
    if (isExternalUrl(resolved)) {
      window.location.replace(resolved);
      return true;
    }
    if (isHashOnlyChange(resolved)) {
      const hash2 = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
      window.history.replaceState({}, "", resolved.startsWith("#") ? resolved : withBasePath(resolved));
      scrollToHash(hash2);
      setState(getPathnameAndQuery());
      window.dispatchEvent(new CustomEvent("vinext:navigate"));
      return true;
    }
    const full = withBasePath(resolved);
    routerEvents.emit("routeChangeStart", resolved);
    window.history.replaceState({}, "", full);
    if (!options?.shallow) {
      await navigateClient(full);
    }
    setState(getPathnameAndQuery());
    routerEvents.emit("routeChangeComplete", resolved);
    const hash = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
    if (hash) {
      scrollToHash(hash);
    } else if (options?.scroll !== false) {
      window.scrollTo(0, 0);
    }
    window.dispatchEvent(new CustomEvent("vinext:navigate"));
    return true;
  }, []);
  const back = useCallback(() => {
    window.history.back();
  }, []);
  const reload = useCallback(() => {
    window.location.reload();
  }, []);
  const prefetch = useCallback(async (url) => {
    if (typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      link.as = "document";
      document.head.appendChild(link);
    }
  }, []);
  const _ssrState = _getSSRContext();
  const locale = typeof window === "undefined" ? _ssrState?.locale : window.__VINEXT_LOCALE__;
  const locales = typeof window === "undefined" ? _ssrState?.locales : window.__VINEXT_LOCALES__;
  const defaultLocale = typeof window === "undefined" ? _ssrState?.defaultLocale : window.__VINEXT_DEFAULT_LOCALE__;
  const route = typeof window !== "undefined" ? window.__NEXT_DATA__?.page ?? pathname : pathname;
  const router = useMemo(() => ({
    pathname,
    route,
    query,
    asPath,
    basePath: __basePath,
    locale,
    locales,
    defaultLocale,
    isReady: true,
    isPreview: false,
    isFallback: typeof window !== "undefined" && window.__NEXT_DATA__?.isFallback === true,
    push,
    replace,
    back,
    reload,
    prefetch,
    beforePopState: (cb) => {
      _beforePopStateCb = cb;
    },
    events: routerEvents
  }), [pathname, query, asPath, locale, locales, defaultLocale, push, replace, back, reload, prefetch, route]);
  return router;
}
let _beforePopStateCb;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", (e) => {
    const browserUrl = window.location.pathname + window.location.search;
    const appUrl = stripBasePath(window.location.pathname) + window.location.search;
    if (_beforePopStateCb !== void 0) {
      const shouldContinue = _beforePopStateCb({ url: appUrl, as: appUrl, options: { shallow: false } });
      if (!shouldContinue)
        return;
    }
    routerEvents.emit("routeChangeStart", appUrl);
    navigateClient(browserUrl).then(() => {
      routerEvents.emit("routeChangeComplete", appUrl);
      restoreScrollPosition(e.state);
      window.dispatchEvent(new CustomEvent("vinext:navigate"));
    });
  });
}
const Router = {
  push: async (url, _as, options) => {
    const resolved = applyNavigationLocale(resolveUrl(url), options?.locale);
    if (isExternalUrl(resolved)) {
      window.location.assign(resolved);
      return true;
    }
    if (isHashOnlyChange(resolved)) {
      const hash2 = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
      window.history.pushState({}, "", resolved.startsWith("#") ? resolved : withBasePath(resolved));
      scrollToHash(hash2);
      window.dispatchEvent(new CustomEvent("vinext:navigate"));
      return true;
    }
    saveScrollPosition();
    const full = withBasePath(resolved);
    routerEvents.emit("routeChangeStart", resolved);
    window.history.pushState({}, "", full);
    if (!options?.shallow) {
      await navigateClient(full);
    }
    routerEvents.emit("routeChangeComplete", resolved);
    const hash = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
    if (hash) {
      scrollToHash(hash);
    } else if (options?.scroll !== false) {
      window.scrollTo(0, 0);
    }
    window.dispatchEvent(new CustomEvent("vinext:navigate"));
    return true;
  },
  replace: async (url, _as, options) => {
    const resolved = applyNavigationLocale(resolveUrl(url), options?.locale);
    if (isExternalUrl(resolved)) {
      window.location.replace(resolved);
      return true;
    }
    if (isHashOnlyChange(resolved)) {
      const hash2 = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
      window.history.replaceState({}, "", resolved.startsWith("#") ? resolved : withBasePath(resolved));
      scrollToHash(hash2);
      window.dispatchEvent(new CustomEvent("vinext:navigate"));
      return true;
    }
    const full = withBasePath(resolved);
    routerEvents.emit("routeChangeStart", resolved);
    window.history.replaceState({}, "", full);
    if (!options?.shallow) {
      await navigateClient(full);
    }
    routerEvents.emit("routeChangeComplete", resolved);
    const hash = resolved.includes("#") ? resolved.slice(resolved.indexOf("#")) : "";
    if (hash) {
      scrollToHash(hash);
    } else if (options?.scroll !== false) {
      window.scrollTo(0, 0);
    }
    window.dispatchEvent(new CustomEvent("vinext:navigate"));
    return true;
  },
  back: () => window.history.back(),
  reload: () => window.location.reload(),
  prefetch: async (url) => {
    if (typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      link.as = "document";
      document.head.appendChild(link);
    }
  },
  beforePopState: (cb) => {
    _beforePopStateCb = cb;
  },
  events: routerEvents
};
export {
  _registerRouterStateAccessors,
  applyNavigationLocale,
  Router as default,
  isExternalUrl,
  isHashOnlyChange,
  setSSRContext,
  useRouter
};
