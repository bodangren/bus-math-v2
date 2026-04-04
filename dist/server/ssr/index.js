import assetsManifest from "./__vite_rsc_assets_manifest.js";
import * as ReactDOM from "react-dom";
import ReactDOM__default from "react-dom";
import * as React from "react";
import React__default from "react";
import { renderToReadableStream } from "react-dom/server.edge";
function safeFunctionCast(f) {
  return f;
}
function memoize(f, options) {
  const keyFn = ((...args) => args[0]);
  const cache = /* @__PURE__ */ new Map();
  return safeFunctionCast(function(...args) {
    const key = keyFn(...args);
    const value = cache.get(key);
    if (typeof value !== "undefined") return value;
    const newValue = f.apply(this, args);
    cache.set(key, newValue);
    return newValue;
  });
}
const SERVER_REFERENCE_PREFIX = "$$server:";
function removeReferenceCacheTag(id) {
  return id.split("$$cache=")[0];
}
function setInternalRequire() {
  globalThis.__vite_rsc_require__ = (id) => {
    if (id.startsWith(SERVER_REFERENCE_PREFIX)) {
      id = id.slice(9);
      return globalThis.__vite_rsc_server_require__(id);
    }
    return globalThis.__vite_rsc_client_require__(id);
  };
}
let init = false;
function setRequireModule(options) {
  if (init) return;
  init = true;
  const requireModule = memoize((id) => {
    return options.load(removeReferenceCacheTag(id));
  });
  globalThis.__vite_rsc_client_require__ = requireModule;
  setInternalRequire();
}
function createServerConsumerManifest() {
  return {};
}
var client_edge = { exports: {} };
var reactServerDomWebpackClient_edge_production = {};
var hasRequiredReactServerDomWebpackClient_edge_production;
function requireReactServerDomWebpackClient_edge_production() {
  if (hasRequiredReactServerDomWebpackClient_edge_production) return reactServerDomWebpackClient_edge_production;
  hasRequiredReactServerDomWebpackClient_edge_production = 1;
  var ReactDOM2 = ReactDOM__default, decoderOptions = { stream: true }, hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveClientReference(bundlerConfig, metadata) {
    if (bundlerConfig) {
      var moduleExports = bundlerConfig[metadata[0]];
      if (bundlerConfig = moduleExports && moduleExports[metadata[2]])
        moduleExports = bundlerConfig.name;
      else {
        bundlerConfig = moduleExports && moduleExports["*"];
        if (!bundlerConfig)
          throw Error(
            'Could not find the module "' + metadata[0] + '" in the React Server Consumer Manifest. This is probably a bug in the React Server Components bundler.'
          );
        moduleExports = metadata[2];
      }
      return 4 === metadata.length ? [bundlerConfig.id, bundlerConfig.chunks, moduleExports, 1] : [bundlerConfig.id, bundlerConfig.chunks, moduleExports];
    }
    return metadata;
  }
  function resolveServerReference(bundlerConfig, id) {
    var name = "", resolvedModuleData = bundlerConfig[id];
    if (resolvedModuleData) name = resolvedModuleData.name;
    else {
      var idx = id.lastIndexOf("#");
      -1 !== idx && (name = id.slice(idx + 1), resolvedModuleData = bundlerConfig[id.slice(0, idx)]);
      if (!resolvedModuleData)
        throw Error(
          'Could not find the module "' + id + '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.'
        );
    }
    return resolvedModuleData.async ? [resolvedModuleData.id, resolvedModuleData.chunks, name, 1] : [resolvedModuleData.id, resolvedModuleData.chunks, name];
  }
  var chunkCache = /* @__PURE__ */ new Map();
  function requireAsyncModule(id) {
    var promise = __vite_rsc_require__(id);
    if ("function" !== typeof promise.then || "fulfilled" === promise.status)
      return null;
    promise.then(
      function(value) {
        promise.status = "fulfilled";
        promise.value = value;
      },
      function(reason) {
        promise.status = "rejected";
        promise.reason = reason;
      }
    );
    return promise;
  }
  function ignoreReject() {
  }
  function preloadModule(metadata) {
    for (var chunks = metadata[1], promises = [], i = 0; i < chunks.length; ) {
      var chunkId = chunks[i++];
      chunks[i++];
      var entry = chunkCache.get(chunkId);
      if (void 0 === entry) {
        entry = __webpack_chunk_load__(chunkId);
        promises.push(entry);
        var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
        entry.then(resolve, ignoreReject);
        chunkCache.set(chunkId, entry);
      } else null !== entry && promises.push(entry);
    }
    return 4 === metadata.length ? 0 === promises.length ? requireAsyncModule(metadata[0]) : Promise.all(promises).then(function() {
      return requireAsyncModule(metadata[0]);
    }) : 0 < promises.length ? Promise.all(promises) : null;
  }
  function requireModule(metadata) {
    var moduleExports = __vite_rsc_require__(metadata[0]);
    if (4 === metadata.length && "function" === typeof moduleExports.then)
      if ("fulfilled" === moduleExports.status)
        moduleExports = moduleExports.value;
      else throw moduleExports.reason;
    if ("*" === metadata[2]) return moduleExports;
    if ("" === metadata[2])
      return moduleExports.__esModule ? moduleExports.default : moduleExports;
    if (hasOwnProperty.call(moduleExports, metadata[2]))
      return moduleExports[metadata[2]];
  }
  function prepareDestinationWithChunks(moduleLoading, chunks, nonce$jscomp$0) {
    if (null !== moduleLoading)
      for (var i = 1; i < chunks.length; i += 2) {
        var nonce = nonce$jscomp$0, JSCompiler_temp_const = ReactDOMSharedInternals.d, JSCompiler_temp_const$jscomp$0 = JSCompiler_temp_const.X, JSCompiler_temp_const$jscomp$1 = moduleLoading.prefix + chunks[i];
        var JSCompiler_inline_result = moduleLoading.crossOrigin;
        JSCompiler_inline_result = "string" === typeof JSCompiler_inline_result ? "use-credentials" === JSCompiler_inline_result ? JSCompiler_inline_result : "" : void 0;
        JSCompiler_temp_const$jscomp$0.call(
          JSCompiler_temp_const,
          JSCompiler_temp_const$jscomp$1,
          { crossOrigin: JSCompiler_inline_result, nonce }
        );
      }
  }
  var ReactDOMSharedInternals = ReactDOM2.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return "function" === typeof maybeIterable ? maybeIterable : null;
  }
  var ASYNC_ITERATOR = Symbol.asyncIterator, isArrayImpl = Array.isArray, getPrototypeOf = Object.getPrototypeOf, ObjectPrototype = Object.prototype, knownServerReferences = /* @__PURE__ */ new WeakMap();
  function serializeNumber(number) {
    return Number.isFinite(number) ? 0 === number && -Infinity === 1 / number ? "$-0" : number : Infinity === number ? "$Infinity" : -Infinity === number ? "$-Infinity" : "$NaN";
  }
  function processReply(root, formFieldPrefix, temporaryReferences, resolve, reject) {
    function serializeTypedArray(tag, typedArray) {
      typedArray = new Blob([
        new Uint8Array(
          typedArray.buffer,
          typedArray.byteOffset,
          typedArray.byteLength
        )
      ]);
      var blobId = nextPartId++;
      null === formData && (formData = new FormData());
      formData.append(formFieldPrefix + blobId, typedArray);
      return "$" + tag + blobId.toString(16);
    }
    function serializeBinaryReader(reader) {
      function progress(entry) {
        entry.done ? (entry = nextPartId++, data.append(formFieldPrefix + entry, new Blob(buffer)), data.append(
          formFieldPrefix + streamId,
          '"$o' + entry.toString(16) + '"'
        ), data.append(formFieldPrefix + streamId, "C"), pendingParts--, 0 === pendingParts && resolve(data)) : (buffer.push(entry.value), reader.read(new Uint8Array(1024)).then(progress, reject));
      }
      null === formData && (formData = new FormData());
      var data = formData;
      pendingParts++;
      var streamId = nextPartId++, buffer = [];
      reader.read(new Uint8Array(1024)).then(progress, reject);
      return "$r" + streamId.toString(16);
    }
    function serializeReader(reader) {
      function progress(entry) {
        if (entry.done)
          data.append(formFieldPrefix + streamId, "C"), pendingParts--, 0 === pendingParts && resolve(data);
        else
          try {
            var partJSON = JSON.stringify(entry.value, resolveToJSON);
            data.append(formFieldPrefix + streamId, partJSON);
            reader.read().then(progress, reject);
          } catch (x) {
            reject(x);
          }
      }
      null === formData && (formData = new FormData());
      var data = formData;
      pendingParts++;
      var streamId = nextPartId++;
      reader.read().then(progress, reject);
      return "$R" + streamId.toString(16);
    }
    function serializeReadableStream(stream) {
      try {
        var binaryReader = stream.getReader({ mode: "byob" });
      } catch (x) {
        return serializeReader(stream.getReader());
      }
      return serializeBinaryReader(binaryReader);
    }
    function serializeAsyncIterable(iterable, iterator) {
      function progress(entry) {
        if (entry.done) {
          if (void 0 === entry.value)
            data.append(formFieldPrefix + streamId, "C");
          else
            try {
              var partJSON = JSON.stringify(entry.value, resolveToJSON);
              data.append(formFieldPrefix + streamId, "C" + partJSON);
            } catch (x) {
              reject(x);
              return;
            }
          pendingParts--;
          0 === pendingParts && resolve(data);
        } else
          try {
            var partJSON$21 = JSON.stringify(entry.value, resolveToJSON);
            data.append(formFieldPrefix + streamId, partJSON$21);
            iterator.next().then(progress, reject);
          } catch (x$22) {
            reject(x$22);
          }
      }
      null === formData && (formData = new FormData());
      var data = formData;
      pendingParts++;
      var streamId = nextPartId++;
      iterable = iterable === iterator;
      iterator.next().then(progress, reject);
      return "$" + (iterable ? "x" : "X") + streamId.toString(16);
    }
    function resolveToJSON(key, value) {
      if (null === value) return null;
      if ("object" === typeof value) {
        switch (value.$$typeof) {
          case REACT_ELEMENT_TYPE:
            if (void 0 !== temporaryReferences && -1 === key.indexOf(":")) {
              var parentReference = writtenObjects.get(this);
              if (void 0 !== parentReference)
                return temporaryReferences.set(parentReference + ":" + key, value), "$T";
            }
            throw Error(
              "React Element cannot be passed to Server Functions from the Client without a temporary reference set. Pass a TemporaryReferenceSet to the options."
            );
          case REACT_LAZY_TYPE:
            parentReference = value._payload;
            var init2 = value._init;
            null === formData && (formData = new FormData());
            pendingParts++;
            try {
              var resolvedModel = init2(parentReference), lazyId = nextPartId++, partJSON = serializeModel(resolvedModel, lazyId);
              formData.append(formFieldPrefix + lazyId, partJSON);
              return "$" + lazyId.toString(16);
            } catch (x) {
              if ("object" === typeof x && null !== x && "function" === typeof x.then) {
                pendingParts++;
                var lazyId$23 = nextPartId++;
                parentReference = function() {
                  try {
                    var partJSON$24 = serializeModel(value, lazyId$23), data$25 = formData;
                    data$25.append(formFieldPrefix + lazyId$23, partJSON$24);
                    pendingParts--;
                    0 === pendingParts && resolve(data$25);
                  } catch (reason) {
                    reject(reason);
                  }
                };
                x.then(parentReference, parentReference);
                return "$" + lazyId$23.toString(16);
              }
              reject(x);
              return null;
            } finally {
              pendingParts--;
            }
        }
        parentReference = writtenObjects.get(value);
        if ("function" === typeof value.then) {
          if (void 0 !== parentReference)
            if (modelRoot === value) modelRoot = null;
            else return parentReference;
          null === formData && (formData = new FormData());
          pendingParts++;
          var promiseId = nextPartId++;
          key = "$@" + promiseId.toString(16);
          writtenObjects.set(value, key);
          value.then(function(partValue) {
            try {
              var previousReference = writtenObjects.get(partValue);
              var partJSON$27 = void 0 !== previousReference ? JSON.stringify(previousReference) : serializeModel(partValue, promiseId);
              partValue = formData;
              partValue.append(formFieldPrefix + promiseId, partJSON$27);
              pendingParts--;
              0 === pendingParts && resolve(partValue);
            } catch (reason) {
              reject(reason);
            }
          }, reject);
          return key;
        }
        if (void 0 !== parentReference)
          if (modelRoot === value) modelRoot = null;
          else return parentReference;
        else
          -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference && (key = parentReference + ":" + key, writtenObjects.set(value, key), void 0 !== temporaryReferences && temporaryReferences.set(key, value)));
        if (isArrayImpl(value)) return value;
        if (value instanceof FormData) {
          null === formData && (formData = new FormData());
          var data$31 = formData;
          key = nextPartId++;
          var prefix = formFieldPrefix + key + "_";
          value.forEach(function(originalValue, originalKey) {
            data$31.append(prefix + originalKey, originalValue);
          });
          return "$K" + key.toString(16);
        }
        if (value instanceof Map)
          return key = nextPartId++, parentReference = serializeModel(Array.from(value), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$Q" + key.toString(16);
        if (value instanceof Set)
          return key = nextPartId++, parentReference = serializeModel(Array.from(value), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$W" + key.toString(16);
        if (value instanceof ArrayBuffer)
          return key = new Blob([value]), parentReference = nextPartId++, null === formData && (formData = new FormData()), formData.append(formFieldPrefix + parentReference, key), "$A" + parentReference.toString(16);
        if (value instanceof Int8Array) return serializeTypedArray("O", value);
        if (value instanceof Uint8Array) return serializeTypedArray("o", value);
        if (value instanceof Uint8ClampedArray)
          return serializeTypedArray("U", value);
        if (value instanceof Int16Array) return serializeTypedArray("S", value);
        if (value instanceof Uint16Array) return serializeTypedArray("s", value);
        if (value instanceof Int32Array) return serializeTypedArray("L", value);
        if (value instanceof Uint32Array) return serializeTypedArray("l", value);
        if (value instanceof Float32Array) return serializeTypedArray("G", value);
        if (value instanceof Float64Array) return serializeTypedArray("g", value);
        if (value instanceof BigInt64Array)
          return serializeTypedArray("M", value);
        if (value instanceof BigUint64Array)
          return serializeTypedArray("m", value);
        if (value instanceof DataView) return serializeTypedArray("V", value);
        if ("function" === typeof Blob && value instanceof Blob)
          return null === formData && (formData = new FormData()), key = nextPartId++, formData.append(formFieldPrefix + key, value), "$B" + key.toString(16);
        if (key = getIteratorFn(value))
          return parentReference = key.call(value), parentReference === value ? (key = nextPartId++, parentReference = serializeModel(
            Array.from(parentReference),
            key
          ), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$i" + key.toString(16)) : Array.from(parentReference);
        if ("function" === typeof ReadableStream && value instanceof ReadableStream)
          return serializeReadableStream(value);
        key = value[ASYNC_ITERATOR];
        if ("function" === typeof key)
          return serializeAsyncIterable(value, key.call(value));
        key = getPrototypeOf(value);
        if (key !== ObjectPrototype && (null === key || null !== getPrototypeOf(key))) {
          if (void 0 === temporaryReferences)
            throw Error(
              "Only plain objects, and a few built-ins, can be passed to Server Functions. Classes or null prototypes are not supported."
            );
          return "$T";
        }
        return value;
      }
      if ("string" === typeof value) {
        if ("Z" === value[value.length - 1] && this[key] instanceof Date)
          return "$D" + value;
        key = "$" === value[0] ? "$" + value : value;
        return key;
      }
      if ("boolean" === typeof value) return value;
      if ("number" === typeof value) return serializeNumber(value);
      if ("undefined" === typeof value) return "$undefined";
      if ("function" === typeof value) {
        parentReference = knownServerReferences.get(value);
        if (void 0 !== parentReference) {
          key = writtenObjects.get(value);
          if (void 0 !== key) return key;
          key = JSON.stringify(
            { id: parentReference.id, bound: parentReference.bound },
            resolveToJSON
          );
          null === formData && (formData = new FormData());
          parentReference = nextPartId++;
          formData.set(formFieldPrefix + parentReference, key);
          key = "$h" + parentReference.toString(16);
          writtenObjects.set(value, key);
          return key;
        }
        if (void 0 !== temporaryReferences && -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference))
          return temporaryReferences.set(parentReference + ":" + key, value), "$T";
        throw Error(
          "Client Functions cannot be passed directly to Server Functions. Only Functions passed from the Server can be passed back again."
        );
      }
      if ("symbol" === typeof value) {
        if (void 0 !== temporaryReferences && -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference))
          return temporaryReferences.set(parentReference + ":" + key, value), "$T";
        throw Error(
          "Symbols cannot be passed to a Server Function without a temporary reference set. Pass a TemporaryReferenceSet to the options."
        );
      }
      if ("bigint" === typeof value) return "$n" + value.toString(10);
      throw Error(
        "Type " + typeof value + " is not supported as an argument to a Server Function."
      );
    }
    function serializeModel(model, id) {
      "object" === typeof model && null !== model && (id = "$" + id.toString(16), writtenObjects.set(model, id), void 0 !== temporaryReferences && temporaryReferences.set(id, model));
      modelRoot = model;
      return JSON.stringify(model, resolveToJSON);
    }
    var nextPartId = 1, pendingParts = 0, formData = null, writtenObjects = /* @__PURE__ */ new WeakMap(), modelRoot = root, json = serializeModel(root, 0);
    null === formData ? resolve(json) : (formData.set(formFieldPrefix + "0", json), 0 === pendingParts && resolve(formData));
    return function() {
      0 < pendingParts && (pendingParts = 0, null === formData ? resolve(json) : resolve(formData));
    };
  }
  var boundCache = /* @__PURE__ */ new WeakMap();
  function encodeFormData(reference) {
    var resolve, reject, thenable = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    processReply(
      reference,
      "",
      void 0,
      function(body) {
        if ("string" === typeof body) {
          var data = new FormData();
          data.append("0", body);
          body = data;
        }
        thenable.status = "fulfilled";
        thenable.value = body;
        resolve(body);
      },
      function(e) {
        thenable.status = "rejected";
        thenable.reason = e;
        reject(e);
      }
    );
    return thenable;
  }
  function defaultEncodeFormAction(identifierPrefix) {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure)
      throw Error(
        "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
      );
    var data = null;
    if (null !== referenceClosure.bound) {
      data = boundCache.get(referenceClosure);
      data || (data = encodeFormData({
        id: referenceClosure.id,
        bound: referenceClosure.bound
      }), boundCache.set(referenceClosure, data));
      if ("rejected" === data.status) throw data.reason;
      if ("fulfilled" !== data.status) throw data;
      referenceClosure = data.value;
      var prefixedData = new FormData();
      referenceClosure.forEach(function(value, key) {
        prefixedData.append("$ACTION_" + identifierPrefix + ":" + key, value);
      });
      data = prefixedData;
      referenceClosure = "$ACTION_REF_" + identifierPrefix;
    } else referenceClosure = "$ACTION_ID_" + referenceClosure.id;
    return {
      name: referenceClosure,
      method: "POST",
      encType: "multipart/form-data",
      data
    };
  }
  function isSignatureEqual(referenceId, numberOfBoundArgs) {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure)
      throw Error(
        "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
      );
    if (referenceClosure.id !== referenceId) return false;
    var boundPromise = referenceClosure.bound;
    if (null === boundPromise) return 0 === numberOfBoundArgs;
    switch (boundPromise.status) {
      case "fulfilled":
        return boundPromise.value.length === numberOfBoundArgs;
      case "pending":
        throw boundPromise;
      case "rejected":
        throw boundPromise.reason;
      default:
        throw "string" !== typeof boundPromise.status && (boundPromise.status = "pending", boundPromise.then(
          function(boundArgs) {
            boundPromise.status = "fulfilled";
            boundPromise.value = boundArgs;
          },
          function(error) {
            boundPromise.status = "rejected";
            boundPromise.reason = error;
          }
        )), boundPromise;
    }
  }
  function registerBoundServerReference(reference, id, bound, encodeFormAction) {
    knownServerReferences.has(reference) || (knownServerReferences.set(reference, {
      id,
      originalBind: reference.bind,
      bound
    }), Object.defineProperties(reference, {
      $$FORM_ACTION: {
        value: void 0 === encodeFormAction ? defaultEncodeFormAction : function() {
          var referenceClosure = knownServerReferences.get(this);
          if (!referenceClosure)
            throw Error(
              "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
            );
          var boundPromise = referenceClosure.bound;
          null === boundPromise && (boundPromise = Promise.resolve([]));
          return encodeFormAction(referenceClosure.id, boundPromise);
        }
      },
      $$IS_SIGNATURE_EQUAL: { value: isSignatureEqual },
      bind: { value: bind }
    }));
  }
  var FunctionBind = Function.prototype.bind, ArraySlice = Array.prototype.slice;
  function bind() {
    var referenceClosure = knownServerReferences.get(this);
    if (!referenceClosure) return FunctionBind.apply(this, arguments);
    var newFn = referenceClosure.originalBind.apply(this, arguments), args = ArraySlice.call(arguments, 1), boundPromise = null;
    boundPromise = null !== referenceClosure.bound ? Promise.resolve(referenceClosure.bound).then(function(boundArgs) {
      return boundArgs.concat(args);
    }) : Promise.resolve(args);
    knownServerReferences.set(newFn, {
      id: referenceClosure.id,
      originalBind: newFn.bind,
      bound: boundPromise
    });
    Object.defineProperties(newFn, {
      $$FORM_ACTION: { value: this.$$FORM_ACTION },
      $$IS_SIGNATURE_EQUAL: { value: isSignatureEqual },
      bind: { value: bind }
    });
    return newFn;
  }
  function createBoundServerReference(metaData, callServer, encodeFormAction) {
    function action() {
      var args = Array.prototype.slice.call(arguments);
      return bound ? "fulfilled" === bound.status ? callServer(id, bound.value.concat(args)) : Promise.resolve(bound).then(function(boundArgs) {
        return callServer(id, boundArgs.concat(args));
      }) : callServer(id, args);
    }
    var id = metaData.id, bound = metaData.bound;
    registerBoundServerReference(action, id, bound, encodeFormAction);
    return action;
  }
  function createServerReference$1(id, callServer, encodeFormAction) {
    function action() {
      var args = Array.prototype.slice.call(arguments);
      return callServer(id, args);
    }
    registerBoundServerReference(action, id, null, encodeFormAction);
    return action;
  }
  function ReactPromise(status, value, reason) {
    this.status = status;
    this.value = value;
    this.reason = reason;
  }
  ReactPromise.prototype = Object.create(Promise.prototype);
  ReactPromise.prototype.then = function(resolve, reject) {
    switch (this.status) {
      case "resolved_model":
        initializeModelChunk(this);
        break;
      case "resolved_module":
        initializeModuleChunk(this);
    }
    switch (this.status) {
      case "fulfilled":
        "function" === typeof resolve && resolve(this.value);
        break;
      case "pending":
      case "blocked":
        "function" === typeof resolve && (null === this.value && (this.value = []), this.value.push(resolve));
        "function" === typeof reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
        break;
      case "halted":
        break;
      default:
        "function" === typeof reject && reject(this.reason);
    }
  };
  function readChunk(chunk) {
    switch (chunk.status) {
      case "resolved_model":
        initializeModelChunk(chunk);
        break;
      case "resolved_module":
        initializeModuleChunk(chunk);
    }
    switch (chunk.status) {
      case "fulfilled":
        return chunk.value;
      case "pending":
      case "blocked":
      case "halted":
        throw chunk;
      default:
        throw chunk.reason;
    }
  }
  function wakeChunk(listeners, value, chunk) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      "function" === typeof listener ? listener(value) : fulfillReference(listener, value);
    }
  }
  function rejectChunk(listeners, error) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      "function" === typeof listener ? listener(error) : rejectReference(listener, error);
    }
  }
  function resolveBlockedCycle(resolvedChunk, reference) {
    var referencedChunk = reference.handler.chunk;
    if (null === referencedChunk) return null;
    if (referencedChunk === resolvedChunk) return reference.handler;
    reference = referencedChunk.value;
    if (null !== reference)
      for (referencedChunk = 0; referencedChunk < reference.length; referencedChunk++) {
        var listener = reference[referencedChunk];
        if ("function" !== typeof listener && (listener = resolveBlockedCycle(resolvedChunk, listener), null !== listener))
          return listener;
      }
    return null;
  }
  function wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners) {
    switch (chunk.status) {
      case "fulfilled":
        wakeChunk(resolveListeners, chunk.value);
        break;
      case "blocked":
        for (var i = 0; i < resolveListeners.length; i++) {
          var listener = resolveListeners[i];
          if ("function" !== typeof listener) {
            var cyclicHandler = resolveBlockedCycle(chunk, listener);
            if (null !== cyclicHandler)
              switch (fulfillReference(listener, cyclicHandler.value), resolveListeners.splice(i, 1), i--, null !== rejectListeners && (listener = rejectListeners.indexOf(listener), -1 !== listener && rejectListeners.splice(listener, 1)), chunk.status) {
                case "fulfilled":
                  wakeChunk(resolveListeners, chunk.value);
                  return;
                case "rejected":
                  null !== rejectListeners && rejectChunk(rejectListeners, chunk.reason);
                  return;
              }
          }
        }
      case "pending":
        if (chunk.value)
          for (i = 0; i < resolveListeners.length; i++)
            chunk.value.push(resolveListeners[i]);
        else chunk.value = resolveListeners;
        if (chunk.reason) {
          if (rejectListeners)
            for (resolveListeners = 0; resolveListeners < rejectListeners.length; resolveListeners++)
              chunk.reason.push(rejectListeners[resolveListeners]);
        } else chunk.reason = rejectListeners;
        break;
      case "rejected":
        rejectListeners && rejectChunk(rejectListeners, chunk.reason);
    }
  }
  function triggerErrorOnChunk(response, chunk, error) {
    "pending" !== chunk.status && "blocked" !== chunk.status ? chunk.reason.error(error) : (response = chunk.reason, chunk.status = "rejected", chunk.reason = error, null !== response && rejectChunk(response, error));
  }
  function createResolvedIteratorResultChunk(response, value, done) {
    return new ReactPromise(
      "resolved_model",
      (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}",
      response
    );
  }
  function resolveIteratorResultChunk(response, chunk, value, done) {
    resolveModelChunk(
      response,
      chunk,
      (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}"
    );
  }
  function resolveModelChunk(response, chunk, value) {
    if ("pending" !== chunk.status) chunk.reason.enqueueModel(value);
    else {
      var resolveListeners = chunk.value, rejectListeners = chunk.reason;
      chunk.status = "resolved_model";
      chunk.value = value;
      chunk.reason = response;
      null !== resolveListeners && (initializeModelChunk(chunk), wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners));
    }
  }
  function resolveModuleChunk(response, chunk, value) {
    if ("pending" === chunk.status || "blocked" === chunk.status) {
      response = chunk.value;
      var rejectListeners = chunk.reason;
      chunk.status = "resolved_module";
      chunk.value = value;
      chunk.reason = null;
      null !== response && (initializeModuleChunk(chunk), wakeChunkIfInitialized(chunk, response, rejectListeners));
    }
  }
  var initializingHandler = null;
  function initializeModelChunk(chunk) {
    var prevHandler = initializingHandler;
    initializingHandler = null;
    var resolvedModel = chunk.value, response = chunk.reason;
    chunk.status = "blocked";
    chunk.value = null;
    chunk.reason = null;
    try {
      var value = JSON.parse(resolvedModel, response._fromJSON), resolveListeners = chunk.value;
      if (null !== resolveListeners)
        for (chunk.value = null, chunk.reason = null, resolvedModel = 0; resolvedModel < resolveListeners.length; resolvedModel++) {
          var listener = resolveListeners[resolvedModel];
          "function" === typeof listener ? listener(value) : fulfillReference(listener, value, chunk);
        }
      if (null !== initializingHandler) {
        if (initializingHandler.errored) throw initializingHandler.reason;
        if (0 < initializingHandler.deps) {
          initializingHandler.value = value;
          initializingHandler.chunk = chunk;
          return;
        }
      }
      chunk.status = "fulfilled";
      chunk.value = value;
    } catch (error) {
      chunk.status = "rejected", chunk.reason = error;
    } finally {
      initializingHandler = prevHandler;
    }
  }
  function initializeModuleChunk(chunk) {
    try {
      var value = requireModule(chunk.value);
      chunk.status = "fulfilled";
      chunk.value = value;
    } catch (error) {
      chunk.status = "rejected", chunk.reason = error;
    }
  }
  function reportGlobalError(weakResponse, error) {
    weakResponse._closed = true;
    weakResponse._closedReason = error;
    weakResponse._chunks.forEach(function(chunk) {
      "pending" === chunk.status ? triggerErrorOnChunk(weakResponse, chunk, error) : "fulfilled" === chunk.status && null !== chunk.reason && chunk.reason.error(error);
    });
  }
  function createLazyChunkWrapper(chunk) {
    return { $$typeof: REACT_LAZY_TYPE, _payload: chunk, _init: readChunk };
  }
  function getChunk(response, id) {
    var chunks = response._chunks, chunk = chunks.get(id);
    chunk || (chunk = response._closed ? new ReactPromise("rejected", null, response._closedReason) : new ReactPromise("pending", null, null), chunks.set(id, chunk));
    return chunk;
  }
  function fulfillReference(reference, value) {
    var response = reference.response, handler = reference.handler, parentObject = reference.parentObject, key = reference.key, map = reference.map, path = reference.path;
    try {
      for (var i = 1; i < path.length; i++) {
        for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
          var referencedChunk = value._payload;
          if (referencedChunk === handler.chunk) value = handler.value;
          else {
            switch (referencedChunk.status) {
              case "resolved_model":
                initializeModelChunk(referencedChunk);
                break;
              case "resolved_module":
                initializeModuleChunk(referencedChunk);
            }
            switch (referencedChunk.status) {
              case "fulfilled":
                value = referencedChunk.value;
                continue;
              case "blocked":
                var cyclicHandler = resolveBlockedCycle(
                  referencedChunk,
                  reference
                );
                if (null !== cyclicHandler) {
                  value = cyclicHandler.value;
                  continue;
                }
              case "pending":
                path.splice(0, i - 1);
                null === referencedChunk.value ? referencedChunk.value = [reference] : referencedChunk.value.push(reference);
                null === referencedChunk.reason ? referencedChunk.reason = [reference] : referencedChunk.reason.push(reference);
                return;
              case "halted":
                return;
              default:
                rejectReference(reference, referencedChunk.reason);
                return;
            }
          }
        }
        var name = path[i];
        if ("object" === typeof value && null !== value && hasOwnProperty.call(value, name))
          value = value[name];
        else throw Error("Invalid reference.");
      }
      for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
        var referencedChunk$44 = value._payload;
        if (referencedChunk$44 === handler.chunk) value = handler.value;
        else {
          switch (referencedChunk$44.status) {
            case "resolved_model":
              initializeModelChunk(referencedChunk$44);
              break;
            case "resolved_module":
              initializeModuleChunk(referencedChunk$44);
          }
          switch (referencedChunk$44.status) {
            case "fulfilled":
              value = referencedChunk$44.value;
              continue;
          }
          break;
        }
      }
      var mappedValue = map(response, value, parentObject, key);
      "__proto__" !== key && (parentObject[key] = mappedValue);
      "" === key && null === handler.value && (handler.value = mappedValue);
      if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === typeof handler.value && null !== handler.value && handler.value.$$typeof === REACT_ELEMENT_TYPE) {
        var element = handler.value;
        switch (key) {
          case "3":
            element.props = mappedValue;
        }
      }
    } catch (error) {
      rejectReference(reference, error);
      return;
    }
    handler.deps--;
    0 === handler.deps && (reference = handler.chunk, null !== reference && "blocked" === reference.status && (value = reference.value, reference.status = "fulfilled", reference.value = handler.value, reference.reason = handler.reason, null !== value && wakeChunk(value, handler.value)));
  }
  function rejectReference(reference, error) {
    var handler = reference.handler;
    reference = reference.response;
    handler.errored || (handler.errored = true, handler.value = null, handler.reason = error, handler = handler.chunk, null !== handler && "blocked" === handler.status && triggerErrorOnChunk(reference, handler, error));
  }
  function waitForReference(referencedChunk, parentObject, key, response, map, path) {
    if (initializingHandler) {
      var handler = initializingHandler;
      handler.deps++;
    } else
      handler = initializingHandler = {
        parent: null,
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: false
      };
    parentObject = {
      response,
      handler,
      parentObject,
      key,
      map,
      path
    };
    null === referencedChunk.value ? referencedChunk.value = [parentObject] : referencedChunk.value.push(parentObject);
    null === referencedChunk.reason ? referencedChunk.reason = [parentObject] : referencedChunk.reason.push(parentObject);
    return null;
  }
  function loadServerReference(response, metaData, parentObject, key) {
    if (!response._serverReferenceConfig)
      return createBoundServerReference(
        metaData,
        response._callServer,
        response._encodeFormAction
      );
    var serverReference = resolveServerReference(
      response._serverReferenceConfig,
      metaData.id
    ), promise = preloadModule(serverReference);
    if (promise)
      metaData.bound && (promise = Promise.all([promise, metaData.bound]));
    else if (metaData.bound) promise = Promise.resolve(metaData.bound);
    else
      return promise = requireModule(serverReference), registerBoundServerReference(
        promise,
        metaData.id,
        metaData.bound,
        response._encodeFormAction
      ), promise;
    if (initializingHandler) {
      var handler = initializingHandler;
      handler.deps++;
    } else
      handler = initializingHandler = {
        parent: null,
        chunk: null,
        value: null,
        reason: null,
        deps: 1,
        errored: false
      };
    promise.then(
      function() {
        var resolvedValue = requireModule(serverReference);
        if (metaData.bound) {
          var boundArgs = metaData.bound.value.slice(0);
          boundArgs.unshift(null);
          resolvedValue = resolvedValue.bind.apply(resolvedValue, boundArgs);
        }
        registerBoundServerReference(
          resolvedValue,
          metaData.id,
          metaData.bound,
          response._encodeFormAction
        );
        "__proto__" !== key && (parentObject[key] = resolvedValue);
        "" === key && null === handler.value && (handler.value = resolvedValue);
        if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === typeof handler.value && null !== handler.value && handler.value.$$typeof === REACT_ELEMENT_TYPE)
          switch (boundArgs = handler.value, key) {
            case "3":
              boundArgs.props = resolvedValue;
          }
        handler.deps--;
        0 === handler.deps && (resolvedValue = handler.chunk, null !== resolvedValue && "blocked" === resolvedValue.status && (boundArgs = resolvedValue.value, resolvedValue.status = "fulfilled", resolvedValue.value = handler.value, resolvedValue.reason = null, null !== boundArgs && wakeChunk(boundArgs, handler.value)));
      },
      function(error) {
        if (!handler.errored) {
          handler.errored = true;
          handler.value = null;
          handler.reason = error;
          var chunk = handler.chunk;
          null !== chunk && "blocked" === chunk.status && triggerErrorOnChunk(response, chunk, error);
        }
      }
    );
    return null;
  }
  function getOutlinedModel(response, reference, parentObject, key, map) {
    reference = reference.split(":");
    var id = parseInt(reference[0], 16);
    id = getChunk(response, id);
    switch (id.status) {
      case "resolved_model":
        initializeModelChunk(id);
        break;
      case "resolved_module":
        initializeModuleChunk(id);
    }
    switch (id.status) {
      case "fulfilled":
        id = id.value;
        for (var i = 1; i < reference.length; i++) {
          for (; "object" === typeof id && null !== id && id.$$typeof === REACT_LAZY_TYPE; ) {
            id = id._payload;
            switch (id.status) {
              case "resolved_model":
                initializeModelChunk(id);
                break;
              case "resolved_module":
                initializeModuleChunk(id);
            }
            switch (id.status) {
              case "fulfilled":
                id = id.value;
                break;
              case "blocked":
              case "pending":
                return waitForReference(
                  id,
                  parentObject,
                  key,
                  response,
                  map,
                  reference.slice(i - 1)
                );
              case "halted":
                return initializingHandler ? (response = initializingHandler, response.deps++) : initializingHandler = {
                  parent: null,
                  chunk: null,
                  value: null,
                  reason: null,
                  deps: 1,
                  errored: false
                }, null;
              default:
                return initializingHandler ? (initializingHandler.errored = true, initializingHandler.value = null, initializingHandler.reason = id.reason) : initializingHandler = {
                  parent: null,
                  chunk: null,
                  value: null,
                  reason: id.reason,
                  deps: 0,
                  errored: true
                }, null;
            }
          }
          id = id[reference[i]];
        }
        for (; "object" === typeof id && null !== id && id.$$typeof === REACT_LAZY_TYPE; ) {
          reference = id._payload;
          switch (reference.status) {
            case "resolved_model":
              initializeModelChunk(reference);
              break;
            case "resolved_module":
              initializeModuleChunk(reference);
          }
          switch (reference.status) {
            case "fulfilled":
              id = reference.value;
              continue;
          }
          break;
        }
        return map(response, id, parentObject, key);
      case "pending":
      case "blocked":
        return waitForReference(id, parentObject, key, response, map, reference);
      case "halted":
        return initializingHandler ? (response = initializingHandler, response.deps++) : initializingHandler = {
          parent: null,
          chunk: null,
          value: null,
          reason: null,
          deps: 1,
          errored: false
        }, null;
      default:
        return initializingHandler ? (initializingHandler.errored = true, initializingHandler.value = null, initializingHandler.reason = id.reason) : initializingHandler = {
          parent: null,
          chunk: null,
          value: null,
          reason: id.reason,
          deps: 0,
          errored: true
        }, null;
    }
  }
  function createMap(response, model) {
    return new Map(model);
  }
  function createSet(response, model) {
    return new Set(model);
  }
  function createBlob(response, model) {
    return new Blob(model.slice(1), { type: model[0] });
  }
  function createFormData(response, model) {
    response = new FormData();
    for (var i = 0; i < model.length; i++)
      response.append(model[i][0], model[i][1]);
    return response;
  }
  function extractIterator(response, model) {
    return model[Symbol.iterator]();
  }
  function createModel(response, model) {
    return model;
  }
  function parseModelString(response, parentObject, key, value) {
    if ("$" === value[0]) {
      if ("$" === value)
        return null !== initializingHandler && "0" === key && (initializingHandler = {
          parent: initializingHandler,
          chunk: null,
          value: null,
          reason: null,
          deps: 0,
          errored: false
        }), REACT_ELEMENT_TYPE;
      switch (value[1]) {
        case "$":
          return value.slice(1);
        case "L":
          return parentObject = parseInt(value.slice(2), 16), response = getChunk(response, parentObject), createLazyChunkWrapper(response);
        case "@":
          return parentObject = parseInt(value.slice(2), 16), getChunk(response, parentObject);
        case "S":
          return Symbol.for(value.slice(2));
        case "h":
          return value = value.slice(2), getOutlinedModel(
            response,
            value,
            parentObject,
            key,
            loadServerReference
          );
        case "T":
          parentObject = "$" + value.slice(2);
          response = response._tempRefs;
          if (null == response)
            throw Error(
              "Missing a temporary reference set but the RSC response returned a temporary reference. Pass a temporaryReference option with the set that was used with the reply."
            );
          return response.get(parentObject);
        case "Q":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createMap);
        case "W":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createSet);
        case "B":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createBlob);
        case "K":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, createFormData);
        case "Z":
          return resolveErrorProd();
        case "i":
          return value = value.slice(2), getOutlinedModel(response, value, parentObject, key, extractIterator);
        case "I":
          return Infinity;
        case "-":
          return "$-0" === value ? -0 : -Infinity;
        case "N":
          return NaN;
        case "u":
          return;
        case "D":
          return new Date(Date.parse(value.slice(2)));
        case "n":
          return BigInt(value.slice(2));
        default:
          return value = value.slice(1), getOutlinedModel(response, value, parentObject, key, createModel);
      }
    }
    return value;
  }
  function missingCall() {
    throw Error(
      'Trying to call a function from "use server" but the callServer option was not implemented in your router runtime.'
    );
  }
  function ResponseInstance(bundlerConfig, serverReferenceConfig, moduleLoading, callServer, encodeFormAction, nonce, temporaryReferences) {
    var chunks = /* @__PURE__ */ new Map();
    this._bundlerConfig = bundlerConfig;
    this._serverReferenceConfig = serverReferenceConfig;
    this._moduleLoading = moduleLoading;
    this._callServer = void 0 !== callServer ? callServer : missingCall;
    this._encodeFormAction = encodeFormAction;
    this._nonce = nonce;
    this._chunks = chunks;
    this._stringDecoder = new TextDecoder();
    this._fromJSON = null;
    this._closed = false;
    this._closedReason = null;
    this._tempRefs = temporaryReferences;
    this._fromJSON = createFromJSONCallback(this);
  }
  function resolveBuffer(response, id, buffer) {
    response = response._chunks;
    var chunk = response.get(id);
    chunk && "pending" !== chunk.status ? chunk.reason.enqueueValue(buffer) : (buffer = new ReactPromise("fulfilled", buffer, null), response.set(id, buffer));
  }
  function resolveModule(response, id, model) {
    var chunks = response._chunks, chunk = chunks.get(id);
    model = JSON.parse(model, response._fromJSON);
    var clientReference = resolveClientReference(response._bundlerConfig, model);
    prepareDestinationWithChunks(
      response._moduleLoading,
      model[1],
      response._nonce
    );
    if (model = preloadModule(clientReference)) {
      if (chunk) {
        var blockedChunk = chunk;
        blockedChunk.status = "blocked";
      } else
        blockedChunk = new ReactPromise("blocked", null, null), chunks.set(id, blockedChunk);
      model.then(
        function() {
          return resolveModuleChunk(response, blockedChunk, clientReference);
        },
        function(error) {
          return triggerErrorOnChunk(response, blockedChunk, error);
        }
      );
    } else
      chunk ? resolveModuleChunk(response, chunk, clientReference) : (chunk = new ReactPromise("resolved_module", clientReference, null), chunks.set(id, chunk));
  }
  function resolveStream(response, id, stream, controller) {
    response = response._chunks;
    var chunk = response.get(id);
    chunk ? "pending" === chunk.status && (id = chunk.value, chunk.status = "fulfilled", chunk.value = stream, chunk.reason = controller, null !== id && wakeChunk(id, chunk.value)) : (stream = new ReactPromise("fulfilled", stream, controller), response.set(id, stream));
  }
  function startReadableStream(response, id, type) {
    var controller = null, closed = false;
    type = new ReadableStream({
      type,
      start: function(c) {
        controller = c;
      }
    });
    var previousBlockedChunk = null;
    resolveStream(response, id, type, {
      enqueueValue: function(value) {
        null === previousBlockedChunk ? controller.enqueue(value) : previousBlockedChunk.then(function() {
          controller.enqueue(value);
        });
      },
      enqueueModel: function(json) {
        if (null === previousBlockedChunk) {
          var chunk = new ReactPromise("resolved_model", json, response);
          initializeModelChunk(chunk);
          "fulfilled" === chunk.status ? controller.enqueue(chunk.value) : (chunk.then(
            function(v) {
              return controller.enqueue(v);
            },
            function(e) {
              return controller.error(e);
            }
          ), previousBlockedChunk = chunk);
        } else {
          chunk = previousBlockedChunk;
          var chunk$55 = new ReactPromise("pending", null, null);
          chunk$55.then(
            function(v) {
              return controller.enqueue(v);
            },
            function(e) {
              return controller.error(e);
            }
          );
          previousBlockedChunk = chunk$55;
          chunk.then(function() {
            previousBlockedChunk === chunk$55 && (previousBlockedChunk = null);
            resolveModelChunk(response, chunk$55, json);
          });
        }
      },
      close: function() {
        if (!closed)
          if (closed = true, null === previousBlockedChunk) controller.close();
          else {
            var blockedChunk = previousBlockedChunk;
            previousBlockedChunk = null;
            blockedChunk.then(function() {
              return controller.close();
            });
          }
      },
      error: function(error) {
        if (!closed)
          if (closed = true, null === previousBlockedChunk)
            controller.error(error);
          else {
            var blockedChunk = previousBlockedChunk;
            previousBlockedChunk = null;
            blockedChunk.then(function() {
              return controller.error(error);
            });
          }
      }
    });
  }
  function asyncIterator() {
    return this;
  }
  function createIterator(next) {
    next = { next };
    next[ASYNC_ITERATOR] = asyncIterator;
    return next;
  }
  function startAsyncIterable(response, id, iterator) {
    var buffer = [], closed = false, nextWriteIndex = 0, iterable = {};
    iterable[ASYNC_ITERATOR] = function() {
      var nextReadIndex = 0;
      return createIterator(function(arg) {
        if (void 0 !== arg)
          throw Error(
            "Values cannot be passed to next() of AsyncIterables passed to Client Components."
          );
        if (nextReadIndex === buffer.length) {
          if (closed)
            return new ReactPromise(
              "fulfilled",
              { done: true, value: void 0 },
              null
            );
          buffer[nextReadIndex] = new ReactPromise("pending", null, null);
        }
        return buffer[nextReadIndex++];
      });
    };
    resolveStream(
      response,
      id,
      iterator ? iterable[ASYNC_ITERATOR]() : iterable,
      {
        enqueueValue: function(value) {
          if (nextWriteIndex === buffer.length)
            buffer[nextWriteIndex] = new ReactPromise(
              "fulfilled",
              { done: false, value },
              null
            );
          else {
            var chunk = buffer[nextWriteIndex], resolveListeners = chunk.value, rejectListeners = chunk.reason;
            chunk.status = "fulfilled";
            chunk.value = { done: false, value };
            chunk.reason = null;
            null !== resolveListeners && wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners);
          }
          nextWriteIndex++;
        },
        enqueueModel: function(value) {
          nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
            response,
            value,
            false
          ) : resolveIteratorResultChunk(
            response,
            buffer[nextWriteIndex],
            value,
            false
          );
          nextWriteIndex++;
        },
        close: function(value) {
          if (!closed)
            for (closed = true, nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
              response,
              value,
              true
            ) : resolveIteratorResultChunk(
              response,
              buffer[nextWriteIndex],
              value,
              true
            ), nextWriteIndex++; nextWriteIndex < buffer.length; )
              resolveIteratorResultChunk(
                response,
                buffer[nextWriteIndex++],
                '"$undefined"',
                true
              );
        },
        error: function(error) {
          if (!closed)
            for (closed = true, nextWriteIndex === buffer.length && (buffer[nextWriteIndex] = new ReactPromise(
              "pending",
              null,
              null
            )); nextWriteIndex < buffer.length; )
              triggerErrorOnChunk(response, buffer[nextWriteIndex++], error);
        }
      }
    );
  }
  function resolveErrorProd() {
    var error = Error(
      "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error."
    );
    error.stack = "Error: " + error.message;
    return error;
  }
  function mergeBuffer(buffer, lastChunk) {
    for (var l = buffer.length, byteLength = lastChunk.length, i = 0; i < l; i++)
      byteLength += buffer[i].byteLength;
    byteLength = new Uint8Array(byteLength);
    for (var i$56 = i = 0; i$56 < l; i$56++) {
      var chunk = buffer[i$56];
      byteLength.set(chunk, i);
      i += chunk.byteLength;
    }
    byteLength.set(lastChunk, i);
    return byteLength;
  }
  function resolveTypedArray(response, id, buffer, lastChunk, constructor, bytesPerElement) {
    buffer = 0 === buffer.length && 0 === lastChunk.byteOffset % bytesPerElement ? lastChunk : mergeBuffer(buffer, lastChunk);
    constructor = new constructor(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength / bytesPerElement
    );
    resolveBuffer(response, id, constructor);
  }
  function processFullBinaryRow(response, streamState, id, tag, buffer, chunk) {
    switch (tag) {
      case 65:
        resolveBuffer(response, id, mergeBuffer(buffer, chunk).buffer);
        return;
      case 79:
        resolveTypedArray(response, id, buffer, chunk, Int8Array, 1);
        return;
      case 111:
        resolveBuffer(
          response,
          id,
          0 === buffer.length ? chunk : mergeBuffer(buffer, chunk)
        );
        return;
      case 85:
        resolveTypedArray(response, id, buffer, chunk, Uint8ClampedArray, 1);
        return;
      case 83:
        resolveTypedArray(response, id, buffer, chunk, Int16Array, 2);
        return;
      case 115:
        resolveTypedArray(response, id, buffer, chunk, Uint16Array, 2);
        return;
      case 76:
        resolveTypedArray(response, id, buffer, chunk, Int32Array, 4);
        return;
      case 108:
        resolveTypedArray(response, id, buffer, chunk, Uint32Array, 4);
        return;
      case 71:
        resolveTypedArray(response, id, buffer, chunk, Float32Array, 4);
        return;
      case 103:
        resolveTypedArray(response, id, buffer, chunk, Float64Array, 8);
        return;
      case 77:
        resolveTypedArray(response, id, buffer, chunk, BigInt64Array, 8);
        return;
      case 109:
        resolveTypedArray(response, id, buffer, chunk, BigUint64Array, 8);
        return;
      case 86:
        resolveTypedArray(response, id, buffer, chunk, DataView, 1);
        return;
    }
    streamState = response._stringDecoder;
    for (var row = "", i = 0; i < buffer.length; i++)
      row += streamState.decode(buffer[i], decoderOptions);
    buffer = row += streamState.decode(chunk);
    switch (tag) {
      case 73:
        resolveModule(response, id, buffer);
        break;
      case 72:
        id = buffer[0];
        buffer = buffer.slice(1);
        response = JSON.parse(buffer, response._fromJSON);
        buffer = ReactDOMSharedInternals.d;
        switch (id) {
          case "D":
            buffer.D(response);
            break;
          case "C":
            "string" === typeof response ? buffer.C(response) : buffer.C(response[0], response[1]);
            break;
          case "L":
            id = response[0];
            tag = response[1];
            3 === response.length ? buffer.L(id, tag, response[2]) : buffer.L(id, tag);
            break;
          case "m":
            "string" === typeof response ? buffer.m(response) : buffer.m(response[0], response[1]);
            break;
          case "X":
            "string" === typeof response ? buffer.X(response) : buffer.X(response[0], response[1]);
            break;
          case "S":
            "string" === typeof response ? buffer.S(response) : buffer.S(
              response[0],
              0 === response[1] ? void 0 : response[1],
              3 === response.length ? response[2] : void 0
            );
            break;
          case "M":
            "string" === typeof response ? buffer.M(response) : buffer.M(response[0], response[1]);
        }
        break;
      case 69:
        tag = response._chunks;
        chunk = tag.get(id);
        buffer = JSON.parse(buffer);
        streamState = resolveErrorProd();
        streamState.digest = buffer.digest;
        chunk ? triggerErrorOnChunk(response, chunk, streamState) : (response = new ReactPromise("rejected", null, streamState), tag.set(id, response));
        break;
      case 84:
        response = response._chunks;
        (tag = response.get(id)) && "pending" !== tag.status ? tag.reason.enqueueValue(buffer) : (buffer = new ReactPromise("fulfilled", buffer, null), response.set(id, buffer));
        break;
      case 78:
      case 68:
      case 74:
      case 87:
        throw Error(
          "Failed to read a RSC payload created by a development version of React on the server while using a production version on the client. Always use matching versions on the server and the client."
        );
      case 82:
        startReadableStream(response, id, void 0);
        break;
      case 114:
        startReadableStream(response, id, "bytes");
        break;
      case 88:
        startAsyncIterable(response, id, false);
        break;
      case 120:
        startAsyncIterable(response, id, true);
        break;
      case 67:
        (id = response._chunks.get(id)) && "fulfilled" === id.status && id.reason.close("" === buffer ? '"$undefined"' : buffer);
        break;
      default:
        tag = response._chunks, (chunk = tag.get(id)) ? resolveModelChunk(response, chunk, buffer) : (response = new ReactPromise("resolved_model", buffer, response), tag.set(id, response));
    }
  }
  function createFromJSONCallback(response) {
    return function(key, value) {
      if ("__proto__" !== key) {
        if ("string" === typeof value)
          return parseModelString(response, this, key, value);
        if ("object" === typeof value && null !== value) {
          if (value[0] === REACT_ELEMENT_TYPE) {
            if (key = {
              $$typeof: REACT_ELEMENT_TYPE,
              type: value[1],
              key: value[2],
              ref: null,
              props: value[3]
            }, null !== initializingHandler) {
              if (value = initializingHandler, initializingHandler = value.parent, value.errored)
                key = new ReactPromise("rejected", null, value.reason), key = createLazyChunkWrapper(key);
              else if (0 < value.deps) {
                var blockedChunk = new ReactPromise("blocked", null, null);
                value.value = key;
                value.chunk = blockedChunk;
                key = createLazyChunkWrapper(blockedChunk);
              }
            }
          } else key = value;
          return key;
        }
        return value;
      }
    };
  }
  function close(weakResponse) {
    reportGlobalError(weakResponse, Error("Connection closed."));
  }
  function noServerCall() {
    throw Error(
      "Server Functions cannot be called during initial render. This would create a fetch waterfall. Try to use a Server Component to pass data to Client Components instead."
    );
  }
  function createResponseFromOptions(options) {
    return new ResponseInstance(
      options.serverConsumerManifest.moduleMap,
      options.serverConsumerManifest.serverModuleMap,
      options.serverConsumerManifest.moduleLoading,
      noServerCall,
      options.encodeFormAction,
      "string" === typeof options.nonce ? options.nonce : void 0,
      options && options.temporaryReferences ? options.temporaryReferences : void 0
    );
  }
  function startReadingFromStream(response, stream, onDone) {
    function progress(_ref) {
      var value = _ref.value;
      if (_ref.done) return onDone();
      var i = 0, rowState = streamState._rowState;
      _ref = streamState._rowID;
      for (var rowTag = streamState._rowTag, rowLength = streamState._rowLength, buffer = streamState._buffer, chunkLength = value.length; i < chunkLength; ) {
        var lastIdx = -1;
        switch (rowState) {
          case 0:
            lastIdx = value[i++];
            58 === lastIdx ? rowState = 1 : _ref = _ref << 4 | (96 < lastIdx ? lastIdx - 87 : lastIdx - 48);
            continue;
          case 1:
            rowState = value[i];
            84 === rowState || 65 === rowState || 79 === rowState || 111 === rowState || 85 === rowState || 83 === rowState || 115 === rowState || 76 === rowState || 108 === rowState || 71 === rowState || 103 === rowState || 77 === rowState || 109 === rowState || 86 === rowState ? (rowTag = rowState, rowState = 2, i++) : 64 < rowState && 91 > rowState || 35 === rowState || 114 === rowState || 120 === rowState ? (rowTag = rowState, rowState = 3, i++) : (rowTag = 0, rowState = 3);
            continue;
          case 2:
            lastIdx = value[i++];
            44 === lastIdx ? rowState = 4 : rowLength = rowLength << 4 | (96 < lastIdx ? lastIdx - 87 : lastIdx - 48);
            continue;
          case 3:
            lastIdx = value.indexOf(10, i);
            break;
          case 4:
            lastIdx = i + rowLength, lastIdx > value.length && (lastIdx = -1);
        }
        var offset = value.byteOffset + i;
        if (-1 < lastIdx)
          rowLength = new Uint8Array(value.buffer, offset, lastIdx - i), processFullBinaryRow(
            response,
            streamState,
            _ref,
            rowTag,
            buffer,
            rowLength
          ), i = lastIdx, 3 === rowState && i++, rowLength = _ref = rowTag = rowState = 0, buffer.length = 0;
        else {
          value = new Uint8Array(value.buffer, offset, value.byteLength - i);
          buffer.push(value);
          rowLength -= value.byteLength;
          break;
        }
      }
      streamState._rowState = rowState;
      streamState._rowID = _ref;
      streamState._rowTag = rowTag;
      streamState._rowLength = rowLength;
      return reader.read().then(progress).catch(error);
    }
    function error(e) {
      reportGlobalError(response, e);
    }
    var streamState = {
      _rowState: 0,
      _rowID: 0,
      _rowTag: 0,
      _rowLength: 0,
      _buffer: []
    }, reader = stream.getReader();
    reader.read().then(progress).catch(error);
  }
  reactServerDomWebpackClient_edge_production.createFromFetch = function(promiseForResponse, options) {
    var response = createResponseFromOptions(options);
    promiseForResponse.then(
      function(r) {
        startReadingFromStream(response, r.body, close.bind(null, response));
      },
      function(e) {
        reportGlobalError(response, e);
      }
    );
    return getChunk(response, 0);
  };
  reactServerDomWebpackClient_edge_production.createFromReadableStream = function(stream, options) {
    options = createResponseFromOptions(options);
    startReadingFromStream(options, stream, close.bind(null, options));
    return getChunk(options, 0);
  };
  reactServerDomWebpackClient_edge_production.createServerReference = function(id) {
    return createServerReference$1(id, noServerCall);
  };
  reactServerDomWebpackClient_edge_production.createTemporaryReferenceSet = function() {
    return /* @__PURE__ */ new Map();
  };
  reactServerDomWebpackClient_edge_production.encodeReply = function(value, options) {
    return new Promise(function(resolve, reject) {
      var abort = processReply(
        value,
        "",
        options && options.temporaryReferences ? options.temporaryReferences : void 0,
        resolve,
        reject
      );
      if (options && options.signal) {
        var signal = options.signal;
        if (signal.aborted) abort(signal.reason);
        else {
          var listener = function() {
            abort(signal.reason);
            signal.removeEventListener("abort", listener);
          };
          signal.addEventListener("abort", listener);
        }
      }
    });
  };
  reactServerDomWebpackClient_edge_production.registerServerReference = function(reference, id, encodeFormAction) {
    registerBoundServerReference(reference, id, null, encodeFormAction);
    return reference;
  };
  return reactServerDomWebpackClient_edge_production;
}
var reactServerDomWebpackClient_edge_development = {};
var hasRequiredReactServerDomWebpackClient_edge_development;
function requireReactServerDomWebpackClient_edge_development() {
  if (hasRequiredReactServerDomWebpackClient_edge_development) return reactServerDomWebpackClient_edge_development;
  hasRequiredReactServerDomWebpackClient_edge_development = 1;
  "production" !== process.env.NODE_ENV && (function() {
    function resolveClientReference(bundlerConfig, metadata) {
      if (bundlerConfig) {
        var moduleExports = bundlerConfig[metadata[0]];
        if (bundlerConfig = moduleExports && moduleExports[metadata[2]])
          moduleExports = bundlerConfig.name;
        else {
          bundlerConfig = moduleExports && moduleExports["*"];
          if (!bundlerConfig)
            throw Error(
              'Could not find the module "' + metadata[0] + '" in the React Server Consumer Manifest. This is probably a bug in the React Server Components bundler.'
            );
          moduleExports = metadata[2];
        }
        return 4 === metadata.length ? [bundlerConfig.id, bundlerConfig.chunks, moduleExports, 1] : [bundlerConfig.id, bundlerConfig.chunks, moduleExports];
      }
      return metadata;
    }
    function resolveServerReference(bundlerConfig, id) {
      var name = "", resolvedModuleData = bundlerConfig[id];
      if (resolvedModuleData) name = resolvedModuleData.name;
      else {
        var idx = id.lastIndexOf("#");
        -1 !== idx && (name = id.slice(idx + 1), resolvedModuleData = bundlerConfig[id.slice(0, idx)]);
        if (!resolvedModuleData)
          throw Error(
            'Could not find the module "' + id + '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.'
          );
      }
      return resolvedModuleData.async ? [resolvedModuleData.id, resolvedModuleData.chunks, name, 1] : [resolvedModuleData.id, resolvedModuleData.chunks, name];
    }
    function requireAsyncModule(id) {
      var promise = __vite_rsc_require__(id);
      if ("function" !== typeof promise.then || "fulfilled" === promise.status)
        return null;
      promise.then(
        function(value) {
          promise.status = "fulfilled";
          promise.value = value;
        },
        function(reason) {
          promise.status = "rejected";
          promise.reason = reason;
        }
      );
      return promise;
    }
    function ignoreReject() {
    }
    function preloadModule(metadata) {
      for (var chunks = metadata[1], promises = [], i = 0; i < chunks.length; ) {
        var chunkId = chunks[i++];
        chunks[i++];
        var entry = chunkCache.get(chunkId);
        if (void 0 === entry) {
          entry = __webpack_chunk_load__(chunkId);
          promises.push(entry);
          var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
          entry.then(resolve, ignoreReject);
          chunkCache.set(chunkId, entry);
        } else null !== entry && promises.push(entry);
      }
      return 4 === metadata.length ? 0 === promises.length ? requireAsyncModule(metadata[0]) : Promise.all(promises).then(function() {
        return requireAsyncModule(metadata[0]);
      }) : 0 < promises.length ? Promise.all(promises) : null;
    }
    function requireModule(metadata) {
      var moduleExports = __vite_rsc_require__(metadata[0]);
      if (4 === metadata.length && "function" === typeof moduleExports.then)
        if ("fulfilled" === moduleExports.status)
          moduleExports = moduleExports.value;
        else throw moduleExports.reason;
      if ("*" === metadata[2]) return moduleExports;
      if ("" === metadata[2])
        return moduleExports.__esModule ? moduleExports.default : moduleExports;
      if (hasOwnProperty.call(moduleExports, metadata[2]))
        return moduleExports[metadata[2]];
    }
    function prepareDestinationWithChunks(moduleLoading, chunks, nonce$jscomp$0) {
      if (null !== moduleLoading)
        for (var i = 1; i < chunks.length; i += 2) {
          var nonce = nonce$jscomp$0, JSCompiler_temp_const = ReactDOMSharedInternals.d, JSCompiler_temp_const$jscomp$0 = JSCompiler_temp_const.X, JSCompiler_temp_const$jscomp$1 = moduleLoading.prefix + chunks[i];
          var JSCompiler_inline_result = moduleLoading.crossOrigin;
          JSCompiler_inline_result = "string" === typeof JSCompiler_inline_result ? "use-credentials" === JSCompiler_inline_result ? JSCompiler_inline_result : "" : void 0;
          JSCompiler_temp_const$jscomp$0.call(
            JSCompiler_temp_const,
            JSCompiler_temp_const$jscomp$1,
            { crossOrigin: JSCompiler_inline_result, nonce }
          );
        }
    }
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable)
        return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    function isObjectPrototype(object) {
      if (!object) return false;
      var ObjectPrototype2 = Object.prototype;
      if (object === ObjectPrototype2) return true;
      if (getPrototypeOf(object)) return false;
      object = Object.getOwnPropertyNames(object);
      for (var i = 0; i < object.length; i++)
        if (!(object[i] in ObjectPrototype2)) return false;
      return true;
    }
    function isSimpleObject(object) {
      if (!isObjectPrototype(getPrototypeOf(object))) return false;
      for (var names = Object.getOwnPropertyNames(object), i = 0; i < names.length; i++) {
        var descriptor = Object.getOwnPropertyDescriptor(object, names[i]);
        if (!descriptor || !descriptor.enumerable && ("key" !== names[i] && "ref" !== names[i] || "function" !== typeof descriptor.get))
          return false;
      }
      return true;
    }
    function objectName(object) {
      object = Object.prototype.toString.call(object);
      return object.slice(8, object.length - 1);
    }
    function describeKeyForErrorMessage(key) {
      var encodedKey = JSON.stringify(key);
      return '"' + key + '"' === encodedKey ? key : encodedKey;
    }
    function describeValueForErrorMessage(value) {
      switch (typeof value) {
        case "string":
          return JSON.stringify(
            10 >= value.length ? value : value.slice(0, 10) + "..."
          );
        case "object":
          if (isArrayImpl(value)) return "[...]";
          if (null !== value && value.$$typeof === CLIENT_REFERENCE_TAG)
            return "client";
          value = objectName(value);
          return "Object" === value ? "{...}" : value;
        case "function":
          return value.$$typeof === CLIENT_REFERENCE_TAG ? "client" : (value = value.displayName || value.name) ? "function " + value : "function";
        default:
          return String(value);
      }
    }
    function describeElementType(type) {
      if ("string" === typeof type) return type;
      switch (type) {
        case REACT_SUSPENSE_TYPE:
          return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
          return "SuspenseList";
      }
      if ("object" === typeof type)
        switch (type.$$typeof) {
          case REACT_FORWARD_REF_TYPE:
            return describeElementType(type.render);
          case REACT_MEMO_TYPE:
            return describeElementType(type.type);
          case REACT_LAZY_TYPE:
            var payload = type._payload;
            type = type._init;
            try {
              return describeElementType(type(payload));
            } catch (x) {
            }
        }
      return "";
    }
    function describeObjectForErrorMessage(objectOrArray, expandedName) {
      var objKind = objectName(objectOrArray);
      if ("Object" !== objKind && "Array" !== objKind) return objKind;
      var start = -1, length = 0;
      if (isArrayImpl(objectOrArray))
        if (jsxChildrenParents.has(objectOrArray)) {
          var type = jsxChildrenParents.get(objectOrArray);
          objKind = "<" + describeElementType(type) + ">";
          for (var i = 0; i < objectOrArray.length; i++) {
            var value = objectOrArray[i];
            value = "string" === typeof value ? value : "object" === typeof value && null !== value ? "{" + describeObjectForErrorMessage(value) + "}" : "{" + describeValueForErrorMessage(value) + "}";
            "" + i === expandedName ? (start = objKind.length, length = value.length, objKind += value) : objKind = 15 > value.length && 40 > objKind.length + value.length ? objKind + value : objKind + "{...}";
          }
          objKind += "</" + describeElementType(type) + ">";
        } else {
          objKind = "[";
          for (type = 0; type < objectOrArray.length; type++)
            0 < type && (objKind += ", "), i = objectOrArray[type], i = "object" === typeof i && null !== i ? describeObjectForErrorMessage(i) : describeValueForErrorMessage(i), "" + type === expandedName ? (start = objKind.length, length = i.length, objKind += i) : objKind = 10 > i.length && 40 > objKind.length + i.length ? objKind + i : objKind + "...";
          objKind += "]";
        }
      else if (objectOrArray.$$typeof === REACT_ELEMENT_TYPE)
        objKind = "<" + describeElementType(objectOrArray.type) + "/>";
      else {
        if (objectOrArray.$$typeof === CLIENT_REFERENCE_TAG) return "client";
        if (jsxPropsParents.has(objectOrArray)) {
          objKind = jsxPropsParents.get(objectOrArray);
          objKind = "<" + (describeElementType(objKind) || "...");
          type = Object.keys(objectOrArray);
          for (i = 0; i < type.length; i++) {
            objKind += " ";
            value = type[i];
            objKind += describeKeyForErrorMessage(value) + "=";
            var _value2 = objectOrArray[value];
            var _substr2 = value === expandedName && "object" === typeof _value2 && null !== _value2 ? describeObjectForErrorMessage(_value2) : describeValueForErrorMessage(_value2);
            "string" !== typeof _value2 && (_substr2 = "{" + _substr2 + "}");
            value === expandedName ? (start = objKind.length, length = _substr2.length, objKind += _substr2) : objKind = 10 > _substr2.length && 40 > objKind.length + _substr2.length ? objKind + _substr2 : objKind + "...";
          }
          objKind += ">";
        } else {
          objKind = "{";
          type = Object.keys(objectOrArray);
          for (i = 0; i < type.length; i++)
            0 < i && (objKind += ", "), value = type[i], objKind += describeKeyForErrorMessage(value) + ": ", _value2 = objectOrArray[value], _value2 = "object" === typeof _value2 && null !== _value2 ? describeObjectForErrorMessage(_value2) : describeValueForErrorMessage(_value2), value === expandedName ? (start = objKind.length, length = _value2.length, objKind += _value2) : objKind = 10 > _value2.length && 40 > objKind.length + _value2.length ? objKind + _value2 : objKind + "...";
          objKind += "}";
        }
      }
      return void 0 === expandedName ? objKind : -1 < start && 0 < length ? (objectOrArray = " ".repeat(start) + "^".repeat(length), "\n  " + objKind + "\n  " + objectOrArray) : "\n  " + objKind;
    }
    function serializeNumber(number) {
      return Number.isFinite(number) ? 0 === number && -Infinity === 1 / number ? "$-0" : number : Infinity === number ? "$Infinity" : -Infinity === number ? "$-Infinity" : "$NaN";
    }
    function processReply(root, formFieldPrefix, temporaryReferences, resolve, reject) {
      function serializeTypedArray(tag, typedArray) {
        typedArray = new Blob([
          new Uint8Array(
            typedArray.buffer,
            typedArray.byteOffset,
            typedArray.byteLength
          )
        ]);
        var blobId = nextPartId++;
        null === formData && (formData = new FormData());
        formData.append(formFieldPrefix + blobId, typedArray);
        return "$" + tag + blobId.toString(16);
      }
      function serializeBinaryReader(reader) {
        function progress(entry) {
          entry.done ? (entry = nextPartId++, data.append(formFieldPrefix + entry, new Blob(buffer)), data.append(
            formFieldPrefix + streamId,
            '"$o' + entry.toString(16) + '"'
          ), data.append(formFieldPrefix + streamId, "C"), pendingParts--, 0 === pendingParts && resolve(data)) : (buffer.push(entry.value), reader.read(new Uint8Array(1024)).then(progress, reject));
        }
        null === formData && (formData = new FormData());
        var data = formData;
        pendingParts++;
        var streamId = nextPartId++, buffer = [];
        reader.read(new Uint8Array(1024)).then(progress, reject);
        return "$r" + streamId.toString(16);
      }
      function serializeReader(reader) {
        function progress(entry) {
          if (entry.done)
            data.append(formFieldPrefix + streamId, "C"), pendingParts--, 0 === pendingParts && resolve(data);
          else
            try {
              var partJSON = JSON.stringify(entry.value, resolveToJSON);
              data.append(formFieldPrefix + streamId, partJSON);
              reader.read().then(progress, reject);
            } catch (x) {
              reject(x);
            }
        }
        null === formData && (formData = new FormData());
        var data = formData;
        pendingParts++;
        var streamId = nextPartId++;
        reader.read().then(progress, reject);
        return "$R" + streamId.toString(16);
      }
      function serializeReadableStream(stream) {
        try {
          var binaryReader = stream.getReader({ mode: "byob" });
        } catch (x) {
          return serializeReader(stream.getReader());
        }
        return serializeBinaryReader(binaryReader);
      }
      function serializeAsyncIterable(iterable, iterator) {
        function progress(entry) {
          if (entry.done) {
            if (void 0 === entry.value)
              data.append(formFieldPrefix + streamId, "C");
            else
              try {
                var partJSON = JSON.stringify(entry.value, resolveToJSON);
                data.append(formFieldPrefix + streamId, "C" + partJSON);
              } catch (x) {
                reject(x);
                return;
              }
            pendingParts--;
            0 === pendingParts && resolve(data);
          } else
            try {
              var _partJSON = JSON.stringify(entry.value, resolveToJSON);
              data.append(formFieldPrefix + streamId, _partJSON);
              iterator.next().then(progress, reject);
            } catch (x$0) {
              reject(x$0);
            }
        }
        null === formData && (formData = new FormData());
        var data = formData;
        pendingParts++;
        var streamId = nextPartId++;
        iterable = iterable === iterator;
        iterator.next().then(progress, reject);
        return "$" + (iterable ? "x" : "X") + streamId.toString(16);
      }
      function resolveToJSON(key, value) {
        "__proto__" === key && console.error(
          "Expected not to serialize an object with own property `__proto__`. When parsed this property will be omitted.%s",
          describeObjectForErrorMessage(this, key)
        );
        var originalValue = this[key];
        "object" !== typeof originalValue || originalValue === value || originalValue instanceof Date || ("Object" !== objectName(originalValue) ? console.error(
          "Only plain objects can be passed to Server Functions from the Client. %s objects are not supported.%s",
          objectName(originalValue),
          describeObjectForErrorMessage(this, key)
        ) : console.error(
          "Only plain objects can be passed to Server Functions from the Client. Objects with toJSON methods are not supported. Convert it manually to a simple value before passing it to props.%s",
          describeObjectForErrorMessage(this, key)
        ));
        if (null === value) return null;
        if ("object" === typeof value) {
          switch (value.$$typeof) {
            case REACT_ELEMENT_TYPE:
              if (void 0 !== temporaryReferences && -1 === key.indexOf(":")) {
                var parentReference = writtenObjects.get(this);
                if (void 0 !== parentReference)
                  return temporaryReferences.set(parentReference + ":" + key, value), "$T";
              }
              throw Error(
                "React Element cannot be passed to Server Functions from the Client without a temporary reference set. Pass a TemporaryReferenceSet to the options." + describeObjectForErrorMessage(this, key)
              );
            case REACT_LAZY_TYPE:
              originalValue = value._payload;
              var init2 = value._init;
              null === formData && (formData = new FormData());
              pendingParts++;
              try {
                parentReference = init2(originalValue);
                var lazyId = nextPartId++, partJSON = serializeModel(parentReference, lazyId);
                formData.append(formFieldPrefix + lazyId, partJSON);
                return "$" + lazyId.toString(16);
              } catch (x) {
                if ("object" === typeof x && null !== x && "function" === typeof x.then) {
                  pendingParts++;
                  var _lazyId = nextPartId++;
                  parentReference = function() {
                    try {
                      var _partJSON2 = serializeModel(value, _lazyId), _data = formData;
                      _data.append(formFieldPrefix + _lazyId, _partJSON2);
                      pendingParts--;
                      0 === pendingParts && resolve(_data);
                    } catch (reason) {
                      reject(reason);
                    }
                  };
                  x.then(parentReference, parentReference);
                  return "$" + _lazyId.toString(16);
                }
                reject(x);
                return null;
              } finally {
                pendingParts--;
              }
          }
          parentReference = writtenObjects.get(value);
          if ("function" === typeof value.then) {
            if (void 0 !== parentReference)
              if (modelRoot === value) modelRoot = null;
              else return parentReference;
            null === formData && (formData = new FormData());
            pendingParts++;
            var promiseId = nextPartId++;
            key = "$@" + promiseId.toString(16);
            writtenObjects.set(value, key);
            value.then(function(partValue) {
              try {
                var previousReference = writtenObjects.get(partValue);
                var _partJSON3 = void 0 !== previousReference ? JSON.stringify(previousReference) : serializeModel(partValue, promiseId);
                partValue = formData;
                partValue.append(formFieldPrefix + promiseId, _partJSON3);
                pendingParts--;
                0 === pendingParts && resolve(partValue);
              } catch (reason) {
                reject(reason);
              }
            }, reject);
            return key;
          }
          if (void 0 !== parentReference)
            if (modelRoot === value) modelRoot = null;
            else return parentReference;
          else
            -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference && (parentReference = parentReference + ":" + key, writtenObjects.set(value, parentReference), void 0 !== temporaryReferences && temporaryReferences.set(parentReference, value)));
          if (isArrayImpl(value)) return value;
          if (value instanceof FormData) {
            null === formData && (formData = new FormData());
            var _data3 = formData;
            key = nextPartId++;
            var prefix2 = formFieldPrefix + key + "_";
            value.forEach(function(originalValue2, originalKey) {
              _data3.append(prefix2 + originalKey, originalValue2);
            });
            return "$K" + key.toString(16);
          }
          if (value instanceof Map)
            return key = nextPartId++, parentReference = serializeModel(Array.from(value), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$Q" + key.toString(16);
          if (value instanceof Set)
            return key = nextPartId++, parentReference = serializeModel(Array.from(value), key), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$W" + key.toString(16);
          if (value instanceof ArrayBuffer)
            return key = new Blob([value]), parentReference = nextPartId++, null === formData && (formData = new FormData()), formData.append(formFieldPrefix + parentReference, key), "$A" + parentReference.toString(16);
          if (value instanceof Int8Array)
            return serializeTypedArray("O", value);
          if (value instanceof Uint8Array)
            return serializeTypedArray("o", value);
          if (value instanceof Uint8ClampedArray)
            return serializeTypedArray("U", value);
          if (value instanceof Int16Array)
            return serializeTypedArray("S", value);
          if (value instanceof Uint16Array)
            return serializeTypedArray("s", value);
          if (value instanceof Int32Array)
            return serializeTypedArray("L", value);
          if (value instanceof Uint32Array)
            return serializeTypedArray("l", value);
          if (value instanceof Float32Array)
            return serializeTypedArray("G", value);
          if (value instanceof Float64Array)
            return serializeTypedArray("g", value);
          if (value instanceof BigInt64Array)
            return serializeTypedArray("M", value);
          if (value instanceof BigUint64Array)
            return serializeTypedArray("m", value);
          if (value instanceof DataView) return serializeTypedArray("V", value);
          if ("function" === typeof Blob && value instanceof Blob)
            return null === formData && (formData = new FormData()), key = nextPartId++, formData.append(formFieldPrefix + key, value), "$B" + key.toString(16);
          if (parentReference = getIteratorFn(value))
            return parentReference = parentReference.call(value), parentReference === value ? (key = nextPartId++, parentReference = serializeModel(
              Array.from(parentReference),
              key
            ), null === formData && (formData = new FormData()), formData.append(formFieldPrefix + key, parentReference), "$i" + key.toString(16)) : Array.from(parentReference);
          if ("function" === typeof ReadableStream && value instanceof ReadableStream)
            return serializeReadableStream(value);
          parentReference = value[ASYNC_ITERATOR];
          if ("function" === typeof parentReference)
            return serializeAsyncIterable(value, parentReference.call(value));
          parentReference = getPrototypeOf(value);
          if (parentReference !== ObjectPrototype && (null === parentReference || null !== getPrototypeOf(parentReference))) {
            if (void 0 === temporaryReferences)
              throw Error(
                "Only plain objects, and a few built-ins, can be passed to Server Functions. Classes or null prototypes are not supported." + describeObjectForErrorMessage(this, key)
              );
            return "$T";
          }
          value.$$typeof === REACT_CONTEXT_TYPE ? console.error(
            "React Context Providers cannot be passed to Server Functions from the Client.%s",
            describeObjectForErrorMessage(this, key)
          ) : "Object" !== objectName(value) ? console.error(
            "Only plain objects can be passed to Server Functions from the Client. %s objects are not supported.%s",
            objectName(value),
            describeObjectForErrorMessage(this, key)
          ) : isSimpleObject(value) ? Object.getOwnPropertySymbols && (parentReference = Object.getOwnPropertySymbols(value), 0 < parentReference.length && console.error(
            "Only plain objects can be passed to Server Functions from the Client. Objects with symbol properties like %s are not supported.%s",
            parentReference[0].description,
            describeObjectForErrorMessage(this, key)
          )) : console.error(
            "Only plain objects can be passed to Server Functions from the Client. Classes or other objects with methods are not supported.%s",
            describeObjectForErrorMessage(this, key)
          );
          return value;
        }
        if ("string" === typeof value) {
          if ("Z" === value[value.length - 1] && this[key] instanceof Date)
            return "$D" + value;
          key = "$" === value[0] ? "$" + value : value;
          return key;
        }
        if ("boolean" === typeof value) return value;
        if ("number" === typeof value) return serializeNumber(value);
        if ("undefined" === typeof value) return "$undefined";
        if ("function" === typeof value) {
          parentReference = knownServerReferences.get(value);
          if (void 0 !== parentReference) {
            key = writtenObjects.get(value);
            if (void 0 !== key) return key;
            key = JSON.stringify(
              { id: parentReference.id, bound: parentReference.bound },
              resolveToJSON
            );
            null === formData && (formData = new FormData());
            parentReference = nextPartId++;
            formData.set(formFieldPrefix + parentReference, key);
            key = "$h" + parentReference.toString(16);
            writtenObjects.set(value, key);
            return key;
          }
          if (void 0 !== temporaryReferences && -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference))
            return temporaryReferences.set(parentReference + ":" + key, value), "$T";
          throw Error(
            "Client Functions cannot be passed directly to Server Functions. Only Functions passed from the Server can be passed back again."
          );
        }
        if ("symbol" === typeof value) {
          if (void 0 !== temporaryReferences && -1 === key.indexOf(":") && (parentReference = writtenObjects.get(this), void 0 !== parentReference))
            return temporaryReferences.set(parentReference + ":" + key, value), "$T";
          throw Error(
            "Symbols cannot be passed to a Server Function without a temporary reference set. Pass a TemporaryReferenceSet to the options." + describeObjectForErrorMessage(this, key)
          );
        }
        if ("bigint" === typeof value) return "$n" + value.toString(10);
        throw Error(
          "Type " + typeof value + " is not supported as an argument to a Server Function."
        );
      }
      function serializeModel(model, id) {
        "object" === typeof model && null !== model && (id = "$" + id.toString(16), writtenObjects.set(model, id), void 0 !== temporaryReferences && temporaryReferences.set(id, model));
        modelRoot = model;
        return JSON.stringify(model, resolveToJSON);
      }
      var nextPartId = 1, pendingParts = 0, formData = null, writtenObjects = /* @__PURE__ */ new WeakMap(), modelRoot = root, json = serializeModel(root, 0);
      null === formData ? resolve(json) : (formData.set(formFieldPrefix + "0", json), 0 === pendingParts && resolve(formData));
      return function() {
        0 < pendingParts && (pendingParts = 0, null === formData ? resolve(json) : resolve(formData));
      };
    }
    function encodeFormData(reference) {
      var resolve, reject, thenable = new Promise(function(res, rej) {
        resolve = res;
        reject = rej;
      });
      processReply(
        reference,
        "",
        void 0,
        function(body) {
          if ("string" === typeof body) {
            var data = new FormData();
            data.append("0", body);
            body = data;
          }
          thenable.status = "fulfilled";
          thenable.value = body;
          resolve(body);
        },
        function(e) {
          thenable.status = "rejected";
          thenable.reason = e;
          reject(e);
        }
      );
      return thenable;
    }
    function defaultEncodeFormAction(identifierPrefix) {
      var referenceClosure = knownServerReferences.get(this);
      if (!referenceClosure)
        throw Error(
          "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
        );
      var data = null;
      if (null !== referenceClosure.bound) {
        data = boundCache.get(referenceClosure);
        data || (data = encodeFormData({
          id: referenceClosure.id,
          bound: referenceClosure.bound
        }), boundCache.set(referenceClosure, data));
        if ("rejected" === data.status) throw data.reason;
        if ("fulfilled" !== data.status) throw data;
        referenceClosure = data.value;
        var prefixedData = new FormData();
        referenceClosure.forEach(function(value, key) {
          prefixedData.append("$ACTION_" + identifierPrefix + ":" + key, value);
        });
        data = prefixedData;
        referenceClosure = "$ACTION_REF_" + identifierPrefix;
      } else referenceClosure = "$ACTION_ID_" + referenceClosure.id;
      return {
        name: referenceClosure,
        method: "POST",
        encType: "multipart/form-data",
        data
      };
    }
    function isSignatureEqual(referenceId, numberOfBoundArgs) {
      var referenceClosure = knownServerReferences.get(this);
      if (!referenceClosure)
        throw Error(
          "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
        );
      if (referenceClosure.id !== referenceId) return false;
      var boundPromise = referenceClosure.bound;
      if (null === boundPromise) return 0 === numberOfBoundArgs;
      switch (boundPromise.status) {
        case "fulfilled":
          return boundPromise.value.length === numberOfBoundArgs;
        case "pending":
          throw boundPromise;
        case "rejected":
          throw boundPromise.reason;
        default:
          throw "string" !== typeof boundPromise.status && (boundPromise.status = "pending", boundPromise.then(
            function(boundArgs) {
              boundPromise.status = "fulfilled";
              boundPromise.value = boundArgs;
            },
            function(error) {
              boundPromise.status = "rejected";
              boundPromise.reason = error;
            }
          )), boundPromise;
      }
    }
    function createFakeServerFunction(name, filename, sourceMap, line, col, environmentName, innerFunction) {
      name || (name = "<anonymous>");
      var encodedName = JSON.stringify(name);
      1 >= line ? (line = encodedName.length + 7, col = "s=>({" + encodedName + " ".repeat(col < line ? 0 : col - line) + ":(...args) => s(...args)})\n/* This module is a proxy to a Server Action. Turn on Source Maps to see the server source. */") : col = "/* This module is a proxy to a Server Action. Turn on Source Maps to see the server source. */" + "\n".repeat(line - 2) + "server=>({" + encodedName + ":\n" + " ".repeat(1 > col ? 0 : col - 1) + "(...args) => server(...args)})";
      filename.startsWith("/") && (filename = "file://" + filename);
      sourceMap ? (col += "\n//# sourceURL=about://React/" + encodeURIComponent(environmentName) + "/" + encodeURI(filename) + "?s" + fakeServerFunctionIdx++, col += "\n//# sourceMappingURL=" + sourceMap) : filename && (col += "\n//# sourceURL=" + filename);
      try {
        return (0, eval)(col)(innerFunction)[name];
      } catch (x) {
        return innerFunction;
      }
    }
    function registerBoundServerReference(reference, id, bound, encodeFormAction) {
      knownServerReferences.has(reference) || (knownServerReferences.set(reference, {
        id,
        originalBind: reference.bind,
        bound
      }), Object.defineProperties(reference, {
        $$FORM_ACTION: {
          value: void 0 === encodeFormAction ? defaultEncodeFormAction : function() {
            var referenceClosure = knownServerReferences.get(this);
            if (!referenceClosure)
              throw Error(
                "Tried to encode a Server Action from a different instance than the encoder is from. This is a bug in React."
              );
            var boundPromise = referenceClosure.bound;
            null === boundPromise && (boundPromise = Promise.resolve([]));
            return encodeFormAction(referenceClosure.id, boundPromise);
          }
        },
        $$IS_SIGNATURE_EQUAL: { value: isSignatureEqual },
        bind: { value: bind }
      }));
    }
    function bind() {
      var referenceClosure = knownServerReferences.get(this);
      if (!referenceClosure) return FunctionBind.apply(this, arguments);
      var newFn = referenceClosure.originalBind.apply(this, arguments);
      null != arguments[0] && console.error(
        'Cannot bind "this" of a Server Action. Pass null or undefined as the first argument to .bind().'
      );
      var args = ArraySlice.call(arguments, 1), boundPromise = null;
      boundPromise = null !== referenceClosure.bound ? Promise.resolve(referenceClosure.bound).then(function(boundArgs) {
        return boundArgs.concat(args);
      }) : Promise.resolve(args);
      knownServerReferences.set(newFn, {
        id: referenceClosure.id,
        originalBind: newFn.bind,
        bound: boundPromise
      });
      Object.defineProperties(newFn, {
        $$FORM_ACTION: { value: this.$$FORM_ACTION },
        $$IS_SIGNATURE_EQUAL: { value: isSignatureEqual },
        bind: { value: bind }
      });
      return newFn;
    }
    function createBoundServerReference(metaData, callServer, encodeFormAction, findSourceMapURL) {
      function action() {
        var args = Array.prototype.slice.call(arguments);
        return bound ? "fulfilled" === bound.status ? callServer(id, bound.value.concat(args)) : Promise.resolve(bound).then(function(boundArgs) {
          return callServer(id, boundArgs.concat(args));
        }) : callServer(id, args);
      }
      var id = metaData.id, bound = metaData.bound, location = metaData.location;
      if (location) {
        var functionName = metaData.name || "", filename = location[1], line = location[2];
        location = location[3];
        metaData = metaData.env || "Server";
        findSourceMapURL = null == findSourceMapURL ? null : findSourceMapURL(filename, metaData);
        action = createFakeServerFunction(
          functionName,
          filename,
          findSourceMapURL,
          line,
          location,
          metaData,
          action
        );
      }
      registerBoundServerReference(action, id, bound, encodeFormAction);
      return action;
    }
    function parseStackLocation(error) {
      error = error.stack;
      error.startsWith("Error: react-stack-top-frame\n") && (error = error.slice(29));
      var endOfFirst = error.indexOf("\n");
      if (-1 !== endOfFirst) {
        var endOfSecond = error.indexOf("\n", endOfFirst + 1);
        endOfFirst = -1 === endOfSecond ? error.slice(endOfFirst + 1) : error.slice(endOfFirst + 1, endOfSecond);
      } else endOfFirst = error;
      error = v8FrameRegExp.exec(endOfFirst);
      if (!error && (error = jscSpiderMonkeyFrameRegExp.exec(endOfFirst), !error))
        return null;
      endOfFirst = error[1] || "";
      "<anonymous>" === endOfFirst && (endOfFirst = "");
      endOfSecond = error[2] || error[5] || "";
      "<anonymous>" === endOfSecond && (endOfSecond = "");
      return [
        endOfFirst,
        endOfSecond,
        +(error[3] || error[6]),
        +(error[4] || error[7])
      ];
    }
    function createServerReference$1(id, callServer, encodeFormAction, findSourceMapURL, functionName) {
      function action() {
        var args = Array.prototype.slice.call(arguments);
        return callServer(id, args);
      }
      var location = parseStackLocation(Error("react-stack-top-frame"));
      if (null !== location) {
        var filename = location[1], line = location[2];
        location = location[3];
        findSourceMapURL = null == findSourceMapURL ? null : findSourceMapURL(filename, "Client");
        action = createFakeServerFunction(
          "",
          filename,
          findSourceMapURL,
          line,
          location,
          "Client",
          action
        );
      }
      registerBoundServerReference(action, id, null, encodeFormAction);
      return action;
    }
    function getComponentNameFromType(type) {
      if (null == type) return null;
      if ("function" === typeof type)
        return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
      if ("string" === typeof type) return type;
      switch (type) {
        case REACT_FRAGMENT_TYPE:
          return "Fragment";
        case REACT_PROFILER_TYPE:
          return "Profiler";
        case REACT_STRICT_MODE_TYPE:
          return "StrictMode";
        case REACT_SUSPENSE_TYPE:
          return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
          return "SuspenseList";
        case REACT_ACTIVITY_TYPE:
          return "Activity";
      }
      if ("object" === typeof type)
        switch ("number" === typeof type.tag && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), type.$$typeof) {
          case REACT_PORTAL_TYPE:
            return "Portal";
          case REACT_CONTEXT_TYPE:
            return type.displayName || "Context";
          case REACT_CONSUMER_TYPE:
            return (type._context.displayName || "Context") + ".Consumer";
          case REACT_FORWARD_REF_TYPE:
            var innerType = type.render;
            type = type.displayName;
            type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
            return type;
          case REACT_MEMO_TYPE:
            return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
          case REACT_LAZY_TYPE:
            innerType = type._payload;
            type = type._init;
            try {
              return getComponentNameFromType(type(innerType));
            } catch (x) {
            }
        }
      return null;
    }
    function getArrayKind(array) {
      for (var kind = 0, i = 0; i < array.length; i++) {
        var value = array[i];
        if ("object" === typeof value && null !== value)
          if (isArrayImpl(value) && 2 === value.length && "string" === typeof value[0]) {
            if (0 !== kind && 3 !== kind) return 1;
            kind = 3;
          } else return 1;
        else {
          if ("function" === typeof value || "string" === typeof value && 50 < value.length || 0 !== kind && 2 !== kind)
            return 1;
          kind = 2;
        }
      }
      return kind;
    }
    function addObjectToProperties(object, properties, indent, prefix2) {
      for (var key in object)
        hasOwnProperty.call(object, key) && "_" !== key[0] && addValueToProperties(key, object[key], properties, indent, prefix2);
    }
    function addValueToProperties(propertyName, value, properties, indent, prefix2) {
      switch (typeof value) {
        case "object":
          if (null === value) {
            value = "null";
            break;
          } else {
            if (value.$$typeof === REACT_ELEMENT_TYPE) {
              var typeName = getComponentNameFromType(value.type) || "…", key = value.key;
              value = value.props;
              var propsKeys = Object.keys(value), propsLength = propsKeys.length;
              if (null == key && 0 === propsLength) {
                value = "<" + typeName + " />";
                break;
              }
              if (3 > indent || 1 === propsLength && "children" === propsKeys[0] && null == key) {
                value = "<" + typeName + " … />";
                break;
              }
              properties.push([
                prefix2 + "  ".repeat(indent) + propertyName,
                "<" + typeName
              ]);
              null !== key && addValueToProperties(
                "key",
                key,
                properties,
                indent + 1,
                prefix2
              );
              propertyName = false;
              for (var propKey in value)
                "children" === propKey ? null != value.children && (!isArrayImpl(value.children) || 0 < value.children.length) && (propertyName = true) : hasOwnProperty.call(value, propKey) && "_" !== propKey[0] && addValueToProperties(
                  propKey,
                  value[propKey],
                  properties,
                  indent + 1,
                  prefix2
                );
              properties.push([
                "",
                propertyName ? ">…</" + typeName + ">" : "/>"
              ]);
              return;
            }
            typeName = Object.prototype.toString.call(value);
            typeName = typeName.slice(8, typeName.length - 1);
            if ("Array" === typeName) {
              if (propKey = getArrayKind(value), 2 === propKey || 0 === propKey) {
                value = JSON.stringify(value);
                break;
              } else if (3 === propKey) {
                properties.push([
                  prefix2 + "  ".repeat(indent) + propertyName,
                  ""
                ]);
                for (propertyName = 0; propertyName < value.length; propertyName++)
                  typeName = value[propertyName], addValueToProperties(
                    typeName[0],
                    typeName[1],
                    properties,
                    indent + 1,
                    prefix2
                  );
                return;
              }
            }
            if ("Promise" === typeName) {
              if ("fulfilled" === value.status) {
                if (typeName = properties.length, addValueToProperties(
                  propertyName,
                  value.value,
                  properties,
                  indent,
                  prefix2
                ), properties.length > typeName) {
                  properties = properties[typeName];
                  properties[1] = "Promise<" + (properties[1] || "Object") + ">";
                  return;
                }
              } else if ("rejected" === value.status && (typeName = properties.length, addValueToProperties(
                propertyName,
                value.reason,
                properties,
                indent,
                prefix2
              ), properties.length > typeName)) {
                properties = properties[typeName];
                properties[1] = "Rejected Promise<" + properties[1] + ">";
                return;
              }
              properties.push([
                "  ".repeat(indent) + propertyName,
                "Promise"
              ]);
              return;
            }
            "Object" === typeName && (propKey = Object.getPrototypeOf(value)) && "function" === typeof propKey.constructor && (typeName = propKey.constructor.name);
            properties.push([
              prefix2 + "  ".repeat(indent) + propertyName,
              "Object" === typeName ? 3 > indent ? "" : "…" : typeName
            ]);
            3 > indent && addObjectToProperties(value, properties, indent + 1, prefix2);
            return;
          }
        case "function":
          value = "" === value.name ? "() => {}" : value.name + "() {}";
          break;
        case "string":
          value = "This object has been omitted by React in the console log to avoid sending too much data from the server. Try logging smaller or more specific objects." === value ? "…" : JSON.stringify(value);
          break;
        case "undefined":
          value = "undefined";
          break;
        case "boolean":
          value = value ? "true" : "false";
          break;
        default:
          value = String(value);
      }
      properties.push([
        prefix2 + "  ".repeat(indent) + propertyName,
        value
      ]);
    }
    function getIODescription(value) {
      try {
        switch (typeof value) {
          case "object":
            if (null === value) return "";
            if (value instanceof Error) return String(value.message);
            if ("string" === typeof value.url) return value.url;
            if ("string" === typeof value.href) return value.href;
            if ("string" === typeof value.src) return value.src;
            if ("string" === typeof value.currentSrc) return value.currentSrc;
            if ("string" === typeof value.command) return value.command;
            if ("object" === typeof value.request && null !== value.request && "string" === typeof value.request.url)
              return value.request.url;
            if ("object" === typeof value.response && null !== value.response && "string" === typeof value.response.url)
              return value.response.url;
            if ("string" === typeof value.id || "number" === typeof value.id || "bigint" === typeof value.id)
              return String(value.id);
            if ("string" === typeof value.name) return value.name;
            var str = value.toString();
            return str.startsWith("[object ") || 5 > str.length || 500 < str.length ? "" : str;
          case "string":
            return 5 > value.length || 500 < value.length ? "" : value;
          case "number":
          case "bigint":
            return String(value);
          default:
            return "";
        }
      } catch (x) {
        return "";
      }
    }
    function markAllTracksInOrder() {
      supportsUserTiming && (console.timeStamp(
        "Server Requests Track",
        1e-3,
        1e-3,
        "Server Requests ⚛",
        void 0,
        "primary-light"
      ), console.timeStamp(
        "Server Components Track",
        1e-3,
        1e-3,
        "Primary",
        "Server Components ⚛",
        "primary-light"
      ));
    }
    function getIOColor(functionName) {
      switch (functionName.charCodeAt(0) % 3) {
        case 0:
          return "tertiary-light";
        case 1:
          return "tertiary";
        default:
          return "tertiary-dark";
      }
    }
    function getIOLongName(ioInfo, description, env, rootEnv) {
      ioInfo = ioInfo.name;
      description = "" === description ? ioInfo : ioInfo + " (" + description + ")";
      return env === rootEnv || void 0 === env ? description : description + " [" + env + "]";
    }
    function getIOShortName(ioInfo, description, env, rootEnv) {
      ioInfo = ioInfo.name;
      env = env === rootEnv || void 0 === env ? "" : " [" + env + "]";
      var desc = "";
      rootEnv = 30 - ioInfo.length - env.length;
      if (1 < rootEnv) {
        var l = description.length;
        if (0 < l && l <= rootEnv) desc = " (" + description + ")";
        else if (description.startsWith("http://") || description.startsWith("https://") || description.startsWith("/")) {
          var queryIdx = description.indexOf("?");
          -1 === queryIdx && (queryIdx = description.length);
          47 === description.charCodeAt(queryIdx - 1) && queryIdx--;
          desc = description.lastIndexOf("/", queryIdx - 1);
          queryIdx - desc < rootEnv ? desc = " (…" + description.slice(desc, queryIdx) + ")" : (l = description.slice(desc, desc + rootEnv / 2), description = description.slice(
            queryIdx - rootEnv / 2,
            queryIdx
          ), desc = " (" + (0 < desc ? "…" : "") + l + "…" + description + ")");
        }
      }
      return ioInfo + desc + env;
    }
    function logComponentAwait(asyncInfo, trackIdx, startTime, endTime, rootEnv, value) {
      if (supportsUserTiming && 0 < endTime) {
        var description = getIODescription(value), name = getIOShortName(
          asyncInfo.awaited,
          description,
          asyncInfo.env,
          rootEnv
        ), entryName = "await " + name;
        name = getIOColor(name);
        var debugTask = asyncInfo.debugTask || asyncInfo.awaited.debugTask;
        if (debugTask) {
          var properties = [];
          "object" === typeof value && null !== value ? addObjectToProperties(value, properties, 0, "") : void 0 !== value && addValueToProperties("awaited value", value, properties, 0, "");
          asyncInfo = getIOLongName(
            asyncInfo.awaited,
            description,
            asyncInfo.env,
            rootEnv
          );
          debugTask.run(
            performance.measure.bind(performance, entryName, {
              start: 0 > startTime ? 0 : startTime,
              end: endTime,
              detail: {
                devtools: {
                  color: name,
                  track: trackNames[trackIdx],
                  trackGroup: "Server Components ⚛",
                  properties,
                  tooltipText: asyncInfo
                }
              }
            })
          );
        } else
          console.timeStamp(
            entryName,
            0 > startTime ? 0 : startTime,
            endTime,
            trackNames[trackIdx],
            "Server Components ⚛",
            name
          );
      }
    }
    function logIOInfoErrored(ioInfo, rootEnv, error) {
      var startTime = ioInfo.start, endTime = ioInfo.end;
      if (supportsUserTiming && 0 <= endTime) {
        var description = getIODescription(error), entryName = getIOShortName(ioInfo, description, ioInfo.env, rootEnv), debugTask = ioInfo.debugTask;
        debugTask ? (error = [
          [
            "rejected with",
            "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error)
          ]
        ], ioInfo = getIOLongName(ioInfo, description, ioInfo.env, rootEnv) + " Rejected", debugTask.run(
          performance.measure.bind(performance, "​" + entryName, {
            start: 0 > startTime ? 0 : startTime,
            end: endTime,
            detail: {
              devtools: {
                color: "error",
                track: "Server Requests ⚛",
                properties: error,
                tooltipText: ioInfo
              }
            }
          })
        )) : console.timeStamp(
          entryName,
          0 > startTime ? 0 : startTime,
          endTime,
          "Server Requests ⚛",
          void 0,
          "error"
        );
      }
    }
    function logIOInfo(ioInfo, rootEnv, value) {
      var startTime = ioInfo.start, endTime = ioInfo.end;
      if (supportsUserTiming && 0 <= endTime) {
        var description = getIODescription(value), entryName = getIOShortName(ioInfo, description, ioInfo.env, rootEnv), color = getIOColor(entryName), debugTask = ioInfo.debugTask;
        if (debugTask) {
          var properties = [];
          "object" === typeof value && null !== value ? addObjectToProperties(value, properties, 0, "") : void 0 !== value && addValueToProperties("Resolved", value, properties, 0, "");
          ioInfo = getIOLongName(ioInfo, description, ioInfo.env, rootEnv);
          debugTask.run(
            performance.measure.bind(performance, "​" + entryName, {
              start: 0 > startTime ? 0 : startTime,
              end: endTime,
              detail: {
                devtools: {
                  color,
                  track: "Server Requests ⚛",
                  properties,
                  tooltipText: ioInfo
                }
              }
            })
          );
        } else
          console.timeStamp(
            entryName,
            0 > startTime ? 0 : startTime,
            endTime,
            "Server Requests ⚛",
            void 0,
            color
          );
      }
    }
    function prepareStackTrace(error, structuredStackTrace) {
      error = (error.name || "Error") + ": " + (error.message || "");
      for (var i = 0; i < structuredStackTrace.length; i++)
        error += "\n    at " + structuredStackTrace[i].toString();
      return error;
    }
    function ReactPromise(status, value, reason) {
      this.status = status;
      this.value = value;
      this.reason = reason;
      this._children = [];
      this._debugChunk = null;
      this._debugInfo = [];
    }
    function unwrapWeakResponse(weakResponse) {
      weakResponse = weakResponse.weak.deref();
      if (void 0 === weakResponse)
        throw Error(
          "We did not expect to receive new data after GC:ing the response."
        );
      return weakResponse;
    }
    function closeDebugChannel(debugChannel) {
      debugChannel.callback && debugChannel.callback("");
    }
    function readChunk(chunk) {
      switch (chunk.status) {
        case "resolved_model":
          initializeModelChunk(chunk);
          break;
        case "resolved_module":
          initializeModuleChunk(chunk);
      }
      switch (chunk.status) {
        case "fulfilled":
          return chunk.value;
        case "pending":
        case "blocked":
        case "halted":
          throw chunk;
        default:
          throw chunk.reason;
      }
    }
    function getRoot(weakResponse) {
      weakResponse = unwrapWeakResponse(weakResponse);
      return getChunk(weakResponse, 0);
    }
    function createPendingChunk(response) {
      0 === response._pendingChunks++ && (response._weakResponse.response = response, null !== response._pendingInitialRender && (clearTimeout(response._pendingInitialRender), response._pendingInitialRender = null));
      return new ReactPromise("pending", null, null);
    }
    function releasePendingChunk(response, chunk) {
      "pending" === chunk.status && 0 === --response._pendingChunks && (response._weakResponse.response = null, response._pendingInitialRender = setTimeout(
        flushInitialRenderPerformance.bind(null, response),
        100
      ));
    }
    function moveDebugInfoFromChunkToInnerValue(chunk, value) {
      value = resolveLazy(value);
      "object" !== typeof value || null === value || !isArrayImpl(value) && "function" !== typeof value[ASYNC_ITERATOR] && value.$$typeof !== REACT_ELEMENT_TYPE && value.$$typeof !== REACT_LAZY_TYPE || (chunk = chunk._debugInfo.splice(0), isArrayImpl(value._debugInfo) ? value._debugInfo.unshift.apply(value._debugInfo, chunk) : Object.defineProperty(value, "_debugInfo", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: chunk
      }));
    }
    function wakeChunk(listeners, value, chunk) {
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        "function" === typeof listener ? listener(value) : fulfillReference(listener, value, chunk);
      }
      moveDebugInfoFromChunkToInnerValue(chunk, value);
    }
    function rejectChunk(listeners, error) {
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        "function" === typeof listener ? listener(error) : rejectReference(listener, error);
      }
    }
    function resolveBlockedCycle(resolvedChunk, reference) {
      var referencedChunk = reference.handler.chunk;
      if (null === referencedChunk) return null;
      if (referencedChunk === resolvedChunk) return reference.handler;
      reference = referencedChunk.value;
      if (null !== reference)
        for (referencedChunk = 0; referencedChunk < reference.length; referencedChunk++) {
          var listener = reference[referencedChunk];
          if ("function" !== typeof listener && (listener = resolveBlockedCycle(resolvedChunk, listener), null !== listener))
            return listener;
        }
      return null;
    }
    function wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners) {
      switch (chunk.status) {
        case "fulfilled":
          wakeChunk(resolveListeners, chunk.value, chunk);
          break;
        case "blocked":
          for (var i = 0; i < resolveListeners.length; i++) {
            var listener = resolveListeners[i];
            if ("function" !== typeof listener) {
              var cyclicHandler = resolveBlockedCycle(chunk, listener);
              if (null !== cyclicHandler)
                switch (fulfillReference(listener, cyclicHandler.value, chunk), resolveListeners.splice(i, 1), i--, null !== rejectListeners && (listener = rejectListeners.indexOf(listener), -1 !== listener && rejectListeners.splice(listener, 1)), chunk.status) {
                  case "fulfilled":
                    wakeChunk(resolveListeners, chunk.value, chunk);
                    return;
                  case "rejected":
                    null !== rejectListeners && rejectChunk(rejectListeners, chunk.reason);
                    return;
                }
            }
          }
        case "pending":
          if (chunk.value)
            for (i = 0; i < resolveListeners.length; i++)
              chunk.value.push(resolveListeners[i]);
          else chunk.value = resolveListeners;
          if (chunk.reason) {
            if (rejectListeners)
              for (resolveListeners = 0; resolveListeners < rejectListeners.length; resolveListeners++)
                chunk.reason.push(rejectListeners[resolveListeners]);
          } else chunk.reason = rejectListeners;
          break;
        case "rejected":
          rejectListeners && rejectChunk(rejectListeners, chunk.reason);
      }
    }
    function triggerErrorOnChunk(response, chunk, error) {
      if ("pending" !== chunk.status && "blocked" !== chunk.status)
        chunk.reason.error(error);
      else {
        releasePendingChunk(response, chunk);
        var listeners = chunk.reason;
        if ("pending" === chunk.status && null != chunk._debugChunk) {
          var prevHandler = initializingHandler, prevChunk = initializingChunk;
          initializingHandler = null;
          chunk.status = "blocked";
          chunk.value = null;
          chunk.reason = null;
          initializingChunk = chunk;
          try {
            initializeDebugChunk(response, chunk);
          } finally {
            initializingHandler = prevHandler, initializingChunk = prevChunk;
          }
        }
        chunk.status = "rejected";
        chunk.reason = error;
        null !== listeners && rejectChunk(listeners, error);
      }
    }
    function createResolvedModelChunk(response, value) {
      return new ReactPromise("resolved_model", value, response);
    }
    function createResolvedIteratorResultChunk(response, value, done) {
      return new ReactPromise(
        "resolved_model",
        (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}",
        response
      );
    }
    function resolveIteratorResultChunk(response, chunk, value, done) {
      resolveModelChunk(
        response,
        chunk,
        (done ? '{"done":true,"value":' : '{"done":false,"value":') + value + "}"
      );
    }
    function resolveModelChunk(response, chunk, value) {
      if ("pending" !== chunk.status) chunk.reason.enqueueModel(value);
      else {
        releasePendingChunk(response, chunk);
        var resolveListeners = chunk.value, rejectListeners = chunk.reason;
        chunk.status = "resolved_model";
        chunk.value = value;
        chunk.reason = response;
        null !== resolveListeners && (initializeModelChunk(chunk), wakeChunkIfInitialized(chunk, resolveListeners, rejectListeners));
      }
    }
    function resolveModuleChunk(response, chunk, value) {
      if ("pending" === chunk.status || "blocked" === chunk.status) {
        releasePendingChunk(response, chunk);
        response = chunk.value;
        var rejectListeners = chunk.reason;
        chunk.status = "resolved_module";
        chunk.value = value;
        chunk.reason = null;
        value = [];
        null !== value && chunk._debugInfo.push.apply(chunk._debugInfo, value);
        null !== response && (initializeModuleChunk(chunk), wakeChunkIfInitialized(chunk, response, rejectListeners));
      }
    }
    function initializeDebugChunk(response, chunk) {
      var debugChunk = chunk._debugChunk;
      if (null !== debugChunk) {
        var debugInfo = chunk._debugInfo;
        try {
          if ("resolved_model" === debugChunk.status) {
            for (var idx = debugInfo.length, c = debugChunk._debugChunk; null !== c; )
              "fulfilled" !== c.status && idx++, c = c._debugChunk;
            initializeModelChunk(debugChunk);
            switch (debugChunk.status) {
              case "fulfilled":
                debugInfo[idx] = initializeDebugInfo(
                  response,
                  debugChunk.value
                );
                break;
              case "blocked":
              case "pending":
                waitForReference(
                  debugChunk,
                  debugInfo,
                  "" + idx,
                  response,
                  initializeDebugInfo,
                  [""],
                  true
                );
                break;
              default:
                throw debugChunk.reason;
            }
          } else
            switch (debugChunk.status) {
              case "fulfilled":
                break;
              case "blocked":
              case "pending":
                waitForReference(
                  debugChunk,
                  {},
                  "debug",
                  response,
                  initializeDebugInfo,
                  [""],
                  true
                );
                break;
              default:
                throw debugChunk.reason;
            }
        } catch (error) {
          triggerErrorOnChunk(response, chunk, error);
        }
      }
    }
    function initializeModelChunk(chunk) {
      var prevHandler = initializingHandler, prevChunk = initializingChunk;
      initializingHandler = null;
      var resolvedModel = chunk.value, response = chunk.reason;
      chunk.status = "blocked";
      chunk.value = null;
      chunk.reason = null;
      initializingChunk = chunk;
      initializeDebugChunk(response, chunk);
      try {
        var value = JSON.parse(resolvedModel, response._fromJSON), resolveListeners = chunk.value;
        if (null !== resolveListeners)
          for (chunk.value = null, chunk.reason = null, resolvedModel = 0; resolvedModel < resolveListeners.length; resolvedModel++) {
            var listener = resolveListeners[resolvedModel];
            "function" === typeof listener ? listener(value) : fulfillReference(listener, value, chunk);
          }
        if (null !== initializingHandler) {
          if (initializingHandler.errored) throw initializingHandler.reason;
          if (0 < initializingHandler.deps) {
            initializingHandler.value = value;
            initializingHandler.chunk = chunk;
            return;
          }
        }
        chunk.status = "fulfilled";
        chunk.value = value;
        moveDebugInfoFromChunkToInnerValue(chunk, value);
      } catch (error) {
        chunk.status = "rejected", chunk.reason = error;
      } finally {
        initializingHandler = prevHandler, initializingChunk = prevChunk;
      }
    }
    function initializeModuleChunk(chunk) {
      try {
        var value = requireModule(chunk.value);
        chunk.status = "fulfilled";
        chunk.value = value;
      } catch (error) {
        chunk.status = "rejected", chunk.reason = error;
      }
    }
    function reportGlobalError(weakResponse, error) {
      if (void 0 !== weakResponse.weak.deref()) {
        var response = unwrapWeakResponse(weakResponse);
        response._closed = true;
        response._closedReason = error;
        response._chunks.forEach(function(chunk) {
          "pending" === chunk.status ? triggerErrorOnChunk(response, chunk, error) : "fulfilled" === chunk.status && null !== chunk.reason && chunk.reason.error(error);
        });
        weakResponse = response._debugChannel;
        void 0 !== weakResponse && (closeDebugChannel(weakResponse), response._debugChannel = void 0, null !== debugChannelRegistry && debugChannelRegistry.unregister(response));
      }
    }
    function nullRefGetter() {
      return null;
    }
    function getTaskName(type) {
      if (type === REACT_FRAGMENT_TYPE) return "<>";
      if ("function" === typeof type) return '"use client"';
      if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
        return type._init === readChunk ? '"use client"' : "<...>";
      try {
        var name = getComponentNameFromType(type);
        return name ? "<" + name + ">" : "<...>";
      } catch (x) {
        return "<...>";
      }
    }
    function initializeElement(response, element, lazyNode) {
      var stack = element._debugStack, owner = element._owner;
      null === owner && (element._owner = response._debugRootOwner);
      var env = response._rootEnvironmentName;
      null !== owner && null != owner.env && (env = owner.env);
      var normalizedStackTrace = null;
      null === owner && null != response._debugRootStack ? normalizedStackTrace = response._debugRootStack : null !== stack && (normalizedStackTrace = createFakeJSXCallStackInDEV(
        response,
        stack,
        env
      ));
      element._debugStack = normalizedStackTrace;
      normalizedStackTrace = null;
      supportsCreateTask && null !== stack && (normalizedStackTrace = console.createTask.bind(
        console,
        getTaskName(element.type)
      ), stack = buildFakeCallStack(
        response,
        stack,
        env,
        false,
        normalizedStackTrace
      ), env = null === owner ? null : initializeFakeTask(response, owner), null === env ? (env = response._debugRootTask, normalizedStackTrace = null != env ? env.run(stack) : stack()) : normalizedStackTrace = env.run(stack));
      element._debugTask = normalizedStackTrace;
      null !== owner && initializeFakeStack(response, owner);
      null !== lazyNode && (lazyNode._store && lazyNode._store.validated && !element._store.validated && (element._store.validated = lazyNode._store.validated), "fulfilled" === lazyNode._payload.status && lazyNode._debugInfo && (response = lazyNode._debugInfo.splice(0), element._debugInfo ? element._debugInfo.unshift.apply(element._debugInfo, response) : Object.defineProperty(element, "_debugInfo", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: response
      })));
      Object.freeze(element.props);
    }
    function createLazyChunkWrapper(chunk, validated) {
      var lazyType = {
        $$typeof: REACT_LAZY_TYPE,
        _payload: chunk,
        _init: readChunk
      };
      lazyType._debugInfo = chunk._debugInfo;
      lazyType._store = { validated };
      return lazyType;
    }
    function getChunk(response, id) {
      var chunks = response._chunks, chunk = chunks.get(id);
      chunk || (chunk = response._closed ? new ReactPromise("rejected", null, response._closedReason) : createPendingChunk(response), chunks.set(id, chunk));
      return chunk;
    }
    function fulfillReference(reference, value, fulfilledChunk) {
      var response = reference.response, handler = reference.handler, parentObject = reference.parentObject, key = reference.key, map = reference.map, path = reference.path;
      try {
        for (var i = 1; i < path.length; i++) {
          for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
            var referencedChunk = value._payload;
            if (referencedChunk === handler.chunk) value = handler.value;
            else {
              switch (referencedChunk.status) {
                case "resolved_model":
                  initializeModelChunk(referencedChunk);
                  break;
                case "resolved_module":
                  initializeModuleChunk(referencedChunk);
              }
              switch (referencedChunk.status) {
                case "fulfilled":
                  value = referencedChunk.value;
                  continue;
                case "blocked":
                  var cyclicHandler = resolveBlockedCycle(
                    referencedChunk,
                    reference
                  );
                  if (null !== cyclicHandler) {
                    value = cyclicHandler.value;
                    continue;
                  }
                case "pending":
                  path.splice(0, i - 1);
                  null === referencedChunk.value ? referencedChunk.value = [reference] : referencedChunk.value.push(reference);
                  null === referencedChunk.reason ? referencedChunk.reason = [reference] : referencedChunk.reason.push(reference);
                  return;
                case "halted":
                  return;
                default:
                  rejectReference(reference, referencedChunk.reason);
                  return;
              }
            }
          }
          var name = path[i];
          if ("object" === typeof value && null !== value && hasOwnProperty.call(value, name))
            value = value[name];
          else throw Error("Invalid reference.");
        }
        for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
          var _referencedChunk = value._payload;
          if (_referencedChunk === handler.chunk) value = handler.value;
          else {
            switch (_referencedChunk.status) {
              case "resolved_model":
                initializeModelChunk(_referencedChunk);
                break;
              case "resolved_module":
                initializeModuleChunk(_referencedChunk);
            }
            switch (_referencedChunk.status) {
              case "fulfilled":
                value = _referencedChunk.value;
                continue;
            }
            break;
          }
        }
        var mappedValue = map(response, value, parentObject, key);
        "__proto__" !== key && (parentObject[key] = mappedValue);
        "" === key && null === handler.value && (handler.value = mappedValue);
        if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === typeof handler.value && null !== handler.value && handler.value.$$typeof === REACT_ELEMENT_TYPE) {
          var element = handler.value;
          switch (key) {
            case "3":
              transferReferencedDebugInfo(handler.chunk, fulfilledChunk);
              element.props = mappedValue;
              break;
            case "4":
              element._owner = mappedValue;
              break;
            case "5":
              element._debugStack = mappedValue;
              break;
            default:
              transferReferencedDebugInfo(handler.chunk, fulfilledChunk);
          }
        } else
          reference.isDebug || transferReferencedDebugInfo(handler.chunk, fulfilledChunk);
      } catch (error) {
        rejectReference(reference, error);
        return;
      }
      handler.deps--;
      0 === handler.deps && (reference = handler.chunk, null !== reference && "blocked" === reference.status && (value = reference.value, reference.status = "fulfilled", reference.value = handler.value, reference.reason = handler.reason, null !== value && wakeChunk(value, handler.value, reference)));
    }
    function rejectReference(reference, error) {
      var handler = reference.handler;
      reference = reference.response;
      if (!handler.errored) {
        var blockedValue = handler.value;
        handler.errored = true;
        handler.value = null;
        handler.reason = error;
        handler = handler.chunk;
        if (null !== handler && "blocked" === handler.status) {
          if ("object" === typeof blockedValue && null !== blockedValue && blockedValue.$$typeof === REACT_ELEMENT_TYPE) {
            var erroredComponent = {
              name: getComponentNameFromType(blockedValue.type) || "",
              owner: blockedValue._owner
            };
            erroredComponent.debugStack = blockedValue._debugStack;
            supportsCreateTask && (erroredComponent.debugTask = blockedValue._debugTask);
            handler._debugInfo.push(erroredComponent);
          }
          triggerErrorOnChunk(reference, handler, error);
        }
      }
    }
    function waitForReference(referencedChunk, parentObject, key, response, map, path, isAwaitingDebugInfo) {
      if (!(void 0 !== response._debugChannel && response._debugChannel.hasReadable || "pending" !== referencedChunk.status || parentObject[0] !== REACT_ELEMENT_TYPE || "4" !== key && "5" !== key))
        return null;
      if (initializingHandler) {
        var handler = initializingHandler;
        handler.deps++;
      } else
        handler = initializingHandler = {
          parent: null,
          chunk: null,
          value: null,
          reason: null,
          deps: 1,
          errored: false
        };
      parentObject = {
        response,
        handler,
        parentObject,
        key,
        map,
        path
      };
      parentObject.isDebug = isAwaitingDebugInfo;
      null === referencedChunk.value ? referencedChunk.value = [parentObject] : referencedChunk.value.push(parentObject);
      null === referencedChunk.reason ? referencedChunk.reason = [parentObject] : referencedChunk.reason.push(parentObject);
      return null;
    }
    function loadServerReference(response, metaData, parentObject, key) {
      if (!response._serverReferenceConfig)
        return createBoundServerReference(
          metaData,
          response._callServer,
          response._encodeFormAction,
          response._debugFindSourceMapURL
        );
      var serverReference = resolveServerReference(
        response._serverReferenceConfig,
        metaData.id
      ), promise = preloadModule(serverReference);
      if (promise)
        metaData.bound && (promise = Promise.all([promise, metaData.bound]));
      else if (metaData.bound) promise = Promise.resolve(metaData.bound);
      else
        return promise = requireModule(serverReference), registerBoundServerReference(
          promise,
          metaData.id,
          metaData.bound,
          response._encodeFormAction
        ), promise;
      if (initializingHandler) {
        var handler = initializingHandler;
        handler.deps++;
      } else
        handler = initializingHandler = {
          parent: null,
          chunk: null,
          value: null,
          reason: null,
          deps: 1,
          errored: false
        };
      promise.then(
        function() {
          var resolvedValue = requireModule(serverReference);
          if (metaData.bound) {
            var boundArgs = metaData.bound.value.slice(0);
            boundArgs.unshift(null);
            resolvedValue = resolvedValue.bind.apply(resolvedValue, boundArgs);
          }
          registerBoundServerReference(
            resolvedValue,
            metaData.id,
            metaData.bound,
            response._encodeFormAction
          );
          "__proto__" !== key && (parentObject[key] = resolvedValue);
          "" === key && null === handler.value && (handler.value = resolvedValue);
          if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === typeof handler.value && null !== handler.value && handler.value.$$typeof === REACT_ELEMENT_TYPE)
            switch (boundArgs = handler.value, key) {
              case "3":
                boundArgs.props = resolvedValue;
                break;
              case "4":
                boundArgs._owner = resolvedValue;
            }
          handler.deps--;
          0 === handler.deps && (resolvedValue = handler.chunk, null !== resolvedValue && "blocked" === resolvedValue.status && (boundArgs = resolvedValue.value, resolvedValue.status = "fulfilled", resolvedValue.value = handler.value, resolvedValue.reason = null, null !== boundArgs && wakeChunk(boundArgs, handler.value, resolvedValue)));
        },
        function(error) {
          if (!handler.errored) {
            var blockedValue = handler.value;
            handler.errored = true;
            handler.value = null;
            handler.reason = error;
            var chunk = handler.chunk;
            if (null !== chunk && "blocked" === chunk.status) {
              if ("object" === typeof blockedValue && null !== blockedValue && blockedValue.$$typeof === REACT_ELEMENT_TYPE) {
                var erroredComponent = {
                  name: getComponentNameFromType(blockedValue.type) || "",
                  owner: blockedValue._owner
                };
                erroredComponent.debugStack = blockedValue._debugStack;
                supportsCreateTask && (erroredComponent.debugTask = blockedValue._debugTask);
                chunk._debugInfo.push(erroredComponent);
              }
              triggerErrorOnChunk(response, chunk, error);
            }
          }
        }
      );
      return null;
    }
    function resolveLazy(value) {
      for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
        var payload = value._payload;
        if ("fulfilled" === payload.status) value = payload.value;
        else break;
      }
      return value;
    }
    function transferReferencedDebugInfo(parentChunk, referencedChunk) {
      if (null !== parentChunk) {
        referencedChunk = referencedChunk._debugInfo;
        parentChunk = parentChunk._debugInfo;
        for (var i = 0; i < referencedChunk.length; ++i) {
          var debugInfoEntry = referencedChunk[i];
          null == debugInfoEntry.name && parentChunk.push(debugInfoEntry);
        }
      }
    }
    function getOutlinedModel(response, reference, parentObject, key, map) {
      var path = reference.split(":");
      reference = parseInt(path[0], 16);
      reference = getChunk(response, reference);
      null !== initializingChunk && isArrayImpl(initializingChunk._children) && initializingChunk._children.push(reference);
      switch (reference.status) {
        case "resolved_model":
          initializeModelChunk(reference);
          break;
        case "resolved_module":
          initializeModuleChunk(reference);
      }
      switch (reference.status) {
        case "fulfilled":
          for (var value = reference.value, i = 1; i < path.length; i++) {
            for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
              value = value._payload;
              switch (value.status) {
                case "resolved_model":
                  initializeModelChunk(value);
                  break;
                case "resolved_module":
                  initializeModuleChunk(value);
              }
              switch (value.status) {
                case "fulfilled":
                  value = value.value;
                  break;
                case "blocked":
                case "pending":
                  return waitForReference(
                    value,
                    parentObject,
                    key,
                    response,
                    map,
                    path.slice(i - 1),
                    false
                  );
                case "halted":
                  return initializingHandler ? (parentObject = initializingHandler, parentObject.deps++) : initializingHandler = {
                    parent: null,
                    chunk: null,
                    value: null,
                    reason: null,
                    deps: 1,
                    errored: false
                  }, null;
                default:
                  return initializingHandler ? (initializingHandler.errored = true, initializingHandler.value = null, initializingHandler.reason = value.reason) : initializingHandler = {
                    parent: null,
                    chunk: null,
                    value: null,
                    reason: value.reason,
                    deps: 0,
                    errored: true
                  }, null;
              }
            }
            value = value[path[i]];
          }
          for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE; ) {
            path = value._payload;
            switch (path.status) {
              case "resolved_model":
                initializeModelChunk(path);
                break;
              case "resolved_module":
                initializeModuleChunk(path);
            }
            switch (path.status) {
              case "fulfilled":
                value = path.value;
                continue;
            }
            break;
          }
          response = map(response, value, parentObject, key);
          (parentObject[0] !== REACT_ELEMENT_TYPE || "4" !== key && "5" !== key) && transferReferencedDebugInfo(initializingChunk, reference);
          return response;
        case "pending":
        case "blocked":
          return waitForReference(
            reference,
            parentObject,
            key,
            response,
            map,
            path,
            false
          );
        case "halted":
          return initializingHandler ? (parentObject = initializingHandler, parentObject.deps++) : initializingHandler = {
            parent: null,
            chunk: null,
            value: null,
            reason: null,
            deps: 1,
            errored: false
          }, null;
        default:
          return initializingHandler ? (initializingHandler.errored = true, initializingHandler.value = null, initializingHandler.reason = reference.reason) : initializingHandler = {
            parent: null,
            chunk: null,
            value: null,
            reason: reference.reason,
            deps: 0,
            errored: true
          }, null;
      }
    }
    function createMap(response, model) {
      return new Map(model);
    }
    function createSet(response, model) {
      return new Set(model);
    }
    function createBlob(response, model) {
      return new Blob(model.slice(1), { type: model[0] });
    }
    function createFormData(response, model) {
      response = new FormData();
      for (var i = 0; i < model.length; i++)
        response.append(model[i][0], model[i][1]);
      return response;
    }
    function applyConstructor(response, model, parentObject) {
      Object.setPrototypeOf(parentObject, model.prototype);
    }
    function defineLazyGetter(response, chunk, parentObject, key) {
      "__proto__" !== key && Object.defineProperty(parentObject, key, {
        get: function() {
          "resolved_model" === chunk.status && initializeModelChunk(chunk);
          switch (chunk.status) {
            case "fulfilled":
              return chunk.value;
            case "rejected":
              throw chunk.reason;
          }
          return "This object has been omitted by React in the console log to avoid sending too much data from the server. Try logging smaller or more specific objects.";
        },
        enumerable: true,
        configurable: false
      });
      return null;
    }
    function extractIterator(response, model) {
      return model[Symbol.iterator]();
    }
    function createModel(response, model) {
      return model;
    }
    function getInferredFunctionApproximate(code) {
      code = code.startsWith("Object.defineProperty(") ? code.slice(22) : code.startsWith("(") ? code.slice(1) : code;
      if (code.startsWith("async function")) {
        var idx = code.indexOf("(", 14);
        if (-1 !== idx)
          return code = code.slice(14, idx).trim(), (0, eval)("({" + JSON.stringify(code) + ":async function(){}})")[code];
      } else if (code.startsWith("function")) {
        if (idx = code.indexOf("(", 8), -1 !== idx)
          return code = code.slice(8, idx).trim(), (0, eval)("({" + JSON.stringify(code) + ":function(){}})")[code];
      } else if (code.startsWith("class") && (idx = code.indexOf("{", 5), -1 !== idx))
        return code = code.slice(5, idx).trim(), (0, eval)("({" + JSON.stringify(code) + ":class{}})")[code];
      return function() {
      };
    }
    function parseModelString(response, parentObject, key, value) {
      if ("$" === value[0]) {
        if ("$" === value)
          return null !== initializingHandler && "0" === key && (initializingHandler = {
            parent: initializingHandler,
            chunk: null,
            value: null,
            reason: null,
            deps: 0,
            errored: false
          }), REACT_ELEMENT_TYPE;
        switch (value[1]) {
          case "$":
            return value.slice(1);
          case "L":
            return parentObject = parseInt(value.slice(2), 16), response = getChunk(response, parentObject), null !== initializingChunk && isArrayImpl(initializingChunk._children) && initializingChunk._children.push(response), createLazyChunkWrapper(response, 0);
          case "@":
            return parentObject = parseInt(value.slice(2), 16), response = getChunk(response, parentObject), null !== initializingChunk && isArrayImpl(initializingChunk._children) && initializingChunk._children.push(response), response;
          case "S":
            return Symbol.for(value.slice(2));
          case "h":
            var ref = value.slice(2);
            return getOutlinedModel(
              response,
              ref,
              parentObject,
              key,
              loadServerReference
            );
          case "T":
            parentObject = "$" + value.slice(2);
            response = response._tempRefs;
            if (null == response)
              throw Error(
                "Missing a temporary reference set but the RSC response returned a temporary reference. Pass a temporaryReference option with the set that was used with the reply."
              );
            return response.get(parentObject);
          case "Q":
            return ref = value.slice(2), getOutlinedModel(response, ref, parentObject, key, createMap);
          case "W":
            return ref = value.slice(2), getOutlinedModel(response, ref, parentObject, key, createSet);
          case "B":
            return ref = value.slice(2), getOutlinedModel(response, ref, parentObject, key, createBlob);
          case "K":
            return ref = value.slice(2), getOutlinedModel(response, ref, parentObject, key, createFormData);
          case "Z":
            return ref = value.slice(2), getOutlinedModel(
              response,
              ref,
              parentObject,
              key,
              resolveErrorDev
            );
          case "i":
            return ref = value.slice(2), getOutlinedModel(
              response,
              ref,
              parentObject,
              key,
              extractIterator
            );
          case "I":
            return Infinity;
          case "-":
            return "$-0" === value ? -0 : -Infinity;
          case "N":
            return NaN;
          case "u":
            return;
          case "D":
            return new Date(Date.parse(value.slice(2)));
          case "n":
            return BigInt(value.slice(2));
          case "P":
            return ref = value.slice(2), getOutlinedModel(
              response,
              ref,
              parentObject,
              key,
              applyConstructor
            );
          case "E":
            response = value.slice(2);
            try {
              if (!mightHaveStaticConstructor.test(response))
                return (0, eval)(response);
            } catch (x) {
            }
            try {
              if (ref = getInferredFunctionApproximate(response), response.startsWith("Object.defineProperty(")) {
                var idx = response.lastIndexOf(',"name",{value:"');
                if (-1 !== idx) {
                  var name = JSON.parse(
                    response.slice(idx + 16 - 1, response.length - 2)
                  );
                  Object.defineProperty(ref, "name", { value: name });
                }
              }
            } catch (_) {
              ref = function() {
              };
            }
            return ref;
          case "Y":
            if (2 < value.length && (ref = response._debugChannel && response._debugChannel.callback)) {
              if ("@" === value[2])
                return parentObject = value.slice(3), key = parseInt(parentObject, 16), response._chunks.has(key) || ref("P:" + parentObject), getChunk(response, key);
              value = value.slice(2);
              idx = parseInt(value, 16);
              response._chunks.has(idx) || ref("Q:" + value);
              ref = getChunk(response, idx);
              return "fulfilled" === ref.status ? ref.value : defineLazyGetter(response, ref, parentObject, key);
            }
            "__proto__" !== key && Object.defineProperty(parentObject, key, {
              get: function() {
                return "This object has been omitted by React in the console log to avoid sending too much data from the server. Try logging smaller or more specific objects.";
              },
              enumerable: true,
              configurable: false
            });
            return null;
          default:
            return ref = value.slice(1), getOutlinedModel(response, ref, parentObject, key, createModel);
        }
      }
      return value;
    }
    function missingCall() {
      throw Error(
        'Trying to call a function from "use server" but the callServer option was not implemented in your router runtime.'
      );
    }
    function ResponseInstance(bundlerConfig, serverReferenceConfig, moduleLoading, callServer, encodeFormAction, nonce, temporaryReferences, findSourceMapURL, replayConsole, environmentName, debugChannel) {
      var chunks = /* @__PURE__ */ new Map();
      this._bundlerConfig = bundlerConfig;
      this._serverReferenceConfig = serverReferenceConfig;
      this._moduleLoading = moduleLoading;
      this._callServer = void 0 !== callServer ? callServer : missingCall;
      this._encodeFormAction = encodeFormAction;
      this._nonce = nonce;
      this._chunks = chunks;
      this._stringDecoder = new TextDecoder();
      this._fromJSON = null;
      this._closed = false;
      this._closedReason = null;
      this._tempRefs = temporaryReferences;
      this._timeOrigin = 0;
      this._pendingInitialRender = null;
      this._pendingChunks = 0;
      this._weakResponse = { weak: new WeakRef(this), response: this };
      this._debugRootOwner = bundlerConfig = void 0 === ReactSharedInteralsServer || null === ReactSharedInteralsServer.A ? null : ReactSharedInteralsServer.A.getOwner();
      this._debugRootStack = null !== bundlerConfig ? Error("react-stack-top-frame") : null;
      environmentName = void 0 === environmentName ? "Server" : environmentName;
      supportsCreateTask && (this._debugRootTask = console.createTask(
        '"use ' + environmentName.toLowerCase() + '"'
      ));
      this._debugStartTime = performance.now();
      this._debugFindSourceMapURL = findSourceMapURL;
      this._debugChannel = debugChannel;
      this._blockedConsole = null;
      this._replayConsole = replayConsole;
      this._rootEnvironmentName = environmentName;
      debugChannel && (null === debugChannelRegistry ? (closeDebugChannel(debugChannel), this._debugChannel = void 0) : debugChannelRegistry.register(this, debugChannel, this));
      replayConsole && markAllTracksInOrder();
      this._fromJSON = createFromJSONCallback(this);
    }
    function createStreamState(weakResponse, streamDebugValue) {
      var streamState = {
        _rowState: 0,
        _rowID: 0,
        _rowTag: 0,
        _rowLength: 0,
        _buffer: []
      };
      weakResponse = unwrapWeakResponse(weakResponse);
      var debugValuePromise = Promise.resolve(streamDebugValue);
      debugValuePromise.status = "fulfilled";
      debugValuePromise.value = streamDebugValue;
      streamState._debugInfo = {
        name: "RSC stream",
        start: weakResponse._debugStartTime,
        end: weakResponse._debugStartTime,
        byteSize: 0,
        value: debugValuePromise,
        owner: weakResponse._debugRootOwner,
        debugStack: weakResponse._debugRootStack,
        debugTask: weakResponse._debugRootTask
      };
      streamState._debugTargetChunkSize = MIN_CHUNK_SIZE;
      return streamState;
    }
    function addDebugInfo(chunk, debugInfo) {
      var value = resolveLazy(chunk.value);
      "object" !== typeof value || null === value || !isArrayImpl(value) && "function" !== typeof value[ASYNC_ITERATOR] && value.$$typeof !== REACT_ELEMENT_TYPE && value.$$typeof !== REACT_LAZY_TYPE ? chunk._debugInfo.push.apply(chunk._debugInfo, debugInfo) : isArrayImpl(value._debugInfo) ? value._debugInfo.push.apply(value._debugInfo, debugInfo) : Object.defineProperty(value, "_debugInfo", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: debugInfo
      });
    }
    function resolveChunkDebugInfo(streamState, chunk) {
      streamState = [{ awaited: streamState._debugInfo }];
      "pending" === chunk.status || "blocked" === chunk.status ? (streamState = addDebugInfo.bind(null, chunk, streamState), chunk.then(streamState, streamState)) : addDebugInfo(chunk, streamState);
    }
    function resolveBuffer(response, id, buffer, streamState) {
      var chunks = response._chunks, chunk = chunks.get(id);
      chunk && "pending" !== chunk.status ? chunk.reason.enqueueValue(buffer) : (chunk && releasePendingChunk(response, chunk), response = new ReactPromise("fulfilled", buffer, null), resolveChunkDebugInfo(streamState, response), chunks.set(id, response));
    }
    function resolveModule(response, id, model, streamState) {
      var chunks = response._chunks, chunk = chunks.get(id);
      model = JSON.parse(model, response._fromJSON);
      var clientReference = resolveClientReference(
        response._bundlerConfig,
        model
      );
      prepareDestinationWithChunks(
        response._moduleLoading,
        model[1],
        response._nonce
      );
      if (model = preloadModule(clientReference)) {
        if (chunk) {
          releasePendingChunk(response, chunk);
          var blockedChunk = chunk;
          blockedChunk.status = "blocked";
        } else
          blockedChunk = new ReactPromise("blocked", null, null), chunks.set(id, blockedChunk);
        resolveChunkDebugInfo(streamState, blockedChunk);
        model.then(
          function() {
            return resolveModuleChunk(response, blockedChunk, clientReference);
          },
          function(error) {
            return triggerErrorOnChunk(response, blockedChunk, error);
          }
        );
      } else
        chunk ? (resolveChunkDebugInfo(streamState, chunk), resolveModuleChunk(response, chunk, clientReference)) : (chunk = new ReactPromise(
          "resolved_module",
          clientReference,
          null
        ), resolveChunkDebugInfo(streamState, chunk), chunks.set(id, chunk));
    }
    function resolveStream(response, id, stream, controller, streamState) {
      var chunks = response._chunks, chunk = chunks.get(id);
      if (chunk) {
        if (resolveChunkDebugInfo(streamState, chunk), "pending" === chunk.status) {
          releasePendingChunk(response, chunk);
          id = chunk.value;
          if (null != chunk._debugChunk) {
            streamState = initializingHandler;
            chunks = initializingChunk;
            initializingHandler = null;
            chunk.status = "blocked";
            chunk.value = null;
            chunk.reason = null;
            initializingChunk = chunk;
            try {
              if (initializeDebugChunk(response, chunk), null !== initializingHandler && !initializingHandler.errored && 0 < initializingHandler.deps) {
                initializingHandler.value = stream;
                initializingHandler.reason = controller;
                initializingHandler.chunk = chunk;
                return;
              }
            } finally {
              initializingHandler = streamState, initializingChunk = chunks;
            }
          }
          chunk.status = "fulfilled";
          chunk.value = stream;
          chunk.reason = controller;
          null !== id && wakeChunk(id, chunk.value, chunk);
        }
      } else
        response = new ReactPromise("fulfilled", stream, controller), resolveChunkDebugInfo(streamState, response), chunks.set(id, response);
    }
    function startReadableStream(response, id, type, streamState) {
      var controller = null, closed = false;
      type = new ReadableStream({
        type,
        start: function(c) {
          controller = c;
        }
      });
      var previousBlockedChunk = null;
      resolveStream(
        response,
        id,
        type,
        {
          enqueueValue: function(value) {
            null === previousBlockedChunk ? controller.enqueue(value) : previousBlockedChunk.then(function() {
              controller.enqueue(value);
            });
          },
          enqueueModel: function(json) {
            if (null === previousBlockedChunk) {
              var chunk = createResolvedModelChunk(response, json);
              initializeModelChunk(chunk);
              "fulfilled" === chunk.status ? controller.enqueue(chunk.value) : (chunk.then(
                function(v) {
                  return controller.enqueue(v);
                },
                function(e) {
                  return controller.error(e);
                }
              ), previousBlockedChunk = chunk);
            } else {
              chunk = previousBlockedChunk;
              var _chunk3 = createPendingChunk(response);
              _chunk3.then(
                function(v) {
                  return controller.enqueue(v);
                },
                function(e) {
                  return controller.error(e);
                }
              );
              previousBlockedChunk = _chunk3;
              chunk.then(function() {
                previousBlockedChunk === _chunk3 && (previousBlockedChunk = null);
                resolveModelChunk(response, _chunk3, json);
              });
            }
          },
          close: function() {
            if (!closed)
              if (closed = true, null === previousBlockedChunk)
                controller.close();
              else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function() {
                  return controller.close();
                });
              }
          },
          error: function(error) {
            if (!closed)
              if (closed = true, null === previousBlockedChunk)
                controller.error(error);
              else {
                var blockedChunk = previousBlockedChunk;
                previousBlockedChunk = null;
                blockedChunk.then(function() {
                  return controller.error(error);
                });
              }
          }
        },
        streamState
      );
    }
    function asyncIterator() {
      return this;
    }
    function createIterator(next) {
      next = { next };
      next[ASYNC_ITERATOR] = asyncIterator;
      return next;
    }
    function startAsyncIterable(response, id, iterator, streamState) {
      var buffer = [], closed = false, nextWriteIndex = 0, iterable = {};
      iterable[ASYNC_ITERATOR] = function() {
        var nextReadIndex = 0;
        return createIterator(function(arg) {
          if (void 0 !== arg)
            throw Error(
              "Values cannot be passed to next() of AsyncIterables passed to Client Components."
            );
          if (nextReadIndex === buffer.length) {
            if (closed)
              return new ReactPromise(
                "fulfilled",
                { done: true, value: void 0 },
                null
              );
            buffer[nextReadIndex] = createPendingChunk(response);
          }
          return buffer[nextReadIndex++];
        });
      };
      resolveStream(
        response,
        id,
        iterator ? iterable[ASYNC_ITERATOR]() : iterable,
        {
          enqueueValue: function(value) {
            if (nextWriteIndex === buffer.length)
              buffer[nextWriteIndex] = new ReactPromise(
                "fulfilled",
                { done: false, value },
                null
              );
            else {
              var chunk = buffer[nextWriteIndex], resolveListeners = chunk.value, rejectListeners = chunk.reason;
              chunk.status = "fulfilled";
              chunk.value = { done: false, value };
              chunk.reason = null;
              null !== resolveListeners && wakeChunkIfInitialized(
                chunk,
                resolveListeners,
                rejectListeners
              );
            }
            nextWriteIndex++;
          },
          enqueueModel: function(value) {
            nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(
              response,
              value,
              false
            ) : resolveIteratorResultChunk(
              response,
              buffer[nextWriteIndex],
              value,
              false
            );
            nextWriteIndex++;
          },
          close: function(value) {
            if (!closed)
              for (closed = true, nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, true) : resolveIteratorResultChunk(
                response,
                buffer[nextWriteIndex],
                value,
                true
              ), nextWriteIndex++; nextWriteIndex < buffer.length; )
                resolveIteratorResultChunk(
                  response,
                  buffer[nextWriteIndex++],
                  '"$undefined"',
                  true
                );
          },
          error: function(error) {
            if (!closed)
              for (closed = true, nextWriteIndex === buffer.length && (buffer[nextWriteIndex] = createPendingChunk(response)); nextWriteIndex < buffer.length; )
                triggerErrorOnChunk(response, buffer[nextWriteIndex++], error);
          }
        },
        streamState
      );
    }
    function resolveErrorDev(response, errorInfo) {
      var name = errorInfo.name, env = errorInfo.env;
      var error = buildFakeCallStack(
        response,
        errorInfo.stack,
        env,
        false,
        Error.bind(
          null,
          errorInfo.message || "An error occurred in the Server Components render but no message was provided"
        )
      );
      var ownerTask = null;
      null != errorInfo.owner && (errorInfo = errorInfo.owner.slice(1), errorInfo = getOutlinedModel(
        response,
        errorInfo,
        {},
        "",
        createModel
      ), null !== errorInfo && (ownerTask = initializeFakeTask(response, errorInfo)));
      null === ownerTask ? (response = getRootTask(response, env), error = null != response ? response.run(error) : error()) : error = ownerTask.run(error);
      error.name = name;
      error.environmentName = env;
      return error;
    }
    function createFakeFunction(name, filename, sourceMap, line, col, enclosingLine, enclosingCol, environmentName) {
      name || (name = "<anonymous>");
      var encodedName = JSON.stringify(name);
      1 > enclosingLine ? enclosingLine = 0 : enclosingLine--;
      1 > enclosingCol ? enclosingCol = 0 : enclosingCol--;
      1 > line ? line = 0 : line--;
      1 > col ? col = 0 : col--;
      if (line < enclosingLine || line === enclosingLine && col < enclosingCol)
        enclosingCol = enclosingLine = 0;
      1 > line ? (line = encodedName.length + 3, enclosingCol -= line, 0 > enclosingCol && (enclosingCol = 0), col = col - enclosingCol - line - 3, 0 > col && (col = 0), encodedName = "({" + encodedName + ":" + " ".repeat(enclosingCol) + "_=>" + " ".repeat(col) + "_()})") : 1 > enclosingLine ? (enclosingCol -= encodedName.length + 3, 0 > enclosingCol && (enclosingCol = 0), encodedName = "({" + encodedName + ":" + " ".repeat(enclosingCol) + "_=>" + "\n".repeat(line - enclosingLine) + " ".repeat(col) + "_()})") : enclosingLine === line ? (col = col - enclosingCol - 3, 0 > col && (col = 0), encodedName = "\n".repeat(enclosingLine - 1) + "({" + encodedName + ":\n" + " ".repeat(enclosingCol) + "_=>" + " ".repeat(col) + "_()})") : encodedName = "\n".repeat(enclosingLine - 1) + "({" + encodedName + ":\n" + " ".repeat(enclosingCol) + "_=>" + "\n".repeat(line - enclosingLine) + " ".repeat(col) + "_()})";
      encodedName = 1 > enclosingLine ? encodedName + "\n/* This module was rendered by a Server Component. Turn on Source Maps to see the server source. */" : "/* This module was rendered by a Server Component. Turn on Source Maps to see the server source. */" + encodedName;
      filename.startsWith("/") && (filename = "file://" + filename);
      sourceMap ? (encodedName += "\n//# sourceURL=about://React/" + encodeURIComponent(environmentName) + "/" + encodeURI(filename) + "?" + fakeFunctionIdx++, encodedName += "\n//# sourceMappingURL=" + sourceMap) : encodedName = filename ? encodedName + ("\n//# sourceURL=" + encodeURI(filename)) : encodedName + "\n//# sourceURL=<anonymous>";
      try {
        var fn = (0, eval)(encodedName)[name];
      } catch (x) {
        fn = function(_) {
          return _();
        };
      }
      return fn;
    }
    function buildFakeCallStack(response, stack, environmentName, useEnclosingLine, innerCall) {
      for (var i = 0; i < stack.length; i++) {
        var frame = stack[i], frameKey = frame.join("-") + "-" + environmentName + (useEnclosingLine ? "-e" : "-n"), fn = fakeFunctionCache.get(frameKey);
        if (void 0 === fn) {
          fn = frame[0];
          var filename = frame[1], line = frame[2], col = frame[3], enclosingLine = frame[4];
          frame = frame[5];
          var findSourceMapURL = response._debugFindSourceMapURL;
          findSourceMapURL = findSourceMapURL ? findSourceMapURL(filename, environmentName) : null;
          fn = createFakeFunction(
            fn,
            filename,
            findSourceMapURL,
            line,
            col,
            useEnclosingLine ? line : enclosingLine,
            useEnclosingLine ? col : frame,
            environmentName
          );
          fakeFunctionCache.set(frameKey, fn);
        }
        innerCall = fn.bind(null, innerCall);
      }
      return innerCall;
    }
    function getRootTask(response, childEnvironmentName) {
      var rootTask = response._debugRootTask;
      return rootTask ? response._rootEnvironmentName !== childEnvironmentName ? (response = console.createTask.bind(
        console,
        '"use ' + childEnvironmentName.toLowerCase() + '"'
      ), rootTask.run(response)) : rootTask : null;
    }
    function initializeFakeTask(response, debugInfo) {
      if (!supportsCreateTask || null == debugInfo.stack) return null;
      var cachedEntry = debugInfo.debugTask;
      if (void 0 !== cachedEntry) return cachedEntry;
      var useEnclosingLine = void 0 === debugInfo.key, stack = debugInfo.stack, env = null == debugInfo.env ? response._rootEnvironmentName : debugInfo.env;
      cachedEntry = null == debugInfo.owner || null == debugInfo.owner.env ? response._rootEnvironmentName : debugInfo.owner.env;
      var ownerTask = null == debugInfo.owner ? null : initializeFakeTask(response, debugInfo.owner);
      env = env !== cachedEntry ? '"use ' + env.toLowerCase() + '"' : void 0 !== debugInfo.key ? "<" + (debugInfo.name || "...") + ">" : void 0 !== debugInfo.name ? debugInfo.name || "unknown" : "await " + (debugInfo.awaited.name || "unknown");
      env = console.createTask.bind(console, env);
      useEnclosingLine = buildFakeCallStack(
        response,
        stack,
        cachedEntry,
        useEnclosingLine,
        env
      );
      null === ownerTask ? (response = getRootTask(response, cachedEntry), response = null != response ? response.run(useEnclosingLine) : useEnclosingLine()) : response = ownerTask.run(useEnclosingLine);
      return debugInfo.debugTask = response;
    }
    function fakeJSXCallSite() {
      return Error("react-stack-top-frame");
    }
    function initializeFakeStack(response, debugInfo) {
      if (void 0 === debugInfo.debugStack) {
        null != debugInfo.stack && (debugInfo.debugStack = createFakeJSXCallStackInDEV(
          response,
          debugInfo.stack,
          null == debugInfo.env ? "" : debugInfo.env
        ));
        var owner = debugInfo.owner;
        null != owner && (initializeFakeStack(response, owner), void 0 === owner.debugLocation && null != debugInfo.debugStack && (owner.debugLocation = debugInfo.debugStack));
      }
    }
    function initializeDebugInfo(response, debugInfo) {
      void 0 !== debugInfo.stack && initializeFakeTask(response, debugInfo);
      if (null == debugInfo.owner && null != response._debugRootOwner) {
        var _componentInfoOrAsyncInfo = debugInfo;
        _componentInfoOrAsyncInfo.owner = response._debugRootOwner;
        _componentInfoOrAsyncInfo.stack = null;
        _componentInfoOrAsyncInfo.debugStack = response._debugRootStack;
        _componentInfoOrAsyncInfo.debugTask = response._debugRootTask;
      } else
        void 0 !== debugInfo.stack && initializeFakeStack(response, debugInfo);
      "number" === typeof debugInfo.time && (debugInfo = { time: debugInfo.time + response._timeOrigin });
      return debugInfo;
    }
    function getCurrentStackInDEV() {
      var owner = currentOwnerInDEV;
      if (null === owner) return "";
      try {
        var info = "";
        if (owner.owner || "string" !== typeof owner.name) {
          for (; owner; ) {
            var ownerStack = owner.debugStack;
            if (null != ownerStack) {
              if (owner = owner.owner) {
                var JSCompiler_temp_const = info;
                var error = ownerStack, prevPrepareStackTrace = Error.prepareStackTrace;
                Error.prepareStackTrace = prepareStackTrace;
                var stack = error.stack;
                Error.prepareStackTrace = prevPrepareStackTrace;
                stack.startsWith("Error: react-stack-top-frame\n") && (stack = stack.slice(29));
                var idx = stack.indexOf("\n");
                -1 !== idx && (stack = stack.slice(idx + 1));
                idx = stack.indexOf("react_stack_bottom_frame");
                -1 !== idx && (idx = stack.lastIndexOf("\n", idx));
                var JSCompiler_inline_result = -1 !== idx ? stack = stack.slice(0, idx) : "";
                info = JSCompiler_temp_const + ("\n" + JSCompiler_inline_result);
              }
            } else break;
          }
          var JSCompiler_inline_result$jscomp$0 = info;
        } else {
          JSCompiler_temp_const = owner.name;
          if (void 0 === prefix)
            try {
              throw Error();
            } catch (x) {
              prefix = (error = x.stack.trim().match(/\n( *(at )?)/)) && error[1] || "", suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
            }
          JSCompiler_inline_result$jscomp$0 = "\n" + prefix + JSCompiler_temp_const + suffix;
        }
      } catch (x) {
        JSCompiler_inline_result$jscomp$0 = "\nError generating stack: " + x.message + "\n" + x.stack;
      }
      return JSCompiler_inline_result$jscomp$0;
    }
    function resolveConsoleEntry(response, json) {
      if (response._replayConsole) {
        var blockedChunk = response._blockedConsole;
        if (null == blockedChunk)
          blockedChunk = createResolvedModelChunk(response, json), initializeModelChunk(blockedChunk), "fulfilled" === blockedChunk.status ? replayConsoleWithCallStackInDEV(response, blockedChunk.value) : (blockedChunk.then(
            function(v) {
              return replayConsoleWithCallStackInDEV(response, v);
            },
            function() {
            }
          ), response._blockedConsole = blockedChunk);
        else {
          var _chunk4 = createPendingChunk(response);
          _chunk4.then(
            function(v) {
              return replayConsoleWithCallStackInDEV(response, v);
            },
            function() {
            }
          );
          response._blockedConsole = _chunk4;
          var unblock = function() {
            response._blockedConsole === _chunk4 && (response._blockedConsole = null);
            resolveModelChunk(response, _chunk4, json);
          };
          blockedChunk.then(unblock, unblock);
        }
      }
    }
    function initializeIOInfo(response, ioInfo) {
      void 0 !== ioInfo.stack && (initializeFakeTask(response, ioInfo), initializeFakeStack(response, ioInfo));
      ioInfo.start += response._timeOrigin;
      ioInfo.end += response._timeOrigin;
      if (response._replayConsole) {
        response = response._rootEnvironmentName;
        var promise = ioInfo.value;
        if (promise)
          switch (promise.status) {
            case "fulfilled":
              logIOInfo(ioInfo, response, promise.value);
              break;
            case "rejected":
              logIOInfoErrored(ioInfo, response, promise.reason);
              break;
            default:
              promise.then(
                logIOInfo.bind(null, ioInfo, response),
                logIOInfoErrored.bind(null, ioInfo, response)
              );
          }
        else logIOInfo(ioInfo, response, void 0);
      }
    }
    function resolveIOInfo(response, id, model) {
      var chunks = response._chunks, chunk = chunks.get(id);
      chunk ? (resolveModelChunk(response, chunk, model), "resolved_model" === chunk.status && initializeModelChunk(chunk)) : (chunk = createResolvedModelChunk(response, model), chunks.set(id, chunk), initializeModelChunk(chunk));
      "fulfilled" === chunk.status ? initializeIOInfo(response, chunk.value) : chunk.then(
        function(v) {
          initializeIOInfo(response, v);
        },
        function() {
        }
      );
    }
    function mergeBuffer(buffer, lastChunk) {
      for (var l = buffer.length, byteLength = lastChunk.length, i = 0; i < l; i++)
        byteLength += buffer[i].byteLength;
      byteLength = new Uint8Array(byteLength);
      for (var _i3 = i = 0; _i3 < l; _i3++) {
        var chunk = buffer[_i3];
        byteLength.set(chunk, i);
        i += chunk.byteLength;
      }
      byteLength.set(lastChunk, i);
      return byteLength;
    }
    function resolveTypedArray(response, id, buffer, lastChunk, constructor, bytesPerElement, streamState) {
      buffer = 0 === buffer.length && 0 === lastChunk.byteOffset % bytesPerElement ? lastChunk : mergeBuffer(buffer, lastChunk);
      constructor = new constructor(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength / bytesPerElement
      );
      resolveBuffer(response, id, constructor, streamState);
    }
    function flushComponentPerformance(response$jscomp$0, root, trackIdx$jscomp$6, trackTime, parentEndTime) {
      if (!isArrayImpl(root._children)) {
        var previousResult = root._children, previousEndTime = previousResult.endTime;
        if (-Infinity < parentEndTime && parentEndTime < previousEndTime && null !== previousResult.component) {
          var componentInfo = previousResult.component, trackIdx = trackIdx$jscomp$6, startTime = parentEndTime;
          if (supportsUserTiming && 0 <= previousEndTime && 10 > trackIdx) {
            var color = componentInfo.env === response$jscomp$0._rootEnvironmentName ? "primary-light" : "secondary-light", entryName = componentInfo.name + " [deduped]", debugTask = componentInfo.debugTask;
            debugTask ? debugTask.run(
              console.timeStamp.bind(
                console,
                entryName,
                0 > startTime ? 0 : startTime,
                previousEndTime,
                trackNames[trackIdx],
                "Server Components ⚛",
                color
              )
            ) : console.timeStamp(
              entryName,
              0 > startTime ? 0 : startTime,
              previousEndTime,
              trackNames[trackIdx],
              "Server Components ⚛",
              color
            );
          }
        }
        previousResult.track = trackIdx$jscomp$6;
        return previousResult;
      }
      var children = root._children, debugInfo = root._debugInfo;
      if (debugInfo) {
        for (var startTime$jscomp$0 = 0, i = 0; i < debugInfo.length; i++) {
          var info = debugInfo[i];
          "number" === typeof info.time && (startTime$jscomp$0 = info.time);
          if ("string" === typeof info.name) {
            startTime$jscomp$0 < trackTime && trackIdx$jscomp$6++;
            trackTime = startTime$jscomp$0;
            break;
          }
        }
        for (var _i4 = debugInfo.length - 1; 0 <= _i4; _i4--) {
          var _info = debugInfo[_i4];
          if ("number" === typeof _info.time && _info.time > parentEndTime) {
            parentEndTime = _info.time;
            break;
          }
        }
      }
      var result = {
        track: trackIdx$jscomp$6,
        endTime: -Infinity,
        component: null
      };
      root._children = result;
      for (var childrenEndTime = -Infinity, childTrackIdx = trackIdx$jscomp$6, childTrackTime = trackTime, _i5 = 0; _i5 < children.length; _i5++) {
        var childResult = flushComponentPerformance(
          response$jscomp$0,
          children[_i5],
          childTrackIdx,
          childTrackTime,
          parentEndTime
        );
        null !== childResult.component && (result.component = childResult.component);
        childTrackIdx = childResult.track;
        var childEndTime = childResult.endTime;
        childEndTime > childTrackTime && (childTrackTime = childEndTime);
        childEndTime > childrenEndTime && (childrenEndTime = childEndTime);
      }
      if (debugInfo)
        for (var componentEndTime = 0, isLastComponent = true, endTime = -1, endTimeIdx = -1, _i6 = debugInfo.length - 1; 0 <= _i6; _i6--) {
          var _info2 = debugInfo[_i6];
          if ("number" === typeof _info2.time) {
            0 === componentEndTime && (componentEndTime = _info2.time);
            var time = _info2.time;
            if (-1 < endTimeIdx)
              for (var j = endTimeIdx - 1; j > _i6; j--) {
                var candidateInfo = debugInfo[j];
                if ("string" === typeof candidateInfo.name) {
                  componentEndTime > childrenEndTime && (childrenEndTime = componentEndTime);
                  var componentInfo$jscomp$0 = candidateInfo, response = response$jscomp$0, componentInfo$jscomp$1 = componentInfo$jscomp$0, trackIdx$jscomp$0 = trackIdx$jscomp$6, startTime$jscomp$1 = time, componentEndTime$jscomp$0 = componentEndTime, childrenEndTime$jscomp$0 = childrenEndTime;
                  if (isLastComponent && "rejected" === root.status && root.reason !== response._closedReason) {
                    var componentInfo$jscomp$2 = componentInfo$jscomp$1, trackIdx$jscomp$1 = trackIdx$jscomp$0, startTime$jscomp$2 = startTime$jscomp$1, childrenEndTime$jscomp$1 = childrenEndTime$jscomp$0, error = root.reason;
                    if (supportsUserTiming) {
                      var env = componentInfo$jscomp$2.env, name = componentInfo$jscomp$2.name, entryName$jscomp$0 = env === response._rootEnvironmentName || void 0 === env ? name : name + " [" + env + "]", properties = [
                        [
                          "Error",
                          "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error)
                        ]
                      ];
                      null != componentInfo$jscomp$2.key && addValueToProperties(
                        "key",
                        componentInfo$jscomp$2.key,
                        properties,
                        0,
                        ""
                      );
                      null != componentInfo$jscomp$2.props && addObjectToProperties(
                        componentInfo$jscomp$2.props,
                        properties,
                        0,
                        ""
                      );
                      performance.measure("​" + entryName$jscomp$0, {
                        start: 0 > startTime$jscomp$2 ? 0 : startTime$jscomp$2,
                        end: childrenEndTime$jscomp$1,
                        detail: {
                          devtools: {
                            color: "error",
                            track: trackNames[trackIdx$jscomp$1],
                            trackGroup: "Server Components ⚛",
                            tooltipText: entryName$jscomp$0 + " Errored",
                            properties
                          }
                        }
                      });
                    }
                  } else {
                    var componentInfo$jscomp$3 = componentInfo$jscomp$1, trackIdx$jscomp$2 = trackIdx$jscomp$0, startTime$jscomp$3 = startTime$jscomp$1, childrenEndTime$jscomp$2 = childrenEndTime$jscomp$0;
                    if (supportsUserTiming && 0 <= childrenEndTime$jscomp$2 && 10 > trackIdx$jscomp$2) {
                      var env$jscomp$0 = componentInfo$jscomp$3.env, name$jscomp$0 = componentInfo$jscomp$3.name, isPrimaryEnv = env$jscomp$0 === response._rootEnvironmentName, selfTime = componentEndTime$jscomp$0 - startTime$jscomp$3, color$jscomp$0 = 0.5 > selfTime ? isPrimaryEnv ? "primary-light" : "secondary-light" : 50 > selfTime ? isPrimaryEnv ? "primary" : "secondary" : 500 > selfTime ? isPrimaryEnv ? "primary-dark" : "secondary-dark" : "error", entryName$jscomp$1 = isPrimaryEnv || void 0 === env$jscomp$0 ? name$jscomp$0 : name$jscomp$0 + " [" + env$jscomp$0 + "]", debugTask$jscomp$0 = componentInfo$jscomp$3.debugTask;
                      if (debugTask$jscomp$0) {
                        var properties$jscomp$0 = [];
                        null != componentInfo$jscomp$3.key && addValueToProperties(
                          "key",
                          componentInfo$jscomp$3.key,
                          properties$jscomp$0,
                          0,
                          ""
                        );
                        null != componentInfo$jscomp$3.props && addObjectToProperties(
                          componentInfo$jscomp$3.props,
                          properties$jscomp$0,
                          0,
                          ""
                        );
                        debugTask$jscomp$0.run(
                          performance.measure.bind(
                            performance,
                            "​" + entryName$jscomp$1,
                            {
                              start: 0 > startTime$jscomp$3 ? 0 : startTime$jscomp$3,
                              end: childrenEndTime$jscomp$2,
                              detail: {
                                devtools: {
                                  color: color$jscomp$0,
                                  track: trackNames[trackIdx$jscomp$2],
                                  trackGroup: "Server Components ⚛",
                                  properties: properties$jscomp$0
                                }
                              }
                            }
                          )
                        );
                      } else
                        console.timeStamp(
                          "​" + entryName$jscomp$1,
                          0 > startTime$jscomp$3 ? 0 : startTime$jscomp$3,
                          childrenEndTime$jscomp$2,
                          trackNames[trackIdx$jscomp$2],
                          "Server Components ⚛",
                          color$jscomp$0
                        );
                    }
                  }
                  componentEndTime = time;
                  result.component = componentInfo$jscomp$0;
                  isLastComponent = false;
                } else if (candidateInfo.awaited && null != candidateInfo.awaited.env) {
                  endTime > childrenEndTime && (childrenEndTime = endTime);
                  var asyncInfo = candidateInfo, env$jscomp$1 = response$jscomp$0._rootEnvironmentName, promise = asyncInfo.awaited.value;
                  if (promise) {
                    var thenable = promise;
                    switch (thenable.status) {
                      case "fulfilled":
                        logComponentAwait(
                          asyncInfo,
                          trackIdx$jscomp$6,
                          time,
                          endTime,
                          env$jscomp$1,
                          thenable.value
                        );
                        break;
                      case "rejected":
                        var asyncInfo$jscomp$0 = asyncInfo, trackIdx$jscomp$3 = trackIdx$jscomp$6, startTime$jscomp$4 = time, endTime$jscomp$0 = endTime, rootEnv = env$jscomp$1, error$jscomp$0 = thenable.reason;
                        if (supportsUserTiming && 0 < endTime$jscomp$0) {
                          var description = getIODescription(error$jscomp$0), entryName$jscomp$2 = "await " + getIOShortName(
                            asyncInfo$jscomp$0.awaited,
                            description,
                            asyncInfo$jscomp$0.env,
                            rootEnv
                          ), debugTask$jscomp$1 = asyncInfo$jscomp$0.debugTask || asyncInfo$jscomp$0.awaited.debugTask;
                          if (debugTask$jscomp$1) {
                            var properties$jscomp$1 = [
                              [
                                "Rejected",
                                "object" === typeof error$jscomp$0 && null !== error$jscomp$0 && "string" === typeof error$jscomp$0.message ? String(error$jscomp$0.message) : String(error$jscomp$0)
                              ]
                            ], tooltipText = getIOLongName(
                              asyncInfo$jscomp$0.awaited,
                              description,
                              asyncInfo$jscomp$0.env,
                              rootEnv
                            ) + " Rejected";
                            debugTask$jscomp$1.run(
                              performance.measure.bind(
                                performance,
                                entryName$jscomp$2,
                                {
                                  start: 0 > startTime$jscomp$4 ? 0 : startTime$jscomp$4,
                                  end: endTime$jscomp$0,
                                  detail: {
                                    devtools: {
                                      color: "error",
                                      track: trackNames[trackIdx$jscomp$3],
                                      trackGroup: "Server Components ⚛",
                                      properties: properties$jscomp$1,
                                      tooltipText
                                    }
                                  }
                                }
                              )
                            );
                          } else
                            console.timeStamp(
                              entryName$jscomp$2,
                              0 > startTime$jscomp$4 ? 0 : startTime$jscomp$4,
                              endTime$jscomp$0,
                              trackNames[trackIdx$jscomp$3],
                              "Server Components ⚛",
                              "error"
                            );
                        }
                        break;
                      default:
                        logComponentAwait(
                          asyncInfo,
                          trackIdx$jscomp$6,
                          time,
                          endTime,
                          env$jscomp$1,
                          void 0
                        );
                    }
                  } else
                    logComponentAwait(
                      asyncInfo,
                      trackIdx$jscomp$6,
                      time,
                      endTime,
                      env$jscomp$1,
                      void 0
                    );
                }
              }
            else {
              endTime = time;
              for (var _j = debugInfo.length - 1; _j > _i6; _j--) {
                var _candidateInfo = debugInfo[_j];
                if ("string" === typeof _candidateInfo.name) {
                  componentEndTime > childrenEndTime && (childrenEndTime = componentEndTime);
                  var _componentInfo = _candidateInfo, _env = response$jscomp$0._rootEnvironmentName, componentInfo$jscomp$4 = _componentInfo, trackIdx$jscomp$4 = trackIdx$jscomp$6, startTime$jscomp$5 = time, childrenEndTime$jscomp$3 = childrenEndTime;
                  if (supportsUserTiming) {
                    var env$jscomp$2 = componentInfo$jscomp$4.env, name$jscomp$1 = componentInfo$jscomp$4.name, entryName$jscomp$3 = env$jscomp$2 === _env || void 0 === env$jscomp$2 ? name$jscomp$1 : name$jscomp$1 + " [" + env$jscomp$2 + "]", properties$jscomp$2 = [
                      [
                        "Aborted",
                        "The stream was aborted before this Component finished rendering."
                      ]
                    ];
                    null != componentInfo$jscomp$4.key && addValueToProperties(
                      "key",
                      componentInfo$jscomp$4.key,
                      properties$jscomp$2,
                      0,
                      ""
                    );
                    null != componentInfo$jscomp$4.props && addObjectToProperties(
                      componentInfo$jscomp$4.props,
                      properties$jscomp$2,
                      0,
                      ""
                    );
                    performance.measure("​" + entryName$jscomp$3, {
                      start: 0 > startTime$jscomp$5 ? 0 : startTime$jscomp$5,
                      end: childrenEndTime$jscomp$3,
                      detail: {
                        devtools: {
                          color: "warning",
                          track: trackNames[trackIdx$jscomp$4],
                          trackGroup: "Server Components ⚛",
                          tooltipText: entryName$jscomp$3 + " Aborted",
                          properties: properties$jscomp$2
                        }
                      }
                    });
                  }
                  componentEndTime = time;
                  result.component = _componentInfo;
                  isLastComponent = false;
                } else if (_candidateInfo.awaited && null != _candidateInfo.awaited.env) {
                  var _asyncInfo = _candidateInfo, _env2 = response$jscomp$0._rootEnvironmentName;
                  _asyncInfo.awaited.end > endTime && (endTime = _asyncInfo.awaited.end);
                  endTime > childrenEndTime && (childrenEndTime = endTime);
                  var asyncInfo$jscomp$1 = _asyncInfo, trackIdx$jscomp$5 = trackIdx$jscomp$6, startTime$jscomp$6 = time, endTime$jscomp$1 = endTime, rootEnv$jscomp$0 = _env2;
                  if (supportsUserTiming && 0 < endTime$jscomp$1) {
                    var entryName$jscomp$4 = "await " + getIOShortName(
                      asyncInfo$jscomp$1.awaited,
                      "",
                      asyncInfo$jscomp$1.env,
                      rootEnv$jscomp$0
                    ), debugTask$jscomp$2 = asyncInfo$jscomp$1.debugTask || asyncInfo$jscomp$1.awaited.debugTask;
                    if (debugTask$jscomp$2) {
                      var tooltipText$jscomp$0 = getIOLongName(
                        asyncInfo$jscomp$1.awaited,
                        "",
                        asyncInfo$jscomp$1.env,
                        rootEnv$jscomp$0
                      ) + " Aborted";
                      debugTask$jscomp$2.run(
                        performance.measure.bind(
                          performance,
                          entryName$jscomp$4,
                          {
                            start: 0 > startTime$jscomp$6 ? 0 : startTime$jscomp$6,
                            end: endTime$jscomp$1,
                            detail: {
                              devtools: {
                                color: "warning",
                                track: trackNames[trackIdx$jscomp$5],
                                trackGroup: "Server Components ⚛",
                                properties: [
                                  [
                                    "Aborted",
                                    "The stream was aborted before this Promise resolved."
                                  ]
                                ],
                                tooltipText: tooltipText$jscomp$0
                              }
                            }
                          }
                        )
                      );
                    } else
                      console.timeStamp(
                        entryName$jscomp$4,
                        0 > startTime$jscomp$6 ? 0 : startTime$jscomp$6,
                        endTime$jscomp$1,
                        trackNames[trackIdx$jscomp$5],
                        "Server Components ⚛",
                        "warning"
                      );
                  }
                }
              }
            }
            endTime = time;
            endTimeIdx = _i6;
          }
        }
      result.endTime = childrenEndTime;
      return result;
    }
    function flushInitialRenderPerformance(response) {
      if (response._replayConsole) {
        var rootChunk = getChunk(response, 0);
        isArrayImpl(rootChunk._children) && (markAllTracksInOrder(), flushComponentPerformance(
          response,
          rootChunk,
          0,
          -Infinity,
          -Infinity
        ));
      }
    }
    function processFullBinaryRow(response, streamState, id, tag, buffer, chunk) {
      switch (tag) {
        case 65:
          resolveBuffer(
            response,
            id,
            mergeBuffer(buffer, chunk).buffer,
            streamState
          );
          return;
        case 79:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            Int8Array,
            1,
            streamState
          );
          return;
        case 111:
          resolveBuffer(
            response,
            id,
            0 === buffer.length ? chunk : mergeBuffer(buffer, chunk),
            streamState
          );
          return;
        case 85:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            Uint8ClampedArray,
            1,
            streamState
          );
          return;
        case 83:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            Int16Array,
            2,
            streamState
          );
          return;
        case 115:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            Uint16Array,
            2,
            streamState
          );
          return;
        case 76:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            Int32Array,
            4,
            streamState
          );
          return;
        case 108:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            Uint32Array,
            4,
            streamState
          );
          return;
        case 71:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            Float32Array,
            4,
            streamState
          );
          return;
        case 103:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            Float64Array,
            8,
            streamState
          );
          return;
        case 77:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            BigInt64Array,
            8,
            streamState
          );
          return;
        case 109:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            BigUint64Array,
            8,
            streamState
          );
          return;
        case 86:
          resolveTypedArray(
            response,
            id,
            buffer,
            chunk,
            DataView,
            1,
            streamState
          );
          return;
      }
      for (var stringDecoder = response._stringDecoder, row = "", i = 0; i < buffer.length; i++)
        row += stringDecoder.decode(buffer[i], decoderOptions);
      buffer = row += stringDecoder.decode(chunk);
      switch (tag) {
        case 73:
          resolveModule(response, id, buffer, streamState);
          break;
        case 72:
          id = buffer[0];
          streamState = buffer.slice(1);
          response = JSON.parse(streamState, response._fromJSON);
          streamState = ReactDOMSharedInternals.d;
          switch (id) {
            case "D":
              streamState.D(response);
              break;
            case "C":
              "string" === typeof response ? streamState.C(response) : streamState.C(response[0], response[1]);
              break;
            case "L":
              id = response[0];
              buffer = response[1];
              3 === response.length ? streamState.L(id, buffer, response[2]) : streamState.L(id, buffer);
              break;
            case "m":
              "string" === typeof response ? streamState.m(response) : streamState.m(response[0], response[1]);
              break;
            case "X":
              "string" === typeof response ? streamState.X(response) : streamState.X(response[0], response[1]);
              break;
            case "S":
              "string" === typeof response ? streamState.S(response) : streamState.S(
                response[0],
                0 === response[1] ? void 0 : response[1],
                3 === response.length ? response[2] : void 0
              );
              break;
            case "M":
              "string" === typeof response ? streamState.M(response) : streamState.M(response[0], response[1]);
          }
          break;
        case 69:
          tag = response._chunks;
          chunk = tag.get(id);
          buffer = JSON.parse(buffer);
          stringDecoder = resolveErrorDev(response, buffer);
          stringDecoder.digest = buffer.digest;
          chunk ? (resolveChunkDebugInfo(streamState, chunk), triggerErrorOnChunk(response, chunk, stringDecoder)) : (response = new ReactPromise("rejected", null, stringDecoder), resolveChunkDebugInfo(streamState, response), tag.set(id, response));
          break;
        case 84:
          tag = response._chunks;
          (chunk = tag.get(id)) && "pending" !== chunk.status ? chunk.reason.enqueueValue(buffer) : (chunk && releasePendingChunk(response, chunk), response = new ReactPromise("fulfilled", buffer, null), resolveChunkDebugInfo(streamState, response), tag.set(id, response));
          break;
        case 78:
          response._timeOrigin = +buffer - performance.timeOrigin;
          break;
        case 68:
          id = getChunk(response, id);
          "fulfilled" !== id.status && "rejected" !== id.status && "halted" !== id.status && "blocked" !== id.status && "resolved_module" !== id.status && (streamState = id._debugChunk, tag = createResolvedModelChunk(response, buffer), tag._debugChunk = streamState, id._debugChunk = tag, initializeDebugChunk(response, id), "blocked" !== tag.status || void 0 !== response._debugChannel && response._debugChannel.hasReadable || '"' !== buffer[0] || "$" !== buffer[1] || (streamState = buffer.slice(2, buffer.length - 1).split(":"), streamState = parseInt(streamState[0], 16), "pending" === getChunk(response, streamState).status && (id._debugChunk = null)));
          break;
        case 74:
          resolveIOInfo(response, id, buffer);
          break;
        case 87:
          resolveConsoleEntry(response, buffer);
          break;
        case 82:
          startReadableStream(response, id, void 0, streamState);
          break;
        case 114:
          startReadableStream(response, id, "bytes", streamState);
          break;
        case 88:
          startAsyncIterable(response, id, false, streamState);
          break;
        case 120:
          startAsyncIterable(response, id, true, streamState);
          break;
        case 67:
          (response = response._chunks.get(id)) && "fulfilled" === response.status && response.reason.close("" === buffer ? '"$undefined"' : buffer);
          break;
        default:
          if ("" === buffer) {
            if (streamState = response._chunks, (buffer = streamState.get(id)) || streamState.set(id, buffer = createPendingChunk(response)), "pending" === buffer.status || "blocked" === buffer.status)
              releasePendingChunk(response, buffer), response = buffer, response.status = "halted", response.value = null, response.reason = null;
          } else
            tag = response._chunks, (chunk = tag.get(id)) ? (resolveChunkDebugInfo(streamState, chunk), resolveModelChunk(response, chunk, buffer)) : (response = createResolvedModelChunk(response, buffer), resolveChunkDebugInfo(streamState, response), tag.set(id, response));
      }
    }
    function createFromJSONCallback(response) {
      return function(key, value) {
        if ("__proto__" !== key) {
          if ("string" === typeof value)
            return parseModelString(response, this, key, value);
          if ("object" === typeof value && null !== value) {
            if (value[0] === REACT_ELEMENT_TYPE)
              b: {
                var owner = value[4], stack = value[5];
                key = value[6];
                value = {
                  $$typeof: REACT_ELEMENT_TYPE,
                  type: value[1],
                  key: value[2],
                  props: value[3],
                  _owner: void 0 === owner ? null : owner
                };
                Object.defineProperty(value, "ref", {
                  enumerable: false,
                  get: nullRefGetter
                });
                value._store = {};
                Object.defineProperty(value._store, "validated", {
                  configurable: false,
                  enumerable: false,
                  writable: true,
                  value: key
                });
                Object.defineProperty(value, "_debugInfo", {
                  configurable: false,
                  enumerable: false,
                  writable: true,
                  value: null
                });
                Object.defineProperty(value, "_debugStack", {
                  configurable: false,
                  enumerable: false,
                  writable: true,
                  value: void 0 === stack ? null : stack
                });
                Object.defineProperty(value, "_debugTask", {
                  configurable: false,
                  enumerable: false,
                  writable: true,
                  value: null
                });
                if (null !== initializingHandler) {
                  owner = initializingHandler;
                  initializingHandler = owner.parent;
                  if (owner.errored) {
                    stack = new ReactPromise("rejected", null, owner.reason);
                    initializeElement(response, value, null);
                    owner = {
                      name: getComponentNameFromType(value.type) || "",
                      owner: value._owner
                    };
                    owner.debugStack = value._debugStack;
                    supportsCreateTask && (owner.debugTask = value._debugTask);
                    stack._debugInfo = [owner];
                    key = createLazyChunkWrapper(stack, key);
                    break b;
                  }
                  if (0 < owner.deps) {
                    stack = new ReactPromise("blocked", null, null);
                    owner.value = value;
                    owner.chunk = stack;
                    key = createLazyChunkWrapper(stack, key);
                    value = initializeElement.bind(null, response, value, key);
                    stack.then(value, value);
                    break b;
                  }
                }
                initializeElement(response, value, null);
                key = value;
              }
            else key = value;
            return key;
          }
          return value;
        }
      };
    }
    function close(weakResponse) {
      reportGlobalError(weakResponse, Error("Connection closed."));
    }
    function noServerCall() {
      throw Error(
        "Server Functions cannot be called during initial render. This would create a fetch waterfall. Try to use a Server Component to pass data to Client Components instead."
      );
    }
    function createResponseFromOptions(options) {
      return new ResponseInstance(
        options.serverConsumerManifest.moduleMap,
        options.serverConsumerManifest.serverModuleMap,
        options.serverConsumerManifest.moduleLoading,
        noServerCall,
        options.encodeFormAction,
        "string" === typeof options.nonce ? options.nonce : void 0,
        options && options.temporaryReferences ? options.temporaryReferences : void 0,
        options && options.findSourceMapURL ? options.findSourceMapURL : void 0,
        options ? true === options.replayConsoleLogs : false,
        options && options.environmentName ? options.environmentName : void 0,
        options && void 0 !== options.debugChannel ? {
          hasReadable: void 0 !== options.debugChannel.readable,
          callback: null
        } : void 0
      )._weakResponse;
    }
    function startReadingFromStream(response$jscomp$0, stream, onDone, debugValue) {
      function progress(_ref) {
        var value = _ref.value;
        if (_ref.done) return onDone();
        _ref = streamState;
        if (void 0 !== response$jscomp$0.weak.deref()) {
          var response = unwrapWeakResponse(response$jscomp$0), i = 0, rowState = _ref._rowState, rowID = _ref._rowID, rowTag = _ref._rowTag, rowLength = _ref._rowLength, buffer = _ref._buffer, chunkLength = value.length, debugInfo = _ref._debugInfo, endTime = performance.now(), previousEndTime = debugInfo.end, newByteLength = debugInfo.byteSize + chunkLength;
          newByteLength > _ref._debugTargetChunkSize || endTime > previousEndTime + 10 ? (_ref._debugInfo = {
            name: debugInfo.name,
            start: debugInfo.start,
            end: endTime,
            byteSize: newByteLength,
            value: debugInfo.value,
            owner: debugInfo.owner,
            debugStack: debugInfo.debugStack,
            debugTask: debugInfo.debugTask
          }, _ref._debugTargetChunkSize = newByteLength + MIN_CHUNK_SIZE) : (debugInfo.end = endTime, debugInfo.byteSize = newByteLength);
          for (; i < chunkLength; ) {
            debugInfo = -1;
            switch (rowState) {
              case 0:
                debugInfo = value[i++];
                58 === debugInfo ? rowState = 1 : rowID = rowID << 4 | (96 < debugInfo ? debugInfo - 87 : debugInfo - 48);
                continue;
              case 1:
                rowState = value[i];
                84 === rowState || 65 === rowState || 79 === rowState || 111 === rowState || 85 === rowState || 83 === rowState || 115 === rowState || 76 === rowState || 108 === rowState || 71 === rowState || 103 === rowState || 77 === rowState || 109 === rowState || 86 === rowState ? (rowTag = rowState, rowState = 2, i++) : 64 < rowState && 91 > rowState || 35 === rowState || 114 === rowState || 120 === rowState ? (rowTag = rowState, rowState = 3, i++) : (rowTag = 0, rowState = 3);
                continue;
              case 2:
                debugInfo = value[i++];
                44 === debugInfo ? rowState = 4 : rowLength = rowLength << 4 | (96 < debugInfo ? debugInfo - 87 : debugInfo - 48);
                continue;
              case 3:
                debugInfo = value.indexOf(10, i);
                break;
              case 4:
                debugInfo = i + rowLength, debugInfo > value.length && (debugInfo = -1);
            }
            endTime = value.byteOffset + i;
            if (-1 < debugInfo)
              rowLength = new Uint8Array(
                value.buffer,
                endTime,
                debugInfo - i
              ), processFullBinaryRow(
                response,
                _ref,
                rowID,
                rowTag,
                buffer,
                rowLength
              ), i = debugInfo, 3 === rowState && i++, rowLength = rowID = rowTag = rowState = 0, buffer.length = 0;
            else {
              value = new Uint8Array(
                value.buffer,
                endTime,
                value.byteLength - i
              );
              buffer.push(value);
              rowLength -= value.byteLength;
              break;
            }
          }
          _ref._rowState = rowState;
          _ref._rowID = rowID;
          _ref._rowTag = rowTag;
          _ref._rowLength = rowLength;
        }
        return reader.read().then(progress).catch(error);
      }
      function error(e) {
        reportGlobalError(response$jscomp$0, e);
      }
      var streamState = createStreamState(response$jscomp$0, debugValue), reader = stream.getReader();
      reader.read().then(progress).catch(error);
    }
    var ReactDOM2 = ReactDOM__default, React2 = React__default, decoderOptions = { stream: true }, bind$1 = Function.prototype.bind, hasOwnProperty = Object.prototype.hasOwnProperty, chunkCache = /* @__PURE__ */ new Map(), ReactDOMSharedInternals = ReactDOM2.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, ASYNC_ITERATOR = Symbol.asyncIterator, isArrayImpl = Array.isArray, getPrototypeOf = Object.getPrototypeOf, jsxPropsParents = /* @__PURE__ */ new WeakMap(), jsxChildrenParents = /* @__PURE__ */ new WeakMap(), CLIENT_REFERENCE_TAG = /* @__PURE__ */ Symbol.for("react.client.reference"), ObjectPrototype = Object.prototype, knownServerReferences = /* @__PURE__ */ new WeakMap(), boundCache = /* @__PURE__ */ new WeakMap(), fakeServerFunctionIdx = 0, FunctionBind = Function.prototype.bind, ArraySlice = Array.prototype.slice, v8FrameRegExp = /^ {3} at (?:(.+) \((.+):(\d+):(\d+)\)|(?:async )?(.+):(\d+):(\d+))$/, jscSpiderMonkeyFrameRegExp = /(?:(.*)@)?(.*):(\d+):(\d+)/, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), supportsUserTiming = "undefined" !== typeof console && "function" === typeof console.timeStamp && "undefined" !== typeof performance && "function" === typeof performance.measure, trackNames = "Primary Parallel Parallel​ Parallel​​ Parallel​​​ Parallel​​​​ Parallel​​​​​ Parallel​​​​​​ Parallel​​​​​​​ Parallel​​​​​​​​".split(
      " "
    ), prefix, suffix;
    var ReactSharedInteralsServer = React2.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactSharedInternals = React2.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE || ReactSharedInteralsServer;
    ReactPromise.prototype = Object.create(Promise.prototype);
    ReactPromise.prototype.then = function(resolve, reject) {
      var _this = this;
      switch (this.status) {
        case "resolved_model":
          initializeModelChunk(this);
          break;
        case "resolved_module":
          initializeModuleChunk(this);
      }
      var resolveCallback = resolve, rejectCallback = reject, wrapperPromise = new Promise(function(res, rej) {
        resolve = function(value) {
          wrapperPromise._debugInfo = _this._debugInfo;
          res(value);
        };
        reject = function(reason) {
          wrapperPromise._debugInfo = _this._debugInfo;
          rej(reason);
        };
      });
      wrapperPromise.then(resolveCallback, rejectCallback);
      switch (this.status) {
        case "fulfilled":
          "function" === typeof resolve && resolve(this.value);
          break;
        case "pending":
        case "blocked":
          "function" === typeof resolve && (null === this.value && (this.value = []), this.value.push(resolve));
          "function" === typeof reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
          break;
        case "halted":
          break;
        default:
          "function" === typeof reject && reject(this.reason);
      }
    };
    var debugChannelRegistry = "function" === typeof FinalizationRegistry ? new FinalizationRegistry(closeDebugChannel) : null, initializingHandler = null, initializingChunk = null, mightHaveStaticConstructor = /\bclass\b.*\bstatic\b/, MIN_CHUNK_SIZE = 65536, supportsCreateTask = !!console.createTask, fakeFunctionCache = /* @__PURE__ */ new Map(), fakeFunctionIdx = 0, createFakeJSXCallStack = {
      react_stack_bottom_frame: function(response, stack, environmentName) {
        return buildFakeCallStack(
          response,
          stack,
          environmentName,
          false,
          fakeJSXCallSite
        )();
      }
    }, createFakeJSXCallStackInDEV = createFakeJSXCallStack.react_stack_bottom_frame.bind(
      createFakeJSXCallStack
    ), currentOwnerInDEV = null, replayConsoleWithCallStack = {
      react_stack_bottom_frame: function(response, payload) {
        var methodName = payload[0], stackTrace = payload[1], owner = payload[2], env = payload[3];
        payload = payload.slice(4);
        var prevStack = ReactSharedInternals.getCurrentStack;
        ReactSharedInternals.getCurrentStack = getCurrentStackInDEV;
        currentOwnerInDEV = null === owner ? response._debugRootOwner : owner;
        try {
          a: {
            var offset = 0;
            switch (methodName) {
              case "dir":
              case "dirxml":
              case "groupEnd":
              case "table":
                var JSCompiler_inline_result = bind$1.apply(
                  console[methodName],
                  [console].concat(payload)
                );
                break a;
              case "assert":
                offset = 1;
            }
            var newArgs = payload.slice(0);
            "string" === typeof newArgs[offset] ? newArgs.splice(
              offset,
              1,
              "\x1B[0m\x1B[7m%c%s\x1B[0m%c " + newArgs[offset],
              "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px",
              " " + env + " ",
              ""
            ) : newArgs.splice(
              offset,
              0,
              "\x1B[0m\x1B[7m%c%s\x1B[0m%c",
              "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px",
              " " + env + " ",
              ""
            );
            newArgs.unshift(console);
            JSCompiler_inline_result = bind$1.apply(
              console[methodName],
              newArgs
            );
          }
          var callStack = buildFakeCallStack(
            response,
            stackTrace,
            env,
            false,
            JSCompiler_inline_result
          );
          if (null != owner) {
            var task = initializeFakeTask(response, owner);
            initializeFakeStack(response, owner);
            if (null !== task) {
              task.run(callStack);
              return;
            }
          }
          var rootTask = getRootTask(response, env);
          null != rootTask ? rootTask.run(callStack) : callStack();
        } finally {
          currentOwnerInDEV = null, ReactSharedInternals.getCurrentStack = prevStack;
        }
      }
    }, replayConsoleWithCallStackInDEV = replayConsoleWithCallStack.react_stack_bottom_frame.bind(
      replayConsoleWithCallStack
    );
    reactServerDomWebpackClient_edge_development.createFromFetch = function(promiseForResponse, options) {
      var response = createResponseFromOptions(options);
      promiseForResponse.then(
        function(r) {
          if (options && options.debugChannel && options.debugChannel.readable) {
            var streamDoneCount = 0, handleDone = function() {
              2 === ++streamDoneCount && close(response);
            };
            startReadingFromStream(
              response,
              options.debugChannel.readable,
              handleDone
            );
            startReadingFromStream(response, r.body, handleDone, r);
          } else
            startReadingFromStream(
              response,
              r.body,
              close.bind(null, response),
              r
            );
        },
        function(e) {
          reportGlobalError(response, e);
        }
      );
      return getRoot(response);
    };
    reactServerDomWebpackClient_edge_development.createFromReadableStream = function(stream, options) {
      var response = createResponseFromOptions(options);
      if (options && options.debugChannel && options.debugChannel.readable) {
        var streamDoneCount = 0, handleDone = function() {
          2 === ++streamDoneCount && close(response);
        };
        startReadingFromStream(
          response,
          options.debugChannel.readable,
          handleDone
        );
        startReadingFromStream(response, stream, handleDone, stream);
      } else
        startReadingFromStream(
          response,
          stream,
          close.bind(null, response),
          stream
        );
      return getRoot(response);
    };
    reactServerDomWebpackClient_edge_development.createServerReference = function(id) {
      return createServerReference$1(id, noServerCall);
    };
    reactServerDomWebpackClient_edge_development.createTemporaryReferenceSet = function() {
      return /* @__PURE__ */ new Map();
    };
    reactServerDomWebpackClient_edge_development.encodeReply = function(value, options) {
      return new Promise(function(resolve, reject) {
        var abort = processReply(
          value,
          "",
          options && options.temporaryReferences ? options.temporaryReferences : void 0,
          resolve,
          reject
        );
        if (options && options.signal) {
          var signal = options.signal;
          if (signal.aborted) abort(signal.reason);
          else {
            var listener = function() {
              abort(signal.reason);
              signal.removeEventListener("abort", listener);
            };
            signal.addEventListener("abort", listener);
          }
        }
      });
    };
    reactServerDomWebpackClient_edge_development.registerServerReference = function(reference, id, encodeFormAction) {
      registerBoundServerReference(reference, id, null, encodeFormAction);
      return reference;
    };
  })();
  return reactServerDomWebpackClient_edge_development;
}
var hasRequiredClient_edge;
function requireClient_edge() {
  if (hasRequiredClient_edge) return client_edge.exports;
  hasRequiredClient_edge = 1;
  if (process.env.NODE_ENV === "production") {
    client_edge.exports = requireReactServerDomWebpackClient_edge_production();
  } else {
    client_edge.exports = requireReactServerDomWebpackClient_edge_development();
  }
  return client_edge.exports;
}
var client_edgeExports = requireClient_edge();
function createFromReadableStream(stream, options = {}) {
  return client_edgeExports.createFromReadableStream(stream, {
    serverConsumerManifest: createServerConsumerManifest(),
    ...options
  });
}
const clientReferences = {
  "168423284e2a": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_168423284e2a;
  },
  "ab3f863de78f": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_ab3f863de78f;
  },
  "03118f6f3e7a": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_03118f6f3e7a;
  },
  "e9a57d9d3b92": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_e9a57d9d3b92;
  },
  "355853aeb2b9": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_355853aeb2b9;
  },
  "b8b9cb2b5e2f": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_b8b9cb2b5e2f;
  },
  "19577ed33728": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_19577ed33728;
  },
  "732cfb3b021f": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_732cfb3b021f;
  },
  "0dd7285711dc": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_0dd7285711dc;
  },
  "3cb731667909": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_3cb731667909;
  },
  "bb1c2a08e0a4": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_bb1c2a08e0a4;
  },
  "bd5dff20de36": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_bd5dff20de36;
  },
  "f8d8a72d7013": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_f8d8a72d7013;
  },
  "9642d40e0185": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_9642d40e0185;
  },
  "d2d9302f16e5": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_d2d9302f16e5;
  },
  "757d8b621f8b": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_757d8b621f8b;
  },
  "8a73f3786674": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_8a73f3786674;
  },
  "12afa74d869d": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_12afa74d869d;
  },
  "39943e3ac7c5": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_39943e3ac7c5;
  },
  "005c3b14c95a": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_005c3b14c95a;
  },
  "902786d5592b": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_902786d5592b;
  },
  "7f0a5a9a62a4": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_7f0a5a9a62a4;
  },
  "f29e6e234fea": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_f29e6e234fea;
  },
  "0deffcb8ffd7": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_0deffcb8ffd7;
  },
  "c2747888630f": async () => {
    const m = await import("./assets/facade__virtual_vinext-rsc-entry-RBkw5eqJ.js");
    return m.export_c2747888630f;
  }
};
initialize();
function initialize() {
  setRequireModule({ load: async (id) => {
    {
      const import_ = clientReferences[id];
      if (!import_) throw new Error(`client reference not found '${id}'`);
      const deps = assetsManifest.clientReferenceDeps[id] ?? {
        js: [],
        css: []
      };
      preloadDeps(deps);
      return wrapResourceProxy(await import_(), id, deps);
    }
  } });
}
function wrapResourceProxy(mod, id, deps) {
  return new Proxy(mod, { get(target, p, receiver) {
    if (p in mod) {
      preloadDeps(deps);
    }
    return Reflect.get(target, p, receiver);
  } });
}
function preloadDeps(deps) {
  for (const href of deps.js) ReactDOM.preloadModule(href, {
    as: "script",
    crossOrigin: ""
  });
  for (const href of deps.css) ReactDOM.preinit(href, {
    as: "style",
    precedence: assetsManifest.cssLinkPrecedence !== false ? "vite-rsc/client-reference" : void 0
  });
}
let _LayoutSegmentCtx = null;
function getLayoutSegmentContext() {
  if (_LayoutSegmentCtx === null && typeof React.createContext === "function") {
    _LayoutSegmentCtx = React.createContext(0);
  }
  return _LayoutSegmentCtx;
}
let _serverContext = null;
let _serverInsertedHTMLCallbacks = [];
let _getServerContext = () => _serverContext;
let _setServerContext = (ctx) => {
  _serverContext = ctx;
};
let _getInsertedHTMLCallbacks = () => _serverInsertedHTMLCallbacks;
let _clearInsertedHTMLCallbacks = () => {
  _serverInsertedHTMLCallbacks = [];
};
function setNavigationContext(ctx) {
  _setServerContext(ctx);
}
const isServer = typeof window === "undefined";
function stripBasePath(p) {
  return p;
}
function withBasePath(p) {
  return p;
}
const MAX_PREFETCH_CACHE_SIZE = 50;
function toRscUrl(href) {
  const [beforeHash] = href.split("#");
  const qIdx = beforeHash.indexOf("?");
  const pathname = qIdx === -1 ? beforeHash : beforeHash.slice(0, qIdx);
  const query = qIdx === -1 ? "" : beforeHash.slice(qIdx);
  const normalizedPath = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return normalizedPath + ".rsc" + query;
}
function getPrefetchCache() {
  if (isServer)
    return /* @__PURE__ */ new Map();
  const win = window;
  if (!win.__VINEXT_RSC_PREFETCH_CACHE__) {
    win.__VINEXT_RSC_PREFETCH_CACHE__ = /* @__PURE__ */ new Map();
  }
  return win.__VINEXT_RSC_PREFETCH_CACHE__;
}
function getPrefetchedUrls() {
  if (isServer)
    return /* @__PURE__ */ new Set();
  const win = window;
  if (!win.__VINEXT_RSC_PREFETCHED_URLS__) {
    win.__VINEXT_RSC_PREFETCHED_URLS__ = /* @__PURE__ */ new Set();
  }
  return win.__VINEXT_RSC_PREFETCHED_URLS__;
}
function storePrefetchResponse(rscUrl, response) {
  const cache = getPrefetchCache();
  if (cache.size >= MAX_PREFETCH_CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest !== void 0)
      cache.delete(oldest);
  }
  cache.set(rscUrl, { response, timestamp: Date.now() });
}
const _listeners = /* @__PURE__ */ new Set();
function notifyListeners() {
  for (const fn of _listeners)
    fn();
}
let _cachedSearch = !isServer ? window.location.search : "";
let _cachedSearchParams = new URLSearchParams(_cachedSearch);
function getSearchParamsSnapshot() {
  const current = window.location.search;
  if (current !== _cachedSearch) {
    _cachedSearch = current;
    _cachedSearchParams = new URLSearchParams(current);
  }
  return _cachedSearchParams;
}
let _cachedPathname = !isServer ? stripBasePath(window.location.pathname) : "/";
function getPathnameSnapshot() {
  const current = stripBasePath(window.location.pathname);
  if (current !== _cachedPathname) {
    _cachedPathname = current;
  }
  return _cachedPathname;
}
function usePathname() {
  if (isServer) {
    return _getServerContext()?.pathname ?? "/";
  }
  return React.useSyncExternalStore((cb) => {
    _listeners.add(cb);
    return () => {
      _listeners.delete(cb);
    };
  }, getPathnameSnapshot, () => _getServerContext()?.pathname ?? "/");
}
function useSearchParams() {
  if (isServer) {
    return _getServerContext()?.searchParams ?? new URLSearchParams();
  }
  return React.useSyncExternalStore((cb) => {
    _listeners.add(cb);
    return () => {
      _listeners.delete(cb);
    };
  }, getSearchParamsSnapshot, () => _getServerContext()?.searchParams ?? new URLSearchParams());
}
function isExternalUrl(href) {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
}
function isHashOnlyChange(href) {
  if (typeof window === "undefined")
    return false;
  if (href.startsWith("#"))
    return true;
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
  const id = hash.slice(1);
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "auto" });
  }
}
const _nativeReplaceState = !isServer ? window.history.replaceState.bind(window.history) : null;
function saveScrollPosition() {
  const state = window.history.state ?? {};
  _nativeReplaceState.call(window.history, { ...state, __vinext_scrollX: window.scrollX, __vinext_scrollY: window.scrollY }, "");
}
function restoreScrollPosition(state) {
  if (state && typeof state === "object" && "__vinext_scrollY" in state) {
    const { __vinext_scrollX: x, __vinext_scrollY: y } = state;
    Promise.resolve().then(() => {
      const pending = window.__VINEXT_RSC_PENDING__ ?? null;
      if (pending) {
        pending.then(() => {
          requestAnimationFrame(() => {
            window.scrollTo(x, y);
          });
        });
      } else {
        requestAnimationFrame(() => {
          window.scrollTo(x, y);
        });
      }
    });
  }
}
async function navigateImpl(href, mode, scroll) {
  if (isExternalUrl(href)) {
    if (mode === "replace") {
      window.location.replace(href);
    } else {
      window.location.assign(href);
    }
    return;
  }
  const fullHref = withBasePath(href);
  if (mode === "push") {
    saveScrollPosition();
  }
  if (isHashOnlyChange(fullHref)) {
    const hash2 = fullHref.includes("#") ? fullHref.slice(fullHref.indexOf("#")) : "";
    if (mode === "replace") {
      window.history.replaceState(null, "", fullHref);
    } else {
      window.history.pushState(null, "", fullHref);
    }
    notifyListeners();
    if (scroll) {
      scrollToHash(hash2);
    }
    return;
  }
  const hashIdx = fullHref.indexOf("#");
  const hash = hashIdx !== -1 ? fullHref.slice(hashIdx) : "";
  if (mode === "replace") {
    window.history.replaceState(null, "", fullHref);
  } else {
    window.history.pushState(null, "", fullHref);
  }
  notifyListeners();
  if (typeof window.__VINEXT_RSC_NAVIGATE__ === "function") {
    await window.__VINEXT_RSC_NAVIGATE__(fullHref);
  }
  if (scroll) {
    if (hash) {
      scrollToHash(hash);
    } else {
      window.scrollTo(0, 0);
    }
  }
}
function useRouter() {
  const router = {
    push(href, options) {
      if (isServer)
        return;
      navigateImpl(href, "push", options?.scroll !== false);
    },
    replace(href, options) {
      if (isServer)
        return;
      navigateImpl(href, "replace", options?.scroll !== false);
    },
    back() {
      if (isServer)
        return;
      window.history.back();
    },
    forward() {
      if (isServer)
        return;
      window.history.forward();
    },
    refresh() {
      if (isServer)
        return;
      if (typeof window.__VINEXT_RSC_NAVIGATE__ === "function") {
        window.__VINEXT_RSC_NAVIGATE__(window.location.href);
      }
    },
    prefetch(href) {
      if (isServer)
        return;
      const fullHref = withBasePath(href);
      const rscUrl = toRscUrl(fullHref);
      const prefetched = getPrefetchedUrls();
      if (prefetched.has(rscUrl))
        return;
      prefetched.add(rscUrl);
      fetch(rscUrl, {
        headers: { Accept: "text/x-component" },
        priority: "low"
      }).then((response) => {
        if (response.ok) {
          storePrefetchResponse(rscUrl, response);
        } else {
          prefetched.delete(rscUrl);
        }
      }).catch(() => {
        prefetched.delete(rscUrl);
      });
    }
  };
  return router;
}
function flushServerInsertedHTML() {
  const callbacks = _getInsertedHTMLCallbacks();
  const results = [];
  for (const cb of callbacks) {
    try {
      const result = cb();
      if (result != null)
        results.push(result);
    } catch {
    }
  }
  callbacks.length = 0;
  return results;
}
function clearServerInsertedHTML() {
  _clearInsertedHTMLCallbacks();
}
var RedirectType;
(function(RedirectType2) {
  RedirectType2["push"] = "push";
  RedirectType2["replace"] = "replace";
})(RedirectType || (RedirectType = {}));
if (!isServer) {
  window.addEventListener("popstate", (event) => {
    notifyListeners();
    restoreScrollPosition(event.state);
  });
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.pushState = function patchedPushState(data, unused, url) {
    originalPushState(data, unused, url);
    notifyListeners();
  };
  window.history.replaceState = function patchedReplaceState(data, unused, url) {
    originalReplaceState(data, unused, url);
    notifyListeners();
  };
}
const navigation = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get RedirectType() {
    return RedirectType;
  },
  clearServerInsertedHTML,
  flushServerInsertedHTML,
  getLayoutSegmentContext,
  getPrefetchCache,
  getPrefetchedUrls,
  setNavigationContext,
  storePrefetchResponse,
  toRscUrl,
  usePathname,
  useRouter,
  useSearchParams
}, Symbol.toStringTag, { value: "Module" }));
function safeJsonStringify(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function createRscEmbedTransform(embedStream) {
  const reader = embedStream.getReader();
  const _decoder = new TextDecoder();
  let done = false;
  let pendingChunks = [];
  let reading = false;
  function fixFlightHints(text) {
    return text.replace(/(\d+:HL\[.*?),"stylesheet"(\]|,)/g, '$1,"style"$2');
  }
  async function pumpReader() {
    if (reading) return;
    reading = true;
    try {
      while (true) {
        const result = await reader.read();
        if (result.done) {
          done = true;
          break;
        }
        const text = _decoder.decode(result.value, { stream: true });
        pendingChunks.push(fixFlightHints(text));
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[vinext] RSC embed stream read error:", err);
      }
      done = true;
    }
    reading = false;
  }
  const pumpPromise = pumpReader();
  return {
    /**
     * Flush any accumulated RSC chunks as <script> tags.
     * Called after each HTML chunk is enqueued.
     */
    flush() {
      if (pendingChunks.length === 0) return "";
      const chunks = pendingChunks;
      pendingChunks = [];
      let scripts = "";
      for (const chunk of chunks) {
        scripts += "<script>self.__VINEXT_RSC_CHUNKS__=self.__VINEXT_RSC_CHUNKS__||[];self.__VINEXT_RSC_CHUNKS__.push(" + safeJsonStringify(chunk) + ")<\/script>";
      }
      return scripts;
    },
    /**
     * Wait for the RSC stream to fully complete and return any final
     * script tags plus the closing signal.
     */
    async finalize() {
      await pumpPromise;
      let scripts = this.flush();
      scripts += "<script>self.__VINEXT_RSC_DONE__=true<\/script>";
      return scripts;
    }
  };
}
async function handleSsr(rscStream, navContext, fontData) {
  if (navContext) {
    setNavigationContext(navContext);
  }
  const { clearServerInsertedHTML: clearServerInsertedHTML2, flushServerInsertedHTML: flushServerInsertedHTML2 } = await Promise.resolve().then(() => navigation);
  clearServerInsertedHTML2();
  try {
    let _escAttr = function(s) {
      return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    }, fixPreloadAs = function(html) {
      return html.replace(/<link(?=[^>]*\srel="preload")[^>]*>/g, function(tag) {
        return tag.replace(' as="stylesheet"', ' as="style"');
      });
    };
    const [ssrStream, embedStream] = rscStream.tee();
    const rscEmbed = createRscEmbedTransform(embedStream);
    const root = createFromReadableStream(ssrStream);
    const bootstrapScriptContent = await Promise.resolve(assetsManifest.bootstrapScriptContent);
    const htmlStream = await renderToReadableStream(root, {
      bootstrapScriptContent,
      onError(error) {
        if (error && typeof error === "object" && "digest" in error) {
          return String(error.digest);
        }
        return void 0;
      }
    });
    const insertedElements = flushServerInsertedHTML2();
    const { renderToStaticMarkup } = await import("react-dom/server.edge");
    const { createElement, Fragment } = await import("react");
    let insertedHTML = "";
    for (const el of insertedElements) {
      try {
        insertedHTML += renderToStaticMarkup(createElement(Fragment, null, el));
      } catch {
      }
    }
    let fontHTML = "";
    if (fontData) {
      if (fontData.links && fontData.links.length > 0) {
        for (const url of fontData.links) {
          fontHTML += '<link rel="stylesheet" href="' + _escAttr(url) + '" />\n';
        }
      }
      if (fontData.preloads && fontData.preloads.length > 0) {
        for (const preload of fontData.preloads) {
          fontHTML += '<link rel="preload" href="' + _escAttr(preload.href) + '" as="font" type="' + _escAttr(preload.type) + '" crossorigin />\n';
        }
      }
      if (fontData.styles && fontData.styles.length > 0) {
        fontHTML += "<style data-vinext-fonts>" + fontData.styles.join("\n") + "</style>\n";
      }
    }
    let modulePreloadHTML = "";
    if (bootstrapScriptContent) {
      const m = bootstrapScriptContent.match(/import\("([^"]+)"\)/);
      if (m && m[1]) {
        modulePreloadHTML = '<link rel="modulepreload" href="' + _escAttr(m[1]) + '" />\n';
      }
    }
    const paramsScript = "<script>self.__VINEXT_RSC_PARAMS__=" + safeJsonStringify(navContext?.params || {}) + "<\/script>";
    const injectHTML = paramsScript + modulePreloadHTML + insertedHTML + fontHTML;
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let injected = false;
    let buffered = [];
    let timeoutId = null;
    const transform = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const fixed = fixPreloadAs(text);
        buffered.push(fixed);
        if (timeoutId !== null) return;
        timeoutId = setTimeout(() => {
          for (const buf of buffered) {
            if (!injected) {
              const headEnd = buf.indexOf("</head>");
              if (headEnd !== -1) {
                const before = buf.slice(0, headEnd);
                const after = buf.slice(headEnd);
                controller.enqueue(encoder.encode(before + injectHTML + after));
                injected = true;
                continue;
              }
            }
            controller.enqueue(encoder.encode(buf));
          }
          buffered = [];
          const rscScripts = rscEmbed.flush();
          if (rscScripts) {
            controller.enqueue(encoder.encode(rscScripts));
          }
          timeoutId = null;
        }, 0);
      },
      async flush(controller) {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        for (const buf of buffered) {
          if (!injected) {
            const headEnd = buf.indexOf("</head>");
            if (headEnd !== -1) {
              const before = buf.slice(0, headEnd);
              const after = buf.slice(headEnd);
              controller.enqueue(encoder.encode(before + injectHTML + after));
              injected = true;
              continue;
            }
          }
          controller.enqueue(encoder.encode(buf));
        }
        buffered = [];
        if (!injected && injectHTML) {
          controller.enqueue(encoder.encode(injectHTML));
        }
        const finalScripts = await rscEmbed.finalize();
        if (finalScripts) {
          controller.enqueue(encoder.encode(finalScripts));
        }
      }
    });
    return htmlStream.pipeThrough(transform);
  } finally {
    setNavigationContext(null);
    clearServerInsertedHTML2();
  }
}
export {
  usePathname as a,
  useSearchParams as b,
  getLayoutSegmentContext as c,
  getPrefetchedUrls as g,
  handleSsr,
  storePrefetchResponse as s,
  toRscUrl as t,
  useRouter as u
};
