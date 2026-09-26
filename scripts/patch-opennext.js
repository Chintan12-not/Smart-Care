import fs from "fs";
import path from "path";

const handlerPath = path.resolve(".open-next/server-functions/default/handler.mjs");
const middlewarePath = path.resolve(".open-next/middleware/handler.mjs");
const workerPath = path.resolve(".open-next/worker.js");

const shim = `import { createRequire as __createRequire } from "node:module";
const __nativeRequire = typeof globalThis.require !== "undefined" ? globalThis.require : __createRequire(typeof import.meta !== "undefined" && import.meta.url ? import.meta.url : "file:///worker.js");

try {
  const __NativeFunction = globalThis.Function;
  if (typeof globalThis.__patchedFunction === "undefined") {
    globalThis.__patchedFunction = true;
    globalThis.Function = function (...args) {
      try {
        return __NativeFunction(...args);
      } catch (e) {
        return function () { return {}; };
      }
    };
    Object.setPrototypeOf(globalThis.Function, __NativeFunction);
  }
} catch (e) {}

const __dummyFs = {
  mkdirSync: () => {},
  writeFileSync: () => {},
  existsSync: () => false,
  readFileSync: () => "",
  statSync: () => ({ isFile: () => false, isDirectory: () => false }),
  promises: { readFile: async () => "", writeFile: async () => {}, mkdir: async () => {} }
};
__dummyFs.default = __dummyFs;

const __dummyOs = {
  cpus: () => [{}],
  type: () => "Linux",
  arch: () => "x64",
  platform: () => "linux",
  release: () => "1.0.0",
  homedir: () => "/tmp",
  tmpdir: () => "/tmp",
  hostname: () => "worker",
  endianness: () => "LE",
  totalmem: () => 1073741824,
  freemem: () => 536870912,
  loadavg: () => [0, 0, 0],
  networkInterfaces: () => ({})
};
__dummyOs.default = __dummyOs;

function __parseManifestCode(code) {
  const fallback = { sortedPages: [], pages: { "/": [] }, ampFirstPages: [], devFiles: [], ampDevFiles: [], lowPriorityFiles: [], rootMainFiles: [], polyfillFiles: [] };
  if (typeof code !== "string") return fallback;
  try {
    const start = code.indexOf("{");
    const end = code.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const jsonCandidate = code.slice(start, end + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (e) {
        const validJson = jsonCandidate
          .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":')
          .replace(/'/g, '"');
        return JSON.parse(validJson);
      }
    }
  } catch (e) {}
  return fallback;
}

const __dummyVm = {
  runInNewContext: (code, ctx) => {
    const parsed = __parseManifestCode(code);
    if (ctx && typeof ctx === "object") {
      Object.assign(ctx, parsed);
    }
    return parsed;
  },
  runInThisContext: (code) => {
    return __parseManifestCode(code);
  },
  createContext: (ctx) => ctx || {},
  Script: class Script { runInContext() {} runInThisContext() {} }
};
__dummyVm.default = __dummyVm;

const __dummyModule = new Proxy(function DummyConstructor() {}, {
  get(target, prop) {
    if (prop === "__esModule") return true;
    if (prop === "default") return __dummyModule;
    if (prop === "promises") return __dummyFs.promises;
    if (typeof prop === "string" && prop.startsWith("is")) return () => false;
    function DummyFn() {}
    try { Object.defineProperty(DummyFn, "length", { value: 1, configurable: true }); } catch (e) {}
    return DummyFn;
  },
  set() { return true; },
  defineProperty() { return true; },
  construct() { return {}; }
});

function __makeMutable(mod) {
  if (typeof mod !== "object" || mod === null) return mod;
  return new Proxy(mod, {
    get(target, prop, receiver) {
      if (prop === "prototype") return target.prototype || {};
      if (prop === "constructor") return target.constructor || Object;
      if (prop === "__esModule") return true;
      if (prop === "default") {
        let val;
        try { val = Reflect.get(target, prop, target); } catch (e) {}
        return (val !== undefined && val !== null) ? val : target;
      }
      let val;
      try { val = Reflect.get(target, prop, target); } catch (e) {}
      if (val === undefined) {
        function DummyProp() {}
        return DummyProp;
      }
      if (typeof val === "function") {
        try {
          return new Proxy(val, {
            construct(t, args) {
              try { return new t(...args); } catch (e) { return {}; }
            },
            apply(t, thisArg, args) {
              return t.apply(thisArg, args);
            }
          });
        } catch (e) {
          return val.bind(target);
        }
      }
      return val;
    },
    set(target, prop, value) {
      try {
        Reflect.set(target, prop, value, target);
      } catch (e) {}
      return true;
    },
    defineProperty(target, prop, descriptor) {
      try {
        Reflect.defineProperty(target, prop, descriptor);
      } catch (e) {}
      return true;
    }
  });
}

const __unsupportedModules = new Set([
  "fs", "node:fs",
  "os", "node:os",
  "vm", "node:vm",
  "inspector", "node:inspector",
  "child_process", "node:child_process",
  "cluster", "node:cluster",
  "net", "node:net",
  "tls", "node:tls",
  "dgram", "node:dgram",
  "dns", "node:dns",
  "readline", "node:readline",
  "repl", "node:repl",
  "v8", "node:v8",
  "perf_hooks", "node:perf_hooks"
]);

const require = function(id) {
  if (id === "fs" || id === "node:fs") return __makeMutable(__dummyFs);
  if (id === "os" || id === "node:os") return __makeMutable(__dummyOs);
  if (id === "vm" || id === "node:vm") return __makeMutable(__dummyVm);
  if (typeof id === "string" && (id.startsWith("node:") || __unsupportedModules.has(id))) {
    try {
      const res = __nativeRequire(id);
      return __makeMutable(res);
    } catch (e) {
      return __dummyModule;
    }
  }
  try {
    const res = __nativeRequire(id);
    return __makeMutable(res);
  } catch (err) {
    return __dummyModule;
  }
};

Object.assign(require, __nativeRequire);
if (typeof globalThis.require === "undefined") { globalThis.require = require; }
`;

