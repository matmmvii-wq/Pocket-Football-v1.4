import { createRequire } from "node:module"; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error2(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error2(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       * @param {Boolean} [isServer=false] Create the instance in either server or
       *     client mode
       * @param {Number} [maxPayload=0] The maximum allowed message length
       */
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code2) {
      return code2 >= 1e3 && code2 <= 1014 && code2 !== 1004 && code2 !== 1005 && code2 !== 1006 || code2 >= 3e3 && code2 <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error2 = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error2);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          const error2 = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error2);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error2 = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error2);
            return;
          }
          if (!this._fragmented) {
            const error2 = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error2);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error2 = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error2);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error2 = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error2);
            return;
          }
          if (compressed) {
            const error2 = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error2);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error2 = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error2);
            return;
          }
        } else {
          const error2 = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error2);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error2 = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error2);
            return;
          }
        } else if (this._masked) {
          const error2 = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error2);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error2 = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error2);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error2 = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error2);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error2 = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error2);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error2 = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error2);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code2 = data.readUInt16BE(0);
            if (!isValidStatusCode(code2)) {
              const error2 = this.createError(
                RangeError,
                `invalid status code ${code2}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error2);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error2 = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error2);
              return;
            }
            this._loop = false;
            this.emit("conclude", code2, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code2, data, mask, cb) {
        let buf;
        if (code2 === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code2 !== "number" || !isValidStatusCode(code2)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code2, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code2, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {Buffer[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code2, message) {
            const event = new CloseEvent("close", {
              code: code2,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error2) {
            const event = new ErrorEvent("error", {
              error: error2,
              message: error2.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code2 = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code2 = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code2 === 32 || code2 === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code2 === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (code2 === 32 || code2 === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code2 === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code2 === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code2] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code2] === 1) {
              if (start === -1) start = i;
            } else if (code2 === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code2 === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code2 === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code2 === 32 || code2 === 9)) {
            if (end === -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code2 === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code2 === 32 || code2 === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code2, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code2, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(
          opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
          false,
          opts.maxPayload
        );
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code2, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code2;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code2 === 1005) websocket.close();
      else websocket.close(code2, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code2 = header.charCodeAt(i);
        if (end === -1 && tokenChars[code2] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code2 === 32 || code2 === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code2 === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash } = __require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server2 = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server2.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 8 && version !== 13) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(
            this.options.perMessageDeflate,
            true,
            this.options.maxPayload
          );
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code2, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code2 || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server2, map) {
      for (const event of Object.keys(map)) server2.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server2.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server2) {
      server2._state = CLOSED;
      server2.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code2, message, headers) {
      message = message || http.STATUS_CODES[code2];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code2} ${http.STATUS_CODES[code2]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server2, req, socket, code2, message) {
      if (server2.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server2.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code2, message);
      }
    }
  }
});

// node_modules/matter-js/build/matter.js
var require_matter = __commonJS({
  "node_modules/matter-js/build/matter.js"(exports, module) {
    (function webpackUniversalModuleDefinition(root2, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define("Matter", [], factory);
      else if (typeof exports === "object")
        exports["Matter"] = factory();
      else
        root2["Matter"] = factory();
    })(exports, function() {
      return (
        /******/
        (function(modules) {
          var installedModules = {};
          function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) {
              return installedModules[moduleId].exports;
            }
            var module2 = installedModules[moduleId] = {
              /******/
              i: moduleId,
              /******/
              l: false,
              /******/
              exports: {}
              /******/
            };
            modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
            module2.l = true;
            return module2.exports;
          }
          __webpack_require__.m = modules;
          __webpack_require__.c = installedModules;
          __webpack_require__.d = function(exports2, name, getter) {
            if (!__webpack_require__.o(exports2, name)) {
              Object.defineProperty(exports2, name, { enumerable: true, get: getter });
            }
          };
          __webpack_require__.r = function(exports2) {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
              Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
            }
            Object.defineProperty(exports2, "__esModule", { value: true });
          };
          __webpack_require__.t = function(value, mode) {
            if (mode & 1) value = __webpack_require__(value);
            if (mode & 8) return value;
            if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
            var ns = /* @__PURE__ */ Object.create(null);
            __webpack_require__.r(ns);
            Object.defineProperty(ns, "default", { enumerable: true, value });
            if (mode & 2 && typeof value != "string") for (var key in value) __webpack_require__.d(ns, key, function(key2) {
              return value[key2];
            }.bind(null, key));
            return ns;
          };
          __webpack_require__.n = function(module2) {
            var getter = module2 && module2.__esModule ? (
              /******/
              function getDefault() {
                return module2["default"];
              }
            ) : (
              /******/
              function getModuleExports() {
                return module2;
              }
            );
            __webpack_require__.d(getter, "a", getter);
            return getter;
          };
          __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
          };
          __webpack_require__.p = "";
          return __webpack_require__(__webpack_require__.s = 20);
        })([
          /* 0 */
          /***/
          (function(module2, exports2) {
            var Common = {};
            module2.exports = Common;
            (function() {
              Common._baseDelta = 1e3 / 60;
              Common._nextId = 0;
              Common._seed = 0;
              Common._nowStartTime = +/* @__PURE__ */ new Date();
              Common._warnedOnce = {};
              Common._decomp = null;
              Common.extend = function(obj, deep) {
                var argsStart, args, deepClone;
                if (typeof deep === "boolean") {
                  argsStart = 2;
                  deepClone = deep;
                } else {
                  argsStart = 1;
                  deepClone = true;
                }
                for (var i = argsStart; i < arguments.length; i++) {
                  var source = arguments[i];
                  if (source) {
                    for (var prop in source) {
                      if (deepClone && source[prop] && source[prop].constructor === Object) {
                        if (!obj[prop] || obj[prop].constructor === Object) {
                          obj[prop] = obj[prop] || {};
                          Common.extend(obj[prop], deepClone, source[prop]);
                        } else {
                          obj[prop] = source[prop];
                        }
                      } else {
                        obj[prop] = source[prop];
                      }
                    }
                  }
                }
                return obj;
              };
              Common.clone = function(obj, deep) {
                return Common.extend({}, deep, obj);
              };
              Common.keys = function(obj) {
                if (Object.keys)
                  return Object.keys(obj);
                var keys = [];
                for (var key in obj)
                  keys.push(key);
                return keys;
              };
              Common.values = function(obj) {
                var values = [];
                if (Object.keys) {
                  var keys = Object.keys(obj);
                  for (var i = 0; i < keys.length; i++) {
                    values.push(obj[keys[i]]);
                  }
                  return values;
                }
                for (var key in obj)
                  values.push(obj[key]);
                return values;
              };
              Common.get = function(obj, path, begin, end) {
                path = path.split(".").slice(begin, end);
                for (var i = 0; i < path.length; i += 1) {
                  obj = obj[path[i]];
                }
                return obj;
              };
              Common.set = function(obj, path, val, begin, end) {
                var parts = path.split(".").slice(begin, end);
                Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;
                return val;
              };
              Common.shuffle = function(array) {
                for (var i = array.length - 1; i > 0; i--) {
                  var j = Math.floor(Common.random() * (i + 1));
                  var temp = array[i];
                  array[i] = array[j];
                  array[j] = temp;
                }
                return array;
              };
              Common.choose = function(choices) {
                return choices[Math.floor(Common.random() * choices.length)];
              };
              Common.isElement = function(obj) {
                if (typeof HTMLElement !== "undefined") {
                  return obj instanceof HTMLElement;
                }
                return !!(obj && obj.nodeType && obj.nodeName);
              };
              Common.isArray = function(obj) {
                return Object.prototype.toString.call(obj) === "[object Array]";
              };
              Common.isFunction = function(obj) {
                return typeof obj === "function";
              };
              Common.isPlainObject = function(obj) {
                return typeof obj === "object" && obj.constructor === Object;
              };
              Common.isString = function(obj) {
                return toString.call(obj) === "[object String]";
              };
              Common.clamp = function(value, min, max) {
                if (value < min)
                  return min;
                if (value > max)
                  return max;
                return value;
              };
              Common.sign = function(value) {
                return value < 0 ? -1 : 1;
              };
              Common.now = function() {
                if (typeof window !== "undefined" && window.performance) {
                  if (window.performance.now) {
                    return window.performance.now();
                  } else if (window.performance.webkitNow) {
                    return window.performance.webkitNow();
                  }
                }
                if (Date.now) {
                  return Date.now();
                }
                return /* @__PURE__ */ new Date() - Common._nowStartTime;
              };
              Common.random = function(min, max) {
                min = typeof min !== "undefined" ? min : 0;
                max = typeof max !== "undefined" ? max : 1;
                return min + _seededRandom() * (max - min);
              };
              var _seededRandom = function() {
                Common._seed = (Common._seed * 9301 + 49297) % 233280;
                return Common._seed / 233280;
              };
              Common.colorToNumber = function(colorString) {
                colorString = colorString.replace("#", "");
                if (colorString.length == 3) {
                  colorString = colorString.charAt(0) + colorString.charAt(0) + colorString.charAt(1) + colorString.charAt(1) + colorString.charAt(2) + colorString.charAt(2);
                }
                return parseInt(colorString, 16);
              };
              Common.logLevel = 1;
              Common.log = function() {
                if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
                  console.log.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                }
              };
              Common.info = function() {
                if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
                  console.info.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                }
              };
              Common.warn = function() {
                if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
                  console.warn.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                }
              };
              Common.warnOnce = function() {
                var message = Array.prototype.slice.call(arguments).join(" ");
                if (!Common._warnedOnce[message]) {
                  Common.warn(message);
                  Common._warnedOnce[message] = true;
                }
              };
              Common.deprecated = function(obj, prop, warning) {
                obj[prop] = Common.chain(function() {
                  Common.warnOnce("\u{1F505} deprecated \u{1F505}", warning);
                }, obj[prop]);
              };
              Common.nextId = function() {
                return Common._nextId++;
              };
              Common.indexOf = function(haystack, needle) {
                if (haystack.indexOf)
                  return haystack.indexOf(needle);
                for (var i = 0; i < haystack.length; i++) {
                  if (haystack[i] === needle)
                    return i;
                }
                return -1;
              };
              Common.map = function(list, func) {
                if (list.map) {
                  return list.map(func);
                }
                var mapped = [];
                for (var i = 0; i < list.length; i += 1) {
                  mapped.push(func(list[i]));
                }
                return mapped;
              };
              Common.topologicalSort = function(graph) {
                var result = [], visited = [], temp = [];
                for (var node in graph) {
                  if (!visited[node] && !temp[node]) {
                    Common._topologicalSort(node, visited, temp, graph, result);
                  }
                }
                return result;
              };
              Common._topologicalSort = function(node, visited, temp, graph, result) {
                var neighbors = graph[node] || [];
                temp[node] = true;
                for (var i = 0; i < neighbors.length; i += 1) {
                  var neighbor = neighbors[i];
                  if (temp[neighbor]) {
                    continue;
                  }
                  if (!visited[neighbor]) {
                    Common._topologicalSort(neighbor, visited, temp, graph, result);
                  }
                }
                temp[node] = false;
                visited[node] = true;
                result.push(node);
              };
              Common.chain = function() {
                var funcs = [];
                for (var i = 0; i < arguments.length; i += 1) {
                  var func = arguments[i];
                  if (func._chained) {
                    funcs.push.apply(funcs, func._chained);
                  } else {
                    funcs.push(func);
                  }
                }
                var chain = function() {
                  var lastResult, args = new Array(arguments.length);
                  for (var i2 = 0, l = arguments.length; i2 < l; i2++) {
                    args[i2] = arguments[i2];
                  }
                  for (i2 = 0; i2 < funcs.length; i2 += 1) {
                    var result = funcs[i2].apply(lastResult, args);
                    if (typeof result !== "undefined") {
                      lastResult = result;
                    }
                  }
                  return lastResult;
                };
                chain._chained = funcs;
                return chain;
              };
              Common.chainPathBefore = function(base, path, func) {
                return Common.set(base, path, Common.chain(
                  func,
                  Common.get(base, path)
                ));
              };
              Common.chainPathAfter = function(base, path, func) {
                return Common.set(base, path, Common.chain(
                  Common.get(base, path),
                  func
                ));
              };
              Common.setDecomp = function(decomp) {
                Common._decomp = decomp;
              };
              Common.getDecomp = function() {
                var decomp = Common._decomp;
                try {
                  if (!decomp && typeof window !== "undefined") {
                    decomp = window.decomp;
                  }
                  if (!decomp && typeof global !== "undefined") {
                    decomp = global.decomp;
                  }
                } catch (e) {
                  decomp = null;
                }
                return decomp;
              };
            })();
          }),
          /* 1 */
          /***/
          (function(module2, exports2) {
            var Bounds = {};
            module2.exports = Bounds;
            (function() {
              Bounds.create = function(vertices) {
                var bounds = {
                  min: { x: 0, y: 0 },
                  max: { x: 0, y: 0 }
                };
                if (vertices)
                  Bounds.update(bounds, vertices);
                return bounds;
              };
              Bounds.update = function(bounds, vertices, velocity) {
                bounds.min.x = Infinity;
                bounds.max.x = -Infinity;
                bounds.min.y = Infinity;
                bounds.max.y = -Infinity;
                for (var i = 0; i < vertices.length; i++) {
                  var vertex = vertices[i];
                  if (vertex.x > bounds.max.x) bounds.max.x = vertex.x;
                  if (vertex.x < bounds.min.x) bounds.min.x = vertex.x;
                  if (vertex.y > bounds.max.y) bounds.max.y = vertex.y;
                  if (vertex.y < bounds.min.y) bounds.min.y = vertex.y;
                }
                if (velocity) {
                  if (velocity.x > 0) {
                    bounds.max.x += velocity.x;
                  } else {
                    bounds.min.x += velocity.x;
                  }
                  if (velocity.y > 0) {
                    bounds.max.y += velocity.y;
                  } else {
                    bounds.min.y += velocity.y;
                  }
                }
              };
              Bounds.contains = function(bounds, point) {
                return point.x >= bounds.min.x && point.x <= bounds.max.x && point.y >= bounds.min.y && point.y <= bounds.max.y;
              };
              Bounds.overlaps = function(boundsA, boundsB) {
                return boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x && boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y;
              };
              Bounds.translate = function(bounds, vector) {
                bounds.min.x += vector.x;
                bounds.max.x += vector.x;
                bounds.min.y += vector.y;
                bounds.max.y += vector.y;
              };
              Bounds.shift = function(bounds, position) {
                var deltaX = bounds.max.x - bounds.min.x, deltaY = bounds.max.y - bounds.min.y;
                bounds.min.x = position.x;
                bounds.max.x = position.x + deltaX;
                bounds.min.y = position.y;
                bounds.max.y = position.y + deltaY;
              };
            })();
          }),
          /* 2 */
          /***/
          (function(module2, exports2) {
            var Vector = {};
            module2.exports = Vector;
            (function() {
              Vector.create = function(x, y) {
                return { x: x || 0, y: y || 0 };
              };
              Vector.clone = function(vector) {
                return { x: vector.x, y: vector.y };
              };
              Vector.magnitude = function(vector) {
                return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
              };
              Vector.magnitudeSquared = function(vector) {
                return vector.x * vector.x + vector.y * vector.y;
              };
              Vector.rotate = function(vector, angle, output) {
                var cos = Math.cos(angle), sin = Math.sin(angle);
                if (!output) output = {};
                var x = vector.x * cos - vector.y * sin;
                output.y = vector.x * sin + vector.y * cos;
                output.x = x;
                return output;
              };
              Vector.rotateAbout = function(vector, angle, point, output) {
                var cos = Math.cos(angle), sin = Math.sin(angle);
                if (!output) output = {};
                var x = point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin);
                output.y = point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos);
                output.x = x;
                return output;
              };
              Vector.normalise = function(vector) {
                var magnitude = Vector.magnitude(vector);
                if (magnitude === 0)
                  return { x: 0, y: 0 };
                return { x: vector.x / magnitude, y: vector.y / magnitude };
              };
              Vector.dot = function(vectorA, vectorB) {
                return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
              };
              Vector.cross = function(vectorA, vectorB) {
                return vectorA.x * vectorB.y - vectorA.y * vectorB.x;
              };
              Vector.cross3 = function(vectorA, vectorB, vectorC) {
                return (vectorB.x - vectorA.x) * (vectorC.y - vectorA.y) - (vectorB.y - vectorA.y) * (vectorC.x - vectorA.x);
              };
              Vector.add = function(vectorA, vectorB, output) {
                if (!output) output = {};
                output.x = vectorA.x + vectorB.x;
                output.y = vectorA.y + vectorB.y;
                return output;
              };
              Vector.sub = function(vectorA, vectorB, output) {
                if (!output) output = {};
                output.x = vectorA.x - vectorB.x;
                output.y = vectorA.y - vectorB.y;
                return output;
              };
              Vector.mult = function(vector, scalar) {
                return { x: vector.x * scalar, y: vector.y * scalar };
              };
              Vector.div = function(vector, scalar) {
                return { x: vector.x / scalar, y: vector.y / scalar };
              };
              Vector.perp = function(vector, negate) {
                negate = negate === true ? -1 : 1;
                return { x: negate * -vector.y, y: negate * vector.x };
              };
              Vector.neg = function(vector) {
                return { x: -vector.x, y: -vector.y };
              };
              Vector.angle = function(vectorA, vectorB) {
                return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
              };
              Vector._temp = [
                Vector.create(),
                Vector.create(),
                Vector.create(),
                Vector.create(),
                Vector.create(),
                Vector.create()
              ];
            })();
          }),
          /* 3 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Vertices = {};
            module2.exports = Vertices;
            var Vector = __webpack_require__(2);
            var Common = __webpack_require__(0);
            (function() {
              Vertices.create = function(points, body) {
                var vertices = [];
                for (var i = 0; i < points.length; i++) {
                  var point = points[i], vertex = {
                    x: point.x,
                    y: point.y,
                    index: i,
                    body,
                    isInternal: false
                  };
                  vertices.push(vertex);
                }
                return vertices;
              };
              Vertices.fromPath = function(path, body) {
                var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/ig, points = [];
                path.replace(pathPattern, function(match, x, y) {
                  points.push({ x: parseFloat(x), y: parseFloat(y) });
                });
                return Vertices.create(points, body);
              };
              Vertices.centre = function(vertices) {
                var area = Vertices.area(vertices, true), centre = { x: 0, y: 0 }, cross, temp, j;
                for (var i = 0; i < vertices.length; i++) {
                  j = (i + 1) % vertices.length;
                  cross = Vector.cross(vertices[i], vertices[j]);
                  temp = Vector.mult(Vector.add(vertices[i], vertices[j]), cross);
                  centre = Vector.add(centre, temp);
                }
                return Vector.div(centre, 6 * area);
              };
              Vertices.mean = function(vertices) {
                var average = { x: 0, y: 0 };
                for (var i = 0; i < vertices.length; i++) {
                  average.x += vertices[i].x;
                  average.y += vertices[i].y;
                }
                return Vector.div(average, vertices.length);
              };
              Vertices.area = function(vertices, signed) {
                var area = 0, j = vertices.length - 1;
                for (var i = 0; i < vertices.length; i++) {
                  area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
                  j = i;
                }
                if (signed)
                  return area / 2;
                return Math.abs(area) / 2;
              };
              Vertices.inertia = function(vertices, mass) {
                var numerator = 0, denominator = 0, v = vertices, cross, j;
                for (var n = 0; n < v.length; n++) {
                  j = (n + 1) % v.length;
                  cross = Math.abs(Vector.cross(v[j], v[n]));
                  numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));
                  denominator += cross;
                }
                return mass / 6 * (numerator / denominator);
              };
              Vertices.translate = function(vertices, vector, scalar) {
                scalar = typeof scalar !== "undefined" ? scalar : 1;
                var verticesLength = vertices.length, translateX = vector.x * scalar, translateY = vector.y * scalar, i;
                for (i = 0; i < verticesLength; i++) {
                  vertices[i].x += translateX;
                  vertices[i].y += translateY;
                }
                return vertices;
              };
              Vertices.rotate = function(vertices, angle, point) {
                if (angle === 0)
                  return;
                var cos = Math.cos(angle), sin = Math.sin(angle), pointX = point.x, pointY = point.y, verticesLength = vertices.length, vertex, dx, dy, i;
                for (i = 0; i < verticesLength; i++) {
                  vertex = vertices[i];
                  dx = vertex.x - pointX;
                  dy = vertex.y - pointY;
                  vertex.x = pointX + (dx * cos - dy * sin);
                  vertex.y = pointY + (dx * sin + dy * cos);
                }
                return vertices;
              };
              Vertices.contains = function(vertices, point) {
                var pointX = point.x, pointY = point.y, verticesLength = vertices.length, vertex = vertices[verticesLength - 1], nextVertex;
                for (var i = 0; i < verticesLength; i++) {
                  nextVertex = vertices[i];
                  if ((pointX - vertex.x) * (nextVertex.y - vertex.y) + (pointY - vertex.y) * (vertex.x - nextVertex.x) > 0) {
                    return false;
                  }
                  vertex = nextVertex;
                }
                return true;
              };
              Vertices.scale = function(vertices, scaleX, scaleY, point) {
                if (scaleX === 1 && scaleY === 1)
                  return vertices;
                point = point || Vertices.centre(vertices);
                var vertex, delta;
                for (var i = 0; i < vertices.length; i++) {
                  vertex = vertices[i];
                  delta = Vector.sub(vertex, point);
                  vertices[i].x = point.x + delta.x * scaleX;
                  vertices[i].y = point.y + delta.y * scaleY;
                }
                return vertices;
              };
              Vertices.chamfer = function(vertices, radius, quality, qualityMin, qualityMax) {
                if (typeof radius === "number") {
                  radius = [radius];
                } else {
                  radius = radius || [8];
                }
                quality = typeof quality !== "undefined" ? quality : -1;
                qualityMin = qualityMin || 2;
                qualityMax = qualityMax || 14;
                var newVertices = [];
                for (var i = 0; i < vertices.length; i++) {
                  var prevVertex = vertices[i - 1 >= 0 ? i - 1 : vertices.length - 1], vertex = vertices[i], nextVertex = vertices[(i + 1) % vertices.length], currentRadius = radius[i < radius.length ? i : radius.length - 1];
                  if (currentRadius === 0) {
                    newVertices.push(vertex);
                    continue;
                  }
                  var prevNormal = Vector.normalise({
                    x: vertex.y - prevVertex.y,
                    y: prevVertex.x - vertex.x
                  });
                  var nextNormal = Vector.normalise({
                    x: nextVertex.y - vertex.y,
                    y: vertex.x - nextVertex.x
                  });
                  var diagonalRadius = Math.sqrt(2 * Math.pow(currentRadius, 2)), radiusVector = Vector.mult(Common.clone(prevNormal), currentRadius), midNormal = Vector.normalise(Vector.mult(Vector.add(prevNormal, nextNormal), 0.5)), scaledVertex = Vector.sub(vertex, Vector.mult(midNormal, diagonalRadius));
                  var precision = quality;
                  if (quality === -1) {
                    precision = Math.pow(currentRadius, 0.32) * 1.75;
                  }
                  precision = Common.clamp(precision, qualityMin, qualityMax);
                  if (precision % 2 === 1)
                    precision += 1;
                  var alpha = Math.acos(Vector.dot(prevNormal, nextNormal)), theta = alpha / precision;
                  for (var j = 0; j < precision; j++) {
                    newVertices.push(Vector.add(Vector.rotate(radiusVector, theta * j), scaledVertex));
                  }
                }
                return newVertices;
              };
              Vertices.clockwiseSort = function(vertices) {
                var centre = Vertices.mean(vertices);
                vertices.sort(function(vertexA, vertexB) {
                  return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);
                });
                return vertices;
              };
              Vertices.isConvex = function(vertices) {
                var flag = 0, n = vertices.length, i, j, k, z;
                if (n < 3)
                  return null;
                for (i = 0; i < n; i++) {
                  j = (i + 1) % n;
                  k = (i + 2) % n;
                  z = (vertices[j].x - vertices[i].x) * (vertices[k].y - vertices[j].y);
                  z -= (vertices[j].y - vertices[i].y) * (vertices[k].x - vertices[j].x);
                  if (z < 0) {
                    flag |= 1;
                  } else if (z > 0) {
                    flag |= 2;
                  }
                  if (flag === 3) {
                    return false;
                  }
                }
                if (flag !== 0) {
                  return true;
                } else {
                  return null;
                }
              };
              Vertices.hull = function(vertices) {
                var upper = [], lower = [], vertex, i;
                vertices = vertices.slice(0);
                vertices.sort(function(vertexA, vertexB) {
                  var dx = vertexA.x - vertexB.x;
                  return dx !== 0 ? dx : vertexA.y - vertexB.y;
                });
                for (i = 0; i < vertices.length; i += 1) {
                  vertex = vertices[i];
                  while (lower.length >= 2 && Vector.cross3(lower[lower.length - 2], lower[lower.length - 1], vertex) <= 0) {
                    lower.pop();
                  }
                  lower.push(vertex);
                }
                for (i = vertices.length - 1; i >= 0; i -= 1) {
                  vertex = vertices[i];
                  while (upper.length >= 2 && Vector.cross3(upper[upper.length - 2], upper[upper.length - 1], vertex) <= 0) {
                    upper.pop();
                  }
                  upper.push(vertex);
                }
                upper.pop();
                lower.pop();
                return upper.concat(lower);
              };
            })();
          }),
          /* 4 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Body2 = {};
            module2.exports = Body2;
            var Vertices = __webpack_require__(3);
            var Vector = __webpack_require__(2);
            var Sleeping = __webpack_require__(7);
            var Common = __webpack_require__(0);
            var Bounds = __webpack_require__(1);
            var Axes = __webpack_require__(11);
            (function() {
              Body2._timeCorrection = true;
              Body2._inertiaScale = 4;
              Body2._nextCollidingGroupId = 1;
              Body2._nextNonCollidingGroupId = -1;
              Body2._nextCategory = 1;
              Body2._baseDelta = 1e3 / 60;
              Body2.create = function(options) {
                var defaults = {
                  id: Common.nextId(),
                  type: "body",
                  label: "Body",
                  parts: [],
                  plugin: {},
                  angle: 0,
                  vertices: Vertices.fromPath("L 0 0 L 40 0 L 40 40 L 0 40"),
                  position: { x: 0, y: 0 },
                  force: { x: 0, y: 0 },
                  torque: 0,
                  positionImpulse: { x: 0, y: 0 },
                  constraintImpulse: { x: 0, y: 0, angle: 0 },
                  totalContacts: 0,
                  speed: 0,
                  angularSpeed: 0,
                  velocity: { x: 0, y: 0 },
                  angularVelocity: 0,
                  isSensor: false,
                  isStatic: false,
                  isSleeping: false,
                  motion: 0,
                  sleepThreshold: 60,
                  density: 1e-3,
                  restitution: 0,
                  friction: 0.1,
                  frictionStatic: 0.5,
                  frictionAir: 0.01,
                  collisionFilter: {
                    category: 1,
                    mask: 4294967295,
                    group: 0
                  },
                  slop: 0.05,
                  timeScale: 1,
                  render: {
                    visible: true,
                    opacity: 1,
                    strokeStyle: null,
                    fillStyle: null,
                    lineWidth: null,
                    sprite: {
                      xScale: 1,
                      yScale: 1,
                      xOffset: 0,
                      yOffset: 0
                    }
                  },
                  events: null,
                  bounds: null,
                  chamfer: null,
                  circleRadius: 0,
                  positionPrev: null,
                  anglePrev: 0,
                  parent: null,
                  axes: null,
                  area: 0,
                  mass: 0,
                  inertia: 0,
                  deltaTime: 1e3 / 60,
                  _original: null
                };
                var body = Common.extend(defaults, options);
                _initProperties(body, options);
                return body;
              };
              Body2.nextGroup = function(isNonColliding) {
                if (isNonColliding)
                  return Body2._nextNonCollidingGroupId--;
                return Body2._nextCollidingGroupId++;
              };
              Body2.nextCategory = function() {
                Body2._nextCategory = Body2._nextCategory << 1;
                return Body2._nextCategory;
              };
              var _initProperties = function(body, options) {
                options = options || {};
                Body2.set(body, {
                  bounds: body.bounds || Bounds.create(body.vertices),
                  positionPrev: body.positionPrev || Vector.clone(body.position),
                  anglePrev: body.anglePrev || body.angle,
                  vertices: body.vertices,
                  parts: body.parts || [body],
                  isStatic: body.isStatic,
                  isSleeping: body.isSleeping,
                  parent: body.parent || body
                });
                Vertices.rotate(body.vertices, body.angle, body.position);
                Axes.rotate(body.axes, body.angle);
                Bounds.update(body.bounds, body.vertices, body.velocity);
                Body2.set(body, {
                  axes: options.axes || body.axes,
                  area: options.area || body.area,
                  mass: options.mass || body.mass,
                  inertia: options.inertia || body.inertia
                });
                var defaultFillStyle = body.isStatic ? "#14151f" : Common.choose(["#f19648", "#f5d259", "#f55a3c", "#063e7b", "#ececd1"]), defaultStrokeStyle = body.isStatic ? "#555" : "#ccc", defaultLineWidth = body.isStatic && body.render.fillStyle === null ? 1 : 0;
                body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
                body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
                body.render.lineWidth = body.render.lineWidth || defaultLineWidth;
                body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);
                body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);
              };
              Body2.set = function(body, settings, value) {
                var property;
                if (typeof settings === "string") {
                  property = settings;
                  settings = {};
                  settings[property] = value;
                }
                for (property in settings) {
                  if (!Object.prototype.hasOwnProperty.call(settings, property))
                    continue;
                  value = settings[property];
                  switch (property) {
                    case "isStatic":
                      Body2.setStatic(body, value);
                      break;
                    case "isSleeping":
                      Sleeping.set(body, value);
                      break;
                    case "mass":
                      Body2.setMass(body, value);
                      break;
                    case "density":
                      Body2.setDensity(body, value);
                      break;
                    case "inertia":
                      Body2.setInertia(body, value);
                      break;
                    case "vertices":
                      Body2.setVertices(body, value);
                      break;
                    case "position":
                      Body2.setPosition(body, value);
                      break;
                    case "angle":
                      Body2.setAngle(body, value);
                      break;
                    case "velocity":
                      Body2.setVelocity(body, value);
                      break;
                    case "angularVelocity":
                      Body2.setAngularVelocity(body, value);
                      break;
                    case "speed":
                      Body2.setSpeed(body, value);
                      break;
                    case "angularSpeed":
                      Body2.setAngularSpeed(body, value);
                      break;
                    case "parts":
                      Body2.setParts(body, value);
                      break;
                    case "centre":
                      Body2.setCentre(body, value);
                      break;
                    default:
                      body[property] = value;
                  }
                }
              };
              Body2.setStatic = function(body, isStatic) {
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  if (isStatic) {
                    if (!part.isStatic) {
                      part._original = {
                        restitution: part.restitution,
                        friction: part.friction,
                        mass: part.mass,
                        inertia: part.inertia,
                        density: part.density,
                        inverseMass: part.inverseMass,
                        inverseInertia: part.inverseInertia
                      };
                    }
                    part.restitution = 0;
                    part.friction = 1;
                    part.mass = part.inertia = part.density = Infinity;
                    part.inverseMass = part.inverseInertia = 0;
                    part.positionPrev.x = part.position.x;
                    part.positionPrev.y = part.position.y;
                    part.anglePrev = part.angle;
                    part.angularVelocity = 0;
                    part.speed = 0;
                    part.angularSpeed = 0;
                    part.motion = 0;
                  } else if (part._original) {
                    part.restitution = part._original.restitution;
                    part.friction = part._original.friction;
                    part.mass = part._original.mass;
                    part.inertia = part._original.inertia;
                    part.density = part._original.density;
                    part.inverseMass = part._original.inverseMass;
                    part.inverseInertia = part._original.inverseInertia;
                    part._original = null;
                  }
                  part.isStatic = isStatic;
                }
              };
              Body2.setMass = function(body, mass) {
                var moment = body.inertia / (body.mass / 6);
                body.inertia = moment * (mass / 6);
                body.inverseInertia = 1 / body.inertia;
                body.mass = mass;
                body.inverseMass = 1 / body.mass;
                body.density = body.mass / body.area;
              };
              Body2.setDensity = function(body, density) {
                Body2.setMass(body, density * body.area);
                body.density = density;
              };
              Body2.setInertia = function(body, inertia) {
                body.inertia = inertia;
                body.inverseInertia = 1 / body.inertia;
              };
              Body2.setVertices = function(body, vertices) {
                if (vertices[0].body === body) {
                  body.vertices = vertices;
                } else {
                  body.vertices = Vertices.create(vertices, body);
                }
                body.axes = Axes.fromVertices(body.vertices);
                body.area = Vertices.area(body.vertices);
                Body2.setMass(body, body.density * body.area);
                var centre = Vertices.centre(body.vertices);
                Vertices.translate(body.vertices, centre, -1);
                Body2.setInertia(body, Body2._inertiaScale * Vertices.inertia(body.vertices, body.mass));
                Vertices.translate(body.vertices, body.position);
                Bounds.update(body.bounds, body.vertices, body.velocity);
              };
              Body2.setParts = function(body, parts, autoHull) {
                var i;
                parts = parts.slice(0);
                body.parts.length = 0;
                body.parts.push(body);
                body.parent = body;
                for (i = 0; i < parts.length; i++) {
                  var part = parts[i];
                  if (part !== body) {
                    part.parent = body;
                    body.parts.push(part);
                  }
                }
                if (body.parts.length === 1)
                  return;
                autoHull = typeof autoHull !== "undefined" ? autoHull : true;
                if (autoHull) {
                  var vertices = [];
                  for (i = 0; i < parts.length; i++) {
                    vertices = vertices.concat(parts[i].vertices);
                  }
                  Vertices.clockwiseSort(vertices);
                  var hull = Vertices.hull(vertices), hullCentre = Vertices.centre(hull);
                  Body2.setVertices(body, hull);
                  Vertices.translate(body.vertices, hullCentre);
                }
                var total = Body2._totalProperties(body);
                body.area = total.area;
                body.parent = body;
                body.position.x = total.centre.x;
                body.position.y = total.centre.y;
                body.positionPrev.x = total.centre.x;
                body.positionPrev.y = total.centre.y;
                Body2.setMass(body, total.mass);
                Body2.setInertia(body, total.inertia);
                Body2.setPosition(body, total.centre);
              };
              Body2.setCentre = function(body, centre, relative) {
                if (!relative) {
                  body.positionPrev.x = centre.x - (body.position.x - body.positionPrev.x);
                  body.positionPrev.y = centre.y - (body.position.y - body.positionPrev.y);
                  body.position.x = centre.x;
                  body.position.y = centre.y;
                } else {
                  body.positionPrev.x += centre.x;
                  body.positionPrev.y += centre.y;
                  body.position.x += centre.x;
                  body.position.y += centre.y;
                }
              };
              Body2.setPosition = function(body, position, updateVelocity) {
                var delta = Vector.sub(position, body.position);
                if (updateVelocity) {
                  body.positionPrev.x = body.position.x;
                  body.positionPrev.y = body.position.y;
                  body.velocity.x = delta.x;
                  body.velocity.y = delta.y;
                  body.speed = Vector.magnitude(delta);
                } else {
                  body.positionPrev.x += delta.x;
                  body.positionPrev.y += delta.y;
                }
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  part.position.x += delta.x;
                  part.position.y += delta.y;
                  Vertices.translate(part.vertices, delta);
                  Bounds.update(part.bounds, part.vertices, body.velocity);
                }
              };
              Body2.setAngle = function(body, angle, updateVelocity) {
                var delta = angle - body.angle;
                if (updateVelocity) {
                  body.anglePrev = body.angle;
                  body.angularVelocity = delta;
                  body.angularSpeed = Math.abs(delta);
                } else {
                  body.anglePrev += delta;
                }
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  part.angle += delta;
                  Vertices.rotate(part.vertices, delta, body.position);
                  Axes.rotate(part.axes, delta);
                  Bounds.update(part.bounds, part.vertices, body.velocity);
                  if (i > 0) {
                    Vector.rotateAbout(part.position, delta, body.position, part.position);
                  }
                }
              };
              Body2.setVelocity = function(body, velocity) {
                var timeScale = body.deltaTime / Body2._baseDelta;
                body.positionPrev.x = body.position.x - velocity.x * timeScale;
                body.positionPrev.y = body.position.y - velocity.y * timeScale;
                body.velocity.x = (body.position.x - body.positionPrev.x) / timeScale;
                body.velocity.y = (body.position.y - body.positionPrev.y) / timeScale;
                body.speed = Vector.magnitude(body.velocity);
              };
              Body2.getVelocity = function(body) {
                var timeScale = Body2._baseDelta / body.deltaTime;
                return {
                  x: (body.position.x - body.positionPrev.x) * timeScale,
                  y: (body.position.y - body.positionPrev.y) * timeScale
                };
              };
              Body2.getSpeed = function(body) {
                return Vector.magnitude(Body2.getVelocity(body));
              };
              Body2.setSpeed = function(body, speed) {
                Body2.setVelocity(body, Vector.mult(Vector.normalise(Body2.getVelocity(body)), speed));
              };
              Body2.setAngularVelocity = function(body, velocity) {
                var timeScale = body.deltaTime / Body2._baseDelta;
                body.anglePrev = body.angle - velocity * timeScale;
                body.angularVelocity = (body.angle - body.anglePrev) / timeScale;
                body.angularSpeed = Math.abs(body.angularVelocity);
              };
              Body2.getAngularVelocity = function(body) {
                return (body.angle - body.anglePrev) * Body2._baseDelta / body.deltaTime;
              };
              Body2.getAngularSpeed = function(body) {
                return Math.abs(Body2.getAngularVelocity(body));
              };
              Body2.setAngularSpeed = function(body, speed) {
                Body2.setAngularVelocity(body, Common.sign(Body2.getAngularVelocity(body)) * speed);
              };
              Body2.translate = function(body, translation, updateVelocity) {
                Body2.setPosition(body, Vector.add(body.position, translation), updateVelocity);
              };
              Body2.rotate = function(body, rotation, point, updateVelocity) {
                if (!point) {
                  Body2.setAngle(body, body.angle + rotation, updateVelocity);
                } else {
                  var cos = Math.cos(rotation), sin = Math.sin(rotation), dx = body.position.x - point.x, dy = body.position.y - point.y;
                  Body2.setPosition(body, {
                    x: point.x + (dx * cos - dy * sin),
                    y: point.y + (dx * sin + dy * cos)
                  }, updateVelocity);
                  Body2.setAngle(body, body.angle + rotation, updateVelocity);
                }
              };
              Body2.scale = function(body, scaleX, scaleY, point) {
                var totalArea = 0, totalInertia = 0;
                point = point || body.position;
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  Vertices.scale(part.vertices, scaleX, scaleY, point);
                  part.axes = Axes.fromVertices(part.vertices);
                  part.area = Vertices.area(part.vertices);
                  Body2.setMass(part, body.density * part.area);
                  Vertices.translate(part.vertices, { x: -part.position.x, y: -part.position.y });
                  Body2.setInertia(part, Body2._inertiaScale * Vertices.inertia(part.vertices, part.mass));
                  Vertices.translate(part.vertices, { x: part.position.x, y: part.position.y });
                  if (i > 0) {
                    totalArea += part.area;
                    totalInertia += part.inertia;
                  }
                  part.position.x = point.x + (part.position.x - point.x) * scaleX;
                  part.position.y = point.y + (part.position.y - point.y) * scaleY;
                  Bounds.update(part.bounds, part.vertices, body.velocity);
                }
                if (body.parts.length > 1) {
                  body.area = totalArea;
                  if (!body.isStatic) {
                    Body2.setMass(body, body.density * totalArea);
                    Body2.setInertia(body, totalInertia);
                  }
                }
                if (body.circleRadius) {
                  if (scaleX === scaleY) {
                    body.circleRadius *= scaleX;
                  } else {
                    body.circleRadius = null;
                  }
                }
              };
              Body2.update = function(body, deltaTime) {
                deltaTime = (typeof deltaTime !== "undefined" ? deltaTime : 1e3 / 60) * body.timeScale;
                var deltaTimeSquared = deltaTime * deltaTime, correction = Body2._timeCorrection ? deltaTime / (body.deltaTime || deltaTime) : 1;
                var frictionAir = 1 - body.frictionAir * (deltaTime / Common._baseDelta), velocityPrevX = (body.position.x - body.positionPrev.x) * correction, velocityPrevY = (body.position.y - body.positionPrev.y) * correction;
                body.velocity.x = velocityPrevX * frictionAir + body.force.x / body.mass * deltaTimeSquared;
                body.velocity.y = velocityPrevY * frictionAir + body.force.y / body.mass * deltaTimeSquared;
                body.positionPrev.x = body.position.x;
                body.positionPrev.y = body.position.y;
                body.position.x += body.velocity.x;
                body.position.y += body.velocity.y;
                body.deltaTime = deltaTime;
                body.angularVelocity = (body.angle - body.anglePrev) * frictionAir * correction + body.torque / body.inertia * deltaTimeSquared;
                body.anglePrev = body.angle;
                body.angle += body.angularVelocity;
                for (var i = 0; i < body.parts.length; i++) {
                  var part = body.parts[i];
                  Vertices.translate(part.vertices, body.velocity);
                  if (i > 0) {
                    part.position.x += body.velocity.x;
                    part.position.y += body.velocity.y;
                  }
                  if (body.angularVelocity !== 0) {
                    Vertices.rotate(part.vertices, body.angularVelocity, body.position);
                    Axes.rotate(part.axes, body.angularVelocity);
                    if (i > 0) {
                      Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
                    }
                  }
                  Bounds.update(part.bounds, part.vertices, body.velocity);
                }
              };
              Body2.updateVelocities = function(body) {
                var timeScale = Body2._baseDelta / body.deltaTime, bodyVelocity = body.velocity;
                bodyVelocity.x = (body.position.x - body.positionPrev.x) * timeScale;
                bodyVelocity.y = (body.position.y - body.positionPrev.y) * timeScale;
                body.speed = Math.sqrt(bodyVelocity.x * bodyVelocity.x + bodyVelocity.y * bodyVelocity.y);
                body.angularVelocity = (body.angle - body.anglePrev) * timeScale;
                body.angularSpeed = Math.abs(body.angularVelocity);
              };
              Body2.applyForce = function(body, position, force) {
                var offset = { x: position.x - body.position.x, y: position.y - body.position.y };
                body.force.x += force.x;
                body.force.y += force.y;
                body.torque += offset.x * force.y - offset.y * force.x;
              };
              Body2._totalProperties = function(body) {
                var properties = {
                  mass: 0,
                  area: 0,
                  inertia: 0,
                  centre: { x: 0, y: 0 }
                };
                for (var i = body.parts.length === 1 ? 0 : 1; i < body.parts.length; i++) {
                  var part = body.parts[i], mass = part.mass !== Infinity ? part.mass : 1;
                  properties.mass += mass;
                  properties.area += part.area;
                  properties.inertia += part.inertia;
                  properties.centre = Vector.add(properties.centre, Vector.mult(part.position, mass));
                }
                properties.centre = Vector.div(properties.centre, properties.mass);
                return properties;
              };
            })();
          }),
          /* 5 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Events2 = {};
            module2.exports = Events2;
            var Common = __webpack_require__(0);
            (function() {
              Events2.on = function(object, eventNames, callback) {
                var names = eventNames.split(" "), name;
                for (var i = 0; i < names.length; i++) {
                  name = names[i];
                  object.events = object.events || {};
                  object.events[name] = object.events[name] || [];
                  object.events[name].push(callback);
                }
                return callback;
              };
              Events2.off = function(object, eventNames, callback) {
                if (!eventNames) {
                  object.events = {};
                  return;
                }
                if (typeof eventNames === "function") {
                  callback = eventNames;
                  eventNames = Common.keys(object.events).join(" ");
                }
                var names = eventNames.split(" ");
                for (var i = 0; i < names.length; i++) {
                  var callbacks = object.events[names[i]], newCallbacks = [];
                  if (callback && callbacks) {
                    for (var j = 0; j < callbacks.length; j++) {
                      if (callbacks[j] !== callback)
                        newCallbacks.push(callbacks[j]);
                    }
                  }
                  object.events[names[i]] = newCallbacks;
                }
              };
              Events2.trigger = function(object, eventNames, event) {
                var names, name, callbacks, eventClone;
                var events = object.events;
                if (events && Common.keys(events).length > 0) {
                  if (!event)
                    event = {};
                  names = eventNames.split(" ");
                  for (var i = 0; i < names.length; i++) {
                    name = names[i];
                    callbacks = events[name];
                    if (callbacks) {
                      eventClone = Common.clone(event, false);
                      eventClone.name = name;
                      eventClone.source = object;
                      for (var j = 0; j < callbacks.length; j++) {
                        callbacks[j].apply(object, [eventClone]);
                      }
                    }
                  }
                }
              };
            })();
          }),
          /* 6 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Composite2 = {};
            module2.exports = Composite2;
            var Events2 = __webpack_require__(5);
            var Common = __webpack_require__(0);
            var Bounds = __webpack_require__(1);
            var Body2 = __webpack_require__(4);
            (function() {
              Composite2.create = function(options) {
                return Common.extend({
                  id: Common.nextId(),
                  type: "composite",
                  parent: null,
                  isModified: false,
                  bodies: [],
                  constraints: [],
                  composites: [],
                  label: "Composite",
                  plugin: {},
                  cache: {
                    allBodies: null,
                    allConstraints: null,
                    allComposites: null
                  }
                }, options);
              };
              Composite2.setModified = function(composite, isModified, updateParents, updateChildren) {
                composite.isModified = isModified;
                if (isModified && composite.cache) {
                  composite.cache.allBodies = null;
                  composite.cache.allConstraints = null;
                  composite.cache.allComposites = null;
                }
                if (updateParents && composite.parent) {
                  Composite2.setModified(composite.parent, isModified, updateParents, updateChildren);
                }
                if (updateChildren) {
                  for (var i = 0; i < composite.composites.length; i++) {
                    var childComposite = composite.composites[i];
                    Composite2.setModified(childComposite, isModified, updateParents, updateChildren);
                  }
                }
              };
              Composite2.add = function(composite, object) {
                var objects = [].concat(object);
                Events2.trigger(composite, "beforeAdd", { object });
                for (var i = 0; i < objects.length; i++) {
                  var obj = objects[i];
                  switch (obj.type) {
                    case "body":
                      if (obj.parent !== obj) {
                        Common.warn("Composite.add: skipped adding a compound body part (you must add its parent instead)");
                        break;
                      }
                      Composite2.addBody(composite, obj);
                      break;
                    case "constraint":
                      Composite2.addConstraint(composite, obj);
                      break;
                    case "composite":
                      Composite2.addComposite(composite, obj);
                      break;
                    case "mouseConstraint":
                      Composite2.addConstraint(composite, obj.constraint);
                      break;
                  }
                }
                Events2.trigger(composite, "afterAdd", { object });
                return composite;
              };
              Composite2.remove = function(composite, object, deep) {
                var objects = [].concat(object);
                Events2.trigger(composite, "beforeRemove", { object });
                for (var i = 0; i < objects.length; i++) {
                  var obj = objects[i];
                  switch (obj.type) {
                    case "body":
                      Composite2.removeBody(composite, obj, deep);
                      break;
                    case "constraint":
                      Composite2.removeConstraint(composite, obj, deep);
                      break;
                    case "composite":
                      Composite2.removeComposite(composite, obj, deep);
                      break;
                    case "mouseConstraint":
                      Composite2.removeConstraint(composite, obj.constraint);
                      break;
                  }
                }
                Events2.trigger(composite, "afterRemove", { object });
                return composite;
              };
              Composite2.addComposite = function(compositeA, compositeB) {
                compositeA.composites.push(compositeB);
                compositeB.parent = compositeA;
                Composite2.setModified(compositeA, true, true, false);
                return compositeA;
              };
              Composite2.removeComposite = function(compositeA, compositeB, deep) {
                var position = Common.indexOf(compositeA.composites, compositeB);
                if (position !== -1) {
                  var bodies = Composite2.allBodies(compositeB);
                  Composite2.removeCompositeAt(compositeA, position);
                  for (var i = 0; i < bodies.length; i++) {
                    bodies[i].sleepCounter = 0;
                  }
                }
                if (deep) {
                  for (var i = 0; i < compositeA.composites.length; i++) {
                    Composite2.removeComposite(compositeA.composites[i], compositeB, true);
                  }
                }
                return compositeA;
              };
              Composite2.removeCompositeAt = function(composite, position) {
                composite.composites.splice(position, 1);
                Composite2.setModified(composite, true, true, false);
                return composite;
              };
              Composite2.addBody = function(composite, body) {
                composite.bodies.push(body);
                Composite2.setModified(composite, true, true, false);
                return composite;
              };
              Composite2.removeBody = function(composite, body, deep) {
                var position = Common.indexOf(composite.bodies, body);
                if (position !== -1) {
                  Composite2.removeBodyAt(composite, position);
                  body.sleepCounter = 0;
                }
                if (deep) {
                  for (var i = 0; i < composite.composites.length; i++) {
                    Composite2.removeBody(composite.composites[i], body, true);
                  }
                }
                return composite;
              };
              Composite2.removeBodyAt = function(composite, position) {
                composite.bodies.splice(position, 1);
                Composite2.setModified(composite, true, true, false);
                return composite;
              };
              Composite2.addConstraint = function(composite, constraint) {
                composite.constraints.push(constraint);
                Composite2.setModified(composite, true, true, false);
                return composite;
              };
              Composite2.removeConstraint = function(composite, constraint, deep) {
                var position = Common.indexOf(composite.constraints, constraint);
                if (position !== -1) {
                  Composite2.removeConstraintAt(composite, position);
                }
                if (deep) {
                  for (var i = 0; i < composite.composites.length; i++) {
                    Composite2.removeConstraint(composite.composites[i], constraint, true);
                  }
                }
                return composite;
              };
              Composite2.removeConstraintAt = function(composite, position) {
                composite.constraints.splice(position, 1);
                Composite2.setModified(composite, true, true, false);
                return composite;
              };
              Composite2.clear = function(composite, keepStatic, deep) {
                if (deep) {
                  for (var i = 0; i < composite.composites.length; i++) {
                    Composite2.clear(composite.composites[i], keepStatic, true);
                  }
                }
                if (keepStatic) {
                  composite.bodies = composite.bodies.filter(function(body) {
                    return body.isStatic;
                  });
                } else {
                  composite.bodies.length = 0;
                }
                composite.constraints.length = 0;
                composite.composites.length = 0;
                Composite2.setModified(composite, true, true, false);
                return composite;
              };
              Composite2.allBodies = function(composite) {
                if (composite.cache && composite.cache.allBodies) {
                  return composite.cache.allBodies;
                }
                var bodies = [].concat(composite.bodies);
                for (var i = 0; i < composite.composites.length; i++)
                  bodies = bodies.concat(Composite2.allBodies(composite.composites[i]));
                if (composite.cache) {
                  composite.cache.allBodies = bodies;
                }
                return bodies;
              };
              Composite2.allConstraints = function(composite) {
                if (composite.cache && composite.cache.allConstraints) {
                  return composite.cache.allConstraints;
                }
                var constraints = [].concat(composite.constraints);
                for (var i = 0; i < composite.composites.length; i++)
                  constraints = constraints.concat(Composite2.allConstraints(composite.composites[i]));
                if (composite.cache) {
                  composite.cache.allConstraints = constraints;
                }
                return constraints;
              };
              Composite2.allComposites = function(composite) {
                if (composite.cache && composite.cache.allComposites) {
                  return composite.cache.allComposites;
                }
                var composites = [].concat(composite.composites);
                for (var i = 0; i < composite.composites.length; i++)
                  composites = composites.concat(Composite2.allComposites(composite.composites[i]));
                if (composite.cache) {
                  composite.cache.allComposites = composites;
                }
                return composites;
              };
              Composite2.get = function(composite, id, type) {
                var objects, object;
                switch (type) {
                  case "body":
                    objects = Composite2.allBodies(composite);
                    break;
                  case "constraint":
                    objects = Composite2.allConstraints(composite);
                    break;
                  case "composite":
                    objects = Composite2.allComposites(composite).concat(composite);
                    break;
                }
                if (!objects)
                  return null;
                object = objects.filter(function(object2) {
                  return object2.id.toString() === id.toString();
                });
                return object.length === 0 ? null : object[0];
              };
              Composite2.move = function(compositeA, objects, compositeB) {
                Composite2.remove(compositeA, objects);
                Composite2.add(compositeB, objects);
                return compositeA;
              };
              Composite2.rebase = function(composite) {
                var objects = Composite2.allBodies(composite).concat(Composite2.allConstraints(composite)).concat(Composite2.allComposites(composite));
                for (var i = 0; i < objects.length; i++) {
                  objects[i].id = Common.nextId();
                }
                return composite;
              };
              Composite2.translate = function(composite, translation, recursive) {
                var bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                for (var i = 0; i < bodies.length; i++) {
                  Body2.translate(bodies[i], translation);
                }
                return composite;
              };
              Composite2.rotate = function(composite, rotation, point, recursive) {
                var cos = Math.cos(rotation), sin = Math.sin(rotation), bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], dx = body.position.x - point.x, dy = body.position.y - point.y;
                  Body2.setPosition(body, {
                    x: point.x + (dx * cos - dy * sin),
                    y: point.y + (dx * sin + dy * cos)
                  });
                  Body2.rotate(body, rotation);
                }
                return composite;
              };
              Composite2.scale = function(composite, scaleX, scaleY, point, recursive) {
                var bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], dx = body.position.x - point.x, dy = body.position.y - point.y;
                  Body2.setPosition(body, {
                    x: point.x + dx * scaleX,
                    y: point.y + dy * scaleY
                  });
                  Body2.scale(body, scaleX, scaleY);
                }
                return composite;
              };
              Composite2.bounds = function(composite) {
                var bodies = Composite2.allBodies(composite), vertices = [];
                for (var i = 0; i < bodies.length; i += 1) {
                  var body = bodies[i];
                  vertices.push(body.bounds.min, body.bounds.max);
                }
                return Bounds.create(vertices);
              };
            })();
          }),
          /* 7 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Sleeping = {};
            module2.exports = Sleeping;
            var Body2 = __webpack_require__(4);
            var Events2 = __webpack_require__(5);
            var Common = __webpack_require__(0);
            (function() {
              Sleeping._motionWakeThreshold = 0.18;
              Sleeping._motionSleepThreshold = 0.08;
              Sleeping._minBias = 0.9;
              Sleeping.update = function(bodies, delta) {
                var timeScale = delta / Common._baseDelta, motionSleepThreshold = Sleeping._motionSleepThreshold;
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], speed = Body2.getSpeed(body), angularSpeed = Body2.getAngularSpeed(body), motion = speed * speed + angularSpeed * angularSpeed;
                  if (body.force.x !== 0 || body.force.y !== 0) {
                    Sleeping.set(body, false);
                    continue;
                  }
                  var minMotion = Math.min(body.motion, motion), maxMotion = Math.max(body.motion, motion);
                  body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;
                  if (body.sleepThreshold > 0 && body.motion < motionSleepThreshold) {
                    body.sleepCounter += 1;
                    if (body.sleepCounter >= body.sleepThreshold / timeScale) {
                      Sleeping.set(body, true);
                    }
                  } else if (body.sleepCounter > 0) {
                    body.sleepCounter -= 1;
                  }
                }
              };
              Sleeping.afterCollisions = function(pairs) {
                var motionSleepThreshold = Sleeping._motionSleepThreshold;
                for (var i = 0; i < pairs.length; i++) {
                  var pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  var collision = pair.collision, bodyA = collision.bodyA.parent, bodyB = collision.bodyB.parent;
                  if (bodyA.isSleeping && bodyB.isSleeping || bodyA.isStatic || bodyB.isStatic)
                    continue;
                  if (bodyA.isSleeping || bodyB.isSleeping) {
                    var sleepingBody = bodyA.isSleeping && !bodyA.isStatic ? bodyA : bodyB, movingBody = sleepingBody === bodyA ? bodyB : bodyA;
                    if (!sleepingBody.isStatic && movingBody.motion > motionSleepThreshold) {
                      Sleeping.set(sleepingBody, false);
                    }
                  }
                }
              };
              Sleeping.set = function(body, isSleeping) {
                var wasSleeping = body.isSleeping;
                if (isSleeping) {
                  body.isSleeping = true;
                  body.sleepCounter = body.sleepThreshold;
                  body.positionImpulse.x = 0;
                  body.positionImpulse.y = 0;
                  body.positionPrev.x = body.position.x;
                  body.positionPrev.y = body.position.y;
                  body.anglePrev = body.angle;
                  body.speed = 0;
                  body.angularSpeed = 0;
                  body.motion = 0;
                  if (!wasSleeping) {
                    Events2.trigger(body, "sleepStart");
                  }
                } else {
                  body.isSleeping = false;
                  body.sleepCounter = 0;
                  if (wasSleeping) {
                    Events2.trigger(body, "sleepEnd");
                  }
                }
              };
            })();
          }),
          /* 8 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Collision = {};
            module2.exports = Collision;
            var Vertices = __webpack_require__(3);
            var Pair = __webpack_require__(9);
            (function() {
              var _supports = [];
              var _overlapAB = {
                overlap: 0,
                axis: null
              };
              var _overlapBA = {
                overlap: 0,
                axis: null
              };
              Collision.create = function(bodyA, bodyB) {
                return {
                  pair: null,
                  collided: false,
                  bodyA,
                  bodyB,
                  parentA: bodyA.parent,
                  parentB: bodyB.parent,
                  depth: 0,
                  normal: { x: 0, y: 0 },
                  tangent: { x: 0, y: 0 },
                  penetration: { x: 0, y: 0 },
                  supports: [null, null],
                  supportCount: 0
                };
              };
              Collision.collides = function(bodyA, bodyB, pairs) {
                Collision._overlapAxes(_overlapAB, bodyA.vertices, bodyB.vertices, bodyA.axes);
                if (_overlapAB.overlap <= 0) {
                  return null;
                }
                Collision._overlapAxes(_overlapBA, bodyB.vertices, bodyA.vertices, bodyB.axes);
                if (_overlapBA.overlap <= 0) {
                  return null;
                }
                var pair = pairs && pairs.table[Pair.id(bodyA, bodyB)], collision;
                if (!pair) {
                  collision = Collision.create(bodyA, bodyB);
                  collision.collided = true;
                  collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
                  collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
                  collision.parentA = collision.bodyA.parent;
                  collision.parentB = collision.bodyB.parent;
                } else {
                  collision = pair.collision;
                }
                bodyA = collision.bodyA;
                bodyB = collision.bodyB;
                var minOverlap;
                if (_overlapAB.overlap < _overlapBA.overlap) {
                  minOverlap = _overlapAB;
                } else {
                  minOverlap = _overlapBA;
                }
                var normal = collision.normal, tangent = collision.tangent, penetration = collision.penetration, supports = collision.supports, depth = minOverlap.overlap, minAxis = minOverlap.axis, normalX = minAxis.x, normalY = minAxis.y, deltaX = bodyB.position.x - bodyA.position.x, deltaY = bodyB.position.y - bodyA.position.y;
                if (normalX * deltaX + normalY * deltaY >= 0) {
                  normalX = -normalX;
                  normalY = -normalY;
                }
                normal.x = normalX;
                normal.y = normalY;
                tangent.x = -normalY;
                tangent.y = normalX;
                penetration.x = normalX * depth;
                penetration.y = normalY * depth;
                collision.depth = depth;
                var supportsB = Collision._findSupports(bodyA, bodyB, normal, 1), supportCount = 0;
                if (Vertices.contains(bodyA.vertices, supportsB[0])) {
                  supports[supportCount++] = supportsB[0];
                }
                if (Vertices.contains(bodyA.vertices, supportsB[1])) {
                  supports[supportCount++] = supportsB[1];
                }
                if (supportCount < 2) {
                  var supportsA = Collision._findSupports(bodyB, bodyA, normal, -1);
                  if (Vertices.contains(bodyB.vertices, supportsA[0])) {
                    supports[supportCount++] = supportsA[0];
                  }
                  if (supportCount < 2 && Vertices.contains(bodyB.vertices, supportsA[1])) {
                    supports[supportCount++] = supportsA[1];
                  }
                }
                if (supportCount === 0) {
                  supports[supportCount++] = supportsB[0];
                }
                collision.supportCount = supportCount;
                return collision;
              };
              Collision._overlapAxes = function(result, verticesA, verticesB, axes) {
                var verticesALength = verticesA.length, verticesBLength = verticesB.length, verticesAX = verticesA[0].x, verticesAY = verticesA[0].y, verticesBX = verticesB[0].x, verticesBY = verticesB[0].y, axesLength = axes.length, overlapMin = Number.MAX_VALUE, overlapAxisNumber = 0, overlap, overlapAB, overlapBA, dot, i, j;
                for (i = 0; i < axesLength; i++) {
                  var axis = axes[i], axisX = axis.x, axisY = axis.y, minA = verticesAX * axisX + verticesAY * axisY, minB = verticesBX * axisX + verticesBY * axisY, maxA = minA, maxB = minB;
                  for (j = 1; j < verticesALength; j += 1) {
                    dot = verticesA[j].x * axisX + verticesA[j].y * axisY;
                    if (dot > maxA) {
                      maxA = dot;
                    } else if (dot < minA) {
                      minA = dot;
                    }
                  }
                  for (j = 1; j < verticesBLength; j += 1) {
                    dot = verticesB[j].x * axisX + verticesB[j].y * axisY;
                    if (dot > maxB) {
                      maxB = dot;
                    } else if (dot < minB) {
                      minB = dot;
                    }
                  }
                  overlapAB = maxA - minB;
                  overlapBA = maxB - minA;
                  overlap = overlapAB < overlapBA ? overlapAB : overlapBA;
                  if (overlap < overlapMin) {
                    overlapMin = overlap;
                    overlapAxisNumber = i;
                    if (overlap <= 0) {
                      break;
                    }
                  }
                }
                result.axis = axes[overlapAxisNumber];
                result.overlap = overlapMin;
              };
              Collision._findSupports = function(bodyA, bodyB, normal, direction) {
                var vertices = bodyB.vertices, verticesLength = vertices.length, bodyAPositionX = bodyA.position.x, bodyAPositionY = bodyA.position.y, normalX = normal.x * direction, normalY = normal.y * direction, vertexA = vertices[0], vertexB = vertexA, nearestDistance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y), vertexC, distance, j;
                for (j = 1; j < verticesLength; j += 1) {
                  vertexB = vertices[j];
                  distance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y);
                  if (distance < nearestDistance) {
                    nearestDistance = distance;
                    vertexA = vertexB;
                  }
                }
                vertexC = vertices[(verticesLength + vertexA.index - 1) % verticesLength];
                nearestDistance = normalX * (bodyAPositionX - vertexC.x) + normalY * (bodyAPositionY - vertexC.y);
                vertexB = vertices[(vertexA.index + 1) % verticesLength];
                if (normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y) < nearestDistance) {
                  _supports[0] = vertexA;
                  _supports[1] = vertexB;
                  return _supports;
                }
                _supports[0] = vertexA;
                _supports[1] = vertexC;
                return _supports;
              };
            })();
          }),
          /* 9 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Pair = {};
            module2.exports = Pair;
            var Contact = __webpack_require__(16);
            (function() {
              Pair.create = function(collision, timestamp) {
                var bodyA = collision.bodyA, bodyB = collision.bodyB;
                var pair = {
                  id: Pair.id(bodyA, bodyB),
                  bodyA,
                  bodyB,
                  collision,
                  contacts: [Contact.create(), Contact.create()],
                  contactCount: 0,
                  separation: 0,
                  isActive: true,
                  isSensor: bodyA.isSensor || bodyB.isSensor,
                  timeCreated: timestamp,
                  timeUpdated: timestamp,
                  inverseMass: 0,
                  friction: 0,
                  frictionStatic: 0,
                  restitution: 0,
                  slop: 0
                };
                Pair.update(pair, collision, timestamp);
                return pair;
              };
              Pair.update = function(pair, collision, timestamp) {
                var supports = collision.supports, supportCount = collision.supportCount, contacts = pair.contacts, parentA = collision.parentA, parentB = collision.parentB;
                pair.isActive = true;
                pair.timeUpdated = timestamp;
                pair.collision = collision;
                pair.separation = collision.depth;
                pair.inverseMass = parentA.inverseMass + parentB.inverseMass;
                pair.friction = parentA.friction < parentB.friction ? parentA.friction : parentB.friction;
                pair.frictionStatic = parentA.frictionStatic > parentB.frictionStatic ? parentA.frictionStatic : parentB.frictionStatic;
                pair.restitution = parentA.restitution > parentB.restitution ? parentA.restitution : parentB.restitution;
                pair.slop = parentA.slop > parentB.slop ? parentA.slop : parentB.slop;
                pair.contactCount = supportCount;
                collision.pair = pair;
                var supportA = supports[0], contactA = contacts[0], supportB = supports[1], contactB = contacts[1];
                if (contactB.vertex === supportA || contactA.vertex === supportB) {
                  contacts[1] = contactA;
                  contacts[0] = contactA = contactB;
                  contactB = contacts[1];
                }
                contactA.vertex = supportA;
                contactB.vertex = supportB;
              };
              Pair.setActive = function(pair, isActive, timestamp) {
                if (isActive) {
                  pair.isActive = true;
                  pair.timeUpdated = timestamp;
                } else {
                  pair.isActive = false;
                  pair.contactCount = 0;
                }
              };
              Pair.id = function(bodyA, bodyB) {
                return bodyA.id < bodyB.id ? bodyA.id.toString(36) + ":" + bodyB.id.toString(36) : bodyB.id.toString(36) + ":" + bodyA.id.toString(36);
              };
            })();
          }),
          /* 10 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Constraint2 = {};
            module2.exports = Constraint2;
            var Vertices = __webpack_require__(3);
            var Vector = __webpack_require__(2);
            var Sleeping = __webpack_require__(7);
            var Bounds = __webpack_require__(1);
            var Axes = __webpack_require__(11);
            var Common = __webpack_require__(0);
            (function() {
              Constraint2._warming = 0.4;
              Constraint2._torqueDampen = 1;
              Constraint2._minLength = 1e-6;
              Constraint2.create = function(options) {
                var constraint = options;
                if (constraint.bodyA && !constraint.pointA)
                  constraint.pointA = { x: 0, y: 0 };
                if (constraint.bodyB && !constraint.pointB)
                  constraint.pointB = { x: 0, y: 0 };
                var initialPointA = constraint.bodyA ? Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA, initialPointB = constraint.bodyB ? Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB, length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));
                constraint.length = typeof constraint.length !== "undefined" ? constraint.length : length;
                constraint.id = constraint.id || Common.nextId();
                constraint.label = constraint.label || "Constraint";
                constraint.type = "constraint";
                constraint.stiffness = constraint.stiffness || (constraint.length > 0 ? 1 : 0.7);
                constraint.damping = constraint.damping || 0;
                constraint.angularStiffness = constraint.angularStiffness || 0;
                constraint.angleA = constraint.bodyA ? constraint.bodyA.angle : constraint.angleA;
                constraint.angleB = constraint.bodyB ? constraint.bodyB.angle : constraint.angleB;
                constraint.plugin = {};
                var render = {
                  visible: true,
                  lineWidth: 2,
                  strokeStyle: "#ffffff",
                  type: "line",
                  anchors: true
                };
                if (constraint.length === 0 && constraint.stiffness > 0.1) {
                  render.type = "pin";
                  render.anchors = false;
                } else if (constraint.stiffness < 0.9) {
                  render.type = "spring";
                }
                constraint.render = Common.extend(render, constraint.render);
                return constraint;
              };
              Constraint2.preSolveAll = function(bodies) {
                for (var i = 0; i < bodies.length; i += 1) {
                  var body = bodies[i], impulse = body.constraintImpulse;
                  if (body.isStatic || impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                    continue;
                  }
                  body.position.x += impulse.x;
                  body.position.y += impulse.y;
                  body.angle += impulse.angle;
                }
              };
              Constraint2.solveAll = function(constraints, delta) {
                var timeScale = Common.clamp(delta / Common._baseDelta, 0, 1);
                for (var i = 0; i < constraints.length; i += 1) {
                  var constraint = constraints[i], fixedA = !constraint.bodyA || constraint.bodyA && constraint.bodyA.isStatic, fixedB = !constraint.bodyB || constraint.bodyB && constraint.bodyB.isStatic;
                  if (fixedA || fixedB) {
                    Constraint2.solve(constraints[i], timeScale);
                  }
                }
                for (i = 0; i < constraints.length; i += 1) {
                  constraint = constraints[i];
                  fixedA = !constraint.bodyA || constraint.bodyA && constraint.bodyA.isStatic;
                  fixedB = !constraint.bodyB || constraint.bodyB && constraint.bodyB.isStatic;
                  if (!fixedA && !fixedB) {
                    Constraint2.solve(constraints[i], timeScale);
                  }
                }
              };
              Constraint2.solve = function(constraint, timeScale) {
                var bodyA = constraint.bodyA, bodyB = constraint.bodyB, pointA = constraint.pointA, pointB = constraint.pointB;
                if (!bodyA && !bodyB)
                  return;
                if (bodyA && !bodyA.isStatic) {
                  Vector.rotate(pointA, bodyA.angle - constraint.angleA, pointA);
                  constraint.angleA = bodyA.angle;
                }
                if (bodyB && !bodyB.isStatic) {
                  Vector.rotate(pointB, bodyB.angle - constraint.angleB, pointB);
                  constraint.angleB = bodyB.angle;
                }
                var pointAWorld = pointA, pointBWorld = pointB;
                if (bodyA) pointAWorld = Vector.add(bodyA.position, pointA);
                if (bodyB) pointBWorld = Vector.add(bodyB.position, pointB);
                if (!pointAWorld || !pointBWorld)
                  return;
                var delta = Vector.sub(pointAWorld, pointBWorld), currentLength = Vector.magnitude(delta);
                if (currentLength < Constraint2._minLength) {
                  currentLength = Constraint2._minLength;
                }
                var difference = (currentLength - constraint.length) / currentLength, isRigid = constraint.stiffness >= 1 || constraint.length === 0, stiffness = isRigid ? constraint.stiffness * timeScale : constraint.stiffness * timeScale * timeScale, damping = constraint.damping * timeScale, force = Vector.mult(delta, difference * stiffness), massTotal = (bodyA ? bodyA.inverseMass : 0) + (bodyB ? bodyB.inverseMass : 0), inertiaTotal = (bodyA ? bodyA.inverseInertia : 0) + (bodyB ? bodyB.inverseInertia : 0), resistanceTotal = massTotal + inertiaTotal, torque, share, normal, normalVelocity, relativeVelocity;
                if (damping > 0) {
                  var zero = Vector.create();
                  normal = Vector.div(delta, currentLength);
                  relativeVelocity = Vector.sub(
                    bodyB && Vector.sub(bodyB.position, bodyB.positionPrev) || zero,
                    bodyA && Vector.sub(bodyA.position, bodyA.positionPrev) || zero
                  );
                  normalVelocity = Vector.dot(normal, relativeVelocity);
                }
                if (bodyA && !bodyA.isStatic) {
                  share = bodyA.inverseMass / massTotal;
                  bodyA.constraintImpulse.x -= force.x * share;
                  bodyA.constraintImpulse.y -= force.y * share;
                  bodyA.position.x -= force.x * share;
                  bodyA.position.y -= force.y * share;
                  if (damping > 0) {
                    bodyA.positionPrev.x -= damping * normal.x * normalVelocity * share;
                    bodyA.positionPrev.y -= damping * normal.y * normalVelocity * share;
                  }
                  torque = Vector.cross(pointA, force) / resistanceTotal * Constraint2._torqueDampen * bodyA.inverseInertia * (1 - constraint.angularStiffness);
                  bodyA.constraintImpulse.angle -= torque;
                  bodyA.angle -= torque;
                }
                if (bodyB && !bodyB.isStatic) {
                  share = bodyB.inverseMass / massTotal;
                  bodyB.constraintImpulse.x += force.x * share;
                  bodyB.constraintImpulse.y += force.y * share;
                  bodyB.position.x += force.x * share;
                  bodyB.position.y += force.y * share;
                  if (damping > 0) {
                    bodyB.positionPrev.x += damping * normal.x * normalVelocity * share;
                    bodyB.positionPrev.y += damping * normal.y * normalVelocity * share;
                  }
                  torque = Vector.cross(pointB, force) / resistanceTotal * Constraint2._torqueDampen * bodyB.inverseInertia * (1 - constraint.angularStiffness);
                  bodyB.constraintImpulse.angle += torque;
                  bodyB.angle += torque;
                }
              };
              Constraint2.postSolveAll = function(bodies) {
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], impulse = body.constraintImpulse;
                  if (body.isStatic || impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                    continue;
                  }
                  Sleeping.set(body, false);
                  for (var j = 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    Vertices.translate(part.vertices, impulse);
                    if (j > 0) {
                      part.position.x += impulse.x;
                      part.position.y += impulse.y;
                    }
                    if (impulse.angle !== 0) {
                      Vertices.rotate(part.vertices, impulse.angle, body.position);
                      Axes.rotate(part.axes, impulse.angle);
                      if (j > 0) {
                        Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);
                      }
                    }
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                  }
                  impulse.angle *= Constraint2._warming;
                  impulse.x *= Constraint2._warming;
                  impulse.y *= Constraint2._warming;
                }
              };
              Constraint2.pointAWorld = function(constraint) {
                return {
                  x: (constraint.bodyA ? constraint.bodyA.position.x : 0) + (constraint.pointA ? constraint.pointA.x : 0),
                  y: (constraint.bodyA ? constraint.bodyA.position.y : 0) + (constraint.pointA ? constraint.pointA.y : 0)
                };
              };
              Constraint2.pointBWorld = function(constraint) {
                return {
                  x: (constraint.bodyB ? constraint.bodyB.position.x : 0) + (constraint.pointB ? constraint.pointB.x : 0),
                  y: (constraint.bodyB ? constraint.bodyB.position.y : 0) + (constraint.pointB ? constraint.pointB.y : 0)
                };
              };
              Constraint2.currentLength = function(constraint) {
                var pointAX = (constraint.bodyA ? constraint.bodyA.position.x : 0) + (constraint.pointA ? constraint.pointA.x : 0);
                var pointAY = (constraint.bodyA ? constraint.bodyA.position.y : 0) + (constraint.pointA ? constraint.pointA.y : 0);
                var pointBX = (constraint.bodyB ? constraint.bodyB.position.x : 0) + (constraint.pointB ? constraint.pointB.x : 0);
                var pointBY = (constraint.bodyB ? constraint.bodyB.position.y : 0) + (constraint.pointB ? constraint.pointB.y : 0);
                var deltaX = pointAX - pointBX;
                var deltaY = pointAY - pointBY;
                return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              };
            })();
          }),
          /* 11 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Axes = {};
            module2.exports = Axes;
            var Vector = __webpack_require__(2);
            var Common = __webpack_require__(0);
            (function() {
              Axes.fromVertices = function(vertices) {
                var axes = {};
                for (var i = 0; i < vertices.length; i++) {
                  var j = (i + 1) % vertices.length, normal = Vector.normalise({
                    x: vertices[j].y - vertices[i].y,
                    y: vertices[i].x - vertices[j].x
                  }), gradient = normal.y === 0 ? Infinity : normal.x / normal.y;
                  gradient = gradient.toFixed(3).toString();
                  axes[gradient] = normal;
                }
                return Common.values(axes);
              };
              Axes.rotate = function(axes, angle) {
                if (angle === 0)
                  return;
                var cos = Math.cos(angle), sin = Math.sin(angle);
                for (var i = 0; i < axes.length; i++) {
                  var axis = axes[i], xx;
                  xx = axis.x * cos - axis.y * sin;
                  axis.y = axis.x * sin + axis.y * cos;
                  axis.x = xx;
                }
              };
            })();
          }),
          /* 12 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Bodies2 = {};
            module2.exports = Bodies2;
            var Vertices = __webpack_require__(3);
            var Common = __webpack_require__(0);
            var Body2 = __webpack_require__(4);
            var Bounds = __webpack_require__(1);
            var Vector = __webpack_require__(2);
            (function() {
              Bodies2.rectangle = function(x, y, width, height, options) {
                options = options || {};
                var rectangle = {
                  label: "Rectangle Body",
                  position: { x, y },
                  vertices: Vertices.fromPath("L 0 0 L " + width + " 0 L " + width + " " + height + " L 0 " + height)
                };
                if (options.chamfer) {
                  var chamfer = options.chamfer;
                  rectangle.vertices = Vertices.chamfer(
                    rectangle.vertices,
                    chamfer.radius,
                    chamfer.quality,
                    chamfer.qualityMin,
                    chamfer.qualityMax
                  );
                  delete options.chamfer;
                }
                return Body2.create(Common.extend({}, rectangle, options));
              };
              Bodies2.trapezoid = function(x, y, width, height, slope, options) {
                options = options || {};
                if (slope >= 1) {
                  Common.warn("Bodies.trapezoid: slope parameter must be < 1.");
                }
                slope *= 0.5;
                var roof = (1 - slope * 2) * width;
                var x1 = width * slope, x2 = x1 + roof, x3 = x2 + x1, verticesPath;
                if (slope < 0.5) {
                  verticesPath = "L 0 0 L " + x1 + " " + -height + " L " + x2 + " " + -height + " L " + x3 + " 0";
                } else {
                  verticesPath = "L 0 0 L " + x2 + " " + -height + " L " + x3 + " 0";
                }
                var trapezoid = {
                  label: "Trapezoid Body",
                  position: { x, y },
                  vertices: Vertices.fromPath(verticesPath)
                };
                if (options.chamfer) {
                  var chamfer = options.chamfer;
                  trapezoid.vertices = Vertices.chamfer(
                    trapezoid.vertices,
                    chamfer.radius,
                    chamfer.quality,
                    chamfer.qualityMin,
                    chamfer.qualityMax
                  );
                  delete options.chamfer;
                }
                return Body2.create(Common.extend({}, trapezoid, options));
              };
              Bodies2.circle = function(x, y, radius, options, maxSides) {
                options = options || {};
                var circle = {
                  label: "Circle Body",
                  circleRadius: radius
                };
                maxSides = maxSides || 25;
                var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));
                if (sides % 2 === 1)
                  sides += 1;
                return Bodies2.polygon(x, y, sides, radius, Common.extend({}, circle, options));
              };
              Bodies2.polygon = function(x, y, sides, radius, options) {
                options = options || {};
                if (sides < 3)
                  return Bodies2.circle(x, y, radius, options);
                var theta = 2 * Math.PI / sides, path = "", offset = theta * 0.5;
                for (var i = 0; i < sides; i += 1) {
                  var angle = offset + i * theta, xx = Math.cos(angle) * radius, yy = Math.sin(angle) * radius;
                  path += "L " + xx.toFixed(3) + " " + yy.toFixed(3) + " ";
                }
                var polygon = {
                  label: "Polygon Body",
                  position: { x, y },
                  vertices: Vertices.fromPath(path)
                };
                if (options.chamfer) {
                  var chamfer = options.chamfer;
                  polygon.vertices = Vertices.chamfer(
                    polygon.vertices,
                    chamfer.radius,
                    chamfer.quality,
                    chamfer.qualityMin,
                    chamfer.qualityMax
                  );
                  delete options.chamfer;
                }
                return Body2.create(Common.extend({}, polygon, options));
              };
              Bodies2.fromVertices = function(x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea, removeDuplicatePoints) {
                var decomp = Common.getDecomp(), canDecomp, body, parts, isConvex, isConcave, vertices, i, j, k, v, z;
                canDecomp = Boolean(decomp && decomp.quickDecomp);
                options = options || {};
                parts = [];
                flagInternal = typeof flagInternal !== "undefined" ? flagInternal : false;
                removeCollinear = typeof removeCollinear !== "undefined" ? removeCollinear : 0.01;
                minimumArea = typeof minimumArea !== "undefined" ? minimumArea : 10;
                removeDuplicatePoints = typeof removeDuplicatePoints !== "undefined" ? removeDuplicatePoints : 0.01;
                if (!Common.isArray(vertexSets[0])) {
                  vertexSets = [vertexSets];
                }
                for (v = 0; v < vertexSets.length; v += 1) {
                  vertices = vertexSets[v];
                  isConvex = Vertices.isConvex(vertices);
                  isConcave = !isConvex;
                  if (isConcave && !canDecomp) {
                    Common.warnOnce(
                      "Bodies.fromVertices: Install the 'poly-decomp' library and use Common.setDecomp or provide 'decomp' as a global to decompose concave vertices."
                    );
                  }
                  if (isConvex || !canDecomp) {
                    if (isConvex) {
                      vertices = Vertices.clockwiseSort(vertices);
                    } else {
                      vertices = Vertices.hull(vertices);
                    }
                    parts.push({
                      position: { x, y },
                      vertices
                    });
                  } else {
                    var concave = vertices.map(function(vertex) {
                      return [vertex.x, vertex.y];
                    });
                    decomp.makeCCW(concave);
                    if (removeCollinear !== false)
                      decomp.removeCollinearPoints(concave, removeCollinear);
                    if (removeDuplicatePoints !== false && decomp.removeDuplicatePoints)
                      decomp.removeDuplicatePoints(concave, removeDuplicatePoints);
                    var decomposed = decomp.quickDecomp(concave);
                    for (i = 0; i < decomposed.length; i++) {
                      var chunk = decomposed[i];
                      var chunkVertices = chunk.map(function(vertices2) {
                        return {
                          x: vertices2[0],
                          y: vertices2[1]
                        };
                      });
                      if (minimumArea > 0 && Vertices.area(chunkVertices) < minimumArea)
                        continue;
                      parts.push({
                        position: Vertices.centre(chunkVertices),
                        vertices: chunkVertices
                      });
                    }
                  }
                }
                for (i = 0; i < parts.length; i++) {
                  parts[i] = Body2.create(Common.extend(parts[i], options));
                }
                if (flagInternal) {
                  var coincident_max_dist = 5;
                  for (i = 0; i < parts.length; i++) {
                    var partA = parts[i];
                    for (j = i + 1; j < parts.length; j++) {
                      var partB = parts[j];
                      if (Bounds.overlaps(partA.bounds, partB.bounds)) {
                        var pav = partA.vertices, pbv = partB.vertices;
                        for (k = 0; k < partA.vertices.length; k++) {
                          for (z = 0; z < partB.vertices.length; z++) {
                            var da = Vector.magnitudeSquared(Vector.sub(pav[(k + 1) % pav.length], pbv[z])), db = Vector.magnitudeSquared(Vector.sub(pav[k], pbv[(z + 1) % pbv.length]));
                            if (da < coincident_max_dist && db < coincident_max_dist) {
                              pav[k].isInternal = true;
                              pbv[z].isInternal = true;
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (parts.length > 1) {
                  body = Body2.create(Common.extend({ parts: parts.slice(0) }, options));
                  Body2.setPosition(body, { x, y });
                  return body;
                } else {
                  return parts[0];
                }
              };
            })();
          }),
          /* 13 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Detector = {};
            module2.exports = Detector;
            var Common = __webpack_require__(0);
            var Collision = __webpack_require__(8);
            (function() {
              Detector.create = function(options) {
                var defaults = {
                  bodies: [],
                  collisions: [],
                  pairs: null
                };
                return Common.extend(defaults, options);
              };
              Detector.setBodies = function(detector, bodies) {
                detector.bodies = bodies.slice(0);
              };
              Detector.clear = function(detector) {
                detector.bodies = [];
                detector.collisions = [];
              };
              Detector.collisions = function(detector) {
                var pairs = detector.pairs, bodies = detector.bodies, bodiesLength = bodies.length, canCollide = Detector.canCollide, collides = Collision.collides, collisions = detector.collisions, collisionIndex = 0, i, j;
                bodies.sort(Detector._compareBoundsX);
                for (i = 0; i < bodiesLength; i++) {
                  var bodyA = bodies[i], boundsA = bodyA.bounds, boundXMax = bodyA.bounds.max.x, boundYMax = bodyA.bounds.max.y, boundYMin = bodyA.bounds.min.y, bodyAStatic = bodyA.isStatic || bodyA.isSleeping, partsALength = bodyA.parts.length, partsASingle = partsALength === 1;
                  for (j = i + 1; j < bodiesLength; j++) {
                    var bodyB = bodies[j], boundsB = bodyB.bounds;
                    if (boundsB.min.x > boundXMax) {
                      break;
                    }
                    if (boundYMax < boundsB.min.y || boundYMin > boundsB.max.y) {
                      continue;
                    }
                    if (bodyAStatic && (bodyB.isStatic || bodyB.isSleeping)) {
                      continue;
                    }
                    if (!canCollide(bodyA.collisionFilter, bodyB.collisionFilter)) {
                      continue;
                    }
                    var partsBLength = bodyB.parts.length;
                    if (partsASingle && partsBLength === 1) {
                      var collision = collides(bodyA, bodyB, pairs);
                      if (collision) {
                        collisions[collisionIndex++] = collision;
                      }
                    } else {
                      var partsAStart = partsALength > 1 ? 1 : 0, partsBStart = partsBLength > 1 ? 1 : 0;
                      for (var k = partsAStart; k < partsALength; k++) {
                        var partA = bodyA.parts[k], boundsA = partA.bounds;
                        for (var z = partsBStart; z < partsBLength; z++) {
                          var partB = bodyB.parts[z], boundsB = partB.bounds;
                          if (boundsA.min.x > boundsB.max.x || boundsA.max.x < boundsB.min.x || boundsA.max.y < boundsB.min.y || boundsA.min.y > boundsB.max.y) {
                            continue;
                          }
                          var collision = collides(partA, partB, pairs);
                          if (collision) {
                            collisions[collisionIndex++] = collision;
                          }
                        }
                      }
                    }
                  }
                }
                if (collisions.length !== collisionIndex) {
                  collisions.length = collisionIndex;
                }
                return collisions;
              };
              Detector.canCollide = function(filterA, filterB) {
                if (filterA.group === filterB.group && filterA.group !== 0)
                  return filterA.group > 0;
                return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
              };
              Detector._compareBoundsX = function(bodyA, bodyB) {
                return bodyA.bounds.min.x - bodyB.bounds.min.x;
              };
            })();
          }),
          /* 14 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Mouse = {};
            module2.exports = Mouse;
            var Common = __webpack_require__(0);
            (function() {
              Mouse.create = function(element) {
                var mouse = {};
                if (!element) {
                  Common.log("Mouse.create: element was undefined, defaulting to document.body", "warn");
                }
                mouse.element = element || document.body;
                mouse.absolute = { x: 0, y: 0 };
                mouse.position = { x: 0, y: 0 };
                mouse.mousedownPosition = { x: 0, y: 0 };
                mouse.mouseupPosition = { x: 0, y: 0 };
                mouse.offset = { x: 0, y: 0 };
                mouse.scale = { x: 1, y: 1 };
                mouse.wheelDelta = 0;
                mouse.button = -1;
                mouse.pixelRatio = parseInt(mouse.element.getAttribute("data-pixel-ratio"), 10) || 1;
                mouse.sourceEvents = {
                  mousemove: null,
                  mousedown: null,
                  mouseup: null,
                  mousewheel: null
                };
                mouse.mousemove = function(event) {
                  var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                  if (touches) {
                    mouse.button = 0;
                    event.preventDefault();
                  }
                  mouse.absolute.x = position.x;
                  mouse.absolute.y = position.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                  mouse.sourceEvents.mousemove = event;
                };
                mouse.mousedown = function(event) {
                  var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                  if (touches) {
                    mouse.button = 0;
                    event.preventDefault();
                  } else {
                    mouse.button = event.button;
                  }
                  mouse.absolute.x = position.x;
                  mouse.absolute.y = position.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                  mouse.mousedownPosition.x = mouse.position.x;
                  mouse.mousedownPosition.y = mouse.position.y;
                  mouse.sourceEvents.mousedown = event;
                };
                mouse.mouseup = function(event) {
                  var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                  if (touches) {
                    event.preventDefault();
                  }
                  mouse.button = -1;
                  mouse.absolute.x = position.x;
                  mouse.absolute.y = position.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                  mouse.mouseupPosition.x = mouse.position.x;
                  mouse.mouseupPosition.y = mouse.position.y;
                  mouse.sourceEvents.mouseup = event;
                };
                mouse.mousewheel = function(event) {
                  mouse.wheelDelta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
                  event.preventDefault();
                  mouse.sourceEvents.mousewheel = event;
                };
                Mouse.setElement(mouse, mouse.element);
                return mouse;
              };
              Mouse.setElement = function(mouse, element) {
                mouse.element = element;
                element.addEventListener("mousemove", mouse.mousemove, { passive: true });
                element.addEventListener("mousedown", mouse.mousedown, { passive: true });
                element.addEventListener("mouseup", mouse.mouseup, { passive: true });
                element.addEventListener("wheel", mouse.mousewheel, { passive: false });
                element.addEventListener("touchmove", mouse.mousemove, { passive: false });
                element.addEventListener("touchstart", mouse.mousedown, { passive: false });
                element.addEventListener("touchend", mouse.mouseup, { passive: false });
              };
              Mouse.clearSourceEvents = function(mouse) {
                mouse.sourceEvents.mousemove = null;
                mouse.sourceEvents.mousedown = null;
                mouse.sourceEvents.mouseup = null;
                mouse.sourceEvents.mousewheel = null;
                mouse.wheelDelta = 0;
              };
              Mouse.setOffset = function(mouse, offset) {
                mouse.offset.x = offset.x;
                mouse.offset.y = offset.y;
                mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
              };
              Mouse.setScale = function(mouse, scale) {
                mouse.scale.x = scale.x;
                mouse.scale.y = scale.y;
                mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
              };
              Mouse._getRelativeMousePosition = function(event, element, pixelRatio) {
                var elementBounds = element.getBoundingClientRect(), rootNode = document.documentElement || document.body.parentNode || document.body, scrollX = window.pageXOffset !== void 0 ? window.pageXOffset : rootNode.scrollLeft, scrollY = window.pageYOffset !== void 0 ? window.pageYOffset : rootNode.scrollTop, touches = event.changedTouches, x, y;
                if (touches) {
                  x = touches[0].pageX - elementBounds.left - scrollX;
                  y = touches[0].pageY - elementBounds.top - scrollY;
                } else {
                  x = event.pageX - elementBounds.left - scrollX;
                  y = event.pageY - elementBounds.top - scrollY;
                }
                return {
                  x: x / (element.clientWidth / (element.width || element.clientWidth) * pixelRatio),
                  y: y / (element.clientHeight / (element.height || element.clientHeight) * pixelRatio)
                };
              };
            })();
          }),
          /* 15 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Plugin = {};
            module2.exports = Plugin;
            var Common = __webpack_require__(0);
            (function() {
              Plugin._registry = {};
              Plugin.register = function(plugin) {
                if (!Plugin.isPlugin(plugin)) {
                  Common.warn("Plugin.register:", Plugin.toString(plugin), "does not implement all required fields.");
                }
                if (plugin.name in Plugin._registry) {
                  var registered = Plugin._registry[plugin.name], pluginVersion = Plugin.versionParse(plugin.version).number, registeredVersion = Plugin.versionParse(registered.version).number;
                  if (pluginVersion > registeredVersion) {
                    Common.warn("Plugin.register:", Plugin.toString(registered), "was upgraded to", Plugin.toString(plugin));
                    Plugin._registry[plugin.name] = plugin;
                  } else if (pluginVersion < registeredVersion) {
                    Common.warn("Plugin.register:", Plugin.toString(registered), "can not be downgraded to", Plugin.toString(plugin));
                  } else if (plugin !== registered) {
                    Common.warn("Plugin.register:", Plugin.toString(plugin), "is already registered to different plugin object");
                  }
                } else {
                  Plugin._registry[plugin.name] = plugin;
                }
                return plugin;
              };
              Plugin.resolve = function(dependency) {
                return Plugin._registry[Plugin.dependencyParse(dependency).name];
              };
              Plugin.toString = function(plugin) {
                return typeof plugin === "string" ? plugin : (plugin.name || "anonymous") + "@" + (plugin.version || plugin.range || "0.0.0");
              };
              Plugin.isPlugin = function(obj) {
                return obj && obj.name && obj.version && obj.install;
              };
              Plugin.isUsed = function(module3, name) {
                return module3.used.indexOf(name) > -1;
              };
              Plugin.isFor = function(plugin, module3) {
                var parsed = plugin.for && Plugin.dependencyParse(plugin.for);
                return !plugin.for || module3.name === parsed.name && Plugin.versionSatisfies(module3.version, parsed.range);
              };
              Plugin.use = function(module3, plugins) {
                module3.uses = (module3.uses || []).concat(plugins || []);
                if (module3.uses.length === 0) {
                  Common.warn("Plugin.use:", Plugin.toString(module3), "does not specify any dependencies to install.");
                  return;
                }
                var dependencies = Plugin.dependencies(module3), sortedDependencies = Common.topologicalSort(dependencies), status = [];
                for (var i = 0; i < sortedDependencies.length; i += 1) {
                  if (sortedDependencies[i] === module3.name) {
                    continue;
                  }
                  var plugin = Plugin.resolve(sortedDependencies[i]);
                  if (!plugin) {
                    status.push("\u274C " + sortedDependencies[i]);
                    continue;
                  }
                  if (Plugin.isUsed(module3, plugin.name)) {
                    continue;
                  }
                  if (!Plugin.isFor(plugin, module3)) {
                    Common.warn("Plugin.use:", Plugin.toString(plugin), "is for", plugin.for, "but installed on", Plugin.toString(module3) + ".");
                    plugin._warned = true;
                  }
                  if (plugin.install) {
                    plugin.install(module3);
                  } else {
                    Common.warn("Plugin.use:", Plugin.toString(plugin), "does not specify an install function.");
                    plugin._warned = true;
                  }
                  if (plugin._warned) {
                    status.push("\u{1F536} " + Plugin.toString(plugin));
                    delete plugin._warned;
                  } else {
                    status.push("\u2705 " + Plugin.toString(plugin));
                  }
                  module3.used.push(plugin.name);
                }
                if (status.length > 0) {
                  Common.info(status.join("  "));
                }
              };
              Plugin.dependencies = function(module3, tracked) {
                var parsedBase = Plugin.dependencyParse(module3), name = parsedBase.name;
                tracked = tracked || {};
                if (name in tracked) {
                  return;
                }
                module3 = Plugin.resolve(module3) || module3;
                tracked[name] = Common.map(module3.uses || [], function(dependency) {
                  if (Plugin.isPlugin(dependency)) {
                    Plugin.register(dependency);
                  }
                  var parsed = Plugin.dependencyParse(dependency), resolved = Plugin.resolve(dependency);
                  if (resolved && !Plugin.versionSatisfies(resolved.version, parsed.range)) {
                    Common.warn(
                      "Plugin.dependencies:",
                      Plugin.toString(resolved),
                      "does not satisfy",
                      Plugin.toString(parsed),
                      "used by",
                      Plugin.toString(parsedBase) + "."
                    );
                    resolved._warned = true;
                    module3._warned = true;
                  } else if (!resolved) {
                    Common.warn(
                      "Plugin.dependencies:",
                      Plugin.toString(dependency),
                      "used by",
                      Plugin.toString(parsedBase),
                      "could not be resolved."
                    );
                    module3._warned = true;
                  }
                  return parsed.name;
                });
                for (var i = 0; i < tracked[name].length; i += 1) {
                  Plugin.dependencies(tracked[name][i], tracked);
                }
                return tracked;
              };
              Plugin.dependencyParse = function(dependency) {
                if (Common.isString(dependency)) {
                  var pattern = /^[\w-]+(@(\*|[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-+]+)?))?$/;
                  if (!pattern.test(dependency)) {
                    Common.warn("Plugin.dependencyParse:", dependency, "is not a valid dependency string.");
                  }
                  return {
                    name: dependency.split("@")[0],
                    range: dependency.split("@")[1] || "*"
                  };
                }
                return {
                  name: dependency.name,
                  range: dependency.range || dependency.version
                };
              };
              Plugin.versionParse = function(range) {
                var pattern = /^(\*)|(\^|~|>=|>)?\s*((\d+)\.(\d+)\.(\d+))(-[0-9A-Za-z-+]+)?$/;
                if (!pattern.test(range)) {
                  Common.warn("Plugin.versionParse:", range, "is not a valid version or range.");
                }
                var parts = pattern.exec(range);
                var major = Number(parts[4]);
                var minor = Number(parts[5]);
                var patch = Number(parts[6]);
                return {
                  isRange: Boolean(parts[1] || parts[2]),
                  version: parts[3],
                  range,
                  operator: parts[1] || parts[2] || "",
                  major,
                  minor,
                  patch,
                  parts: [major, minor, patch],
                  prerelease: parts[7],
                  number: major * 1e8 + minor * 1e4 + patch
                };
              };
              Plugin.versionSatisfies = function(version, range) {
                range = range || "*";
                var r = Plugin.versionParse(range), v = Plugin.versionParse(version);
                if (r.isRange) {
                  if (r.operator === "*" || version === "*") {
                    return true;
                  }
                  if (r.operator === ">") {
                    return v.number > r.number;
                  }
                  if (r.operator === ">=") {
                    return v.number >= r.number;
                  }
                  if (r.operator === "~") {
                    return v.major === r.major && v.minor === r.minor && v.patch >= r.patch;
                  }
                  if (r.operator === "^") {
                    if (r.major > 0) {
                      return v.major === r.major && v.number >= r.number;
                    }
                    if (r.minor > 0) {
                      return v.minor === r.minor && v.patch >= r.patch;
                    }
                    return v.patch === r.patch;
                  }
                }
                return version === range || version === "*";
              };
            })();
          }),
          /* 16 */
          /***/
          (function(module2, exports2) {
            var Contact = {};
            module2.exports = Contact;
            (function() {
              Contact.create = function(vertex) {
                return {
                  vertex,
                  normalImpulse: 0,
                  tangentImpulse: 0
                };
              };
            })();
          }),
          /* 17 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Engine2 = {};
            module2.exports = Engine2;
            var Sleeping = __webpack_require__(7);
            var Resolver = __webpack_require__(18);
            var Detector = __webpack_require__(13);
            var Pairs = __webpack_require__(19);
            var Events2 = __webpack_require__(5);
            var Composite2 = __webpack_require__(6);
            var Constraint2 = __webpack_require__(10);
            var Common = __webpack_require__(0);
            var Body2 = __webpack_require__(4);
            (function() {
              Engine2._deltaMax = 1e3 / 60;
              Engine2.create = function(options) {
                options = options || {};
                var defaults = {
                  positionIterations: 6,
                  velocityIterations: 4,
                  constraintIterations: 2,
                  enableSleeping: false,
                  events: [],
                  plugin: {},
                  gravity: {
                    x: 0,
                    y: 1,
                    scale: 1e-3
                  },
                  timing: {
                    timestamp: 0,
                    timeScale: 1,
                    lastDelta: 0,
                    lastElapsed: 0,
                    lastUpdatesPerFrame: 0
                  }
                };
                var engine = Common.extend(defaults, options);
                engine.world = options.world || Composite2.create({ label: "World" });
                engine.pairs = options.pairs || Pairs.create();
                engine.detector = options.detector || Detector.create();
                engine.detector.pairs = engine.pairs;
                engine.grid = { buckets: [] };
                engine.world.gravity = engine.gravity;
                engine.broadphase = engine.grid;
                engine.metrics = {};
                return engine;
              };
              Engine2.update = function(engine, delta) {
                var startTime = Common.now();
                var world = engine.world, detector = engine.detector, pairs = engine.pairs, timing = engine.timing, timestamp = timing.timestamp, i;
                if (delta > Engine2._deltaMax) {
                  Common.warnOnce(
                    "Matter.Engine.update: delta argument is recommended to be less than or equal to",
                    Engine2._deltaMax.toFixed(3),
                    "ms."
                  );
                }
                delta = typeof delta !== "undefined" ? delta : Common._baseDelta;
                delta *= timing.timeScale;
                timing.timestamp += delta;
                timing.lastDelta = delta;
                var event = {
                  timestamp: timing.timestamp,
                  delta
                };
                Events2.trigger(engine, "beforeUpdate", event);
                var allBodies = Composite2.allBodies(world), allConstraints = Composite2.allConstraints(world);
                if (world.isModified) {
                  Detector.setBodies(detector, allBodies);
                  Composite2.setModified(world, false, false, true);
                }
                if (engine.enableSleeping)
                  Sleeping.update(allBodies, delta);
                Engine2._bodiesApplyGravity(allBodies, engine.gravity);
                if (delta > 0) {
                  Engine2._bodiesUpdate(allBodies, delta);
                }
                Events2.trigger(engine, "beforeSolve", event);
                Constraint2.preSolveAll(allBodies);
                for (i = 0; i < engine.constraintIterations; i++) {
                  Constraint2.solveAll(allConstraints, delta);
                }
                Constraint2.postSolveAll(allBodies);
                var collisions = Detector.collisions(detector);
                Pairs.update(pairs, collisions, timestamp);
                if (engine.enableSleeping)
                  Sleeping.afterCollisions(pairs.list);
                if (pairs.collisionStart.length > 0) {
                  Events2.trigger(engine, "collisionStart", {
                    pairs: pairs.collisionStart,
                    timestamp: timing.timestamp,
                    delta
                  });
                }
                var positionDamping = Common.clamp(20 / engine.positionIterations, 0, 1);
                Resolver.preSolvePosition(pairs.list);
                for (i = 0; i < engine.positionIterations; i++) {
                  Resolver.solvePosition(pairs.list, delta, positionDamping);
                }
                Resolver.postSolvePosition(allBodies);
                Constraint2.preSolveAll(allBodies);
                for (i = 0; i < engine.constraintIterations; i++) {
                  Constraint2.solveAll(allConstraints, delta);
                }
                Constraint2.postSolveAll(allBodies);
                Resolver.preSolveVelocity(pairs.list);
                for (i = 0; i < engine.velocityIterations; i++) {
                  Resolver.solveVelocity(pairs.list, delta);
                }
                Engine2._bodiesUpdateVelocities(allBodies);
                if (pairs.collisionActive.length > 0) {
                  Events2.trigger(engine, "collisionActive", {
                    pairs: pairs.collisionActive,
                    timestamp: timing.timestamp,
                    delta
                  });
                }
                if (pairs.collisionEnd.length > 0) {
                  Events2.trigger(engine, "collisionEnd", {
                    pairs: pairs.collisionEnd,
                    timestamp: timing.timestamp,
                    delta
                  });
                }
                Engine2._bodiesClearForces(allBodies);
                Events2.trigger(engine, "afterUpdate", event);
                engine.timing.lastElapsed = Common.now() - startTime;
                return engine;
              };
              Engine2.merge = function(engineA, engineB) {
                Common.extend(engineA, engineB);
                if (engineB.world) {
                  engineA.world = engineB.world;
                  Engine2.clear(engineA);
                  var bodies = Composite2.allBodies(engineA.world);
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    Sleeping.set(body, false);
                    body.id = Common.nextId();
                  }
                }
              };
              Engine2.clear = function(engine) {
                Pairs.clear(engine.pairs);
                Detector.clear(engine.detector);
              };
              Engine2._bodiesClearForces = function(bodies) {
                var bodiesLength = bodies.length;
                for (var i = 0; i < bodiesLength; i++) {
                  var body = bodies[i];
                  body.force.x = 0;
                  body.force.y = 0;
                  body.torque = 0;
                }
              };
              Engine2._bodiesApplyGravity = function(bodies, gravity) {
                var gravityScale = typeof gravity.scale !== "undefined" ? gravity.scale : 1e-3, bodiesLength = bodies.length;
                if (gravity.x === 0 && gravity.y === 0 || gravityScale === 0) {
                  return;
                }
                for (var i = 0; i < bodiesLength; i++) {
                  var body = bodies[i];
                  if (body.isStatic || body.isSleeping)
                    continue;
                  body.force.y += body.mass * gravity.y * gravityScale;
                  body.force.x += body.mass * gravity.x * gravityScale;
                }
              };
              Engine2._bodiesUpdate = function(bodies, delta) {
                var bodiesLength = bodies.length;
                for (var i = 0; i < bodiesLength; i++) {
                  var body = bodies[i];
                  if (body.isStatic || body.isSleeping)
                    continue;
                  Body2.update(body, delta);
                }
              };
              Engine2._bodiesUpdateVelocities = function(bodies) {
                var bodiesLength = bodies.length;
                for (var i = 0; i < bodiesLength; i++) {
                  Body2.updateVelocities(bodies[i]);
                }
              };
            })();
          }),
          /* 18 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Resolver = {};
            module2.exports = Resolver;
            var Vertices = __webpack_require__(3);
            var Common = __webpack_require__(0);
            var Bounds = __webpack_require__(1);
            (function() {
              Resolver._restingThresh = 2;
              Resolver._restingThreshTangent = Math.sqrt(6);
              Resolver._positionDampen = 0.9;
              Resolver._positionWarming = 0.8;
              Resolver._frictionNormalMultiplier = 5;
              Resolver._frictionMaxStatic = Number.MAX_VALUE;
              Resolver.preSolvePosition = function(pairs) {
                var i, pair, contactCount, pairsLength = pairs.length;
                for (i = 0; i < pairsLength; i++) {
                  pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  contactCount = pair.contactCount;
                  pair.collision.parentA.totalContacts += contactCount;
                  pair.collision.parentB.totalContacts += contactCount;
                }
              };
              Resolver.solvePosition = function(pairs, delta, damping) {
                var i, pair, collision, bodyA, bodyB, normal, contactShare, positionImpulse, positionDampen = Resolver._positionDampen * (damping || 1), slopDampen = Common.clamp(delta / Common._baseDelta, 0, 1), pairsLength = pairs.length;
                for (i = 0; i < pairsLength; i++) {
                  pair = pairs[i];
                  if (!pair.isActive || pair.isSensor)
                    continue;
                  collision = pair.collision;
                  bodyA = collision.parentA;
                  bodyB = collision.parentB;
                  normal = collision.normal;
                  pair.separation = collision.depth + normal.x * (bodyB.positionImpulse.x - bodyA.positionImpulse.x) + normal.y * (bodyB.positionImpulse.y - bodyA.positionImpulse.y);
                }
                for (i = 0; i < pairsLength; i++) {
                  pair = pairs[i];
                  if (!pair.isActive || pair.isSensor)
                    continue;
                  collision = pair.collision;
                  bodyA = collision.parentA;
                  bodyB = collision.parentB;
                  normal = collision.normal;
                  positionImpulse = pair.separation - pair.slop * slopDampen;
                  if (bodyA.isStatic || bodyB.isStatic)
                    positionImpulse *= 2;
                  if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    contactShare = positionDampen / bodyA.totalContacts;
                    bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;
                    bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;
                  }
                  if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    contactShare = positionDampen / bodyB.totalContacts;
                    bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;
                    bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;
                  }
                }
              };
              Resolver.postSolvePosition = function(bodies) {
                var positionWarming = Resolver._positionWarming, bodiesLength = bodies.length, verticesTranslate = Vertices.translate, boundsUpdate = Bounds.update;
                for (var i = 0; i < bodiesLength; i++) {
                  var body = bodies[i], positionImpulse = body.positionImpulse, positionImpulseX = positionImpulse.x, positionImpulseY = positionImpulse.y, velocity = body.velocity;
                  body.totalContacts = 0;
                  if (positionImpulseX !== 0 || positionImpulseY !== 0) {
                    for (var j = 0; j < body.parts.length; j++) {
                      var part = body.parts[j];
                      verticesTranslate(part.vertices, positionImpulse);
                      boundsUpdate(part.bounds, part.vertices, velocity);
                      part.position.x += positionImpulseX;
                      part.position.y += positionImpulseY;
                    }
                    body.positionPrev.x += positionImpulseX;
                    body.positionPrev.y += positionImpulseY;
                    if (positionImpulseX * velocity.x + positionImpulseY * velocity.y < 0) {
                      positionImpulse.x = 0;
                      positionImpulse.y = 0;
                    } else {
                      positionImpulse.x *= positionWarming;
                      positionImpulse.y *= positionWarming;
                    }
                  }
                }
              };
              Resolver.preSolveVelocity = function(pairs) {
                var pairsLength = pairs.length, i, j;
                for (i = 0; i < pairsLength; i++) {
                  var pair = pairs[i];
                  if (!pair.isActive || pair.isSensor)
                    continue;
                  var contacts = pair.contacts, contactCount = pair.contactCount, collision = pair.collision, bodyA = collision.parentA, bodyB = collision.parentB, normal = collision.normal, tangent = collision.tangent;
                  for (j = 0; j < contactCount; j++) {
                    var contact = contacts[j], contactVertex = contact.vertex, normalImpulse = contact.normalImpulse, tangentImpulse = contact.tangentImpulse;
                    if (normalImpulse !== 0 || tangentImpulse !== 0) {
                      var impulseX = normal.x * normalImpulse + tangent.x * tangentImpulse, impulseY = normal.y * normalImpulse + tangent.y * tangentImpulse;
                      if (!(bodyA.isStatic || bodyA.isSleeping)) {
                        bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                        bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                        bodyA.anglePrev += bodyA.inverseInertia * ((contactVertex.x - bodyA.position.x) * impulseY - (contactVertex.y - bodyA.position.y) * impulseX);
                      }
                      if (!(bodyB.isStatic || bodyB.isSleeping)) {
                        bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                        bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                        bodyB.anglePrev -= bodyB.inverseInertia * ((contactVertex.x - bodyB.position.x) * impulseY - (contactVertex.y - bodyB.position.y) * impulseX);
                      }
                    }
                  }
                }
              };
              Resolver.solveVelocity = function(pairs, delta) {
                var timeScale = delta / Common._baseDelta, timeScaleSquared = timeScale * timeScale, timeScaleCubed = timeScaleSquared * timeScale, restingThresh = -Resolver._restingThresh * timeScale, restingThreshTangent = Resolver._restingThreshTangent, frictionNormalMultiplier = Resolver._frictionNormalMultiplier * timeScale, frictionMaxStatic = Resolver._frictionMaxStatic, pairsLength = pairs.length, tangentImpulse, maxFriction, i, j;
                for (i = 0; i < pairsLength; i++) {
                  var pair = pairs[i];
                  if (!pair.isActive || pair.isSensor)
                    continue;
                  var collision = pair.collision, bodyA = collision.parentA, bodyB = collision.parentB, normalX = collision.normal.x, normalY = collision.normal.y, tangentX = collision.tangent.x, tangentY = collision.tangent.y, inverseMassTotal = pair.inverseMass, friction = pair.friction * pair.frictionStatic * frictionNormalMultiplier, contacts = pair.contacts, contactCount = pair.contactCount, contactShare = 1 / contactCount;
                  var bodyAVelocityX = bodyA.position.x - bodyA.positionPrev.x, bodyAVelocityY = bodyA.position.y - bodyA.positionPrev.y, bodyAAngularVelocity = bodyA.angle - bodyA.anglePrev, bodyBVelocityX = bodyB.position.x - bodyB.positionPrev.x, bodyBVelocityY = bodyB.position.y - bodyB.positionPrev.y, bodyBAngularVelocity = bodyB.angle - bodyB.anglePrev;
                  for (j = 0; j < contactCount; j++) {
                    var contact = contacts[j], contactVertex = contact.vertex;
                    var offsetAX = contactVertex.x - bodyA.position.x, offsetAY = contactVertex.y - bodyA.position.y, offsetBX = contactVertex.x - bodyB.position.x, offsetBY = contactVertex.y - bodyB.position.y;
                    var velocityPointAX = bodyAVelocityX - offsetAY * bodyAAngularVelocity, velocityPointAY = bodyAVelocityY + offsetAX * bodyAAngularVelocity, velocityPointBX = bodyBVelocityX - offsetBY * bodyBAngularVelocity, velocityPointBY = bodyBVelocityY + offsetBX * bodyBAngularVelocity;
                    var relativeVelocityX = velocityPointAX - velocityPointBX, relativeVelocityY = velocityPointAY - velocityPointBY;
                    var normalVelocity = normalX * relativeVelocityX + normalY * relativeVelocityY, tangentVelocity = tangentX * relativeVelocityX + tangentY * relativeVelocityY;
                    var normalOverlap = pair.separation + normalVelocity;
                    var normalForce = Math.min(normalOverlap, 1);
                    normalForce = normalOverlap < 0 ? 0 : normalForce;
                    var frictionLimit = normalForce * friction;
                    if (tangentVelocity < -frictionLimit || tangentVelocity > frictionLimit) {
                      maxFriction = tangentVelocity > 0 ? tangentVelocity : -tangentVelocity;
                      tangentImpulse = pair.friction * (tangentVelocity > 0 ? 1 : -1) * timeScaleCubed;
                      if (tangentImpulse < -maxFriction) {
                        tangentImpulse = -maxFriction;
                      } else if (tangentImpulse > maxFriction) {
                        tangentImpulse = maxFriction;
                      }
                    } else {
                      tangentImpulse = tangentVelocity;
                      maxFriction = frictionMaxStatic;
                    }
                    var oAcN = offsetAX * normalY - offsetAY * normalX, oBcN = offsetBX * normalY - offsetBY * normalX, share = contactShare / (inverseMassTotal + bodyA.inverseInertia * oAcN * oAcN + bodyB.inverseInertia * oBcN * oBcN);
                    var normalImpulse = (1 + pair.restitution) * normalVelocity * share;
                    tangentImpulse *= share;
                    if (normalVelocity < restingThresh) {
                      contact.normalImpulse = 0;
                    } else {
                      var contactNormalImpulse = contact.normalImpulse;
                      contact.normalImpulse += normalImpulse;
                      if (contact.normalImpulse > 0) contact.normalImpulse = 0;
                      normalImpulse = contact.normalImpulse - contactNormalImpulse;
                    }
                    if (tangentVelocity < -restingThreshTangent || tangentVelocity > restingThreshTangent) {
                      contact.tangentImpulse = 0;
                    } else {
                      var contactTangentImpulse = contact.tangentImpulse;
                      contact.tangentImpulse += tangentImpulse;
                      if (contact.tangentImpulse < -maxFriction) contact.tangentImpulse = -maxFriction;
                      if (contact.tangentImpulse > maxFriction) contact.tangentImpulse = maxFriction;
                      tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                    }
                    var impulseX = normalX * normalImpulse + tangentX * tangentImpulse, impulseY = normalY * normalImpulse + tangentY * tangentImpulse;
                    if (!(bodyA.isStatic || bodyA.isSleeping)) {
                      bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                      bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                      bodyA.anglePrev += (offsetAX * impulseY - offsetAY * impulseX) * bodyA.inverseInertia;
                    }
                    if (!(bodyB.isStatic || bodyB.isSleeping)) {
                      bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                      bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                      bodyB.anglePrev -= (offsetBX * impulseY - offsetBY * impulseX) * bodyB.inverseInertia;
                    }
                  }
                }
              };
            })();
          }),
          /* 19 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Pairs = {};
            module2.exports = Pairs;
            var Pair = __webpack_require__(9);
            var Common = __webpack_require__(0);
            (function() {
              Pairs.create = function(options) {
                return Common.extend({
                  table: {},
                  list: [],
                  collisionStart: [],
                  collisionActive: [],
                  collisionEnd: []
                }, options);
              };
              Pairs.update = function(pairs, collisions, timestamp) {
                var pairUpdate = Pair.update, pairCreate = Pair.create, pairSetActive = Pair.setActive, pairsTable = pairs.table, pairsList = pairs.list, pairsListLength = pairsList.length, pairsListIndex = pairsListLength, collisionStart = pairs.collisionStart, collisionEnd = pairs.collisionEnd, collisionActive = pairs.collisionActive, collisionsLength = collisions.length, collisionStartIndex = 0, collisionEndIndex = 0, collisionActiveIndex = 0, collision, pair, i;
                for (i = 0; i < collisionsLength; i++) {
                  collision = collisions[i];
                  pair = collision.pair;
                  if (pair) {
                    if (pair.isActive) {
                      collisionActive[collisionActiveIndex++] = pair;
                    }
                    pairUpdate(pair, collision, timestamp);
                  } else {
                    pair = pairCreate(collision, timestamp);
                    pairsTable[pair.id] = pair;
                    collisionStart[collisionStartIndex++] = pair;
                    pairsList[pairsListIndex++] = pair;
                  }
                }
                pairsListIndex = 0;
                pairsListLength = pairsList.length;
                for (i = 0; i < pairsListLength; i++) {
                  pair = pairsList[i];
                  if (pair.timeUpdated >= timestamp) {
                    pairsList[pairsListIndex++] = pair;
                  } else {
                    pairSetActive(pair, false, timestamp);
                    if (pair.collision.bodyA.sleepCounter > 0 && pair.collision.bodyB.sleepCounter > 0) {
                      pairsList[pairsListIndex++] = pair;
                    } else {
                      collisionEnd[collisionEndIndex++] = pair;
                      delete pairsTable[pair.id];
                    }
                  }
                }
                if (pairsList.length !== pairsListIndex) {
                  pairsList.length = pairsListIndex;
                }
                if (collisionStart.length !== collisionStartIndex) {
                  collisionStart.length = collisionStartIndex;
                }
                if (collisionEnd.length !== collisionEndIndex) {
                  collisionEnd.length = collisionEndIndex;
                }
                if (collisionActive.length !== collisionActiveIndex) {
                  collisionActive.length = collisionActiveIndex;
                }
              };
              Pairs.clear = function(pairs) {
                pairs.table = {};
                pairs.list.length = 0;
                pairs.collisionStart.length = 0;
                pairs.collisionActive.length = 0;
                pairs.collisionEnd.length = 0;
                return pairs;
              };
            })();
          }),
          /* 20 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Matter2 = module2.exports = __webpack_require__(21);
            Matter2.Axes = __webpack_require__(11);
            Matter2.Bodies = __webpack_require__(12);
            Matter2.Body = __webpack_require__(4);
            Matter2.Bounds = __webpack_require__(1);
            Matter2.Collision = __webpack_require__(8);
            Matter2.Common = __webpack_require__(0);
            Matter2.Composite = __webpack_require__(6);
            Matter2.Composites = __webpack_require__(22);
            Matter2.Constraint = __webpack_require__(10);
            Matter2.Contact = __webpack_require__(16);
            Matter2.Detector = __webpack_require__(13);
            Matter2.Engine = __webpack_require__(17);
            Matter2.Events = __webpack_require__(5);
            Matter2.Grid = __webpack_require__(23);
            Matter2.Mouse = __webpack_require__(14);
            Matter2.MouseConstraint = __webpack_require__(24);
            Matter2.Pair = __webpack_require__(9);
            Matter2.Pairs = __webpack_require__(19);
            Matter2.Plugin = __webpack_require__(15);
            Matter2.Query = __webpack_require__(25);
            Matter2.Render = __webpack_require__(26);
            Matter2.Resolver = __webpack_require__(18);
            Matter2.Runner = __webpack_require__(27);
            Matter2.SAT = __webpack_require__(28);
            Matter2.Sleeping = __webpack_require__(7);
            Matter2.Svg = __webpack_require__(29);
            Matter2.Vector = __webpack_require__(2);
            Matter2.Vertices = __webpack_require__(3);
            Matter2.World = __webpack_require__(30);
            Matter2.Engine.run = Matter2.Runner.run;
            Matter2.Common.deprecated(Matter2.Engine, "run", "Engine.run \u27A4 use Matter.Runner.run(engine) instead");
          }),
          /* 21 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Matter2 = {};
            module2.exports = Matter2;
            var Plugin = __webpack_require__(15);
            var Common = __webpack_require__(0);
            (function() {
              Matter2.name = "matter-js";
              Matter2.version = true ? "0.20.0" : void 0;
              Matter2.uses = [];
              Matter2.used = [];
              Matter2.use = function() {
                Plugin.use(Matter2, Array.prototype.slice.call(arguments));
              };
              Matter2.before = function(path, func) {
                path = path.replace(/^Matter./, "");
                return Common.chainPathBefore(Matter2, path, func);
              };
              Matter2.after = function(path, func) {
                path = path.replace(/^Matter./, "");
                return Common.chainPathAfter(Matter2, path, func);
              };
            })();
          }),
          /* 22 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Composites = {};
            module2.exports = Composites;
            var Composite2 = __webpack_require__(6);
            var Constraint2 = __webpack_require__(10);
            var Common = __webpack_require__(0);
            var Body2 = __webpack_require__(4);
            var Bodies2 = __webpack_require__(12);
            var deprecated = Common.deprecated;
            (function() {
              Composites.stack = function(x, y, columns, rows, columnGap, rowGap, callback) {
                var stack = Composite2.create({ label: "Stack" }), currentX = x, currentY = y, lastBody, i = 0;
                for (var row = 0; row < rows; row++) {
                  var maxHeight = 0;
                  for (var column = 0; column < columns; column++) {
                    var body = callback(currentX, currentY, column, row, lastBody, i);
                    if (body) {
                      var bodyHeight = body.bounds.max.y - body.bounds.min.y, bodyWidth = body.bounds.max.x - body.bounds.min.x;
                      if (bodyHeight > maxHeight)
                        maxHeight = bodyHeight;
                      Body2.translate(body, { x: bodyWidth * 0.5, y: bodyHeight * 0.5 });
                      currentX = body.bounds.max.x + columnGap;
                      Composite2.addBody(stack, body);
                      lastBody = body;
                      i += 1;
                    } else {
                      currentX += columnGap;
                    }
                  }
                  currentY += maxHeight + rowGap;
                  currentX = x;
                }
                return stack;
              };
              Composites.chain = function(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {
                var bodies = composite.bodies;
                for (var i = 1; i < bodies.length; i++) {
                  var bodyA = bodies[i - 1], bodyB = bodies[i], bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y, bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x, bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y, bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;
                  var defaults = {
                    bodyA,
                    pointA: { x: bodyAWidth * xOffsetA, y: bodyAHeight * yOffsetA },
                    bodyB,
                    pointB: { x: bodyBWidth * xOffsetB, y: bodyBHeight * yOffsetB }
                  };
                  var constraint = Common.extend(defaults, options);
                  Composite2.addConstraint(composite, Constraint2.create(constraint));
                }
                composite.label += " Chain";
                return composite;
              };
              Composites.mesh = function(composite, columns, rows, crossBrace, options) {
                var bodies = composite.bodies, row, col, bodyA, bodyB, bodyC;
                for (row = 0; row < rows; row++) {
                  for (col = 1; col < columns; col++) {
                    bodyA = bodies[col - 1 + row * columns];
                    bodyB = bodies[col + row * columns];
                    Composite2.addConstraint(composite, Constraint2.create(Common.extend({ bodyA, bodyB }, options)));
                  }
                  if (row > 0) {
                    for (col = 0; col < columns; col++) {
                      bodyA = bodies[col + (row - 1) * columns];
                      bodyB = bodies[col + row * columns];
                      Composite2.addConstraint(composite, Constraint2.create(Common.extend({ bodyA, bodyB }, options)));
                      if (crossBrace && col > 0) {
                        bodyC = bodies[col - 1 + (row - 1) * columns];
                        Composite2.addConstraint(composite, Constraint2.create(Common.extend({ bodyA: bodyC, bodyB }, options)));
                      }
                      if (crossBrace && col < columns - 1) {
                        bodyC = bodies[col + 1 + (row - 1) * columns];
                        Composite2.addConstraint(composite, Constraint2.create(Common.extend({ bodyA: bodyC, bodyB }, options)));
                      }
                    }
                  }
                }
                composite.label += " Mesh";
                return composite;
              };
              Composites.pyramid = function(x, y, columns, rows, columnGap, rowGap, callback) {
                return Composites.stack(x, y, columns, rows, columnGap, rowGap, function(stackX, stackY, column, row, lastBody, i) {
                  var actualRows = Math.min(rows, Math.ceil(columns / 2)), lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;
                  if (row > actualRows)
                    return;
                  row = actualRows - row;
                  var start = row, end = columns - 1 - row;
                  if (column < start || column > end)
                    return;
                  if (i === 1) {
                    Body2.translate(lastBody, { x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth, y: 0 });
                  }
                  var xOffset = lastBody ? column * lastBodyWidth : 0;
                  return callback(x + xOffset + column * columnGap, stackY, column, row, lastBody, i);
                });
              };
              Composites.newtonsCradle = function(x, y, number, size, length) {
                var newtonsCradle = Composite2.create({ label: "Newtons Cradle" });
                for (var i = 0; i < number; i++) {
                  var separation = 1.9, circle = Bodies2.circle(
                    x + i * (size * separation),
                    y + length,
                    size,
                    { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 1e-4, slop: 1 }
                  ), constraint = Constraint2.create({ pointA: { x: x + i * (size * separation), y }, bodyB: circle });
                  Composite2.addBody(newtonsCradle, circle);
                  Composite2.addConstraint(newtonsCradle, constraint);
                }
                return newtonsCradle;
              };
              deprecated(Composites, "newtonsCradle", "Composites.newtonsCradle \u27A4 moved to newtonsCradle example");
              Composites.car = function(x, y, width, height, wheelSize) {
                var group = Body2.nextGroup(true), wheelBase = 20, wheelAOffset = -width * 0.5 + wheelBase, wheelBOffset = width * 0.5 - wheelBase, wheelYOffset = 0;
                var car = Composite2.create({ label: "Car" }), body = Bodies2.rectangle(x, y, width, height, {
                  collisionFilter: {
                    group
                  },
                  chamfer: {
                    radius: height * 0.5
                  },
                  density: 2e-4
                });
                var wheelA = Bodies2.circle(x + wheelAOffset, y + wheelYOffset, wheelSize, {
                  collisionFilter: {
                    group
                  },
                  friction: 0.8
                });
                var wheelB = Bodies2.circle(x + wheelBOffset, y + wheelYOffset, wheelSize, {
                  collisionFilter: {
                    group
                  },
                  friction: 0.8
                });
                var axelA = Constraint2.create({
                  bodyB: body,
                  pointB: { x: wheelAOffset, y: wheelYOffset },
                  bodyA: wheelA,
                  stiffness: 1,
                  length: 0
                });
                var axelB = Constraint2.create({
                  bodyB: body,
                  pointB: { x: wheelBOffset, y: wheelYOffset },
                  bodyA: wheelB,
                  stiffness: 1,
                  length: 0
                });
                Composite2.addBody(car, body);
                Composite2.addBody(car, wheelA);
                Composite2.addBody(car, wheelB);
                Composite2.addConstraint(car, axelA);
                Composite2.addConstraint(car, axelB);
                return car;
              };
              deprecated(Composites, "car", "Composites.car \u27A4 moved to car example");
              Composites.softBody = function(x, y, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
                particleOptions = Common.extend({ inertia: Infinity }, particleOptions);
                constraintOptions = Common.extend({ stiffness: 0.2, render: { type: "line", anchors: false } }, constraintOptions);
                var softBody = Composites.stack(x, y, columns, rows, columnGap, rowGap, function(stackX, stackY) {
                  return Bodies2.circle(stackX, stackY, particleRadius, particleOptions);
                });
                Composites.mesh(softBody, columns, rows, crossBrace, constraintOptions);
                softBody.label = "Soft Body";
                return softBody;
              };
              deprecated(Composites, "softBody", "Composites.softBody \u27A4 moved to softBody and cloth examples");
            })();
          }),
          /* 23 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Grid = {};
            module2.exports = Grid;
            var Pair = __webpack_require__(9);
            var Common = __webpack_require__(0);
            var deprecated = Common.deprecated;
            (function() {
              Grid.create = function(options) {
                var defaults = {
                  buckets: {},
                  pairs: {},
                  pairsList: [],
                  bucketWidth: 48,
                  bucketHeight: 48
                };
                return Common.extend(defaults, options);
              };
              Grid.update = function(grid, bodies, engine, forceUpdate) {
                var i, col, row, world = engine.world, buckets = grid.buckets, bucket, bucketId, gridChanged = false;
                for (i = 0; i < bodies.length; i++) {
                  var body = bodies[i];
                  if (body.isSleeping && !forceUpdate)
                    continue;
                  if (world.bounds && (body.bounds.max.x < world.bounds.min.x || body.bounds.min.x > world.bounds.max.x || body.bounds.max.y < world.bounds.min.y || body.bounds.min.y > world.bounds.max.y))
                    continue;
                  var newRegion = Grid._getRegion(grid, body);
                  if (!body.region || newRegion.id !== body.region.id || forceUpdate) {
                    if (!body.region || forceUpdate)
                      body.region = newRegion;
                    var union = Grid._regionUnion(newRegion, body.region);
                    for (col = union.startCol; col <= union.endCol; col++) {
                      for (row = union.startRow; row <= union.endRow; row++) {
                        bucketId = Grid._getBucketId(col, row);
                        bucket = buckets[bucketId];
                        var isInsideNewRegion = col >= newRegion.startCol && col <= newRegion.endCol && row >= newRegion.startRow && row <= newRegion.endRow;
                        var isInsideOldRegion = col >= body.region.startCol && col <= body.region.endCol && row >= body.region.startRow && row <= body.region.endRow;
                        if (!isInsideNewRegion && isInsideOldRegion) {
                          if (isInsideOldRegion) {
                            if (bucket)
                              Grid._bucketRemoveBody(grid, bucket, body);
                          }
                        }
                        if (body.region === newRegion || isInsideNewRegion && !isInsideOldRegion || forceUpdate) {
                          if (!bucket)
                            bucket = Grid._createBucket(buckets, bucketId);
                          Grid._bucketAddBody(grid, bucket, body);
                        }
                      }
                    }
                    body.region = newRegion;
                    gridChanged = true;
                  }
                }
                if (gridChanged)
                  grid.pairsList = Grid._createActivePairsList(grid);
              };
              deprecated(Grid, "update", "Grid.update \u27A4 replaced by Matter.Detector");
              Grid.clear = function(grid) {
                grid.buckets = {};
                grid.pairs = {};
                grid.pairsList = [];
              };
              deprecated(Grid, "clear", "Grid.clear \u27A4 replaced by Matter.Detector");
              Grid._regionUnion = function(regionA, regionB) {
                var startCol = Math.min(regionA.startCol, regionB.startCol), endCol = Math.max(regionA.endCol, regionB.endCol), startRow = Math.min(regionA.startRow, regionB.startRow), endRow = Math.max(regionA.endRow, regionB.endRow);
                return Grid._createRegion(startCol, endCol, startRow, endRow);
              };
              Grid._getRegion = function(grid, body) {
                var bounds = body.bounds, startCol = Math.floor(bounds.min.x / grid.bucketWidth), endCol = Math.floor(bounds.max.x / grid.bucketWidth), startRow = Math.floor(bounds.min.y / grid.bucketHeight), endRow = Math.floor(bounds.max.y / grid.bucketHeight);
                return Grid._createRegion(startCol, endCol, startRow, endRow);
              };
              Grid._createRegion = function(startCol, endCol, startRow, endRow) {
                return {
                  id: startCol + "," + endCol + "," + startRow + "," + endRow,
                  startCol,
                  endCol,
                  startRow,
                  endRow
                };
              };
              Grid._getBucketId = function(column, row) {
                return "C" + column + "R" + row;
              };
              Grid._createBucket = function(buckets, bucketId) {
                var bucket = buckets[bucketId] = [];
                return bucket;
              };
              Grid._bucketAddBody = function(grid, bucket, body) {
                var gridPairs = grid.pairs, pairId = Pair.id, bucketLength = bucket.length, i;
                for (i = 0; i < bucketLength; i++) {
                  var bodyB = bucket[i];
                  if (body.id === bodyB.id || body.isStatic && bodyB.isStatic)
                    continue;
                  var id = pairId(body, bodyB), pair = gridPairs[id];
                  if (pair) {
                    pair[2] += 1;
                  } else {
                    gridPairs[id] = [body, bodyB, 1];
                  }
                }
                bucket.push(body);
              };
              Grid._bucketRemoveBody = function(grid, bucket, body) {
                var gridPairs = grid.pairs, pairId = Pair.id, i;
                bucket.splice(Common.indexOf(bucket, body), 1);
                var bucketLength = bucket.length;
                for (i = 0; i < bucketLength; i++) {
                  var pair = gridPairs[pairId(body, bucket[i])];
                  if (pair)
                    pair[2] -= 1;
                }
              };
              Grid._createActivePairsList = function(grid) {
                var pair, gridPairs = grid.pairs, pairKeys = Common.keys(gridPairs), pairKeysLength = pairKeys.length, pairs = [], k;
                for (k = 0; k < pairKeysLength; k++) {
                  pair = gridPairs[pairKeys[k]];
                  if (pair[2] > 0) {
                    pairs.push(pair);
                  } else {
                    delete gridPairs[pairKeys[k]];
                  }
                }
                return pairs;
              };
            })();
          }),
          /* 24 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var MouseConstraint = {};
            module2.exports = MouseConstraint;
            var Vertices = __webpack_require__(3);
            var Sleeping = __webpack_require__(7);
            var Mouse = __webpack_require__(14);
            var Events2 = __webpack_require__(5);
            var Detector = __webpack_require__(13);
            var Constraint2 = __webpack_require__(10);
            var Composite2 = __webpack_require__(6);
            var Common = __webpack_require__(0);
            var Bounds = __webpack_require__(1);
            (function() {
              MouseConstraint.create = function(engine, options) {
                var mouse = (engine ? engine.mouse : null) || (options ? options.mouse : null);
                if (!mouse) {
                  if (engine && engine.render && engine.render.canvas) {
                    mouse = Mouse.create(engine.render.canvas);
                  } else if (options && options.element) {
                    mouse = Mouse.create(options.element);
                  } else {
                    mouse = Mouse.create();
                    Common.warn("MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected");
                  }
                }
                var constraint = Constraint2.create({
                  label: "Mouse Constraint",
                  pointA: mouse.position,
                  pointB: { x: 0, y: 0 },
                  length: 0.01,
                  stiffness: 0.1,
                  angularStiffness: 1,
                  render: {
                    strokeStyle: "#90EE90",
                    lineWidth: 3
                  }
                });
                var defaults = {
                  type: "mouseConstraint",
                  mouse,
                  element: null,
                  body: null,
                  constraint,
                  collisionFilter: {
                    category: 1,
                    mask: 4294967295,
                    group: 0
                  }
                };
                var mouseConstraint = Common.extend(defaults, options);
                Events2.on(engine, "beforeUpdate", function() {
                  var allBodies = Composite2.allBodies(engine.world);
                  MouseConstraint.update(mouseConstraint, allBodies);
                  MouseConstraint._triggerEvents(mouseConstraint);
                });
                return mouseConstraint;
              };
              MouseConstraint.update = function(mouseConstraint, bodies) {
                var mouse = mouseConstraint.mouse, constraint = mouseConstraint.constraint, body = mouseConstraint.body;
                if (mouse.button === 0) {
                  if (!constraint.bodyB) {
                    for (var i = 0; i < bodies.length; i++) {
                      body = bodies[i];
                      if (Bounds.contains(body.bounds, mouse.position) && Detector.canCollide(body.collisionFilter, mouseConstraint.collisionFilter)) {
                        for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                          var part = body.parts[j];
                          if (Vertices.contains(part.vertices, mouse.position)) {
                            constraint.pointA = mouse.position;
                            constraint.bodyB = mouseConstraint.body = body;
                            constraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
                            constraint.angleB = body.angle;
                            Sleeping.set(body, false);
                            Events2.trigger(mouseConstraint, "startdrag", { mouse, body });
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    Sleeping.set(constraint.bodyB, false);
                    constraint.pointA = mouse.position;
                  }
                } else {
                  constraint.bodyB = mouseConstraint.body = null;
                  constraint.pointB = null;
                  if (body)
                    Events2.trigger(mouseConstraint, "enddrag", { mouse, body });
                }
              };
              MouseConstraint._triggerEvents = function(mouseConstraint) {
                var mouse = mouseConstraint.mouse, mouseEvents = mouse.sourceEvents;
                if (mouseEvents.mousemove)
                  Events2.trigger(mouseConstraint, "mousemove", { mouse });
                if (mouseEvents.mousedown)
                  Events2.trigger(mouseConstraint, "mousedown", { mouse });
                if (mouseEvents.mouseup)
                  Events2.trigger(mouseConstraint, "mouseup", { mouse });
                Mouse.clearSourceEvents(mouse);
              };
            })();
          }),
          /* 25 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Query = {};
            module2.exports = Query;
            var Vector = __webpack_require__(2);
            var Collision = __webpack_require__(8);
            var Bounds = __webpack_require__(1);
            var Bodies2 = __webpack_require__(12);
            var Vertices = __webpack_require__(3);
            (function() {
              Query.collides = function(body, bodies) {
                var collisions = [], bodiesLength = bodies.length, bounds = body.bounds, collides = Collision.collides, overlaps = Bounds.overlaps;
                for (var i = 0; i < bodiesLength; i++) {
                  var bodyA = bodies[i], partsALength = bodyA.parts.length, partsAStart = partsALength === 1 ? 0 : 1;
                  if (overlaps(bodyA.bounds, bounds)) {
                    for (var j = partsAStart; j < partsALength; j++) {
                      var part = bodyA.parts[j];
                      if (overlaps(part.bounds, bounds)) {
                        var collision = collides(part, body);
                        if (collision) {
                          collisions.push(collision);
                          break;
                        }
                      }
                    }
                  }
                }
                return collisions;
              };
              Query.ray = function(bodies, startPoint, endPoint, rayWidth) {
                rayWidth = rayWidth || 1e-100;
                var rayAngle = Vector.angle(startPoint, endPoint), rayLength = Vector.magnitude(Vector.sub(startPoint, endPoint)), rayX = (endPoint.x + startPoint.x) * 0.5, rayY = (endPoint.y + startPoint.y) * 0.5, ray = Bodies2.rectangle(rayX, rayY, rayLength, rayWidth, { angle: rayAngle }), collisions = Query.collides(ray, bodies);
                for (var i = 0; i < collisions.length; i += 1) {
                  var collision = collisions[i];
                  collision.body = collision.bodyB = collision.bodyA;
                }
                return collisions;
              };
              Query.region = function(bodies, bounds, outside) {
                var result = [];
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i], overlaps = Bounds.overlaps(body.bounds, bounds);
                  if (overlaps && !outside || !overlaps && outside)
                    result.push(body);
                }
                return result;
              };
              Query.point = function(bodies, point) {
                var result = [];
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i];
                  if (Bounds.contains(body.bounds, point)) {
                    for (var j = body.parts.length === 1 ? 0 : 1; j < body.parts.length; j++) {
                      var part = body.parts[j];
                      if (Bounds.contains(part.bounds, point) && Vertices.contains(part.vertices, point)) {
                        result.push(body);
                        break;
                      }
                    }
                  }
                }
                return result;
              };
            })();
          }),
          /* 26 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Render = {};
            module2.exports = Render;
            var Body2 = __webpack_require__(4);
            var Common = __webpack_require__(0);
            var Composite2 = __webpack_require__(6);
            var Bounds = __webpack_require__(1);
            var Events2 = __webpack_require__(5);
            var Vector = __webpack_require__(2);
            var Mouse = __webpack_require__(14);
            (function() {
              var _requestAnimationFrame, _cancelAnimationFrame;
              if (typeof window !== "undefined") {
                _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                  window.setTimeout(function() {
                    callback(Common.now());
                  }, 1e3 / 60);
                };
                _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
              }
              Render._goodFps = 30;
              Render._goodDelta = 1e3 / 60;
              Render.create = function(options) {
                var defaults = {
                  engine: null,
                  element: null,
                  canvas: null,
                  mouse: null,
                  frameRequestId: null,
                  timing: {
                    historySize: 60,
                    delta: 0,
                    deltaHistory: [],
                    lastTime: 0,
                    lastTimestamp: 0,
                    lastElapsed: 0,
                    timestampElapsed: 0,
                    timestampElapsedHistory: [],
                    engineDeltaHistory: [],
                    engineElapsedHistory: [],
                    engineUpdatesHistory: [],
                    elapsedHistory: []
                  },
                  options: {
                    width: 800,
                    height: 600,
                    pixelRatio: 1,
                    background: "#14151f",
                    wireframeBackground: "#14151f",
                    wireframeStrokeStyle: "#bbb",
                    hasBounds: !!options.bounds,
                    enabled: true,
                    wireframes: true,
                    showSleeping: true,
                    showDebug: false,
                    showStats: false,
                    showPerformance: false,
                    showBounds: false,
                    showVelocity: false,
                    showCollisions: false,
                    showSeparations: false,
                    showAxes: false,
                    showPositions: false,
                    showAngleIndicator: false,
                    showIds: false,
                    showVertexNumbers: false,
                    showConvexHulls: false,
                    showInternalEdges: false,
                    showMousePosition: false
                  }
                };
                var render = Common.extend(defaults, options);
                if (render.canvas) {
                  render.canvas.width = render.options.width || render.canvas.width;
                  render.canvas.height = render.options.height || render.canvas.height;
                }
                render.mouse = options.mouse;
                render.engine = options.engine;
                render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
                render.context = render.canvas.getContext("2d");
                render.textures = {};
                render.bounds = render.bounds || {
                  min: {
                    x: 0,
                    y: 0
                  },
                  max: {
                    x: render.canvas.width,
                    y: render.canvas.height
                  }
                };
                render.controller = Render;
                render.options.showBroadphase = false;
                if (render.options.pixelRatio !== 1) {
                  Render.setPixelRatio(render, render.options.pixelRatio);
                }
                if (Common.isElement(render.element)) {
                  render.element.appendChild(render.canvas);
                }
                return render;
              };
              Render.run = function(render) {
                (function loop(time) {
                  render.frameRequestId = _requestAnimationFrame(loop);
                  _updateTiming(render, time);
                  Render.world(render, time);
                  render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                  if (render.options.showStats || render.options.showDebug) {
                    Render.stats(render, render.context, time);
                  }
                  if (render.options.showPerformance || render.options.showDebug) {
                    Render.performance(render, render.context, time);
                  }
                  render.context.setTransform(1, 0, 0, 1, 0, 0);
                })();
              };
              Render.stop = function(render) {
                _cancelAnimationFrame(render.frameRequestId);
              };
              Render.setPixelRatio = function(render, pixelRatio) {
                var options = render.options, canvas = render.canvas;
                if (pixelRatio === "auto") {
                  pixelRatio = _getPixelRatio(canvas);
                }
                options.pixelRatio = pixelRatio;
                canvas.setAttribute("data-pixel-ratio", pixelRatio);
                canvas.width = options.width * pixelRatio;
                canvas.height = options.height * pixelRatio;
                canvas.style.width = options.width + "px";
                canvas.style.height = options.height + "px";
              };
              Render.setSize = function(render, width, height) {
                render.options.width = width;
                render.options.height = height;
                render.bounds.max.x = render.bounds.min.x + width;
                render.bounds.max.y = render.bounds.min.y + height;
                if (render.options.pixelRatio !== 1) {
                  Render.setPixelRatio(render, render.options.pixelRatio);
                } else {
                  render.canvas.width = width;
                  render.canvas.height = height;
                }
              };
              Render.lookAt = function(render, objects, padding, center) {
                center = typeof center !== "undefined" ? center : true;
                objects = Common.isArray(objects) ? objects : [objects];
                padding = padding || {
                  x: 0,
                  y: 0
                };
                var bounds = {
                  min: { x: Infinity, y: Infinity },
                  max: { x: -Infinity, y: -Infinity }
                };
                for (var i = 0; i < objects.length; i += 1) {
                  var object = objects[i], min = object.bounds ? object.bounds.min : object.min || object.position || object, max = object.bounds ? object.bounds.max : object.max || object.position || object;
                  if (min && max) {
                    if (min.x < bounds.min.x)
                      bounds.min.x = min.x;
                    if (max.x > bounds.max.x)
                      bounds.max.x = max.x;
                    if (min.y < bounds.min.y)
                      bounds.min.y = min.y;
                    if (max.y > bounds.max.y)
                      bounds.max.y = max.y;
                  }
                }
                var width = bounds.max.x - bounds.min.x + 2 * padding.x, height = bounds.max.y - bounds.min.y + 2 * padding.y, viewHeight = render.canvas.height, viewWidth = render.canvas.width, outerRatio = viewWidth / viewHeight, innerRatio = width / height, scaleX = 1, scaleY = 1;
                if (innerRatio > outerRatio) {
                  scaleY = innerRatio / outerRatio;
                } else {
                  scaleX = outerRatio / innerRatio;
                }
                render.options.hasBounds = true;
                render.bounds.min.x = bounds.min.x;
                render.bounds.max.x = bounds.min.x + width * scaleX;
                render.bounds.min.y = bounds.min.y;
                render.bounds.max.y = bounds.min.y + height * scaleY;
                if (center) {
                  render.bounds.min.x += width * 0.5 - width * scaleX * 0.5;
                  render.bounds.max.x += width * 0.5 - width * scaleX * 0.5;
                  render.bounds.min.y += height * 0.5 - height * scaleY * 0.5;
                  render.bounds.max.y += height * 0.5 - height * scaleY * 0.5;
                }
                render.bounds.min.x -= padding.x;
                render.bounds.max.x -= padding.x;
                render.bounds.min.y -= padding.y;
                render.bounds.max.y -= padding.y;
                if (render.mouse) {
                  Mouse.setScale(render.mouse, {
                    x: (render.bounds.max.x - render.bounds.min.x) / render.canvas.width,
                    y: (render.bounds.max.y - render.bounds.min.y) / render.canvas.height
                  });
                  Mouse.setOffset(render.mouse, render.bounds.min);
                }
              };
              Render.startViewTransform = function(render) {
                var boundsWidth = render.bounds.max.x - render.bounds.min.x, boundsHeight = render.bounds.max.y - render.bounds.min.y, boundsScaleX = boundsWidth / render.options.width, boundsScaleY = boundsHeight / render.options.height;
                render.context.setTransform(
                  render.options.pixelRatio / boundsScaleX,
                  0,
                  0,
                  render.options.pixelRatio / boundsScaleY,
                  0,
                  0
                );
                render.context.translate(-render.bounds.min.x, -render.bounds.min.y);
              };
              Render.endViewTransform = function(render) {
                render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
              };
              Render.world = function(render, time) {
                var startTime = Common.now(), engine = render.engine, world = engine.world, canvas = render.canvas, context = render.context, options = render.options, timing = render.timing;
                var allBodies = Composite2.allBodies(world), allConstraints = Composite2.allConstraints(world), background = options.wireframes ? options.wireframeBackground : options.background, bodies = [], constraints = [], i;
                var event = {
                  timestamp: engine.timing.timestamp
                };
                Events2.trigger(render, "beforeRender", event);
                if (render.currentBackground !== background)
                  _applyBackground(render, background);
                context.globalCompositeOperation = "source-in";
                context.fillStyle = "transparent";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.globalCompositeOperation = "source-over";
                if (options.hasBounds) {
                  for (i = 0; i < allBodies.length; i++) {
                    var body = allBodies[i];
                    if (Bounds.overlaps(body.bounds, render.bounds))
                      bodies.push(body);
                  }
                  for (i = 0; i < allConstraints.length; i++) {
                    var constraint = allConstraints[i], bodyA = constraint.bodyA, bodyB = constraint.bodyB, pointAWorld = constraint.pointA, pointBWorld = constraint.pointB;
                    if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                    if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);
                    if (!pointAWorld || !pointBWorld)
                      continue;
                    if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
                      constraints.push(constraint);
                  }
                  Render.startViewTransform(render);
                  if (render.mouse) {
                    Mouse.setScale(render.mouse, {
                      x: (render.bounds.max.x - render.bounds.min.x) / render.options.width,
                      y: (render.bounds.max.y - render.bounds.min.y) / render.options.height
                    });
                    Mouse.setOffset(render.mouse, render.bounds.min);
                  }
                } else {
                  constraints = allConstraints;
                  bodies = allBodies;
                  if (render.options.pixelRatio !== 1) {
                    render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                  }
                }
                if (!options.wireframes || engine.enableSleeping && options.showSleeping) {
                  Render.bodies(render, bodies, context);
                } else {
                  if (options.showConvexHulls)
                    Render.bodyConvexHulls(render, bodies, context);
                  Render.bodyWireframes(render, bodies, context);
                }
                if (options.showBounds)
                  Render.bodyBounds(render, bodies, context);
                if (options.showAxes || options.showAngleIndicator)
                  Render.bodyAxes(render, bodies, context);
                if (options.showPositions)
                  Render.bodyPositions(render, bodies, context);
                if (options.showVelocity)
                  Render.bodyVelocity(render, bodies, context);
                if (options.showIds)
                  Render.bodyIds(render, bodies, context);
                if (options.showSeparations)
                  Render.separations(render, engine.pairs.list, context);
                if (options.showCollisions)
                  Render.collisions(render, engine.pairs.list, context);
                if (options.showVertexNumbers)
                  Render.vertexNumbers(render, bodies, context);
                if (options.showMousePosition)
                  Render.mousePosition(render, render.mouse, context);
                Render.constraints(constraints, context);
                if (options.hasBounds) {
                  Render.endViewTransform(render);
                }
                Events2.trigger(render, "afterRender", event);
                timing.lastElapsed = Common.now() - startTime;
              };
              Render.stats = function(render, context, time) {
                var engine = render.engine, world = engine.world, bodies = Composite2.allBodies(world), parts = 0, width = 55, height = 44, x = 0, y = 0;
                for (var i = 0; i < bodies.length; i += 1) {
                  parts += bodies[i].parts.length;
                }
                var sections = {
                  "Part": parts,
                  "Body": bodies.length,
                  "Cons": Composite2.allConstraints(world).length,
                  "Comp": Composite2.allComposites(world).length,
                  "Pair": engine.pairs.list.length
                };
                context.fillStyle = "#0e0f19";
                context.fillRect(x, y, width * 5.5, height);
                context.font = "12px Arial";
                context.textBaseline = "top";
                context.textAlign = "right";
                for (var key in sections) {
                  var section = sections[key];
                  context.fillStyle = "#aaa";
                  context.fillText(key, x + width, y + 8);
                  context.fillStyle = "#eee";
                  context.fillText(section, x + width, y + 26);
                  x += width;
                }
              };
              Render.performance = function(render, context) {
                var engine = render.engine, timing = render.timing, deltaHistory = timing.deltaHistory, elapsedHistory = timing.elapsedHistory, timestampElapsedHistory = timing.timestampElapsedHistory, engineDeltaHistory = timing.engineDeltaHistory, engineUpdatesHistory = timing.engineUpdatesHistory, engineElapsedHistory = timing.engineElapsedHistory, lastEngineUpdatesPerFrame = engine.timing.lastUpdatesPerFrame, lastEngineDelta = engine.timing.lastDelta;
                var deltaMean = _mean(deltaHistory), elapsedMean = _mean(elapsedHistory), engineDeltaMean = _mean(engineDeltaHistory), engineUpdatesMean = _mean(engineUpdatesHistory), engineElapsedMean = _mean(engineElapsedHistory), timestampElapsedMean = _mean(timestampElapsedHistory), rateMean = timestampElapsedMean / deltaMean || 0, neededUpdatesPerFrame = Math.round(deltaMean / lastEngineDelta), fps = 1e3 / deltaMean || 0;
                var graphHeight = 4, gap = 12, width = 60, height = 34, x = 10, y = 69;
                context.fillStyle = "#0e0f19";
                context.fillRect(0, 50, gap * 5 + width * 6 + 22, height);
                Render.status(
                  context,
                  x,
                  y,
                  width,
                  graphHeight,
                  deltaHistory.length,
                  Math.round(fps) + " fps",
                  fps / Render._goodFps,
                  function(i) {
                    return deltaHistory[i] / deltaMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + gap + width,
                  y,
                  width,
                  graphHeight,
                  engineDeltaHistory.length,
                  lastEngineDelta.toFixed(2) + " dt",
                  Render._goodDelta / lastEngineDelta,
                  function(i) {
                    return engineDeltaHistory[i] / engineDeltaMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + (gap + width) * 2,
                  y,
                  width,
                  graphHeight,
                  engineUpdatesHistory.length,
                  lastEngineUpdatesPerFrame + " upf",
                  Math.pow(Common.clamp(engineUpdatesMean / neededUpdatesPerFrame || 1, 0, 1), 4),
                  function(i) {
                    return engineUpdatesHistory[i] / engineUpdatesMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + (gap + width) * 3,
                  y,
                  width,
                  graphHeight,
                  engineElapsedHistory.length,
                  engineElapsedMean.toFixed(2) + " ut",
                  1 - lastEngineUpdatesPerFrame * engineElapsedMean / Render._goodFps,
                  function(i) {
                    return engineElapsedHistory[i] / engineElapsedMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + (gap + width) * 4,
                  y,
                  width,
                  graphHeight,
                  elapsedHistory.length,
                  elapsedMean.toFixed(2) + " rt",
                  1 - elapsedMean / Render._goodFps,
                  function(i) {
                    return elapsedHistory[i] / elapsedMean - 1;
                  }
                );
                Render.status(
                  context,
                  x + (gap + width) * 5,
                  y,
                  width,
                  graphHeight,
                  timestampElapsedHistory.length,
                  rateMean.toFixed(2) + " x",
                  rateMean * rateMean * rateMean,
                  function(i) {
                    return (timestampElapsedHistory[i] / deltaHistory[i] / rateMean || 0) - 1;
                  }
                );
              };
              Render.status = function(context, x, y, width, height, count, label, indicator, plotY) {
                context.strokeStyle = "#888";
                context.fillStyle = "#444";
                context.lineWidth = 1;
                context.fillRect(x, y + 7, width, 1);
                context.beginPath();
                context.moveTo(x, y + 7 - height * Common.clamp(0.4 * plotY(0), -2, 2));
                for (var i = 0; i < width; i += 1) {
                  context.lineTo(x + i, y + 7 - (i < count ? height * Common.clamp(0.4 * plotY(i), -2, 2) : 0));
                }
                context.stroke();
                context.fillStyle = "hsl(" + Common.clamp(25 + 95 * indicator, 0, 120) + ",100%,60%)";
                context.fillRect(x, y - 7, 4, 4);
                context.font = "12px Arial";
                context.textBaseline = "middle";
                context.textAlign = "right";
                context.fillStyle = "#eee";
                context.fillText(label, x + width, y - 5);
              };
              Render.constraints = function(constraints, context) {
                var c = context;
                for (var i = 0; i < constraints.length; i++) {
                  var constraint = constraints[i];
                  if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)
                    continue;
                  var bodyA = constraint.bodyA, bodyB = constraint.bodyB, start, end;
                  if (bodyA) {
                    start = Vector.add(bodyA.position, constraint.pointA);
                  } else {
                    start = constraint.pointA;
                  }
                  if (constraint.render.type === "pin") {
                    c.beginPath();
                    c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                    c.closePath();
                  } else {
                    if (bodyB) {
                      end = Vector.add(bodyB.position, constraint.pointB);
                    } else {
                      end = constraint.pointB;
                    }
                    c.beginPath();
                    c.moveTo(start.x, start.y);
                    if (constraint.render.type === "spring") {
                      var delta = Vector.sub(end, start), normal = Vector.perp(Vector.normalise(delta)), coils = Math.ceil(Common.clamp(constraint.length / 5, 12, 20)), offset;
                      for (var j = 1; j < coils; j += 1) {
                        offset = j % 2 === 0 ? 1 : -1;
                        c.lineTo(
                          start.x + delta.x * (j / coils) + normal.x * offset * 4,
                          start.y + delta.y * (j / coils) + normal.y * offset * 4
                        );
                      }
                    }
                    c.lineTo(end.x, end.y);
                  }
                  if (constraint.render.lineWidth) {
                    c.lineWidth = constraint.render.lineWidth;
                    c.strokeStyle = constraint.render.strokeStyle;
                    c.stroke();
                  }
                  if (constraint.render.anchors) {
                    c.fillStyle = constraint.render.strokeStyle;
                    c.beginPath();
                    c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                    c.arc(end.x, end.y, 3, 0, 2 * Math.PI);
                    c.closePath();
                    c.fill();
                  }
                }
              };
              Render.bodies = function(render, bodies, context) {
                var c = context, engine = render.engine, options = render.options, showInternalEdges = options.showInternalEdges || !options.wireframes, body, part, i, k;
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (!body.render.visible)
                    continue;
                  for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                    part = body.parts[k];
                    if (!part.render.visible)
                      continue;
                    if (options.showSleeping && body.isSleeping) {
                      c.globalAlpha = 0.5 * part.render.opacity;
                    } else if (part.render.opacity !== 1) {
                      c.globalAlpha = part.render.opacity;
                    }
                    if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
                      var sprite = part.render.sprite, texture = _getTexture(render, sprite.texture);
                      c.translate(part.position.x, part.position.y);
                      c.rotate(part.angle);
                      c.drawImage(
                        texture,
                        texture.width * -sprite.xOffset * sprite.xScale,
                        texture.height * -sprite.yOffset * sprite.yScale,
                        texture.width * sprite.xScale,
                        texture.height * sprite.yScale
                      );
                      c.rotate(-part.angle);
                      c.translate(-part.position.x, -part.position.y);
                    } else {
                      if (part.circleRadius) {
                        c.beginPath();
                        c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                      } else {
                        c.beginPath();
                        c.moveTo(part.vertices[0].x, part.vertices[0].y);
                        for (var j = 1; j < part.vertices.length; j++) {
                          if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                            c.lineTo(part.vertices[j].x, part.vertices[j].y);
                          } else {
                            c.moveTo(part.vertices[j].x, part.vertices[j].y);
                          }
                          if (part.vertices[j].isInternal && !showInternalEdges) {
                            c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                          }
                        }
                        c.lineTo(part.vertices[0].x, part.vertices[0].y);
                        c.closePath();
                      }
                      if (!options.wireframes) {
                        c.fillStyle = part.render.fillStyle;
                        if (part.render.lineWidth) {
                          c.lineWidth = part.render.lineWidth;
                          c.strokeStyle = part.render.strokeStyle;
                          c.stroke();
                        }
                        c.fill();
                      } else {
                        c.lineWidth = 1;
                        c.strokeStyle = render.options.wireframeStrokeStyle;
                        c.stroke();
                      }
                    }
                    c.globalAlpha = 1;
                  }
                }
              };
              Render.bodyWireframes = function(render, bodies, context) {
                var c = context, showInternalEdges = render.options.showInternalEdges, body, part, i, j, k;
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (!body.render.visible)
                    continue;
                  for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                    part = body.parts[k];
                    c.moveTo(part.vertices[0].x, part.vertices[0].y);
                    for (j = 1; j < part.vertices.length; j++) {
                      if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                        c.lineTo(part.vertices[j].x, part.vertices[j].y);
                      } else {
                        c.moveTo(part.vertices[j].x, part.vertices[j].y);
                      }
                      if (part.vertices[j].isInternal && !showInternalEdges) {
                        c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                      }
                    }
                    c.lineTo(part.vertices[0].x, part.vertices[0].y);
                  }
                }
                c.lineWidth = 1;
                c.strokeStyle = render.options.wireframeStrokeStyle;
                c.stroke();
              };
              Render.bodyConvexHulls = function(render, bodies, context) {
                var c = context, body, part, i, j, k;
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (!body.render.visible || body.parts.length === 1)
                    continue;
                  c.moveTo(body.vertices[0].x, body.vertices[0].y);
                  for (j = 1; j < body.vertices.length; j++) {
                    c.lineTo(body.vertices[j].x, body.vertices[j].y);
                  }
                  c.lineTo(body.vertices[0].x, body.vertices[0].y);
                }
                c.lineWidth = 1;
                c.strokeStyle = "rgba(255,255,255,0.2)";
                c.stroke();
              };
              Render.vertexNumbers = function(render, bodies, context) {
                var c = context, i, j, k;
                for (i = 0; i < bodies.length; i++) {
                  var parts = bodies[i].parts;
                  for (k = parts.length > 1 ? 1 : 0; k < parts.length; k++) {
                    var part = parts[k];
                    for (j = 0; j < part.vertices.length; j++) {
                      c.fillStyle = "rgba(255,255,255,0.2)";
                      c.fillText(i + "_" + j, part.position.x + (part.vertices[j].x - part.position.x) * 0.8, part.position.y + (part.vertices[j].y - part.position.y) * 0.8);
                    }
                  }
                }
              };
              Render.mousePosition = function(render, mouse, context) {
                var c = context;
                c.fillStyle = "rgba(255,255,255,0.8)";
                c.fillText(mouse.position.x + "  " + mouse.position.y, mouse.position.x + 5, mouse.position.y - 5);
              };
              Render.bodyBounds = function(render, bodies, context) {
                var c = context, engine = render.engine, options = render.options;
                c.beginPath();
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i];
                  if (body.render.visible) {
                    var parts = bodies[i].parts;
                    for (var j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                      var part = parts[j];
                      c.rect(part.bounds.min.x, part.bounds.min.y, part.bounds.max.x - part.bounds.min.x, part.bounds.max.y - part.bounds.min.y);
                    }
                  }
                }
                if (options.wireframes) {
                  c.strokeStyle = "rgba(255,255,255,0.08)";
                } else {
                  c.strokeStyle = "rgba(0,0,0,0.1)";
                }
                c.lineWidth = 1;
                c.stroke();
              };
              Render.bodyAxes = function(render, bodies, context) {
                var c = context, engine = render.engine, options = render.options, part, i, j, k;
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  var body = bodies[i], parts = body.parts;
                  if (!body.render.visible)
                    continue;
                  if (options.showAxes) {
                    for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                      part = parts[j];
                      for (k = 0; k < part.axes.length; k++) {
                        var axis = part.axes[k];
                        c.moveTo(part.position.x, part.position.y);
                        c.lineTo(part.position.x + axis.x * 20, part.position.y + axis.y * 20);
                      }
                    }
                  } else {
                    for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                      part = parts[j];
                      for (k = 0; k < part.axes.length; k++) {
                        c.moveTo(part.position.x, part.position.y);
                        c.lineTo(
                          (part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2,
                          (part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2
                        );
                      }
                    }
                  }
                }
                if (options.wireframes) {
                  c.strokeStyle = "indianred";
                  c.lineWidth = 1;
                } else {
                  c.strokeStyle = "rgba(255, 255, 255, 0.4)";
                  c.globalCompositeOperation = "overlay";
                  c.lineWidth = 2;
                }
                c.stroke();
                c.globalCompositeOperation = "source-over";
              };
              Render.bodyPositions = function(render, bodies, context) {
                var c = context, engine = render.engine, options = render.options, body, part, i, k;
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (!body.render.visible)
                    continue;
                  for (k = 0; k < body.parts.length; k++) {
                    part = body.parts[k];
                    c.arc(part.position.x, part.position.y, 3, 0, 2 * Math.PI, false);
                    c.closePath();
                  }
                }
                if (options.wireframes) {
                  c.fillStyle = "indianred";
                } else {
                  c.fillStyle = "rgba(0,0,0,0.5)";
                }
                c.fill();
                c.beginPath();
                for (i = 0; i < bodies.length; i++) {
                  body = bodies[i];
                  if (body.render.visible) {
                    c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
                    c.closePath();
                  }
                }
                c.fillStyle = "rgba(255,165,0,0.8)";
                c.fill();
              };
              Render.bodyVelocity = function(render, bodies, context) {
                var c = context;
                c.beginPath();
                for (var i = 0; i < bodies.length; i++) {
                  var body = bodies[i];
                  if (!body.render.visible)
                    continue;
                  var velocity = Body2.getVelocity(body);
                  c.moveTo(body.position.x, body.position.y);
                  c.lineTo(body.position.x + velocity.x, body.position.y + velocity.y);
                }
                c.lineWidth = 3;
                c.strokeStyle = "cornflowerblue";
                c.stroke();
              };
              Render.bodyIds = function(render, bodies, context) {
                var c = context, i, j;
                for (i = 0; i < bodies.length; i++) {
                  if (!bodies[i].render.visible)
                    continue;
                  var parts = bodies[i].parts;
                  for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                    var part = parts[j];
                    c.font = "12px Arial";
                    c.fillStyle = "rgba(255,255,255,0.5)";
                    c.fillText(part.id, part.position.x + 10, part.position.y - 10);
                  }
                }
              };
              Render.collisions = function(render, pairs, context) {
                var c = context, options = render.options, pair, collision, corrected, bodyA, bodyB, i, j;
                c.beginPath();
                for (i = 0; i < pairs.length; i++) {
                  pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  collision = pair.collision;
                  for (j = 0; j < pair.contactCount; j++) {
                    var contact = pair.contacts[j], vertex = contact.vertex;
                    c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
                  }
                }
                if (options.wireframes) {
                  c.fillStyle = "rgba(255,255,255,0.7)";
                } else {
                  c.fillStyle = "orange";
                }
                c.fill();
                c.beginPath();
                for (i = 0; i < pairs.length; i++) {
                  pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  collision = pair.collision;
                  if (pair.contactCount > 0) {
                    var normalPosX = pair.contacts[0].vertex.x, normalPosY = pair.contacts[0].vertex.y;
                    if (pair.contactCount === 2) {
                      normalPosX = (pair.contacts[0].vertex.x + pair.contacts[1].vertex.x) / 2;
                      normalPosY = (pair.contacts[0].vertex.y + pair.contacts[1].vertex.y) / 2;
                    }
                    if (collision.bodyB === collision.supports[0].body || collision.bodyA.isStatic === true) {
                      c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
                    } else {
                      c.moveTo(normalPosX + collision.normal.x * 8, normalPosY + collision.normal.y * 8);
                    }
                    c.lineTo(normalPosX, normalPosY);
                  }
                }
                if (options.wireframes) {
                  c.strokeStyle = "rgba(255,165,0,0.7)";
                } else {
                  c.strokeStyle = "orange";
                }
                c.lineWidth = 1;
                c.stroke();
              };
              Render.separations = function(render, pairs, context) {
                var c = context, options = render.options, pair, collision, corrected, bodyA, bodyB, i, j;
                c.beginPath();
                for (i = 0; i < pairs.length; i++) {
                  pair = pairs[i];
                  if (!pair.isActive)
                    continue;
                  collision = pair.collision;
                  bodyA = collision.bodyA;
                  bodyB = collision.bodyB;
                  var k = 1;
                  if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
                  if (bodyB.isStatic) k = 0;
                  c.moveTo(bodyB.position.x, bodyB.position.y);
                  c.lineTo(bodyB.position.x - collision.penetration.x * k, bodyB.position.y - collision.penetration.y * k);
                  k = 1;
                  if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
                  if (bodyA.isStatic) k = 0;
                  c.moveTo(bodyA.position.x, bodyA.position.y);
                  c.lineTo(bodyA.position.x + collision.penetration.x * k, bodyA.position.y + collision.penetration.y * k);
                }
                if (options.wireframes) {
                  c.strokeStyle = "rgba(255,165,0,0.5)";
                } else {
                  c.strokeStyle = "orange";
                }
                c.stroke();
              };
              Render.inspector = function(inspector, context) {
                var engine = inspector.engine, selected = inspector.selected, render = inspector.render, options = render.options, bounds;
                if (options.hasBounds) {
                  var boundsWidth = render.bounds.max.x - render.bounds.min.x, boundsHeight = render.bounds.max.y - render.bounds.min.y, boundsScaleX = boundsWidth / render.options.width, boundsScaleY = boundsHeight / render.options.height;
                  context.scale(1 / boundsScaleX, 1 / boundsScaleY);
                  context.translate(-render.bounds.min.x, -render.bounds.min.y);
                }
                for (var i = 0; i < selected.length; i++) {
                  var item = selected[i].data;
                  context.translate(0.5, 0.5);
                  context.lineWidth = 1;
                  context.strokeStyle = "rgba(255,165,0,0.9)";
                  context.setLineDash([1, 2]);
                  switch (item.type) {
                    case "body":
                      bounds = item.bounds;
                      context.beginPath();
                      context.rect(
                        Math.floor(bounds.min.x - 3),
                        Math.floor(bounds.min.y - 3),
                        Math.floor(bounds.max.x - bounds.min.x + 6),
                        Math.floor(bounds.max.y - bounds.min.y + 6)
                      );
                      context.closePath();
                      context.stroke();
                      break;
                    case "constraint":
                      var point = item.pointA;
                      if (item.bodyA)
                        point = item.pointB;
                      context.beginPath();
                      context.arc(point.x, point.y, 10, 0, 2 * Math.PI);
                      context.closePath();
                      context.stroke();
                      break;
                  }
                  context.setLineDash([]);
                  context.translate(-0.5, -0.5);
                }
                if (inspector.selectStart !== null) {
                  context.translate(0.5, 0.5);
                  context.lineWidth = 1;
                  context.strokeStyle = "rgba(255,165,0,0.6)";
                  context.fillStyle = "rgba(255,165,0,0.1)";
                  bounds = inspector.selectBounds;
                  context.beginPath();
                  context.rect(
                    Math.floor(bounds.min.x),
                    Math.floor(bounds.min.y),
                    Math.floor(bounds.max.x - bounds.min.x),
                    Math.floor(bounds.max.y - bounds.min.y)
                  );
                  context.closePath();
                  context.stroke();
                  context.fill();
                  context.translate(-0.5, -0.5);
                }
                if (options.hasBounds)
                  context.setTransform(1, 0, 0, 1, 0, 0);
              };
              var _updateTiming = function(render, time) {
                var engine = render.engine, timing = render.timing, historySize = timing.historySize, timestamp = engine.timing.timestamp;
                timing.delta = time - timing.lastTime || Render._goodDelta;
                timing.lastTime = time;
                timing.timestampElapsed = timestamp - timing.lastTimestamp || 0;
                timing.lastTimestamp = timestamp;
                timing.deltaHistory.unshift(timing.delta);
                timing.deltaHistory.length = Math.min(timing.deltaHistory.length, historySize);
                timing.engineDeltaHistory.unshift(engine.timing.lastDelta);
                timing.engineDeltaHistory.length = Math.min(timing.engineDeltaHistory.length, historySize);
                timing.timestampElapsedHistory.unshift(timing.timestampElapsed);
                timing.timestampElapsedHistory.length = Math.min(timing.timestampElapsedHistory.length, historySize);
                timing.engineUpdatesHistory.unshift(engine.timing.lastUpdatesPerFrame);
                timing.engineUpdatesHistory.length = Math.min(timing.engineUpdatesHistory.length, historySize);
                timing.engineElapsedHistory.unshift(engine.timing.lastElapsed);
                timing.engineElapsedHistory.length = Math.min(timing.engineElapsedHistory.length, historySize);
                timing.elapsedHistory.unshift(timing.lastElapsed);
                timing.elapsedHistory.length = Math.min(timing.elapsedHistory.length, historySize);
              };
              var _mean = function(values) {
                var result = 0;
                for (var i = 0; i < values.length; i += 1) {
                  result += values[i];
                }
                return result / values.length || 0;
              };
              var _createCanvas = function(width, height) {
                var canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                canvas.oncontextmenu = function() {
                  return false;
                };
                canvas.onselectstart = function() {
                  return false;
                };
                return canvas;
              };
              var _getPixelRatio = function(canvas) {
                var context = canvas.getContext("2d"), devicePixelRatio = window.devicePixelRatio || 1, backingStorePixelRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
                return devicePixelRatio / backingStorePixelRatio;
              };
              var _getTexture = function(render, imagePath) {
                var image = render.textures[imagePath];
                if (image)
                  return image;
                image = render.textures[imagePath] = new Image();
                image.src = imagePath;
                return image;
              };
              var _applyBackground = function(render, background) {
                var cssBackground = background;
                if (/(jpg|gif|png)$/.test(background))
                  cssBackground = "url(" + background + ")";
                render.canvas.style.background = cssBackground;
                render.canvas.style.backgroundSize = "contain";
                render.currentBackground = background;
              };
            })();
          }),
          /* 27 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Runner = {};
            module2.exports = Runner;
            var Events2 = __webpack_require__(5);
            var Engine2 = __webpack_require__(17);
            var Common = __webpack_require__(0);
            (function() {
              Runner._maxFrameDelta = 1e3 / 15;
              Runner._frameDeltaFallback = 1e3 / 60;
              Runner._timeBufferMargin = 1.5;
              Runner._elapsedNextEstimate = 1;
              Runner._smoothingLowerBound = 0.1;
              Runner._smoothingUpperBound = 0.9;
              Runner.create = function(options) {
                var defaults = {
                  delta: 1e3 / 60,
                  frameDelta: null,
                  frameDeltaSmoothing: true,
                  frameDeltaSnapping: true,
                  frameDeltaHistory: [],
                  frameDeltaHistorySize: 100,
                  frameRequestId: null,
                  timeBuffer: 0,
                  timeLastTick: null,
                  maxUpdates: null,
                  maxFrameTime: 1e3 / 30,
                  lastUpdatesDeferred: 0,
                  enabled: true
                };
                var runner = Common.extend(defaults, options);
                runner.fps = 0;
                return runner;
              };
              Runner.run = function(runner, engine) {
                runner.timeBuffer = Runner._frameDeltaFallback;
                (function onFrame(time) {
                  runner.frameRequestId = Runner._onNextFrame(runner, onFrame);
                  if (time && runner.enabled) {
                    Runner.tick(runner, engine, time);
                  }
                })();
                return runner;
              };
              Runner.tick = function(runner, engine, time) {
                var tickStartTime = Common.now(), engineDelta = runner.delta, updateCount = 0;
                var frameDelta = time - runner.timeLastTick;
                if (!frameDelta || !runner.timeLastTick || frameDelta > Math.max(Runner._maxFrameDelta, runner.maxFrameTime)) {
                  frameDelta = runner.frameDelta || Runner._frameDeltaFallback;
                }
                if (runner.frameDeltaSmoothing) {
                  runner.frameDeltaHistory.push(frameDelta);
                  runner.frameDeltaHistory = runner.frameDeltaHistory.slice(-runner.frameDeltaHistorySize);
                  var deltaHistorySorted = runner.frameDeltaHistory.slice(0).sort();
                  var deltaHistoryWindow = runner.frameDeltaHistory.slice(
                    deltaHistorySorted.length * Runner._smoothingLowerBound,
                    deltaHistorySorted.length * Runner._smoothingUpperBound
                  );
                  var frameDeltaSmoothed = _mean(deltaHistoryWindow);
                  frameDelta = frameDeltaSmoothed || frameDelta;
                }
                if (runner.frameDeltaSnapping) {
                  frameDelta = 1e3 / Math.round(1e3 / frameDelta);
                }
                runner.frameDelta = frameDelta;
                runner.timeLastTick = time;
                runner.timeBuffer += runner.frameDelta;
                runner.timeBuffer = Common.clamp(
                  runner.timeBuffer,
                  0,
                  runner.frameDelta + engineDelta * Runner._timeBufferMargin
                );
                runner.lastUpdatesDeferred = 0;
                var maxUpdates = runner.maxUpdates || Math.ceil(runner.maxFrameTime / engineDelta);
                var event = {
                  timestamp: engine.timing.timestamp
                };
                Events2.trigger(runner, "beforeTick", event);
                Events2.trigger(runner, "tick", event);
                var updateStartTime = Common.now();
                while (engineDelta > 0 && runner.timeBuffer >= engineDelta * Runner._timeBufferMargin) {
                  Events2.trigger(runner, "beforeUpdate", event);
                  Engine2.update(engine, engineDelta);
                  Events2.trigger(runner, "afterUpdate", event);
                  runner.timeBuffer -= engineDelta;
                  updateCount += 1;
                  var elapsedTimeTotal = Common.now() - tickStartTime, elapsedTimeUpdates = Common.now() - updateStartTime, elapsedNextEstimate = elapsedTimeTotal + Runner._elapsedNextEstimate * elapsedTimeUpdates / updateCount;
                  if (updateCount >= maxUpdates || elapsedNextEstimate > runner.maxFrameTime) {
                    runner.lastUpdatesDeferred = Math.round(Math.max(0, runner.timeBuffer / engineDelta - Runner._timeBufferMargin));
                    break;
                  }
                }
                engine.timing.lastUpdatesPerFrame = updateCount;
                Events2.trigger(runner, "afterTick", event);
                if (runner.frameDeltaHistory.length >= 100) {
                  if (runner.lastUpdatesDeferred && Math.round(runner.frameDelta / engineDelta) > maxUpdates) {
                    Common.warnOnce("Matter.Runner: runner reached runner.maxUpdates, see docs.");
                  } else if (runner.lastUpdatesDeferred) {
                    Common.warnOnce("Matter.Runner: runner reached runner.maxFrameTime, see docs.");
                  }
                  if (typeof runner.isFixed !== "undefined") {
                    Common.warnOnce("Matter.Runner: runner.isFixed is now redundant, see docs.");
                  }
                  if (runner.deltaMin || runner.deltaMax) {
                    Common.warnOnce("Matter.Runner: runner.deltaMin and runner.deltaMax were removed, see docs.");
                  }
                  if (runner.fps !== 0) {
                    Common.warnOnce("Matter.Runner: runner.fps was replaced by runner.delta, see docs.");
                  }
                }
              };
              Runner.stop = function(runner) {
                Runner._cancelNextFrame(runner);
              };
              Runner._onNextFrame = function(runner, callback) {
                if (typeof window !== "undefined" && window.requestAnimationFrame) {
                  runner.frameRequestId = window.requestAnimationFrame(callback);
                } else {
                  throw new Error("Matter.Runner: missing required global window.requestAnimationFrame.");
                }
                return runner.frameRequestId;
              };
              Runner._cancelNextFrame = function(runner) {
                if (typeof window !== "undefined" && window.cancelAnimationFrame) {
                  window.cancelAnimationFrame(runner.frameRequestId);
                } else {
                  throw new Error("Matter.Runner: missing required global window.cancelAnimationFrame.");
                }
              };
              var _mean = function(values) {
                var result = 0, valuesLength = values.length;
                for (var i = 0; i < valuesLength; i += 1) {
                  result += values[i];
                }
                return result / valuesLength || 0;
              };
            })();
          }),
          /* 28 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var SAT = {};
            module2.exports = SAT;
            var Collision = __webpack_require__(8);
            var Common = __webpack_require__(0);
            var deprecated = Common.deprecated;
            (function() {
              SAT.collides = function(bodyA, bodyB) {
                return Collision.collides(bodyA, bodyB);
              };
              deprecated(SAT, "collides", "SAT.collides \u27A4 replaced by Collision.collides");
            })();
          }),
          /* 29 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var Svg = {};
            module2.exports = Svg;
            var Bounds = __webpack_require__(1);
            var Common = __webpack_require__(0);
            (function() {
              Svg.pathToVertices = function(path, sampleLength) {
                if (typeof window !== "undefined" && !("SVGPathSeg" in window)) {
                  Common.warn("Svg.pathToVertices: SVGPathSeg not defined, a polyfill is required.");
                }
                var i, il, total, point, segment, segments, segmentsQueue, lastSegment, lastPoint, segmentIndex, points = [], lx, ly, length = 0, x = 0, y = 0;
                sampleLength = sampleLength || 15;
                var addPoint = function(px, py, pathSegType) {
                  var isRelative = pathSegType % 2 === 1 && pathSegType > 1;
                  if (!lastPoint || px != lastPoint.x || py != lastPoint.y) {
                    if (lastPoint && isRelative) {
                      lx = lastPoint.x;
                      ly = lastPoint.y;
                    } else {
                      lx = 0;
                      ly = 0;
                    }
                    var point2 = {
                      x: lx + px,
                      y: ly + py
                    };
                    if (isRelative || !lastPoint) {
                      lastPoint = point2;
                    }
                    points.push(point2);
                    x = lx + px;
                    y = ly + py;
                  }
                };
                var addSegmentPoint = function(segment2) {
                  var segType = segment2.pathSegTypeAsLetter.toUpperCase();
                  if (segType === "Z")
                    return;
                  switch (segType) {
                    case "M":
                    case "L":
                    case "T":
                    case "C":
                    case "S":
                    case "Q":
                      x = segment2.x;
                      y = segment2.y;
                      break;
                    case "H":
                      x = segment2.x;
                      break;
                    case "V":
                      y = segment2.y;
                      break;
                  }
                  addPoint(x, y, segment2.pathSegType);
                };
                Svg._svgPathToAbsolute(path);
                total = path.getTotalLength();
                segments = [];
                for (i = 0; i < path.pathSegList.numberOfItems; i += 1)
                  segments.push(path.pathSegList.getItem(i));
                segmentsQueue = segments.concat();
                while (length < total) {
                  segmentIndex = path.getPathSegAtLength(length);
                  segment = segments[segmentIndex];
                  if (segment != lastSegment) {
                    while (segmentsQueue.length && segmentsQueue[0] != segment)
                      addSegmentPoint(segmentsQueue.shift());
                    lastSegment = segment;
                  }
                  switch (segment.pathSegTypeAsLetter.toUpperCase()) {
                    case "C":
                    case "T":
                    case "S":
                    case "Q":
                    case "A":
                      point = path.getPointAtLength(length);
                      addPoint(point.x, point.y, 0);
                      break;
                  }
                  length += sampleLength;
                }
                for (i = 0, il = segmentsQueue.length; i < il; ++i)
                  addSegmentPoint(segmentsQueue[i]);
                return points;
              };
              Svg._svgPathToAbsolute = function(path) {
                var x0, y0, x1, y1, x2, y2, segs = path.pathSegList, x = 0, y = 0, len = segs.numberOfItems;
                for (var i = 0; i < len; ++i) {
                  var seg = segs.getItem(i), segType = seg.pathSegTypeAsLetter;
                  if (/[MLHVCSQTA]/.test(segType)) {
                    if ("x" in seg) x = seg.x;
                    if ("y" in seg) y = seg.y;
                  } else {
                    if ("x1" in seg) x1 = x + seg.x1;
                    if ("x2" in seg) x2 = x + seg.x2;
                    if ("y1" in seg) y1 = y + seg.y1;
                    if ("y2" in seg) y2 = y + seg.y2;
                    if ("x" in seg) x += seg.x;
                    if ("y" in seg) y += seg.y;
                    switch (segType) {
                      case "m":
                        segs.replaceItem(path.createSVGPathSegMovetoAbs(x, y), i);
                        break;
                      case "l":
                        segs.replaceItem(path.createSVGPathSegLinetoAbs(x, y), i);
                        break;
                      case "h":
                        segs.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x), i);
                        break;
                      case "v":
                        segs.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y), i);
                        break;
                      case "c":
                        segs.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i);
                        break;
                      case "s":
                        segs.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i);
                        break;
                      case "q":
                        segs.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i);
                        break;
                      case "t":
                        segs.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i);
                        break;
                      case "a":
                        segs.replaceItem(path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i);
                        break;
                      case "z":
                      case "Z":
                        x = x0;
                        y = y0;
                        break;
                    }
                  }
                  if (segType == "M" || segType == "m") {
                    x0 = x;
                    y0 = y;
                  }
                }
              };
            })();
          }),
          /* 30 */
          /***/
          (function(module2, exports2, __webpack_require__) {
            var World = {};
            module2.exports = World;
            var Composite2 = __webpack_require__(6);
            var Common = __webpack_require__(0);
            (function() {
              World.create = Composite2.create;
              World.add = Composite2.add;
              World.remove = Composite2.remove;
              World.clear = Composite2.clear;
              World.addComposite = Composite2.addComposite;
              World.addBody = Composite2.addBody;
              World.addConstraint = Composite2.addConstraint;
            })();
          })
          /******/
        ])
      );
    });
  }
});

// src/stadiums.ts
var STADIUM_NAMES = ["Dusk Arena", "Sunset Arena", "The Aztec Bowl", "The Fortress", "The Colossus", "The Yellow Wall", "The Concrete Giant", "The Steel Cathedral"];
function chooseStadium(previous2, rng = Math.random) {
  const choices = STADIUM_NAMES.map((_, i) => i).filter((i) => i !== previous2);
  return choices[Math.min(choices.length - 1, Math.floor(Math.max(0, rng()) * choices.length))];
}

// server/index.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, extname, sep } from "node:path";
import { randomInt } from "node:crypto";

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// src/shopCatalog.ts
var SHOP_SKINS = [
  { id: "lamine", name: "Blue & garnet jersey", kit: "Blue & garnet", price: 1400, color: "#ae3152" },
  { id: "mbappe", name: "White & gold jersey", kit: "White & gold", price: 1500, color: "#e7e6dd" },
  { id: "haaland", name: "Sky blue jersey", kit: "Sky blue", price: 1400, color: "#83c8de" },
  { id: "mora", name: "Green jersey", kit: "Green & white", price: 800, color: "#329468" },
  { id: "kvaratskhelia", name: "Navy & red jersey", kit: "Navy & red", price: 1100, color: "#b4354c" },
  { id: "kane", name: "White & navy jersey", kit: "White & navy", price: 1200, color: "#eee7da" },
  { id: "vozinha", name: "Royal blue jersey", kit: "Royal blue", price: 600, color: "#467cdb" },
  { id: "messi", name: "Sky blue striped jersey", kit: "Sky blue & white", price: 1800, color: "#85cfe9" },
  { id: "ronaldo", name: "Red & green jersey", kit: "Red & green", price: 1800, color: "#d34742" },
  { id: "raphinha", name: "Yellow & green jersey", kit: "Yellow & green", price: 1e3, color: "#e6c94c" }
];
var isSkinId = (id) => SHOP_SKINS.some((s) => s.id === id);

// src/avatar.ts
var AVATAR_OPTIONS = { hair: ["mod cut", "dreads short", "dreads long", "warrior cut", "crop", "long", "buzz cut", "bald", "middle part", "highlights", "afro"], eyes: ["round", "focused", "wide"], brows: ["natural", "thick", "angled", "arched", "straight"], mouth: ["smile", "neutral", "grin"], facialHair: ["none", "stubble", "mustache", "mustache and goatee", "beard", "goatee", "chin strap"], top: ["jersey", "t-shirt", "hoodie"], pattern: ["plain", "stripes", "chest band", "diagonal", "split", "chevron", "pinstripes", "shoulders"], sleeves: ["short", "long"], bottom: ["shorts", "trousers"], shoes: ["boots", "trainers"], headwear: ["none", "headband", "cap", "beanie"], glasses: ["none", "clear", "sunglasses", "round", "sport"], earrings: ["none", "studs", "hoops"], wristwear: ["none", "wristbands", "watch"], necklace: ["none", "chain", "pendant", "beads"] };
var COLOR_KEYS = ["skin", "hairColor", "browColor", "facialHairColor", "eyeColor", "topColor", "trimColor", "bottomColor", "sockColor", "shoeColor", "accessoryColor"];
var DEFAULT_AVATAR = { version: 1, name: "My Player", skin: "#b7733b", hair: "mod cut", hairColor: "#3a2519", browColor: "#3a2519", facialHairColor: "#3a2519", eyeColor: "#35261b", eyes: "round", brows: "natural", mouth: "smile", facialHair: "none", top: "jersey", pattern: "plain", sleeves: "short", topColor: "#2864bc", trimColor: "#f5d46a", bottom: "shorts", bottomColor: "#18273e", sockColor: "#eeeeeb", shoes: "boots", shoeColor: "#f5f0e5", headwear: "none", glasses: "none", earrings: "none", wristwear: "none", necklace: "none", accessoryColor: "#e9bb42" };
var SKIN_TONES = ["#f7dfcf", "#f2d3ba", "#edc6a7", "#e8b78f", "#dfae88", "#d9a078", "#cd9468", "#c48a60", "#b98053", "#b7733b", "#aa704a", "#9c643f", "#915732", "#825135", "#73472f", "#6b402c", "#5b3829", "#4c3025", "#3e2922", "#32231e"];
var HAIR_COLORS = ["#171719", "#29282a", "#3a2519", "#513525", "#71503a", "#946b48", "#b66a32", "#d58e48", "#74352b", "#9b4533", "#69696b", "#989896", "#d8d3c9", "#f1ece2"];
var NATURAL_COLORS = ["#171719", "#3a2519", "#71503a", "#a15b32", "#96928b"];
var EYE_COLORS = ["#35261b", "#956028", "#367ab8", "#63b8d0", "#3d915b", "#7f934b", "#919eaa"];
function nearest(color, palette) {
  const rgb = (v) => [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16));
  const c = rgb(color);
  return palette.reduce((best, v) => {
    const dist = (s) => rgb(s).reduce((n, x, i) => n + (x - c[i]) ** 2, 0);
    return dist(v) < dist(best) ? v : best;
  });
}
var RESTRICTED_COLORS = { skin: SKIN_TONES, hairColor: HAIR_COLORS, browColor: NATURAL_COLORS, facialHairColor: NATURAL_COLORS, eyeColor: EYE_COLORS };
function normalizeAvatar(value) {
  const v = value && typeof value === "object" ? value : {}, result = { ...DEFAULT_AVATAR };
  result.name = typeof v.name === "string" ? v.name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 20) || DEFAULT_AVATAR.name : DEFAULT_AVATAR.name;
  for (const key of COLOR_KEYS) if (typeof v[key] === "string" && /^#[0-9a-fA-F]{6}$/.test(v[key])) result[key] = v[key].toLowerCase();
  for (const key of Object.keys(AVATAR_OPTIONS)) if (AVATAR_OPTIONS[key].includes(v[key])) result[key] = v[key];
  const legacy = { curls: "mod cut", "side part": "middle part" };
  if (typeof v.hair === "string" && legacy[v.hair]) result.hair = legacy[v.hair];
  if (!v.browColor) result.browColor = result.hairColor;
  if (!v.facialHairColor) result.facialHairColor = result.hairColor;
  for (const [key, palette] of Object.entries(RESTRICTED_COLORS)) result[key] = nearest(result[key], palette);
  if (isSkinId(v.skinId)) {
    result.skinId = v.skinId;
    result.name = SHOP_SKINS.find((s) => s.id === v.skinId).name;
  }
  return result;
}
var TOPS = [
  ["Ivory classic", "#eee5d0", "#233044", "plain", "short"],
  ["Crimson classic", "#b72d3b", "#f0d5c2", "plain", "short"],
  ["Royal classic", "#2864bc", "#e9e8de", "plain", "short"],
  ["Onyx classic", "#242831", "#929da5", "plain", "short"],
  ["Golden classic", "#e5b737", "#202d42", "plain", "short"],
  ["Forest stripes", "#277357", "#e6e5d9", "stripes", "short"],
  ["Rose stripe", "#d98297", "#522e46", "chest band", "short"],
  ["Violet split", "#7050a0", "#d3b5df", "split", "short"],
  ["Tangerine slash", "#dd7634", "#f4d8ad", "diagonal", "short"],
  ["Ocean chevron", "#207b95", "#a4dbd9", "chevron", "short"],
  ["Navy pinstripe", "#243a5f", "#b9cbd2", "pinstripes", "short"],
  ["Sage shoulder", "#81967c", "#ecdec6", "shoulders", "short"],
  ["Ivory long sleeve", "#eee5d0", "#263649", "plain", "long"],
  ["Crimson long sleeve", "#b72d3b", "#ead4b1", "shoulders", "long"],
  ["Royal long sleeve", "#2864bc", "#e4e4dc", "chest band", "long"],
  ["Onyx long sleeve", "#242831", "#babbbb", "pinstripes", "long"],
  ["Forest long sleeve", "#277357", "#d6b964", "chevron", "long"],
  ["Sand long sleeve", "#c6a77d", "#6a5948", "split", "long"],
  ["Plum long sleeve", "#683d61", "#cb98b6", "diagonal", "long"],
  ["Sky long sleeve", "#78b4ce", "#eff0db", "stripes", "long"]
].map(([name, topColor, trimColor, pattern, sleeves]) => ({ name, patch: { top: "t-shirt", topColor, trimColor, pattern, sleeves } }));
var BOTTOMS = [["Black shorts", "#232832", "shorts"], ["Navy shorts", "#243653", "shorts"], ["Ivory shorts", "#e8dfca", "shorts"], ["Red shorts", "#a9373c", "shorts"], ["Blue shorts", "#2f60a8", "shorts"], ["Teal shorts", "#267a78", "shorts"], ["Olive shorts", "#73764e", "shorts"], ["Black pants", "#232832", "trousers"], ["Grey pants", "#737c82", "trousers"], ["Sand pants", "#b89c75", "trousers"]].map(([name, bottomColor, bottom]) => ({ name, patch: { bottomColor, bottom } }));
var SOCKS = [["Ivory", "#eeeeeb"], ["Black", "#252b34"], ["Red", "#bc3543"], ["Blue", "#3466b1"], ["Gold", "#e5ba48"], ["Green", "#368268"], ["Rose", "#d37c99"], ["Purple", "#7954a6"]].map(([name, sockColor]) => ({ name, patch: { sockColor } }));
var SHOE_COLORS = [["White", "#f5f0e5"], ["Black", "#242932"], ["Red", "#c93843"], ["Blue", "#326dc5"], ["Green", "#368466"], ["Gold", "#e6b83d"]].map(([name, shoeColor]) => ({ name, patch: { shoeColor } }));

// src/multiplayer.ts
function displayUsername(value) {
  return typeof value === "string" && /^[A-Za-z0-9._]{1,20}$/.test(value) ? value : null;
}
function publicAvatar(value) {
  const avatar = normalizeAvatar(value);
  return { ...avatar, name: avatar.skinId ? avatar.name : "Custom Player" };
}

// src/difficulty.ts
var DIFFICULTIES = { easy: { label: "Easy", delay: 0.48, power: 14, goalBias: 8 }, normal: { label: "Regular", delay: 0.18, power: 18, goalBias: 12 }, hard: { label: "Hard", delay: 0.04, power: 18.5, goalBias: 16 } };
var DEFAULT_DIFFICULTY = "hard";

// src/game.ts
var import_matter_js = __toESM(require_matter(), 1);

// src/teams.ts
var TEAMS = [
  {
    "id": "FRA",
    "name": "France",
    "flag": "fr",
    "color": "#253bb3",
    "shorts": "#deddd5",
    "rank": 1,
    "stars": 5.5,
    "region": "EUROPE"
  },
  {
    "id": "SPA",
    "name": "Spain",
    "flag": "es",
    "color": "#c52c21",
    "shorts": "#23386d",
    "rank": 2,
    "stars": 5.5,
    "region": "EUROPE"
  },
  {
    "id": "ARG",
    "name": "Argentina",
    "flag": "ar",
    "color": "#75b9e5",
    "shorts": "#eeeeea",
    "rank": 3,
    "stars": 5,
    "region": "S. AMERICA"
  },
  {
    "id": "ENG",
    "name": "England",
    "flag": "gb-eng",
    "color": "#e6e3db",
    "shorts": "#182254",
    "rank": 4,
    "stars": 5,
    "region": "EUROPE"
  },
  {
    "id": "POR",
    "name": "Portugal",
    "flag": "pt",
    "color": "#d0231f",
    "shorts": "#247537",
    "rank": 5,
    "stars": 4.7,
    "region": "EUROPE"
  },
  {
    "id": "BRA",
    "name": "Brazil",
    "flag": "br",
    "color": "#e7cb13",
    "shorts": "#2144a8",
    "rank": 6,
    "stars": 4.7,
    "region": "S. AMERICA"
  },
  {
    "id": "NET",
    "name": "Netherlands",
    "flag": "nl",
    "color": "#ed7a13",
    "shorts": "#22252a",
    "rank": 7,
    "stars": 4.5,
    "region": "EUROPE"
  },
  {
    "id": "MOR",
    "name": "Morocco",
    "flag": "ma",
    "color": "#ce241d",
    "shorts": "#22632d",
    "rank": 8,
    "stars": 4.5,
    "region": "AFRICA"
  },
  {
    "id": "BEL",
    "name": "Belgium",
    "flag": "be",
    "color": "#cf202f",
    "shorts": "#202126",
    "rank": 9,
    "stars": 4.5,
    "region": "EUROPE"
  },
  {
    "id": "GER",
    "name": "Germany",
    "flag": "de",
    "color": "#eeeeeb",
    "shorts": "#202126",
    "rank": 10,
    "stars": 5,
    "region": "EUROPE"
  },
  {
    "id": "CRO",
    "name": "Croatia",
    "flag": "hr",
    "color": "#d6352b",
    "shorts": "#e8e5dd",
    "rank": 11,
    "stars": 4,
    "region": "EUROPE"
  },
  {
    "id": "ITA",
    "name": "Italy",
    "flag": "it",
    "color": "#2368c4",
    "shorts": "#eeeeeb",
    "rank": 12,
    "stars": 4,
    "region": "EUROPE"
  },
  {
    "id": "COL",
    "name": "Colombia",
    "flag": "co",
    "color": "#f2d633",
    "shorts": "#213778",
    "rank": 13,
    "stars": 4,
    "region": "S. AMERICA"
  },
  {
    "id": "SEN",
    "name": "Senegal",
    "flag": "sn",
    "color": "#e4dfc6",
    "shorts": "#267132",
    "rank": 14,
    "stars": 4,
    "region": "AFRICA"
  },
  {
    "id": "MEX",
    "name": "Mexico",
    "flag": "mx",
    "color": "#19714e",
    "shorts": "#eeeeeb",
    "rank": 15,
    "stars": 4,
    "region": "N. AMERICA"
  },
  {
    "id": "USA",
    "name": "United States",
    "flag": "us",
    "color": "#e5e4db",
    "shorts": "#232959",
    "rank": 16,
    "stars": 4,
    "region": "N. AMERICA"
  },
  {
    "id": "URU",
    "name": "Uruguay",
    "flag": "uy",
    "color": "#69bfe7",
    "shorts": "#22252a",
    "rank": 17,
    "stars": 4,
    "region": "S. AMERICA"
  },
  {
    "id": "JPN",
    "name": "Japan",
    "flag": "jp",
    "color": "#222c99",
    "shorts": "#dcdad4",
    "rank": 18,
    "stars": 4,
    "region": "ASIA"
  },
  {
    "id": "SUI",
    "name": "Switzerland",
    "flag": "ch",
    "color": "#d82a31",
    "shorts": "#eeeeeb",
    "rank": 19,
    "stars": 4,
    "region": "EUROPE"
  },
  {
    "id": "DEN",
    "name": "Denmark",
    "flag": "dk",
    "color": "#cd2838",
    "shorts": "#eeeeeb",
    "rank": 20,
    "stars": 4.5,
    "region": "EUROPE"
  },
  {
    "id": "IRN",
    "name": "Iran",
    "flag": "ir",
    "color": "#eeeeeb",
    "shorts": "#d72a33",
    "rank": 21,
    "stars": 4,
    "region": "ASIA"
  },
  {
    "id": "TUR",
    "name": "T\xFCrkiye",
    "flag": "tr",
    "color": "#d52333",
    "shorts": "#eeeeeb",
    "rank": 22,
    "stars": 4,
    "region": "EUROPE"
  },
  {
    "id": "ECU",
    "name": "Ecuador",
    "flag": "ec",
    "color": "#f0cf24",
    "shorts": "#213778",
    "rank": 23,
    "stars": 4,
    "region": "S. AMERICA"
  },
  {
    "id": "AUT",
    "name": "Austria",
    "flag": "at",
    "color": "#d52b39",
    "shorts": "#eeeeeb",
    "rank": 24,
    "stars": 4,
    "region": "EUROPE"
  },
  {
    "id": "KOR",
    "name": "South Korea",
    "flag": "kr",
    "color": "#e54350",
    "shorts": "#202126",
    "rank": 25,
    "stars": 4,
    "region": "ASIA"
  },
  {
    "id": "NGA",
    "name": "Nigeria",
    "flag": "ng",
    "color": "#238256",
    "shorts": "#eeeeeb",
    "rank": 26,
    "stars": 3,
    "region": "AFRICA"
  },
  {
    "id": "AUS",
    "name": "Australia",
    "flag": "au",
    "color": "#d9b31b",
    "shorts": "#1c6839",
    "rank": 27,
    "stars": 3,
    "region": "OCEANIA"
  },
  {
    "id": "ALG",
    "name": "Algeria",
    "flag": "dz",
    "color": "#eeeeeb",
    "shorts": "#21744a",
    "rank": 28,
    "stars": 3,
    "region": "AFRICA"
  },
  {
    "id": "EGY",
    "name": "Egypt",
    "flag": "eg",
    "color": "#cb2630",
    "shorts": "#202126",
    "rank": 29,
    "stars": 3,
    "region": "AFRICA"
  },
  {
    "id": "CAN",
    "name": "Canada",
    "flag": "ca",
    "color": "#d52a33",
    "shorts": "#202126",
    "rank": 30,
    "stars": 3,
    "region": "N. AMERICA"
  },
  {
    "id": "NOR",
    "name": "Norway",
    "flag": "no",
    "color": "#c82f39",
    "shorts": "#213778",
    "rank": 31,
    "stars": 3,
    "region": "EUROPE"
  },
  {
    "id": "UKR",
    "name": "Ukraine",
    "flag": "ua",
    "color": "#f0d32b",
    "shorts": "#2671bd",
    "rank": 32,
    "stars": 3,
    "region": "EUROPE"
  },
  {
    "id": "PAN",
    "name": "Panama",
    "flag": "pa",
    "color": "#d3293b",
    "shorts": "#213778",
    "rank": 33,
    "stars": 3,
    "region": "N. AMERICA"
  },
  {
    "id": "CIV",
    "name": "C\xF4te d\u2019Ivoire",
    "flag": "ci",
    "color": "#ed8223",
    "shorts": "#eeeeeb",
    "rank": 34,
    "stars": 3,
    "region": "AFRICA"
  },
  {
    "id": "POL",
    "name": "Poland",
    "flag": "pl",
    "color": "#e7e3db",
    "shorts": "#c32628",
    "rank": 35,
    "stars": 3,
    "region": "EUROPE"
  },
  {
    "id": "RUS",
    "name": "Russia",
    "flag": "ru",
    "color": "#b92537",
    "shorts": "#eeeeeb",
    "rank": 36,
    "stars": 3,
    "region": "EUROPE"
  },
  {
    "id": "WAL",
    "name": "Wales",
    "flag": "gb-wls",
    "color": "#c8293b",
    "shorts": "#eeeeeb",
    "rank": 37,
    "stars": 3,
    "region": "EUROPE"
  },
  {
    "id": "SWE",
    "name": "Sweden",
    "flag": "se",
    "color": "#e9cf2a",
    "shorts": "#254c96",
    "rank": 38,
    "stars": 3,
    "region": "EUROPE"
  },
  {
    "id": "SRB",
    "name": "Serbia",
    "flag": "rs",
    "color": "#c62c3b",
    "shorts": "#213778",
    "rank": 39,
    "stars": 3,
    "region": "EUROPE"
  },
  {
    "id": "PAR",
    "name": "Paraguay",
    "flag": "py",
    "color": "#d3333c",
    "shorts": "#213778",
    "rank": 40,
    "stars": 3,
    "region": "S. AMERICA"
  },
  {
    "id": "CZE",
    "name": "Czechia",
    "flag": "cz",
    "color": "#c82c3a",
    "shorts": "#213778",
    "rank": 41,
    "stars": 2,
    "region": "EUROPE"
  },
  {
    "id": "HUN",
    "name": "Hungary",
    "flag": "hu",
    "color": "#c62d3d",
    "shorts": "#eeeeeb",
    "rank": 42,
    "stars": 2,
    "region": "EUROPE"
  },
  {
    "id": "SCO",
    "name": "Scotland",
    "flag": "gb-sct",
    "color": "#202d66",
    "shorts": "#eeeeeb",
    "rank": 43,
    "stars": 2,
    "region": "EUROPE"
  },
  {
    "id": "TUN",
    "name": "Tunisia",
    "flag": "tn",
    "color": "#eeeeeb",
    "shorts": "#d0293a",
    "rank": 44,
    "stars": 2,
    "region": "AFRICA"
  },
  {
    "id": "CMR",
    "name": "Cameroon",
    "flag": "cm",
    "color": "#22754a",
    "shorts": "#d32a33",
    "rank": 45,
    "stars": 2,
    "region": "AFRICA"
  },
  {
    "id": "COD",
    "name": "DR Congo",
    "flag": "cd",
    "color": "#3e9ddd",
    "shorts": "#d92c3e",
    "rank": 46,
    "stars": 2,
    "region": "AFRICA"
  },
  {
    "id": "GRE",
    "name": "Greece",
    "flag": "gr",
    "color": "#eeeeeb",
    "shorts": "#3174c8",
    "rank": 47,
    "stars": 2,
    "region": "EUROPE"
  },
  {
    "id": "SVK",
    "name": "Slovakia",
    "flag": "sk",
    "color": "#eeeeeb",
    "shorts": "#2559b3",
    "rank": 48,
    "stars": 2,
    "region": "EUROPE"
  },
  {
    "id": "VEN",
    "name": "Venezuela",
    "flag": "ve",
    "color": "#812f48",
    "shorts": "#eeeeeb",
    "rank": 49,
    "stars": 2,
    "region": "S. AMERICA"
  },
  {
    "id": "UZB",
    "name": "Uzbekistan",
    "flag": "uz",
    "color": "#eeeeeb",
    "shorts": "#2680c9",
    "rank": 50,
    "stars": 2,
    "region": "ASIA"
  },
  {
    "id": "CRC",
    "name": "Costa Rica",
    "flag": "cr",
    "color": "#d92b3c",
    "shorts": "#213778",
    "rank": 51,
    "stars": 2,
    "region": "N. AMERICA"
  },
  {
    "id": "MLI",
    "name": "Mali",
    "flag": "ml",
    "color": "#e6ca29",
    "shorts": "#25824e",
    "rank": 52,
    "stars": 2,
    "region": "AFRICA"
  },
  {
    "id": "PER",
    "name": "Peru",
    "flag": "pe",
    "color": "#eeeeeb",
    "shorts": "#eeeeeb",
    "rank": 53,
    "stars": 2,
    "region": "S. AMERICA"
  },
  {
    "id": "CHI",
    "name": "Chile",
    "flag": "cl",
    "color": "#ce2937",
    "shorts": "#213778",
    "rank": 54,
    "stars": 2.5,
    "region": "S. AMERICA"
  },
  {
    "id": "QAT",
    "name": "Qatar",
    "flag": "qa",
    "color": "#842c45",
    "shorts": "#eeeeeb",
    "rank": 55,
    "stars": 2,
    "region": "ASIA"
  },
  {
    "id": "ROU",
    "name": "Romania",
    "flag": "ro",
    "color": "#e8ca29",
    "shorts": "#e8ca29",
    "rank": 56,
    "stars": 1,
    "region": "EUROPE"
  },
  {
    "id": "IRQ",
    "name": "Iraq",
    "flag": "iq",
    "color": "#208249",
    "shorts": "#eeeeeb",
    "rank": 57,
    "stars": 1,
    "region": "ASIA"
  },
  {
    "id": "SVN",
    "name": "Slovenia",
    "flag": "si",
    "color": "#eeeeeb",
    "shorts": "#397c4b",
    "rank": 58,
    "stars": 1,
    "region": "EUROPE"
  },
  {
    "id": "IRL",
    "name": "Ireland",
    "flag": "ie",
    "color": "#29804a",
    "shorts": "#eeeeeb",
    "rank": 59,
    "stars": 1,
    "region": "EUROPE"
  },
  {
    "id": "RSA",
    "name": "South Africa",
    "flag": "za",
    "color": "#e5c329",
    "shorts": "#286945",
    "rank": 60,
    "stars": 1,
    "region": "AFRICA"
  },
  {
    "id": "KSA",
    "name": "Saudi Arabia",
    "flag": "sa",
    "color": "#eeeeeb",
    "shorts": "#23804e",
    "rank": 61,
    "stars": 1,
    "region": "ASIA"
  },
  {
    "id": "BFA",
    "name": "Burkina Faso",
    "flag": "bf",
    "color": "#268148",
    "shorts": "#dc3039",
    "rank": 62,
    "stars": 1,
    "region": "AFRICA"
  },
  {
    "id": "JOR",
    "name": "Jordan",
    "flag": "jo",
    "color": "#d72b37",
    "shorts": "#eeeeeb",
    "rank": 63,
    "stars": 1,
    "region": "ASIA"
  },
  {
    "id": "ALB",
    "name": "Albania",
    "flag": "al",
    "color": "#c82736",
    "shorts": "#202126",
    "rank": 64,
    "stars": 1,
    "region": "EUROPE"
  },
  {
    "id": "BIH",
    "name": "Bosnia and Herzegovina",
    "flag": "ba",
    "color": "#2955a4",
    "shorts": "#eeeeeb",
    "rank": 65,
    "stars": 1,
    "region": "EUROPE"
  },
  {
    "id": "HON",
    "name": "Honduras",
    "flag": "hn",
    "color": "#eeeeeb",
    "shorts": "#2255a5",
    "rank": 66,
    "stars": 1,
    "region": "N. AMERICA"
  },
  {
    "id": "MKD",
    "name": "North Macedonia",
    "flag": "mk",
    "color": "#d42b36",
    "shorts": "#d42b36",
    "rank": 67,
    "stars": 1,
    "region": "EUROPE"
  },
  {
    "id": "UAE",
    "name": "United Arab Emirates",
    "flag": "ae",
    "color": "#eeeeeb",
    "shorts": "#eeeeeb",
    "rank": 68,
    "stars": 1,
    "region": "ASIA"
  },
  {
    "id": "CPV",
    "name": "Cape Verde",
    "flag": "cv",
    "color": "#295ac2",
    "shorts": "#295ac2",
    "rank": 69,
    "stars": 3.5,
    "region": "AFRICA"
  },
  {
    "id": "NIR",
    "name": "Northern Ireland",
    "flag": "gb-nir",
    "color": "#287c4d",
    "shorts": "#eeeeeb",
    "rank": 70,
    "stars": 1,
    "region": "EUROPE"
  }
];
var TEAM_BY_ID = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

// src/game.ts
var { Engine, Bodies, Body, Composite, Constraint, Events } = import_matter_js.default;
var rotateAt = Body.rotate;
var WIDTH = 1e3;
var GROUND = 510;
var GOAL_TOP = 310;
var PLAYER_BALL_IMPACT_BOOST = 0.65;
var BALL_SPEED_LIMIT = 42;
var BALL_RADIUS = 18.5;
var BALL_MASS = Bodies.circle(0, 0, 17, { density: 45e-4 }).mass;
var Match = class _Match {
  constructor(simulation = false) {
    this.simulation = simulation;
    const walls = [Bodies.rectangle(500, GROUND + 20, 1100, 40, { isStatic: true, friction: 0.48 }), Bodies.rectangle(-10, 280, 20, 560, { isStatic: true }), Bodies.rectangle(1010, 280, 20, 560, { isStatic: true }), Bodies.rectangle(500, -20, 1e3, 40, { isStatic: true }), Bodies.rectangle(32, GOAL_TOP, 64, 8, { isStatic: true }), Bodies.rectangle(968, GOAL_TOP, 64, 8, { isStatic: true })];
    Composite.add(this.engine.world, walls);
    for (let p = 0; p < 2; p++) {
      const x = p === 0 ? 140 : 860, g = Body.nextGroup(true), opt = { collisionFilter: { group: g }, friction: 0.48, restitution: 0.1, frictionAir: 3e-3 };
      const torso = Bodies.rectangle(x, 461, 42, 44, { ...opt, chamfer: { radius: 2 }, density: 22e-4 });
      const head = Bodies.circle(x, 426, 11, { ...opt, density: 2e-3 });
      const la = Bodies.rectangle(x - 26, 460, 10, 36, { ...opt }), ra = Bodies.rectangle(x + 26, 460, 10, 36, { ...opt });
      const ll = Bodies.rectangle(x - 11, 497, 11, 24, { ...opt }), rl = Bodies.rectangle(x + 11, 497, 11, 24, { ...opt });
      const parts = [torso, head, la, ra, ll, rl];
      parts.forEach((part) => Body.setMass(part, part.mass * 1.15));
      this.players.push(parts);
      const joints = [Constraint.create({ bodyA: torso, pointA: { x: 0, y: -22 }, bodyB: head, pointB: { x: 0, y: 11 }, stiffness: 0.96, length: 2 }), ...[-1, 1].map((side, i) => Constraint.create({ bodyA: torso, pointA: { x: side * 21, y: -17 }, bodyB: parts[i + 2], pointB: { x: -side * 5, y: -16 }, stiffness: 0.96, length: 0 })), ...[-1, 1].map((side, i) => Constraint.create({ bodyA: torso, pointA: { x: side * 11, y: 22 }, bodyB: parts[i + 4], pointB: { x: 0, y: -11 }, stiffness: 0.95, length: 2 }))];
      Composite.add(this.engine.world, [...parts, ...joints]);
    }
    this.ball = Bodies.circle(500, 160, BALL_RADIUS, { restitution: 0.9, friction: 0.012, frictionAir: 3e-4, density: 45e-4 });
    Body.setMass(this.ball, BALL_MASS);
    Composite.add(this.engine.world, this.ball);
    this.objects = [...this.players.flat(), this.ball];
    Events.on(this.engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        for (let p = 0; p < 2; p++) {
          if (!this.standing[p] || p === 1 && this.mode === "practice") continue;
          const a = this.players[p].includes(pair.bodyA), b = this.players[p].includes(pair.bodyB);
          const other = a ? pair.bodyB : b ? pair.bodyA : null;
          if (other && !other.isStatic && other.speed > 2.5) this.release(p);
        }
      }
    });
    Events.on(this.engine, "collisionStart", (event) => {
      if (this.phase !== "playing" || this.engine.timing.timestamp - this.lastBallImpact < 120) return;
      let strongest, closing = 2;
      for (const pair of event.pairs) {
        const other = pair.bodyA === this.ball ? pair.bodyB : pair.bodyB === this.ball ? pair.bodyA : null;
        if (!other || !this.players.some((parts) => parts.includes(other))) continue;
        const n = pair.collision.normal;
        const approach = -((pair.bodyA.velocity.x - pair.bodyB.velocity.x) * n.x + (pair.bodyA.velocity.y - pair.bodyB.velocity.y) * n.y);
        if (approach > closing) {
          closing = approach;
          strongest = pair;
        }
      }
      if (strongest) {
        const sign = strongest.bodyA === this.ball ? 1 : -1, n = strongest.collision.normal;
        this.pendingBallImpact = { x: n.x * sign * closing * this.impactBoost, y: n.y * sign * closing * this.impactBoost };
        this.lastBallImpact = this.engine.timing.timestamp;
      }
    });
    Events.on(this.engine, "afterUpdate", () => {
      this.limitJoints();
      if (!this.pendingBallImpact) return;
      const boost = this.pendingBallImpact;
      this.pendingBallImpact = null;
      const vx = this.ball.velocity.x + boost.x, vy = this.ball.velocity.y + boost.y;
      const scale = Math.min(1, BALL_SPEED_LIMIT / Math.max(1, Math.hypot(vx, vy)));
      Body.setVelocity(this.ball, { x: vx * scale, y: vy * scale });
    });
    Events.on(this.engine, "beforeUpdate", () => this.flexJoints(this.engine.timing.lastDelta));
    this.resetPositions();
  }
  simulation;
  impactBoost = PLAYER_BALL_IMPACT_BOOST;
  pendingBallImpact = null;
  lastBallImpact = -Infinity;
  roofRestTime = 0;
  engine = Engine.create({ gravity: { x: 0, y: 0.55 }, positionIterations: 8, velocityIterations: 8, constraintIterations: 4 });
  players = [];
  ball;
  objects = [];
  multiplayer = false;
  score = [0, 0];
  duration = 45;
  time = 45;
  phase = "idle";
  message = "";
  teams = ["ARG", "BRA"];
  cooldown = [0, 0];
  standing = [true, true];
  resetTimer = 0;
  aiTimer = 0;
  mode = "normal";
  difficulty = DEFAULT_DIFFICULTY;
  suddenDeath = false;
  onGoal;
  // Internal angular springs preserve anatomy without welding the pieces or
  // steering the figure upright. All angles are relative to its moving torso.
  flexJoints(delta) {
    const rest = [0, 0.16, -0.16, 0.08, -0.08], limits = [0.45, 1.9, 1.9, 0.95, 0.95];
    const step = Math.min(2, delta / (1e3 / 60));
    for (const parts of this.players) {
      const torso = parts[0];
      if (torso.isStatic) continue;
      parts.slice(1).forEach((part, i) => {
        const angle = Math.atan2(Math.sin(part.angle - torso.angle), Math.cos(part.angle - torso.angle));
        const excess = angle - Math.max(-limits[i], Math.min(limits[i], angle));
        const relative = part.angularVelocity - torso.angularVelocity;
        const correction = Math.max(-0.12, Math.min(0.12, ((rest[i] - angle) * 25e-4 - excess * 0.08 - relative * 0.045) * step));
        const inverse = part.inverseInertia + torso.inverseInertia;
        Body.setAngularVelocity(part, part.angularVelocity + correction * part.inverseInertia / inverse);
        Body.setAngularVelocity(torso, torso.angularVelocity - correction * torso.inverseInertia / inverse);
      });
    }
  }
  limitJoints() {
    const limits = [0.65, 2.15, 2.15, 1.15, 1.15];
    const anchors = [[0, 11], [5, -16], [-5, -16], [0, -11], [0, -11]];
    for (const parts of this.players) {
      const torso = parts[0];
      if (torso.isStatic) continue;
      parts.slice(1).forEach((part, i) => {
        const angle = Math.atan2(Math.sin(part.angle - torso.angle), Math.cos(part.angle - torso.angle));
        const correction = Math.max(-limits[i], Math.min(limits[i], angle)) - angle;
        if (!correction) return;
        const [x, y] = anchors[i], c = Math.cos(part.angle), s = Math.sin(part.angle);
        rotateAt(part, correction, { x: part.position.x + c * x - s * y, y: part.position.y + s * x + c * y });
        const relative = part.angularVelocity - torso.angularVelocity;
        if (relative * angle > 0) {
          const shared = (part.angularVelocity * part.inertia + torso.angularVelocity * torso.inertia) / (part.inertia + torso.inertia);
          Body.setAngularVelocity(part, shared);
          Body.setAngularVelocity(torso, shared);
        }
      });
    }
  }
  release(p) {
    this.standing[p] = false;
    this.players[p].forEach((b) => Body.setStatic(b, false));
  }
  resetPositions() {
    this.roofRestTime = 0;
    this.lastBallImpact = -Infinity;
    this.pendingBallImpact = null;
    this.resetBot();
    this.players.forEach((parts, p) => {
      const x = p ? 860 : 140, poses = [[x, 461], [x, 426], [x - 26, 460], [x + 26, 460], [x - 11, 497], [x + 11, 497]];
      parts.forEach((b, i) => {
        Body.setStatic(b, false);
        Body.setPosition(b, { x: poses[i][0], y: poses[i][1] });
        Body.setAngle(b, 0);
        Body.setVelocity(b, { x: 0, y: 0 });
        Body.setAngularVelocity(b, 0);
        b.collisionFilter.mask = p === 1 && this.mode === "practice" ? 0 : 4294967295;
        Body.setStatic(b, true);
      });
    });
    this.standing = [true, true];
    Body.setPosition(this.ball, { x: 500, y: 160 });
    Body.setVelocity(this.ball, { x: this.simulation ? 0 : (Math.random() - 0.5) * 5, y: -3 });
    Body.setAngularVelocity(this.ball, 0.08);
    this.cooldown = [0, 0];
    this.aiTimer = this.difficulty === "hard" ? 0 : DIFFICULTIES[this.difficulty].delay;
  }
  start(teams, mode, difficulty, duration) {
    this.teams = teams;
    this.mode = mode;
    this.difficulty = difficulty;
    this.duration = duration;
    this.time = duration;
    this.score = [0, 0];
    this.suddenDeath = false;
    this.phase = "countdown";
    this.message = "3";
    this.resetTimer = 2.4;
    this.resetPositions();
  }
  extraTime() {
    this.phase = "countdown";
    this.resetTimer = 2.4;
    this.suddenDeath = true;
    this.message = "3";
    this.resetPositions();
  }
  launch(p, x, y) {
    if (this.phase !== "playing" || this.cooldown[p] > 0 || p === 1 && this.mode === "practice") return false;
    const len = Math.hypot(x, y);
    if (len < 1) return false;
    const f = Math.min(1, 18.5 / len);
    if (p === 0) this.setHumanAim(null);
    this.release(p);
    const vx = x * f, vy = y * f;
    const spin = Math.sign(vx || 1) * Math.min(0.045, 0.015 + Math.hypot(vx, vy) * 16e-4);
    const parts = this.players[p], mass = parts.reduce((sum, b) => sum + b.mass, 0);
    const center = parts.reduce((c, b) => ({ x: c.x + b.position.x * b.mass / mass, y: c.y + b.position.y * b.mass / mass }), { x: 0, y: 0 });
    parts.forEach((b) => {
      Body.setVelocity(b, { x: vx - spin * (b.position.y - center.y), y: vy + spin * (b.position.x - center.x) });
      Body.setAngularVelocity(b, spin);
    });
    this.cooldown[p] = 0.28;
    return true;
  }
  tick(dt) {
    this.cooldown = this.cooldown.map((v) => Math.max(0, v - dt));
    if (this.phase === "countdown") {
      this.resetTimer -= dt;
      this.message = String(Math.max(1, Math.ceil(this.resetTimer)));
      if (this.resetTimer <= 0) {
        this.phase = "playing";
        this.message = "";
      }
      return;
    }
    if (this.phase === "goal") {
      this.engine.timing.timeScale = 0.08;
      Engine.update(this.engine, dt * 500);
      Engine.update(this.engine, dt * 500);
      this.engine.timing.timeScale = 1;
      this.resetTimer -= dt;
      if (this.resetTimer <= 0) {
        if ((this.mode === "golden" || this.suddenDeath) && this.mode !== "practice") {
          this.finish();
        } else {
          this.phase = "countdown";
          this.resetTimer = 1;
          this.message = "1";
          this.resetPositions();
        }
      }
      return;
    }
    if (this.phase !== "playing") return;
    if (this.mode === "normal" && !this.suddenDeath) {
      this.time = Math.max(0, this.time - dt);
      if (this.time === 0) {
        this.finish();
        return;
      }
    }
    for (let step = 0; step < 2; step++) {
      if (!this.multiplayer && this.mode !== "practice") this.ai(dt * 0.5);
      Engine.update(this.engine, dt * 500);
    }
    this.releaseRoofBall(dt);
    this.objects.forEach((b) => {
      const v = b.velocity, l = Math.hypot(v.x, v.y);
      const limit = b === this.ball ? BALL_SPEED_LIMIT : 34;
      if (l > limit) Body.setVelocity(b, { x: v.x * limit / l, y: v.y * limit / l });
    });
    if (this.ball.position.y > GOAL_TOP + 20 && (this.ball.position.x < 43 || this.ball.position.x > 957)) {
      const scorer = this.ball.position.x < 53 ? 1 : 0;
      this.score[scorer]++;
      this.phase = "goal";
      this.resetTimer = 2.4;
      this.message = "GOAL!";
      this.onGoal?.();
    }
  }
  // Ball-only crossbar escape. No AI input or player forces are involved.
  releaseRoofBall(dt) {
    const b = this.ball, { x, y } = b.position;
    const roofY = GOAL_TOP - 4 - BALL_RADIUS;
    const left = x >= BALL_RADIUS && x <= 82;
    const right = x >= 918 && x <= WIDTH - BALL_RADIUS;
    if (this.phase !== "playing" || !left && !right || Math.abs(y - roofY) > 9 || Math.abs(b.velocity.y) > 2.2 || Math.abs(b.velocity.x) > 3) {
      this.roofRestTime = 0;
      return;
    }
    this.roofRestTime += dt;
    if (this.roofRestTime < 0.25) return;
    const direction = left ? 1 : -1;
    Body.setVelocity(b, { x: direction * 8, y: -2.8 });
    Body.setAngularVelocity(b, direction * 0.18);
    this.roofRestTime = 0;
  }
  // CPU v2: perception -> priority tactics -> legal launch/hold -> observe again.
  // botState keeps the old debug labels compatible; botTactic is the actual FSM.
  botTactic = "ATTACK";
  get botState() {
    return this.botTactic === "RECOVER" ? "recover" : this.botTactic === "ATTACK" || this.botTactic === "PRESS" ? "charge" : "defend";
  }
  botTarget = { x: 500, y: 160 };
  botStatus = { state: "ATTACK", action: "hold", reason: "kickoff", target: { x: 500, y: 160 }, goalIn: null, aimRisk: 0, grounded: true };
  // Opt-in, bounded diagnostics. No logging or growing history during normal play.
  botDebug = false;
  botHistory = [];
  botOpening = true;
  botClock = 0;
  botGroundTime = 0;
  botLaunchAge = 1;
  botStuckTime = 0;
  botQuietTime = 0;
  botStillTime = 0;
  botProgressAnchor = { x: 860, y: 460 };
  botStateAge = 0;
  botProbeWait = 0;
  botWasReady = false;
  botLastThreat = false;
  botAim = null;
  botAimAge = Infinity;
  botSandbox = null;
  resetBot() {
    this.botTactic = "ATTACK";
    this.botTarget = { x: 500, y: 160 };
    this.botOpening = true;
    this.botClock = 0;
    this.botGroundTime = 0;
    this.botLaunchAge = 1;
    this.botStuckTime = 0;
    this.botQuietTime = 0;
    this.botStateAge = 0;
    this.botProbeWait = 0;
    this.botWasReady = false;
    this.botLastThreat = false;
    this.botStillTime = 0;
    this.botProgressAnchor = { x: 860, y: 460 };
    this.botAim = null;
    this.botAimAge = Infinity;
    this.botHistory = [];
    this.botStatus = { state: "ATTACK", action: "hold", reason: "kickoff", target: { ...this.botTarget }, goalIn: null, aimRisk: 0, grounded: true };
  }
  // Input is the visible arrow in canvas units, just as supplied to paint().
  // A headless caller may supply it directly; release/cancel/reset clears it.
  setHumanAim(aim) {
    if (!aim || !Number.isFinite(aim.x) || !Number.isFinite(aim.y) || this.multiplayer || this.mode === "practice" || this.phase !== "playing") {
      this.botAim = null;
      this.botAimAge = Infinity;
      return;
    }
    const speed = Math.hypot(aim.x, aim.y) * 0.058;
    if (speed < 1) {
      this.botAim = null;
      this.botAimAge = Infinity;
      return;
    }
    const scale = 0.058 * Math.min(1, 18.5 / speed);
    this.botAim = { x: aim.x * scale, y: aim.y * scale };
    this.botAimAge = 0;
  }
  botRoofSupport(player) {
    const parts = this.players[player];
    for (const pair of this.engine.pairs.list) {
      if (!pair.isActive) continue;
      const part = parts.includes(pair.bodyA) ? pair.bodyA : parts.includes(pair.bodyB) ? pair.bodyB : null;
      if (!part) continue;
      const roof = pair.bodyA === part ? pair.bodyB : pair.bodyA;
      if (roof.isStatic && Math.abs(roof.position.y - GOAL_TOP) < 1 && Math.abs(pair.collision.normal.y) > 0.55 && part.position.y < roof.bounds.min.y + 1 && part.velocity.y >= -0.7 && (roof.bounds.max.x < 90 || roof.bounds.min.x > WIDTH - 90)) return roof.position.x < WIDTH / 2 ? -1 : 1;
    }
    return 0;
  }
  botSupported(player) {
    const parts = this.players[player];
    if (this.standing[player]) return true;
    if (this.botRoofSupport(player)) return true;
    const floor = parts.some((b) => b.bounds.max.y >= GROUND - 3 && b.velocity.y >= -0.7);
    if (floor) return true;
    return this.engine.pairs.list.some((pair) => {
      if (!pair.isActive) return false;
      const other = parts.includes(pair.bodyA) ? pair.bodyB : parts.includes(pair.bodyB) ? pair.bodyA : null;
      if (!other) return false;
      const support = this.players[1 - player];
      if (support.includes(other)) return other.speed < 2.5 && parts[0].position.y < other.position.y && support.some((b) => b.bounds.max.y >= GROUND - 3) && parts[0].velocity.y >= -0.7;
      if (other === this.ball) return other.speed < 2 && other.bounds.max.y >= GROUND - 2 && parts[0].position.y < other.position.y && parts[0].velocity.y >= -0.7;
      return other.isStatic && other.position.y >= GROUND && parts[0].velocity.y >= -0.7;
    });
  }
  botCenter(player) {
    let x = 0, y = 0, vx = 0, vy = 0, total = 0;
    for (const body of this.players[player]) {
      const original = body._original;
      const mass = Number.isFinite(body.mass) ? body.mass : original?.mass || 1;
      x += body.position.x * mass;
      y += body.position.y * mass;
      vx += body.velocity.x * mass;
      vy += body.velocity.y * mass;
      total += mass;
    }
    return { x: x / total, y: y / total, vx: vx / total, vy: vy / total };
  }
  // Launch velocity is measured per 60 Hz frame. Integrate the same two half
  // steps and air drag as tick(), rather than mixing seconds and frame units.
  botMotion(frames, drag = 3e-3) {
    let distance = 0, gravity = 0, speed = 1, fall = 0;
    const g = this.engine.gravity.y * this.engine.gravity.scale * (1e3 / 60) ** 2;
    for (let f = 0; f < frames * 2; f++) {
      speed *= 1 - drag * 0.5;
      fall = fall * (1 - drag * 0.5) + g * 0.5;
      distance += speed * 0.5;
      gravity += fall * 0.5;
    }
    return { distance, gravity, speed, fall };
  }
  botTrajectory(frames) {
    let { x, y } = this.ball.position, { x: vx, y: vy } = this.ball.velocity;
    const path = [{ x, y, vx, vy, frame: 0, goal: null }];
    const r = BALL_RADIUS, g = this.engine.gravity.y * this.engine.gravity.scale * (1e3 / 60) ** 2;
    const roof = GOAL_TOP - 4 - r, under = GOAL_TOP + 4 + r;
    for (let frame2 = 1; frame2 <= frames; frame2++) {
      for (let step = 0; step < 2; step++) {
        const ox = x, oy = y;
        vx *= 1 - this.ball.frictionAir * 0.5;
        vy = vy * (1 - this.ball.frictionAir * 0.5) + g * 0.5;
        x += vx * 0.5;
        y += vy * 0.5;
        if (x < r) {
          x = r + (r - x);
          vx = Math.abs(vx) * 0.9;
        }
        if (x > WIDTH - r) {
          x = WIDTH - r - (x - (WIDTH - r));
          vx = -Math.abs(vx) * 0.9;
        }
        if (y < r) {
          y = r + (r - y);
          vy = Math.abs(vy) * 0.9;
        }
        if (y > GROUND - r) {
          y = GROUND - r;
          vy = -Math.abs(vy) * 0.9;
        }
        if (x < 64 + r || x > 936 - r) {
          if (oy <= roof + 2 && y > roof && vy > 0) {
            y = roof;
            vy = -Math.abs(vy) * 0.9;
          } else if (oy >= under - 2 && y < under && vy < 0) {
            y = under;
            vy = Math.abs(vy) * 0.9;
          }
        }
        if (y > roof && y < under) {
          if (ox >= 64 + r && x < 64 + r) {
            x = 64 + r;
            vx = Math.abs(vx) * 0.9;
          }
          if (ox <= 936 - r && x > 936 - r) {
            x = 936 - r;
            vx = -Math.abs(vx) * 0.9;
          }
        }
      }
      const goal = y > GOAL_TOP + 20 ? x > 957 ? 1 : x < 43 ? 0 : null : null;
      path.push({ x, y, vx, vy, frame: frame2, goal });
      if (goal !== null) break;
    }
    return path;
  }
  botOnRoof() {
    const { x, y } = this.ball.position, v = this.ball.velocity;
    return (x <= 82 || x >= 918) && Math.abs(y - (GOAL_TOP - 4 - BALL_RADIUS)) <= 9 && Math.abs(v.x) <= 3 && Math.abs(v.y) <= 2.2;
  }
  botAimThreat(path) {
    if (!this.botAim || this.botAimAge > 0.12 || this.cooldown[0] > 0) return 0;
    const human = this.botCenter(0), aim = this.botAim;
    if (aim.x < 3 || human.x > this.ball.position.x + 45) return 0;
    let risk = 0;
    for (let f = 2; f < Math.min(path.length, 29); f += 2) {
      const motion = this.botMotion(f), q = path[f];
      const x = human.x + aim.x * motion.distance, y = human.y + aim.y * motion.distance + motion.gravity;
      const gap = Math.hypot(x - q.x, y - q.y);
      if (gap < 68 && q.x > 450) risk = Math.max(risk, (1 - gap / 90) * (1 - f / 70));
    }
    return risk * (this.difficulty === "hard" ? 1 : this.difficulty === "normal" ? 0.65 : 0.3);
  }
  botPassiveContact(path, limit = 24) {
    for (let f = 1; f < Math.min(path.length, limit + 1); f++) {
      const q = path[f], motion = this.botMotion(f);
      for (let i = 0; i < 6; i++) {
        const part = this.players[1][i], fixed = part.isStatic;
        const a = part.angle + (fixed ? 0 : part.angularVelocity * motion.distance);
        const c = Math.cos(a), s = Math.sin(a), hw = [21, 11, 5, 5, 5.5, 5.5][i], hh = [22, 11, 18, 18, 12, 12][i];
        const x = part.position.x + (fixed ? 0 : part.velocity.x * motion.distance);
        const y = fixed ? part.position.y : Math.min(GROUND - Math.abs(c) * hh - Math.abs(s) * hw, part.position.y + part.velocity.y * motion.distance + motion.gravity);
        const dx = q.x - x, dy = q.y - y, localX = dx * c + dy * s, localY = -dx * s + dy * c;
        const gap = i === 1 ? Math.hypot(dx, dy) - 11 : Math.hypot(Math.max(0, Math.abs(localX) - hw), Math.max(0, Math.abs(localY) - hh));
        if (gap < BALL_RADIUS - 2) return f;
      }
    }
    return null;
  }
  botIntercepts(path, blocking, deadline = 72) {
    const p = this.botCenter(1), enemy = this.botCenter(0), power = DIFFICULTIES[this.difficulty].power;
    const options = [];
    const offsets = blocking ? [[24, 0], [0, 26], [12, -24], [-12, 4]] : [[32, 12], [25, 30], [42, -10], [48, 6]];
    for (let f = 3; f < Math.min(path.length, deadline + 1); f += 2) {
      const q = path[f];
      if (q.goal !== null) break;
      if (q.y < 65 || (q.x < 83 || q.x > 917) && q.y < GOAL_TOP + 20) continue;
      const motion = this.botMotion(f);
      for (const [ox, oy] of offsets) {
        const x = q.x + ox, y = q.y + oy;
        if (x > 966 || x < 35 || y < 60 || y > GROUND - 12) continue;
        const vx = (x - p.x) / motion.distance, vy = (y - p.y - motion.gravity) / motion.distance;
        const speed = Math.hypot(vx, vy);
        if (speed > power || speed < 2 || !blocking && vx >= -0.65) continue;
        const enemyEta = Math.max(this.cooldown[0] * 60, Math.max(0, Math.hypot(q.x - enemy.x, q.y - enemy.y) - 45) / 18.5);
        const margin = enemyEta - f;
        const shotQuality = Math.max(0, -vx * motion.speed - q.vx);
        const score = (blocking ? 210 : 165) - f * 1.15 + shotQuality * 2.8 + Math.min(12, margin) * 1.1 - Math.max(0, -margin) * 1.2 - Math.abs(oy - 12) * 0.14 - (blocking ? Math.max(0, vx) * 3 : Math.max(0, q.x - 740) * 0.12);
        options.push({ kind: blocking ? "block" : "strike", x: vx, y: vy, target: { x: q.x, y: q.y }, frames: f, score, margin });
      }
    }
    return this.botShortlist(options, blocking ? 6 : 6);
  }
  botShortlist(options, count) {
    options.sort((a, b) => b.score - a.score);
    const result = [];
    for (const option of options) {
      if (result.some((old) => Math.hypot(option.x - old.x, option.y - old.y) < 1.1)) continue;
      result.push(option);
      if (result.length >= count) break;
    }
    return result;
  }
  botMoves(target, recover = false) {
    const p = this.botCenter(1), power = DIFFICULTIES[this.difficulty].power, dx = target.x - p.x;
    if (recover) {
      const direction = Math.abs(dx) > 45 ? Math.sign(dx) : this.ball.position.x < p.x ? -1 : 1;
      return [-5, -7, -9].map((y, i) => ({ kind: "recover", x: direction * (2 + i * 1.5), y, target, frames: 45 + i * 8, score: 80 - i, margin: 0 }));
    }
    const options = [];
    for (const frames of [24, 36, 50, 64]) {
      const motion = this.botMotion(frames), vx = dx / motion.distance;
      for (const lift of [0, 2.5]) {
        const vy = (target.y - p.y - motion.gravity) / motion.distance - lift;
        if (Math.hypot(vx, vy) > power || Math.hypot(vx, vy) < 1.2) continue;
        const score = 90 - frames * 0.4 - lift * 2 - Math.abs(vx) * 0.15;
        options.push({ kind: "move", x: vx, y: Math.min(-1.5, vy), target, frames, score, margin: 0 });
      }
    }
    if (!options.length && Math.abs(dx) > 40) options.push({ kind: "move", x: Math.sign(dx) * Math.min(power * 0.83, 15), y: -4.5, target, frames: 50, score: 40, margin: 0 });
    return this.botShortlist(options, 4);
  }
  botRoofEscapes(side, home) {
    const direction = -side, power = DIFFICULTIES[this.difficulty].power;
    return [[3, -2], [5, -2], [4, 0.75], [6, -4], [3, -4], [8, -1]].map(([x, y], i) => ({
      kind: "escape",
      x: direction * Math.min(x, power * 0.7),
      y,
      target: home,
      frames: 64,
      score: 120 - i,
      margin: 0
    }));
  }
  botCopyWorld() {
    const world = this.botSandbox || (this.botSandbox = new _Match(true));
    Engine.clear(world.engine);
    world.engine.world.isModified = true;
    world.engine.timing.timestamp = 0;
    world.engine.timing.timeScale = 1;
    world.engine.gravity.x = this.engine.gravity.x;
    world.engine.gravity.y = this.engine.gravity.y;
    world.engine.gravity.scale = this.engine.gravity.scale;
    world.multiplayer = true;
    world.mode = "normal";
    world.phase = "playing";
    world.duration = 60;
    world.time = 60;
    world.score = [0, 0];
    world.cooldown = [...this.cooldown];
    world.standing = [...this.standing];
    world.impactBoost = this.impactBoost;
    world.pendingBallImpact = null;
    world.roofRestTime = this.roofRestTime;
    world.lastBallImpact = this.lastBallImpact - this.engine.timing.timestamp;
    for (let i = 0; i < this.objects.length; i++) {
      const from = this.objects[i], to = world.objects[i];
      to.deltaTime = from.deltaTime;
      Body.setStatic(to, false);
      Body.setPosition(to, from.position);
      Body.setAngle(to, from.angle);
      Body.setVelocity(to, from.velocity);
      Body.setAngularVelocity(to, from.angularVelocity);
      to.force.x = from.force.x;
      to.force.y = from.force.y;
      to.torque = from.torque;
      to.collisionFilter.mask = from.collisionFilter.mask;
      const internal = to, source = from;
      Object.assign(internal.positionImpulse, source.positionImpulse);
      Object.assign(internal.constraintImpulse, source.constraintImpulse);
      if (from.isStatic) Body.setStatic(to, true);
      Object.assign(internal.positionPrev, source.positionPrev);
      internal.anglePrev = source.anglePrev;
      from.vertices.forEach((v, j) => {
        to.vertices[j].x = v.x;
        to.vertices[j].y = v.y;
      });
      from.axes.forEach((v, j) => {
        to.axes[j].x = v.x;
        to.axes[j].y = v.y;
      });
      Object.assign(to.bounds.min, from.bounds.min);
      Object.assign(to.bounds.max, from.bounds.max);
    }
    const sourceJoints = Composite.allConstraints(this.engine.world), copyJoints = Composite.allConstraints(world.engine.world);
    for (let i = 0; i < sourceJoints.length; i++) {
      const from = sourceJoints[i], to = copyJoints[i];
      Object.assign(to.pointA, from.pointA);
      Object.assign(to.pointB, from.pointB);
      to.angleA = from.angleA;
      to.angleB = from.angleB;
    }
    return world;
  }
  botRollout(option, frames) {
    const world = this.botCopyWorld();
    let touch = false, touchFrame = Infinity, touchVX = 0, touchVY = 0, frame2 = 0;
    let contactNow = false;
    const contact = (event) => {
      for (const pair of event.pairs) {
        const other = pair.bodyA === world.ball ? pair.bodyB : pair.bodyB === world.ball ? pair.bodyA : null;
        if (other && world.players[1].includes(other)) {
          contactNow = true;
          if (!touch) {
            touch = true;
            touchFrame = frame2;
          }
        }
      }
    };
    Events.on(world.engine, "collisionStart", contact);
    if (option) world.launch(1, option.x, option.y);
    let minX = world.ball.position.x;
    try {
      for (frame2 = 1; frame2 <= frames && world.phase === "playing"; frame2++) {
        world.tick(1 / 60);
        minX = Math.min(minX, world.ball.position.x);
        if (contactNow) {
          touchVX = world.ball.velocity.x;
          touchVY = world.ball.velocity.y;
          contactNow = false;
        }
        if (option?.kind === "strike" && !touch && frame2 > option.frames + 12) {
          const center = world.botCenter(1);
          if (Math.hypot(center.x - world.ball.position.x, center.y - world.ball.position.y) > 110) break;
        }
      }
    } finally {
      Events.off(world.engine, "collisionStart", contact);
    }
    const end = world.botCenter(1), ball = world.ball;
    const forecast = touch && world.phase === "playing" ? world.botTrajectory(90).find((q) => q.goal !== null)?.goal ?? null : null;
    return {
      touch,
      touchFrame,
      touchVX,
      touchVY,
      ownGoal: world.score[0] > 0,
      goal: world.score[1] > 0,
      forecast,
      endFrame: frame2 - 1,
      x: ball.position.x,
      y: ball.position.y,
      vx: ball.velocity.x,
      vy: ball.velocity.y,
      minX,
      cpuX: end.x,
      cpuY: end.y,
      cpuVX: end.vx,
      cpuVY: end.vy,
      onGoalRoof: world.botRoofSupport(1) !== 0
    };
  }
  botProbeScore(probe, option, threat) {
    if (probe.ownGoal) return -Infinity;
    const ball = this.ball.position, p = this.botCenter(1);
    if (option.kind === "escape") {
      if (probe.onGoalRoof || probe.cpuY < GOAL_TOP + 35) return -Infinity;
      return 230 - Math.abs(probe.cpuX - option.target.x) * 0.24 - Math.abs(probe.cpuY - option.target.y) * 0.12 - Math.abs(probe.cpuVX) * 1.5 + (probe.touch && probe.touchVX < 0 ? 25 : 0);
    }
    if (option.kind === "strike" || option.kind === "block") {
      if (!probe.touch && !probe.goal) return -Infinity;
      const progress = ball.x - probe.minX;
      if (option.kind === "strike" && !probe.goal && (progress < 22 || probe.touchVX > -0.8)) return -Infinity;
      if (probe.x > 900 && probe.vx > 1 && !probe.goal) return -Infinity;
      const exposedCounter = probe.vx > 4 && probe.x > probe.cpuX + 75 && probe.x > 450;
      if (option.kind === "strike" && exposedCounter) return -Infinity;
      return (probe.goal ? 600 : 0) + Math.min(450, progress) * 0.45 + Math.max(-24, Math.min(24, -probe.touchVX)) * 4 - Math.min(80, probe.touchFrame) * 0.6 - (probe.vx > 3 && probe.x > 700 ? 85 : 0) - (threat ? 0 : Math.max(0, 810 - probe.cpuX) * 0.025) + option.score * 0.08;
    }
    const before = Math.abs(p.x - option.target.x), after = Math.abs(probe.cpuX - option.target.x);
    if (option.kind === "recover") return 60 - after * 0.1 - Math.abs(probe.cpuVY) * 0.5 + (probe.touch && probe.touchVX < 0 ? 25 : 0);
    if (after > before - 12 && after > 32) return -Infinity;
    if (probe.touch && probe.touchVX > 3 && ball.x > 650) return -Infinity;
    return 110 + (before - after) * 0.7 - after * 0.4 - Math.abs(probe.cpuVX) * 2 - Math.max(0, 410 - probe.cpuY) * 0.2;
  }
  botReport(action, reason, goalIn, aimRisk, grounded, launch) {
    const old = this.botStatus;
    this.botStatus = { state: this.botTactic, action, reason, target: { ...this.botTarget }, goalIn, aimRisk, grounded, time: this.botClock, ...launch ? { launch } : {} };
    if (this.botDebug && (old.state !== this.botTactic || old.action !== action || old.reason !== reason || action === "launch")) {
      this.botHistory.push({ ...this.botStatus, target: { ...this.botTarget } });
      if (this.botHistory.length > 120) this.botHistory.shift();
    }
  }
  ai(dt) {
    if (this.simulation || this.multiplayer || this.mode === "practice" || this.phase !== "playing") return;
    this.botClock += dt;
    this.botStateAge += dt;
    this.botLaunchAge += dt;
    this.botAimAge += dt;
    this.aiTimer = Math.max(0, this.aiTimer - dt);
    this.botProbeWait = Math.max(0, this.botProbeWait - dt);
    const p = this.botCenter(1), enemy = this.botCenter(0), ball = this.ball.position;
    const goalRoof = this.botRoofSupport(1);
    const grounded = this.botSupported(1), ready = grounded && this.botLaunchAge >= 0.28 && this.cooldown[1] <= 0;
    if (!grounded || Math.hypot(p.x - this.botProgressAnchor.x, p.y - this.botProgressAnchor.y) > 16) {
      this.botStillTime = 0;
      this.botProgressAnchor = { x: p.x, y: p.y };
    } else this.botStillTime += dt;
    this.botGroundTime = grounded ? this.botGroundTime + dt : 0;
    const justReady = ready && !this.botWasReady;
    this.botWasReady = ready;
    const path = this.botTrajectory(this.difficulty === "hard" ? 100 : this.difficulty === "normal" ? 82 : 66);
    const incoming = path.find((q) => q.goal === 1), goalIn = incoming ? incoming.frame / 60 : null;
    const aimRisk = this.botAimThreat(path), roof = this.botOnRoof();
    const enemyNear = Math.hypot(ball.x - enemy.x, ball.y - enemy.y) < 160 && enemy.x < ball.x + 50;
    const pressure = ball.x > 570 && enemyNear && (this.cooldown[0] <= 0 || enemy.vx > 3);
    const danger = !!incoming;
    const urgent = danger && !this.botLastThreat;
    this.botLastThreat = danger;
    const passed = ball.x > p.x + 20 && ball.x > 680 && !roof;
    const needsCover = danger || aimRisk > 0.22 || pressure || passed;
    const angle = Math.atan2(Math.sin(this.players[1][0].angle), Math.cos(this.players[1][0].angle));
    const tangled = grounded && Math.hypot(p.vx, p.vy) < 4 && (Math.abs(angle) > 1.2 || this.players[1][1].position.y > p.y + 8);
    this.botStuckTime = tangled ? this.botStuckTime + dt : 0;
    this.botQuietTime = this.ball.speed < 2 && Math.hypot(enemy.vx, enemy.vy) < 2 ? this.botQuietTime + dt : 0;
    if (roof) this.botOpening = false;
    const home = { x: Math.max(850, Math.min(920, ball.x + 65)), y: 462 };
    const usefulCover = !goalRoof && grounded && Math.abs(p.x - home.x) <= 45 && p.y > GOAL_TOP + 55;
    const stalled = this.botStillTime > 0.65 && !usefulCover;
    let options = [], next = "GOALKEEP", reason = "cover the shooting lane";
    let target = { ...home }, hold = false;
    if (danger) {
      next = "GOALKEEP";
      reason = "intercept a goal-bound ball";
      options = this.botIntercepts(path, true, incoming.frame - 1);
      const lane = path.find((q) => q.x >= Math.max(830, p.x) && q.vx > 0) || incoming;
      target = { x: Math.max(820, Math.min(935, lane.x)), y: Math.max(340, Math.min(480, lane.y)) };
      if (goalRoof) options.push(...this.botRoofEscapes(goalRoof, home));
    } else if (goalRoof) {
      next = "RECOVER";
      reason = "leave the goal roof and return to play";
      options = this.botRoofEscapes(goalRoof, home);
    } else if (!grounded) {
      const contact = this.botPassiveContact(path, 18);
      if (contact !== null && this.ball.position.x < p.x + 25) {
        next = "ATTACK";
        reason = "follow the committed interception";
        target = { x: path[contact].x, y: path[contact].y };
      } else {
        next = "RETREAT";
        reason = "prepare retreat before landing";
      }
    } else {
      const attacks = roof ? [] : this.botIntercepts(path, false, this.difficulty === "easy" ? 46 : 72);
      const best = attacks[0];
      const favorable = best && (this.botOpening || best.margin > -5 || ball.x < 510 || this.botQuietTime > 0.65);
      const press = best && ball.x > 430 && best.margin > (this.difficulty === "hard" ? 1 : this.difficulty === "normal" ? 3 : 6);
      if (stalled || this.botStuckTime > 0.16 && !needsCover) {
        next = "RECOVER";
        reason = stalled ? "unstick and restore a useful position" : "recover with an ordinary launch";
        options = this.botMoves(home, true);
      } else if (!roof && best && (favorable && !needsCover || press && !passed)) {
        next = press && ball.x > 520 && !this.botOpening ? "PRESS" : "ATTACK";
        reason = this.botOpening ? "contest kickoff" : next === "PRESS" ? "win a favorable interception" : "strike toward the left goal";
        options = attacks;
        target = { ...best.target };
      } else if (Math.abs(p.x - home.x) > 40 || p.x < ball.x + 18 && ball.x > 640) {
        next = "RETREAT";
        reason = needsCover ? "return before the human shot" : "return to a useful defensive position";
        options = this.botMoves(home);
      } else if (!needsCover && !roof && ball.x < 730 && (this.botQuietTime > 0.65 || !enemyNear) && !best) {
        next = "ATTACK";
        reason = "reposition on the defensive side of the ball";
        target = { x: Math.max(180, Math.min(855, ball.x + 120)), y: 462 };
        options = this.botMoves(target);
      } else if (usefulCover) {
        hold = true;
        reason = roof ? "cover the crossbar release" : needsCover ? "hold the shooting lane" : "hold a useful defensive position";
      } else {
        next = "RECOVER";
        reason = "get into a usable defensive stance";
        options = this.botMoves(home, true);
      }
    }
    if ((next === "ATTACK" || next === "PRESS") && (this.botTactic === "ATTACK" || this.botTactic === "PRESS") && next !== this.botTactic && !danger && this.botStateAge < 0.1 && options[0] && options[0].margin < 7) next = this.botTactic;
    if (next !== this.botTactic) {
      this.botTactic = next;
      this.botStateAge = 0;
      this.botProbeWait = 0;
    }
    this.botTarget = target;
    if (!grounded) {
      this.botReport("wait-ground", reason, goalIn, aimRisk, false);
      return;
    }
    if (!ready) {
      this.botReport("wait-cooldown", reason, goalIn, aimRisk, true);
      return;
    }
    if (this.aiTimer > 0) {
      this.botReport("wait-reaction", reason, goalIn, aimRisk, true);
      return;
    }
    if (hold) {
      this.botReport("hold", reason, goalIn, aimRisk, true);
      return;
    }
    if (this.botProbeWait > 0 && !justReady && !urgent) {
      this.botReport("hold", "tracking the next useful contact", goalIn, aimRisk, true);
      return;
    }
    let selected = null, bestScore = -Infinity;
    if (!goalRoof && (danger || this.botPassiveContact(path, 12) !== null)) {
      const duration = danger ? Math.min(80, incoming.frame + 18) : 36;
      const stay = this.botRollout(null, duration);
      const usefulContact = stay.touch && (danger || Math.hypot(stay.x - ball.x, stay.y - ball.y) > 25 || Math.hypot(stay.vx, stay.vy) > 3);
      if (!stay.ownGoal && (usefulContact || stay.goal) && !(stay.x > 900 && stay.vx > 1)) {
        this.botProbeWait = 0.05;
        this.botReport("hold", danger ? "body already blocks the incoming shot" : "let the ball reach the existing contact", goalIn, aimRisk, true);
        return;
      }
    }
    let candidates = options;
    if (options[0]?.kind === "strike") {
      const screened = [];
      for (const option of options) {
        const probe = this.botRollout(option, Math.min(64, option.frames + 10));
        const score = this.botProbeScore(probe, option, false) + (probe.forecast === 0 ? 150 : 0);
        if (Number.isFinite(score)) screened.push({ option, score });
      }
      screened.sort((a, b) => b.score - a.score);
      candidates = screened.slice(0, 3).map((s) => s.option);
    }
    let checked = 0;
    for (const option of candidates) {
      const frames = Math.min(84, Math.max(option.kind === "strike" ? 84 : option.kind === "move" || option.kind === "recover" ? 64 : 42, option.frames + 24, danger ? incoming.frame + 12 : 0));
      const probe = this.botRollout(option, frames), score = this.botProbeScore(probe, option, danger);
      if (score > bestScore) {
        bestScore = score;
        selected = option;
      }
      checked++;
      if (selected && (danger || probe.goal || option.kind === "recover" || checked >= 2)) break;
      if (checked >= 4 && !danger) break;
    }
    if (!selected && goalRoof) {
      const exits = this.botRoofEscapes(goalRoof, home);
      let exitScore = -Infinity;
      for (const option of exits) {
        const probe = this.botRollout(option, 84);
        const score = (probe.ownGoal ? -1e3 + probe.endFrame * 4 : 0) + (probe.onGoalRoof ? -400 : 100) + Math.min(100, probe.cpuY - p.y) - Math.abs(probe.cpuX - home.x) * 0.1;
        if (score > exitScore) {
          exitScore = score;
          selected = option;
        }
      }
      selected = selected || exits[0];
      reason = danger ? "leave the roof to recover the shooting lane" : "leave the goal roof and return to play";
    }
    if (!selected && !danger && (next === "ATTACK" || next === "PRESS")) {
      const advance = !needsCover && !roof && ball.x < 660 && (!enemyNear || this.botQuietTime > 0.65);
      target = advance ? { x: Math.max(180, Math.min(855, ball.x + 110)), y: 462 } : home;
      this.botTactic = advance ? "ATTACK" : "RETREAT";
      this.botTarget = target;
      reason = advance ? "improve the next shooting angle" : "retreat after rejecting an unsafe challenge";
      if (Math.abs(p.x - target.x) > 35) {
        let moves = 0;
        for (const option of this.botMoves(target)) {
          const probe = this.botRollout(option, 76), score = this.botProbeScore(probe, option, false);
          if (score > bestScore) {
            bestScore = score;
            selected = option;
          }
          if (++moves >= 2 && selected) break;
        }
      }
    }
    if (!selected && danger && Math.abs(p.x - home.x) > 45) {
      let moves = 0;
      for (const option of this.botMoves(home)) {
        const probe = this.botRollout(option, Math.min(80, incoming.frame + 16));
        const progress = Math.abs(p.x - home.x) - Math.abs(probe.cpuX - home.x);
        const score = probe.ownGoal && probe.endFrame >= incoming.frame - 1 && progress > 25 ? -1e3 + probe.endFrame * 2 + progress * 0.1 : this.botProbeScore(probe, option, true);
        if (score > bestScore) {
          bestScore = score;
          selected = option;
        }
        if (++moves >= 2 && selected) break;
      }
    }
    if (selected && this.launch(1, selected.x, selected.y)) {
      this.botOpening = false;
      this.botLaunchAge = 0;
      this.botGroundTime = 0;
      this.botWasReady = false;
      this.botStuckTime = 0;
      this.botProbeWait = 0;
      this.aiTimer = this.difficulty === "hard" ? 0 : DIFFICULTIES[this.difficulty].delay;
      this.botStillTime = 0;
      this.botProgressAnchor = { x: p.x, y: p.y };
      this.botTarget = { ...selected.target };
      this.botReport("launch", reason, goalIn, aimRisk, true, { x: selected.x, y: selected.y });
    } else {
      this.botProbeWait = this.difficulty === "hard" ? 0.06 : 0.12;
      this.botReport("hold", danger ? "no safe reachable block; preserve existing cover" : "no useful legal launch; track and reposition", goalIn, aimRisk, true);
    }
  }
  finish() {
    this.phase = "finished";
    this.message = this.score[0] === this.score[1] ? "DRAW" : this.score[0] > this.score[1] ? "YOU WIN!" : "YOU LOSE";
  }
  dispose() {
    this.botSandbox?.dispose();
    this.botSandbox = null;
    Composite.clear(this.engine.world, false);
    Engine.clear(this.engine);
  }
};

// server/index.mjs
var root = resolve(dirname(fileURLToPath(import.meta.url)), "client");
var rooms = /* @__PURE__ */ new Map();
var connections = /* @__PURE__ */ new Map();
var allowed = process.env.ALLOWED_ORIGINS?.split(",").map((x) => x.trim()).filter(Boolean);
var mime = { ".mp4": "video/mp4", ".jpg": "image/jpeg", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
var server = createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405);
    res.end();
    return;
  }
  try {
    const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = resolve(root, "." + (path === "/" ? "/index.html" : path));
    if (!file.startsWith(root + sep)) throw Error();
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-cache" });
    res.end(req.method === "HEAD" ? void 0 : data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
var wss = new import_websocket_server.default({ noServer: true, maxPayload: 2048, perMessageDeflate: false });
server.on("upgrade", (req, socket, head) => {
  const ip = req.socket.remoteAddress || "unknown";
  if (req.url !== "/ws" || allowed && !allowed.includes(req.headers.origin) || (connections.get(ip) || 0) >= 12 || wss.clients.size >= Number(process.env.MAX_CONNECTIONS || 400)) {
    socket.end("HTTP/1.1 403 Forbidden\r\n\r\n");
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    ws.ip = ip;
    connections.set(ip, (connections.get(ip) || 0) + 1);
    wss.emit("connection", ws);
  });
});
function send(ws, msg) {
  if (ws.readyState === import_websocket.default.OPEN && ws.bufferedAmount < 128e3) ws.send(JSON.stringify(msg));
}
function error(ws, message) {
  send(ws, { type: "error", message });
}
function broadcast(room, msg) {
  room.members.forEach((p) => send(p.ws, msg));
}
function lobby(room) {
  broadcast(room, { type: "room", code: room.code, stadium: room.stadium, isJoinable: !room.active && room.members.length < 2, players: room.members.map((p) => ({ team: p.team, ready: p.ready, avatar: p.avatar, username: p.username })), mode: room.mode, duration: room.duration });
}
function snapshot(room) {
  const m = room.match;
  return { type: "snapshot", seq: room.seq++, score: m.score, time: m.time, duration: m.duration, phase: m.phase, message: m.message, teams: m.teams, mode: m.mode, sudden: m.suddenDeath, bodies: m.objects.map((b) => [b.position.x, b.position.y, b.angle]) };
}
function closeRoom(room, reason) {
  if (!rooms.has(room.code)) return;
  broadcast(room, { type: "closed", message: reason });
  for (const p of room.members) p.ws.room = null;
  room.match.dispose();
  rooms.delete(room.code);
}
function leave(ws) {
  if (ws.room) {
    const room = rooms.get(ws.room);
    if (room) closeRoom(room, "A player left. Create or join another room.");
    ws.room = null;
  }
}
function code() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s;
  do {
    s = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
  } while (rooms.has(s));
  return s;
}
wss.on("connection", (ws) => {
  ws.alive = true;
  ws.window = Date.now();
  ws.count = 0;
  ws.created = 0;
  ws.lastLaunch = 0;
  ws.on("pong", () => ws.alive = true);
  ws.on("message", (raw) => {
    const now = Date.now();
    if (now - ws.window > 1e3) {
      ws.window = now;
      ws.count = 0;
    }
    if (++ws.count > 40) {
      ws.close(1008, "Too many messages");
      return;
    }
    let data;
    try {
      data = JSON.parse(raw.toString());
      if (!data || typeof data !== "object") throw Error();
    } catch {
      error(ws, "Invalid message.");
      return;
    }
    const room = rooms.get(ws.room);
    if (data.type === "create" || data.type === "join") {
      if (room) {
        error(ws, "Leave your current room first.");
        return;
      }
      const username = displayUsername(data.username);
      const team = TEAMS.some((t) => t.id === data.team) ? data.team : "ARG";
      const avatar = data.avatar && typeof data.avatar === "object" ? publicAvatar(data.avatar) : null;
      if (data.type === "create") {
        if (now - ws.created < 1500) {
          error(ws, "Please wait before creating another room.");
          return;
        }
        if (rooms.size >= Number(process.env.MAX_ROOMS || 100)) {
          error(ws, "Server is full. Try again shortly.");
          return;
        }
        ws.created = now;
        const id = code(), match = new Match();
        match.multiplayer = true;
        const r = { code: id, match, members: [{ ws, team, avatar, username, ready: false }], mode: data.mode === "golden" ? "golden" : "normal", duration: data.duration === 90 ? 90 : 45, seq: 0, created: now, active: false, stadium: chooseStadium(-1) };
        rooms.set(id, r);
        ws.room = id;
        send(ws, { type: "seat", seat: 0 });
        lobby(r);
      } else {
        const r = rooms.get(String(data.code || "").toUpperCase());
        if (!r) {
          error(ws, "Room not found. Check the code.");
          return;
        }
        if (r.members.length >= 2) {
          error(ws, "This room is full.");
          return;
        }
        r.members.push({ ws, team, avatar, username, ready: false });
        ws.room = r.code;
        send(ws, { type: "seat", seat: 1 });
        lobby(r);
      }
      return;
    }
    if (data.type === "leave") {
      leave(ws);
      return;
    }
    if (!room) {
      error(ws, "Join a room first.");
      return;
    }
    const seat = room.members.findIndex((p) => p.ws === ws), member = room.members[seat];
    if (data.type === "identity") {
      member.username = displayUsername(data.username);
      lobby(room);
      return;
    }
    if (data.type === "avatar") {
      if (room.active) return;
      member.avatar = publicAvatar(data.avatar);
      room.members.forEach((p) => p.ready = false);
      lobby(room);
      return;
    }
    if (data.type === "ready") {
      if (room.active && room.match.phase !== "finished") return;
      member.ready = !member.ready;
      lobby(room);
      if (room.members.length === 2 && room.members.every((p) => p.ready)) {
        if (room.active) room.stadium = chooseStadium(room.stadium);
        room.members.forEach((p) => p.ready = false);
        room.match.start(room.members.map((p) => p.team), room.mode, "normal", room.duration);
        room.active = true;
        lobby(room);
        broadcast(room, { type: "start" });
        broadcast(room, snapshot(room));
      }
    } else if (data.type === "launch") {
      if (!room.active || !Number.isFinite(data.x) || !Number.isFinite(data.y) || Math.abs(data.x) > 1e3 || Math.abs(data.y) > 1e3 || now - ws.lastLaunch < 200) return;
      ws.lastLaunch = now;
      room.match.launch(seat, data.x, data.y);
    }
  });
  ws.on("error", () => {
  });
  ws.on("close", () => {
    leave(ws);
    connections.set(ws.ip, Math.max(0, (connections.get(ws.ip) || 1) - 1));
  });
});
var previous = performance.now();
var acc = 0;
var frame = 0;
var clock = setInterval(() => {
  const now = performance.now();
  acc += Math.min(0.1, (now - previous) / 1e3);
  previous = now;
  while (acc >= 1 / 60) {
    for (const room of rooms.values()) if (room.active) room.match.tick(1 / 60);
    acc -= 1 / 60;
    frame++;
    if (frame % 3 === 0) {
      for (const room of rooms.values()) if (room.active) broadcast(room, snapshot(room));
    }
  }
}, 1e3 / 60);
var heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) {
      ws.terminate();
      continue;
    }
    ws.alive = false;
    ws.ping();
  }
  for (const room of rooms.values()) if (Date.now() - room.created > 2 * 60 * 60 * 1e3 || !room.active && Date.now() - room.created > 10 * 60 * 1e3) closeRoom(room, "Room expired. Please create a new one.");
}, 15e3);
var port = Number(process.env.PORT || 3e3);
server.listen(port, process.env.HOST || "0.0.0.0", () => console.log(`Pocket Cup listening on port ${server.address().port}`));
function shutdown() {
  clearInterval(clock);
  clearInterval(heartbeat);
  for (const ws of wss.clients) ws.terminate();
  server.close(() => process.exit(0));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
/*! Bundled license information:

matter-js/build/matter.js:
  (*!
   * matter-js 0.20.0 by @liabru
   * http://brm.io/matter-js/
   * License MIT
   * 
   * The MIT License (MIT)
   * 
   * Copyright (c) Liam Brummitt and contributors.
   * 
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * 
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *)
*/