function patchFile(filePath, label) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf-8");
    // Strip old shims if present
    if (content.includes("__createRequire")) {
      content = content.replace(/import \{ createRequire as __createRequire \}[\s\S]*?if \(typeof globalThis\.require === "undefined"\) \{ globalThis\.require = require; \}\r?\n/, "");
    }

    if (label === "worker.js") {
      // Replace static middleware import
      content = content.replace(
        /import\s+\{\s*handler\s+as\s+middlewareHandler\s*\}\s+from\s+["']\.\/middleware\/handler\.mjs["'];?/,
        "// static middleware import deferred to dynamic import"
      );

      // Replace missing durable object exports
      content = content.replace(/export\s+\{\s*DOQueueHandler\s*\}\s+from\s+["'].*?["'];?/g, "export class DOQueueHandler {}");
      content = content.replace(/export\s+\{\s*DOShardedTagCache\s*\}\s+from\s+["'].*?["'];?/g, "export class DOShardedTagCache {}");
      content = content.replace(/export\s+\{\s*BucketCachePurge\s*\}\s+from\s+["'].*?["'];?/g, "export class BucketCachePurge {}");

      // Replace export default with clean try-catch fetch wrapper
      content = content.replace(
        /export default \{[\s\S]*?\};/,
        `export default {
    async fetch(request, env, ctx) {
        try {
            return await runWithCloudflareRequestContext(request, env, ctx, async () => {
                const response = maybeGetSkewProtectionResponse(request);
                if (response) {
                    return response;
                }
                const url = new URL(request.url);
                if (url.pathname.startsWith("/cdn-cgi/image/")) {
                    return handleCdnCgiImageRequest(url, env);
                }
                if (url.pathname === \`\${globalThis.__NEXT_BASE_PATH__}/_next/image\${globalThis.__TRAILING_SLASH__ ? "/" : ""}\`) {
                    return await handleImageRequest(url, request.headers, env);
                }
                const { handler: middlewareHandler } = await import("./middleware/handler.mjs");
                const reqOrResp = await middlewareHandler(request, env, ctx);
                if (reqOrResp instanceof Response) {
                    return reqOrResp;
                }
                const { handler } = await import("./server-functions/default/handler.mjs");
                return handler(reqOrResp, env, ctx, request.signal);
            });
        } catch (err) {
            const msg = "WORKER EXCEPTION:\\n" + (err && err.stack ? err.stack : String(err)) + (err && err.cause ? "\\nCause: " + (err.cause.stack || err.cause) : "");
            console.error(msg);
            return new Response(msg, { status: 500, headers: { "content-type": "text/plain" } });
        }
    }
};`
      );
    }

    content = shim + content;

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`[patch-opennext] Injected clean manifest require shim into ${label}`);
  } else {
    console.warn(`[patch-opennext] File not found: ${filePath}`);
  }
}

patchFile(handlerPath, "handler.mjs");
patchFile(middlewarePath, "middleware/handler.mjs");
patchFile(workerPath, "worker.js");
