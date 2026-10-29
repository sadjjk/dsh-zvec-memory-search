import { createRequire } from "node:module";
import { access, constants, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";
// node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.6/node_modules/@deepseek-ai/cosmokit/lib/index.js
/** Return true when a value is `null` or `undefined`. */
function isNullable(value) {
	return value === null || value === void 0;
}
/** Return true for non-array object values. */
function isPlainObject(data) {
	return data && typeof data === "object" && !Array.isArray(data);
}
/** Filter object entries and return a new object. */
function filterKeys(object, filter) {
	return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
/** Map object values while preserving the original key set. */
function mapValues(object, transform) {
	return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
/** Pick selected keys from an object, optionally including `undefined` values. */
function pick(source, keys, forced) {
	if (!keys) return { ...source };
	const result = {};
	for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
	return result;
}
/** Shared config references used by schema validators and plugin runtimes. */
const write = Symbol.for("cosmokit.volatile.write");
function snapshot(value, ancestors = /* @__PURE__ */ new Set()) {
	if (typeof value === "function") throw new TypeError("volatile config cannot contain functions");
	if (value === null || typeof value !== "object") return value;
	if (ancestors.has(value)) throw new TypeError("volatile config cannot contain cycles");
	ancestors.add(value);
	try {
		if (Array.isArray(value)) return Object.freeze(value.map((item) => snapshot(item, ancestors)));
		if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError("volatile config objects must be plain objects or arrays");
		return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snapshot(item, ancestors)])));
	} finally {
		ancestors.delete(value);
	}
}
/**
* Create a detached reference containing an immutable copy of the supplied data.
* @param value - validated config data; class instances and functions are unsupported.
* @returns a reference whose value is updated only by its owning runtime.
*/
function createVolatile(value) {
	let current = snapshot(value);
	return Object.freeze({
		get: () => current,
		[write]: (value) => {
			current = value;
		}
	});
}
/**
* Identify references across ESM/CJS copies of the shared library.
* @param value - a parsed config value.
* @returns whether the value implements the shared reference protocol.
*/
function isVolatile(value) {
	return typeof value === "object" && value !== null && write in value;
}
/** Test values using `instanceof` with a `toStringTag` fallback. */
function is(type, value) {
	if (arguments.length === 1) return (value) => is(type, value);
	return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
	return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
	return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
/** Binary source detection and base64/hex conversion helpers. */
var Binary;
(function(Binary) {
	Binary.is = isArrayBufferLike;
	Binary.isSource = isArrayBufferSource;
	function fromSource(source) {
		if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
		else return source;
	}
	Binary.fromSource = fromSource;
	function toBase64(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
		let binary = "";
		const bytes = new Uint8Array(source);
		for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}
	Binary.toBase64 = toBase64;
	function fromBase64(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
		return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
	}
	Binary.fromBase64 = fromBase64;
	function toHex(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
		return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	Binary.toHex = toHex;
	function fromHex(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
		const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
		const buffer = [];
		for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
		return Uint8Array.from(buffer).buffer;
	}
	Binary.fromHex = fromHex;
})(Binary || (Binary = {}));
Binary.fromBase64;
Binary.toBase64;
Binary.fromHex;
Binary.toHex;
/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
function clone(source, refs = /* @__PURE__ */ new Map()) {
	if (!source || typeof source !== "object") return source;
	if (is("Date", source)) return new Date(source.valueOf());
	if (is("RegExp", source)) return new RegExp(source.source, source.flags);
	if (isArrayBufferLike(source)) return source.slice(0);
	if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
	const cached = refs.get(source);
	if (cached) return cached;
	if (Array.isArray(source)) {
		const result = [];
		refs.set(source, result);
		source.forEach((value, index) => {
			result[index] = Reflect.apply(clone, null, [value, refs]);
		});
		return result;
	}
	const result = Object.create(Object.getPrototypeOf(source));
	refs.set(source, result);
	for (const key of Reflect.ownKeys(source)) {
		const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
		if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
		Reflect.defineProperty(result, key, descriptor);
	}
	return result;
}
/**
* Compare values recursively, treating two volatile references as equal regardless of value.
* Strict comparison distinguishes null/undefined, treats opaque objects by identity,
* compares URLs by normalized href, treats array holes as undefined, and considers distinct cyclic structures unequal.
* @param a - first value.
* @param b - second value.
* @param strict - whether to require strict data equality outside volatile references.
* @returns whether the values compare equal.
*/
function deepEqual(a, b, strict) {
	const ancestors = /* @__PURE__ */ new Set();
	function compare(a, b) {
		if (a === b) return true;
		if (isVolatile(a) || isVolatile(b)) return isVolatile(a) && isVolatile(b);
		if (!strict && isNullable(a) && isNullable(b)) return true;
		if (typeof a !== typeof b || typeof a !== "object" || !a || !b) return false;
		if (ancestors.has(a)) return false;
		function check(test, then) {
			return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
		}
		ancestors.add(a);
		try {
			return check(Array.isArray, (a, b) => {
				if (a.length !== b.length) return false;
				for (let index = 0; index < a.length; index++) if (!compare(a[index], b[index])) return false;
				return true;
			}) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("URL"), (a, b) => a.href === b.href) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
				if (a.byteLength !== b.byteLength) return false;
				const viewA = new Uint8Array(a);
				const viewB = new Uint8Array(b);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? ((!strict || [a, b].every((value) => Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) && Object.keys({
				...a,
				...b
			}).every((key) => compare(a[key], b[key])));
		} finally {
			ancestors.delete(a);
		}
	}
	return compare(a, b);
}
/** Time constants plus parsing and formatting helpers. */
var Time;
(function(Time) {
	Time.millisecond = 1;
	Time.second = 1e3;
	Time.minute = Time.second * 60;
	Time.hour = Time.minute * 60;
	Time.day = Time.hour * 24;
	Time.week = Time.day * 7;
	let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
	function setTimezoneOffset(offset) {
		timezoneOffset = offset;
	}
	Time.setTimezoneOffset = setTimezoneOffset;
	function getTimezoneOffset() {
		return timezoneOffset;
	}
	Time.getTimezoneOffset = getTimezoneOffset;
	function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
		if (typeof date === "number") date = new Date(date);
		if (offset === void 0) offset = timezoneOffset;
		return Math.floor((date.valueOf() / Time.minute - offset) / 1440);
	}
	Time.getDateNumber = getDateNumber;
	function fromDateNumber(value, offset) {
		const date = new Date(value * Time.day);
		if (offset === void 0) offset = timezoneOffset;
		return new Date(+date + offset * Time.minute);
	}
	Time.fromDateNumber = fromDateNumber;
	const numeric = /\d+(?:\.\d+)?/.source;
	const timeRegExp = new RegExp(`^${[
		"w(?:eek(?:s)?)?",
		"d(?:ay(?:s)?)?",
		"h(?:our(?:s)?)?",
		"m(?:in(?:ute)?(?:s)?)?",
		"s(?:ec(?:ond)?(?:s)?)?"
	].map((unit) => `(${numeric}${unit})?`).join("")}$`);
	function parseTime(source) {
		const capture = timeRegExp.exec(source);
		if (!capture) return 0;
		return (parseFloat(capture[1]) * Time.week || 0) + (parseFloat(capture[2]) * Time.day || 0) + (parseFloat(capture[3]) * Time.hour || 0) + (parseFloat(capture[4]) * Time.minute || 0) + (parseFloat(capture[5]) * Time.second || 0);
	}
	Time.parseTime = parseTime;
	function parseDate(date) {
		const parsed = parseTime(date);
		if (parsed) date = Date.now() + parsed;
		else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
		else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
		return date ? new Date(date) : /* @__PURE__ */ new Date();
	}
	Time.parseDate = parseDate;
	function format(ms) {
		const abs = Math.abs(ms);
		if (abs >= Time.day - Time.hour / 2) return Math.round(ms / Time.day) + "d";
		else if (abs >= Time.hour - Time.minute / 2) return Math.round(ms / Time.hour) + "h";
		else if (abs >= Time.minute - Time.second / 2) return Math.round(ms / Time.minute) + "m";
		else if (abs >= Time.second) return Math.round(ms / Time.second) + "s";
		return ms + "ms";
	}
	Time.format = format;
	function toDigits(source, length = 2) {
		return source.toString().padStart(length, "0");
	}
	Time.toDigits = toDigits;
	function template(template, time = /* @__PURE__ */ new Date()) {
		return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
	}
	Time.template = template;
})(Time || (Time = {}));
// node_modules/.pnpm/@deepseek-ai+schemastery@3.18.5/node_modules/@deepseek-ai/schemastery/lib/index.mjs
const kSchema = Symbol.for("schemastery");
const kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
	options;
	name = "ValidationError";
	constructor(message, options) {
		let prefix = "$";
		for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
		else if (typeof segment === "number") prefix += "[" + segment + "]";
		else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
		if (prefix.startsWith(".")) prefix = prefix.slice(1);
		super((prefix === "$" ? "" : `${prefix} `) + message);
		this.options = options;
	}
	static is(error) {
		return !!error?.[kValidationError];
	}
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
const Schema = function(options) {
	const schema = function(data, options = {}) {
		return Schema.resolve(data, schema, options)[0];
	};
	if (options.refs) {
		const refs = mapValues(options.refs, (options) => new Schema(options));
		const getRef = (uid) => refs[uid];
		for (const key in refs) {
			const options = refs[key];
			options.sKey = getRef(options.sKey);
			options.inner = getRef(options.inner);
			options.list = options.list && options.list.map(getRef);
			options.dict = options.dict && mapValues(options.dict, getRef);
		}
		return refs[options.uid];
	}
	Object.assign(schema, options);
	if (typeof schema.callback === "string") try {
		schema.callback = new Function("return " + schema.callback)();
	} catch {}
	Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
	Object.setPrototypeOf(schema, Schema.prototype);
	schema.meta ||= {};
	schema.toString = schema.toString.bind(schema);
	return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
	return {
		version: 1,
		vendor: "schemastery",
		validate: (value) => {
			try {
				return { value: Schema.resolve(value, this, {})[0] };
			} catch (error) {
				if (ValidationError.is(error)) return { issues: [{
					message: error.message,
					path: error.options.path
				}] };
				throw error;
			}
		}
	};
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
	if (globalThis.__schemastery_refs__) {
		globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
		return this.uid;
	}
	globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
	globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
	const result = {
		uid: this.uid,
		refs: globalThis.__schemastery_refs__
	};
	globalThis.__schemastery_refs__ = void 0;
	return result;
};
Schema.prototype.set = function set(key, value) {
	this.dict[key] = value;
	return this;
};
Schema.prototype.push = function push(value) {
	this.list.push(value);
	return this;
};
function mergeDesc(original, messages) {
	const result = typeof original === "string" ? { "": original } : { ...original };
	for (const locale in messages) {
		const value = messages[locale];
		if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
		else if (typeof value === "string") result[locale] = value;
	}
	return result;
}
function getInner(value) {
	return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
	return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
	const schema = Schema(this);
	const desc = mergeDesc(schema.meta.description, messages);
	if (Object.keys(desc).length) schema.meta.description = desc;
	if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
		return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
	});
	if (schema.list) schema.list = schema.list.map((inner, index) => {
		return inner.i18n(mapValues(messages, (data = {}) => {
			if (Array.isArray(getInner(data))) return getInner(data)[index];
			if (Array.isArray(data)) return data[index];
			return extractKeys(data);
		}));
	});
	if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
		if (getInner(data)) return getInner(data);
		return extractKeys(data);
	}));
	if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
	return schema;
};
Schema.prototype.extra = function extra(key, value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
};
for (const key of [
	"required",
	"disabled",
	"collapse",
	"hidden",
	"loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.deprecated = function deprecated() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "deprecated",
		type: "danger"
	});
	return schema;
};
Schema.prototype.experimental = function experimental() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "experimental",
		type: "warning"
	});
	return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
	const schema = Schema(this);
	const pattern = pick(regexp, ["source", "flags"]);
	schema.meta = {
		...schema.meta,
		pattern
	};
	return schema;
};
Schema.prototype.simplify = function simplify(value) {
	if (isVolatile(value)) value = value.get();
	if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
	if (isNullable(value)) return value;
	if (this.type === "object" || this.type === "dict") {
		const result = {};
		for (const key in value) {
			const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
			if (this.type === "dict" || !isNullable(item)) result[key] = item;
		}
		if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
		return result;
	} else if (this.type === "array" || this.type === "tuple") {
		const result = [];
		value.forEach((value, index) => {
			const schema = this.type === "array" ? this.inner : this.list[index];
			const item = schema ? schema.simplify(value) : value;
			result.push(item);
		});
		return result;
	} else if (this.type === "intersect") {
		const result = {};
		for (const item of this.list) Object.assign(result, item.simplify(value));
		return result;
	} else if (this.type === "union") for (const schema of this.list) try {
		Schema.resolve(value, schema, {});
		return schema.simplify(value);
	} catch {}
	return value;
};
Schema.prototype.toString = function toString(inline) {
	return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		role,
		extra
	};
	return schema;
};
for (const key of [
	"default",
	"link",
	"comment",
	"description",
	"max",
	"min",
	"step"
]) Object.assign(Schema.prototype, { [key](value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.volatile = function volatile() {
	if (this.meta.volatile) throw new TypeError("volatile schema is already wrapped");
	return this.extra("volatile", true);
};
const resolvers = {};
const checkedVolatile = Symbol("checked-volatile-schema");
function validateVolatileSchema(schema, path = [], blocked = false, seen = /* @__PURE__ */ new Map()) {
	const states = seen.get(schema) ?? /* @__PURE__ */ new Set();
	if (states.has(blocked)) return;
	states.add(blocked);
	seen.set(schema, states);
	if (schema.meta?.volatile && blocked) throw new ValidationError("volatile fields require a fixed object path without an enclosing volatile field", { path });
	const nested = blocked || !!schema.meta?.volatile;
	if (schema.dict) for (const [key, child] of Object.entries(schema.dict)) validateVolatileSchema(child, [...path, key], nested, seen);
	if (schema.sKey) validateVolatileSchema(schema.sKey, [...path, "<key>"], true, seen);
	if (schema.inner && (schema.type !== "lazy" || schema.inner[kSchema])) validateVolatileSchema(schema.inner, [...path, "*"], true, seen);
	if (schema.list) for (let index = 0; index < schema.list.length; index++) validateVolatileSchema(schema.list[index], [...path, String(index)], true, seen);
}
Schema.extend = function extend(type, resolve) {
	resolvers[type] = resolve;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
	if (!schema) return [data];
	if (!options[checkedVolatile]) {
		validateVolatileSchema(schema, options.path);
		options = {
			...options,
			[checkedVolatile]: true
		};
	}
	if (schema.meta?.volatile) {
		const inner = Schema(schema);
		inner.meta = {
			...schema.meta,
			volatile: false
		};
		const [value, adapted] = Schema.resolve(data, inner, options, strict);
		try {
			return [createVolatile(value), adapted];
		} catch (error) {
			throw new ValidationError(error instanceof Error ? error.message : String(error), options);
		}
	}
	if (options.ignore?.(data, schema)) return [data];
	if (isNullable(data) && schema.type !== "lazy") {
		if (schema.meta.required) throw new ValidationError(`missing required value`, options);
		let current = schema;
		let fallback = schema.meta.default;
		while (current?.type === "intersect" && isNullable(fallback)) {
			current = current.list[0];
			fallback = current?.meta.default;
		}
		if (isNullable(fallback)) return [data];
		data = clone(fallback);
	}
	const callback = resolvers[schema.type];
	if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
	try {
		return callback(data, schema, options, strict);
	} catch (error) {
		if (!schema.meta.loose) throw error;
		return [schema.meta.default];
	}
};
Schema.from = function from(source) {
	if (isNullable(source)) return Schema.any();
	else if ([
		"string",
		"number",
		"boolean"
	].includes(typeof source)) return Schema.const(source).required();
	else if (source[kSchema]) return source;
	else if (typeof source === "function") switch (source) {
		case String: return Schema.string().required();
		case Number: return Schema.number().required();
		case Boolean: return Schema.boolean().required();
		case Function: return Schema.function().required();
		default: return Schema.is(source).required();
	}
	else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
	const toJSON = () => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return schema.inner.toJSON();
	};
	const schema = new Schema({
		type: "lazy",
		builder,
		inner: { toJSON }
	});
	return schema;
};
Schema.natural = function natural() {
	return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
	return Schema.number().step(.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
	return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
		const date = new Date(value);
		if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
		return date;
	}, true)]);
};
Schema.regExp = function regExp(flag = "") {
	return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
		try {
			return new RegExp(value, flag);
		} catch (e) {
			throw new ValidationError(e.message, options);
		}
	}, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
	return Schema.union([
		Schema.is(ArrayBuffer),
		Schema.is(SharedArrayBuffer),
		Schema.transform(Schema.any(), (value, options) => {
			if (Binary.isSource(value)) return Binary.fromSource(value);
			throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
		}, true),
		...encoding ? [Schema.transform(Schema.string(), (value, options) => {
			try {
				return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)] : []
	]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
	if (!schema.inner[kSchema]) {
		schema.inner = schema.builder();
		schema.inner.meta = {
			...schema.meta,
			...schema.inner.meta
		};
		validateVolatileSchema(schema.inner, options.path, true);
	}
	return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
	return [data];
});
Schema.extend("never", (data, _, options) => {
	throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
	if (deepEqual(data, value)) return [value];
	throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
	const { max = Infinity, min = -Infinity } = meta;
	if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
	if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
	if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
	if (meta.pattern) {
		const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
		if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
	}
	checkWithinRange(data.length, meta, "string length", options);
	return [data];
});
function decimalShift(data, digits) {
	const str = data.toString();
	if (str.includes("e")) return data * Math.pow(10, digits);
	const index = str.indexOf(".");
	if (index === -1) return data * Math.pow(10, digits);
	const frac = str.slice(index + 1);
	const integer = str.slice(0, index);
	if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
	return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
	step = Math.abs(step);
	if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
	const index = step.toString().indexOf(".");
	const digits = step.toString().slice(index + 1).length;
	return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
	if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
	checkWithinRange(data, meta, "number", options);
	const { step } = meta;
	if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
	return [data];
});
Schema.extend("boolean", (data, _, options) => {
	if (typeof data === "boolean") return [data];
	throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
	let value = 0, keys = [];
	if (typeof data === "number") {
		value = data;
		for (const key in bits) if (data & bits[key]) keys.push(key);
	} else if (Array.isArray(data)) {
		keys = data;
		for (const key of keys) {
			if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
			if (key in bits) value |= bits[key];
		}
	} else throw new ValidationError(`expected number or array but got ${data}`, options);
	if (value === meta.default) return [value];
	return [value, keys];
});
Schema.extend("function", (data, _, options) => {
	if (typeof data === "function") return [data];
	throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
	if (typeof constructor === "function") {
		if (data instanceof constructor) return [data];
		throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
	} else {
		if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		let prototype = Object.getPrototypeOf(data);
		while (prototype) {
			if (prototype.constructor?.name === constructor) return [data];
			prototype = Object.getPrototypeOf(prototype);
		}
		throw new ValidationError(`expected ${constructor} but got ${data}`, options);
	}
});
function property(data, key, schema, options) {
	try {
		const [value, adapted] = Schema.resolve(data[key], schema, {
			...options,
			path: [...options.path || [], key]
		});
		if (adapted !== void 0) data[key] = adapted;
		return value;
	} catch (e) {
		if (!options?.autofix) throw e;
		delete data[key];
		return schema.meta.volatile ? createVolatile(schema.meta.default) : schema.meta.default;
	}
}
Schema.extend("array", (data, { inner, meta }, options) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
	return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in data) {
		let rKey;
		try {
			rKey = Schema.resolve(key, sKey, options)[0];
		} catch (error) {
			if (strict) continue;
			throw error;
		}
		result[rKey] = property(data, key, inner, options);
		data[rKey] = data[key];
		if (key !== rKey) delete data[key];
	}
	return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	const result = list.map((inner, index) => property(data, index, inner, options));
	if (strict) return [result];
	result.push(...data.slice(list.length));
	return [result];
});
function merge(result, data) {
	for (const key in data) {
		if (key in result) continue;
		result[key] = data[key];
	}
}
Schema.extend("object", (data, { dict }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in dict) {
		const value = property(data, key, dict[key], options);
		if (!isNullable(value) || key in data) result[key] = value;
	}
	if (!strict) merge(result, data);
	return [result];
});
Schema.extend("union", (data, { list, toString }, options, strict) => {
	const messages = [];
	for (const inner of list) try {
		return Schema.resolve(data, inner, options, strict);
	} catch (error) {
		messages.push(error);
	}
	throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString }, options, strict) => {
	if (!list.length) return [data];
	let result;
	for (const inner of list) {
		const value = Schema.resolve(data, inner, options, true)[0];
		if (isNullable(value)) continue;
		if (isNullable(result)) result = value;
		else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		else if (typeof value === "object") merge(result ??= {}, value);
		else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
	}
	if (!strict && isPlainObject(data)) merge(result, data);
	return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
	const [result, adapted = data] = Schema.resolve(data, inner, options, true);
	if (preserve) return [callback(result)];
	else return [callback(result), callback(adapted)];
});
const formatters = {};
function defineMethod(name, keys, format) {
	formatters[name] = format;
	Object.assign(Schema, { [name](...args) {
		const schema = new Schema({ type: name });
		keys.forEach((key, index) => {
			switch (key) {
				case "sKey":
					schema.sKey = args[index] ?? Schema.string();
					break;
				case "inner":
					schema.inner = Schema.from(args[index]);
					break;
				case "list":
					schema.list = args[index].map(Schema.from);
					break;
				case "dict":
					schema.dict = mapValues(args[index], Schema.from);
					break;
				case "bits":
					schema.bits = {};
					for (const key in args[index]) {
						if (typeof args[index][key] !== "number") continue;
						schema.bits[key] = args[index][key];
					}
					break;
				case "callback": {
					const callback = schema.callback = args[index];
					callback["toJSON"] ||= () => callback.toString();
					break;
				}
				case "constructor": {
					const constructor = schema.constructor = args[index];
					if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
					break;
				}
				default: schema[key] = args[index];
			}
		});
		if (name === "object" || name === "dict") schema.meta.default = {};
		else if (name === "array" || name === "tuple") schema.meta.default = [];
		else if (name === "bitset") schema.meta.default = 0;
		return schema;
	} });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
	if (typeof constructor === "function") return constructor.name;
	else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
	if (Object.keys(dict).length === 0) return "{}";
	return `{ ${Object.entries(dict).map(([key, inner]) => {
		return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
	}).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
	const result = list.map(({ toString: format }) => format()).join(" | ");
	return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
	return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
	"inner",
	"callback",
	"preserve"
], ({ inner }, isInner) => inner.toString(isInner));
// src/config.ts
const DEFAULT_EMBEDDING_MODEL = "local/qwen3-embedding-0.6b";
/** 只接受本地模型引用；远程模型需 API Key 且外发内容，误填时回退默认。 */
function normalizeModel(v) {
	const s = String(v ?? "").trim();
	return /^local\/[a-z0-9._-]+$/i.test(s) ? s : DEFAULT_EMBEDDING_MODEL;
}
const Config = Schema.object({
	memoryRoot: Schema.string().default("").volatile().description("记忆库根目录（绝对路径）"),
	baselineFile: Schema.string().default("").volatile().description("用户补充提示词文件的绝对路径（如用户偏好文件）；留空不注入；超过 64KB 只注入前 64KB"),
	semanticLimit: Schema.number().step(1).min(1).max(50).default(8).volatile().description("默认返回条数"),
	preview: Schema.union([
		"none",
		"short",
		"full"
	]).default("short").volatile().description("默认摘要详略"),
	queryMode: Schema.union([
		"fts+vector",
		"fts",
		"vector"
	]).default("fts+vector").volatile().description("默认检索方式"),
	injectGuide: Schema.boolean().default(true).volatile().description("注入检索引导"),
	injectBaseline: Schema.boolean().default(true).volatile().description("注入补充提示词文件"),
	zgPath: Schema.string().default("").volatile().description("zg 可执行文件路径；留空自动探测"),
	embeddingModel: Schema.string().default(DEFAULT_EMBEDDING_MODEL).volatile().description("建库与重建使用的本地向量模型")
});
/** Volatile 字段解包：每次读取时调用，不缓存结果（adapter 同款）。 */
function read(v, fallback) {
	if (v === void 0 || v === null) return fallback;
	if (typeof v === "object" && v !== null && "get" in v) {
		const cur = v.get();
		return cur === void 0 || cur === null ? fallback : cur;
	}
	return v;
}
/** 实时解析当前配置；数值再 clamp 一道防越界。 */
function resolve$1(c) {
	const bag = c ?? {};
	const n = Number(read(bag.semanticLimit, 8));
	return {
		memoryRoot: String(read(bag.memoryRoot, "")).trim(),
		baselineFile: String(read(bag.baselineFile, "")).trim(),
		semanticLimit: Math.min(50, Math.max(1, Number.isFinite(n) ? Math.trunc(n) : 8)),
		preview: read(bag.preview, "short"),
		queryMode: read(bag.queryMode, "fts+vector"),
		injectGuide: read(bag.injectGuide, true) !== false,
		injectBaseline: read(bag.injectBaseline, true) !== false,
		zgPath: String(read(bag.zgPath, "")).trim(),
		embeddingModel: normalizeModel(read(bag.embeddingModel, DEFAULT_EMBEDDING_MODEL))
	};
}
// src/host/define-tool.ts
/**
* 运行时解析内核 defineTool。
*
* @deepseek-ai/dsh-tools 是内核内部包，不进插件依赖树（旧版把它写进 peerDependencies，
* 0.2.0 运行时因版本不匹配拒装）。照 dsh-context-mode-adapter 的 loadDefineTool：
* ① 宿主模块上下文 → ② Electron app.asar 内路径；都失败返回 null，调用方降级跳过注册。
*
* defineTool 契约（内核 dsh-tools/lib/index.js 探明）：
*   parameters = property-map DSL：{prop: {type, description?, enum?, required?: true}}
*   output = { schema: 值节点（{type:'json'} 为任意值）, render(args, value) 必填，返回 content blocks 数组 }
*/
let resolved;
function loadDefineTool() {
	if (resolved !== void 0) return resolved;
	const candidates = [() => createRequire(import.meta.url)("@deepseek-ai/dsh-tools"), () => {
		const resPath = process.resourcesPath;
		const appAsar = resPath ? resolve(resPath, "app.asar") : "/Applications/DeepSeek Harness.app/Contents/Resources/app.asar";
		return createRequire(join(appAsar, "dsh/node_modules/@deepseek-ai/dsh-tools/package.json"))("@deepseek-ai/dsh-tools");
	}];
	for (const load of candidates) try {
		const mod = load();
		if (typeof mod?.defineTool === "function") {
			resolved = mod.defineTool;
			return resolved;
		}
	} catch {}
	resolved = null;
	return null;
}
// src/host/zg-status.ts
const num = (s) => s === void 0 ? null : Number(s.replace(/,/g, ""));
function parseStatus(text) {
	const t = text ?? "";
	const state = /ZVEC_GREP\.ENGINE\.LOCK\.BUSY/.test(t) ? "busy" : /Workspace index is ready/.test(t) ? "ready" : /Workspace index is updating/.test(t) ? "updating" : /Workspace index needs an update/.test(t) ? "stale" : /Workspace index failed/.test(t) ? "failed" : /Workspace index update was cancelled/.test(t) ? "cancelled" : /Workspace indexing is disabled/.test(t) ? "disabled" : /Workspace index is not (configured|created)/.test(t) ? "none" : "unknown";
	const cov = /Coverage\s+\S*\s+(\d+)%\s+([\d,]+)\s*\/\s*([\d,]+)\s+files/.exec(t);
	const ch = /Changes\s+([\d,]+)\s+added\s+·\s+([\d,]+)\s+modified\s+·\s+([\d,]+)\s+deleted/.exec(t);
	const emb = /Embedding\s+(\S+)/.exec(t);
	const dim = /([\d,]+)\s+dimensions\s+·\s+(\w+)/.exec(t);
	return {
		state,
		coverage: num(cov?.[1]),
		indexed: num(cov?.[2]),
		total: num(cov?.[3]),
		entities: num(/Entities\s+([\d,]+)/.exec(t)?.[1]),
		changes: ch ? {
			added: num(ch[1]),
			modified: num(ch[2]),
			deleted: num(ch[3])
		} : null,
		model: emb?.[1] ?? null,
		dimensions: num(dim?.[1]),
		metric: dim?.[2] ?? null,
		ownerPid: num(/ownerPid:\s*(\d+)/.exec(t)?.[1])
	};
}
/** `Server: stopped` / `Server: ready` → 'running' | 'stopped' | 'unknown' */
function parseServerStatus(text) {
	const m = /Server:\s*(\w+)/.exec(text ?? "");
	if (!m) return "unknown";
	return m[1] === "stopped" ? "stopped" : "running";
}
/**
* 从 `zg server status` 取 server 进程 PID。实测输出（zg 0.2.2）：
*   Server: ready
*   PID: 35512
* server 已停止或无 PID 行返回 null（调用方据此不记录归属，退化为不停止）。
*/
function parseServerPid(text) {
	if (parseServerStatus(text) !== "running") return null;
	const m = /^PID:\s*(\d+)\s*$/m.exec(text ?? "");
	return m ? Number(m[1]) : null;
}
/**
* 索引是否已建（可检索）。updating/stale/failed/cancelled 都只是「最近一次更新」的状态，
* 旧索引仍在、可查；只有 none / disabled / busy / unknown 视为不可用。客户端与 host 共用。
*/
function isBuilt(state) {
	return state === "ready" || state === "updating" || state === "stale" || state === "failed" || state === "cancelled";
}
// src/host/zg.ts
/**
* zg CLI 交互：探测可执行文件、判断索引就绪、跑查询。子进程一律 execFile/spawn 参数数组，不拼 shell。
*/
const run$1 = promisify(execFile);
/** 探测顺序：设置 → which → npm 全局 bin → 常见路径。 */
async function detectZg(configured) {
	const candidates = [];
	if (configured) candidates.push(configured);
	try {
		candidates.push((await run$1("which", ["zg"])).stdout.trim());
	} catch {}
	try {
		candidates.push(join((await run$1("npm", [
			"config",
			"get",
			"prefix"
		])).stdout.trim(), "bin", "zg"));
	} catch {}
	candidates.push(join(homedir(), ".npm-global/bin/zg"), "/opt/homebrew/bin/zg", "/usr/local/bin/zg");
	for (const p of candidates) {
		if (!p) continue;
		try {
			await access(p, constants.X_OK);
			return p;
		} catch {}
	}
	return null;
}
/**
* zg status 原文 + 解析结果；--check-ready 只区分 ready 与其余，不足以识别 stale/busy，故读全文。
*
* zg status 运行期间持有索引读锁（home.readers），此时 zg index 立即报 LOCK.BUSY。
* 卡片轮询、每步注入、工具检索都会读状态，所以：
* - 同一根目录 3s 内复用结果，并发调用合并为一次子进程；
* - 本插件自己的建索引任务运行期间不再起 zg status（返回缓存），避免读锁挡住写入。
*/
const STATUS_TTL_MS = 3e3;
const statusCache = /* @__PURE__ */ new Map();
let statusPaused = () => false;
function setStatusPause(fn) {
	statusPaused = fn;
}
function clearStatusCache(root) {
	if (root) statusCache.delete(root);
	else statusCache.clear();
}
async function readStatus(zg, root) {
	const hit = statusCache.get(root);
	if (hit && (statusPaused(root) || Date.now() - hit.at < STATUS_TTL_MS)) return hit.value;
	const value = readStatusRaw(zg, root);
	statusCache.set(root, {
		at: Date.now(),
		value
	});
	return value;
}
async function readStatusRaw(zg, root) {
	try {
		const { stdout, stderr } = await run$1(zg, ["status", root], {
			cwd: root,
			timeout: 3e4
		});
		return parseStatus(`${stdout}\n${stderr}`);
	} catch (e) {
		return parseStatus(`${e?.stdout ?? ""}\n${e?.stderr ?? ""}`);
	}
}
/** 已建索引即可检索：updating / stale / failed / cancelled 时旧索引仍可查（见 isBuilt）。 */
const searchable = (s) => isBuilt(s.state);
async function readServer(zg) {
	try {
		return parseServerStatus((await run$1(zg, ["server", "status"], { timeout: 5e3 })).stdout);
	} catch (e) {
		return parseServerStatus(String(e?.stdout ?? ""));
	}
}
/** manifest.json 的 updatedTime（毫秒）；只读，不存在返回 null。 */
function readUpdatedTime(root) {
	try {
		return Number(JSON.parse(readFileSync(join(root, ".zvec-grep", "manifest.json"), "utf8")).updatedTime) || null;
	} catch {
		return null;
	}
}
/**
* 经 server 对工作区做一次最小查询，触发 server 为该根挂文件监听（ensureWatcher）。
* 查询词任意，只取副作用；--fts 不加载向量模型，耗时最短。等待 server 就绪最多 10s。
*/
async function attachWatcher(zg, root) {
	for (let i = 0; i < 10; i++) try {
		await run$1(zg, [
			"server",
			"status",
			"--check-ready"
		], { timeout: 3e3 });
		break;
	} catch {
		await new Promise((r) => setTimeout(r, 1e3));
	}
	try {
		await run$1(zg, [
			"query",
			"--fts",
			"zvec",
			"--mode",
			"server",
			"--limit",
			"1",
			"--preview",
			"none"
		], {
			cwd: root,
			timeout: 3e4
		});
		return true;
	} catch {
		return false;
	}
}
/** 跑 zg query；exit code、stdout/stderr 带回。 */
async function zgQuery(zg, root, args) {
	try {
		const { stdout, stderr } = await run$1(zg, ["query", ...args], {
			cwd: root,
			maxBuffer: 8388608
		});
		return {
			stdout,
			stderr,
			code: 0
		};
	} catch (e) {
		return {
			stdout: String(e?.stdout ?? ""),
			stderr: String(e?.stderr ?? e?.message ?? ""),
			code: typeof e?.code === "number" ? e.code : 1
		};
	}
}
/** 默认 .zgignore（zg 默认规则已含 node_modules 等，这里补记忆库常见排除）。 */
const DEFAULT_IGNORE = [
	"**/.git/",
	"**/dist/",
	"**/build/",
	"**/lib/",
	"**/__pycache__/",
	"**/.DS_Store",
	"**/*.lock",
	"**/pnpm-lock.yaml",
	"**/package-lock.json",
	"**/.zvec-grep/"
];
function ensureIgnore(root) {
	const p = join(root, ".zgignore");
	if (!existsSync(p)) writeFileSync(p, DEFAULT_IGNORE.join("\n") + "\n", "utf8");
}
function parseModelLine(line) {
	const s = line.trim();
	let m = /^Preparing (\S+)$/.exec(s);
	if (m) return {
		stage: "preparing",
		model: m[1],
		percent: null,
		downloaded: null,
		total: null
	};
	m = /^Model ready: (\S+)$/.exec(s);
	if (m) return {
		stage: "ready",
		model: m[1],
		percent: null,
		downloaded: null,
		total: null
	};
	m = /^Downloading (\S+) · (\d+)% · ([^/]+)\/(.+)$/.exec(s);
	if (m) return {
		stage: "downloading",
		model: m[1],
		percent: Number(m[2]),
		downloaded: m[3].trim(),
		total: m[4].trim()
	};
	m = /^Downloading (\S+)(?: · (.+))?$/.exec(s);
	if (m) return {
		stage: "downloading",
		model: m[1],
		percent: null,
		downloaded: m[2]?.trim() ?? null,
		total: null
	};
	return null;
}
const LOCK_RETRY_MAX = 5;
const LOCK_RETRY_GAP_MS = 2e3;
/**
* 同一时间只允许一个 zg 任务；DSH 退出时清理。
*
* 写索引任务（build/update/rebuild）的锁处理：zg status / query 运行期间持有索引读锁，
* 此时 zg index 立即报 LOCK.BUSY。任务开始即占槽（readStatus 随之暂停该根的新 status），
* 先等本插件在途的 status 结束再 spawn；若仍被外部读者（Agent 检索、终端命令）占用，
* 间隔 2s 重试，最多 5 次。读锁只在单次 status/query 期间持有（实测约 1s），重试即可让过。
*/
var JobRunner = class {
	current = null;
	/** 当前运行中任务的根目录；无任务返回 null。 */
	activeRoot() {
		return this.current && this.current.exitCode === null ? this.current.root : null;
	}
	start(kind, cmd, argv, cwd, onDone) {
		if (this.current) return { busy: true };
		const job = {
			kind,
			proc: null,
			root: cwd,
			done: 0,
			total: 0,
			tail: [],
			model: null,
			exitCode: null,
			startedAt: Date.now(),
			finishedAt: null,
			stopped: false
		};
		this.current = job;
		const isIndex = kind !== "install";
		const finish = (code) => {
			job.exitCode = code;
			job.finishedAt = Date.now();
			if (this.current === job) this.current = null;
			if (isIndex) clearStatusCache(cwd);
			try {
				onDone?.({
					kind,
					root: cwd,
					startedAt: job.startedAt,
					finishedAt: job.finishedAt,
					exitCode: code,
					tail: job.tail.slice()
				});
			} catch {}
		};
		const attempt = (n) => {
			if (job.stopped) {
				finish(null);
				return;
			}
			if (n > 1) job.tail.push(`索引读锁被占用，第 ${n} 次尝试`);
			const proc = spawn(cmd, argv, { cwd });
			job.proc = proc;
			let lockBusy = false;
			const onData = (d) => {
				for (const line of d.toString("utf8").split(/\r?\n|\r/)) {
					if (line.trim()) job.tail.push(line.trimEnd());
					if (line.includes("ZVEC_GREP.ENGINE.LOCK.BUSY")) lockBusy = true;
					const m = /Indexing files: (\d+)\/(\d+)/.exec(line);
					if (m) {
						job.done = +m[1];
						job.total = +m[2];
					}
					const mp = parseModelLine(line);
					if (mp) job.model = mp;
				}
				if (job.tail.length > 200) job.tail.splice(0, job.tail.length - 200);
			};
			proc.stdout?.on("data", onData);
			proc.stderr?.on("data", onData);
			proc.on("error", (e) => {
				job.tail.push(`Error: ${e.message}`);
			});
			proc.on("close", (code) => {
				job.proc = null;
				if (isIndex && lockBusy && code !== 0 && n < LOCK_RETRY_MAX && !job.stopped) {
					setTimeout(() => attempt(n + 1), LOCK_RETRY_GAP_MS);
					return;
				}
				finish(code);
			});
		};
		const pending = isIndex ? statusCache.get(cwd)?.value : void 0;
		if (pending) pending.finally(() => attempt(1));
		else attempt(1);
		return { started: true };
	}
	snapshot() {
		const j = this.current;
		if (!j) return null;
		return {
			running: j.exitCode === null,
			kind: j.kind,
			done: j.done,
			total: j.total,
			tail: j.tail.slice(-40),
			model: j.model,
			exitCode: j.exitCode,
			startedAt: j.startedAt,
			finishedAt: j.finishedAt
		};
	}
	stop() {
		const j = this.current;
		if (!j) return;
		j.stopped = true;
		j.proc?.kill("SIGTERM");
	}
};
// src/host/zg-output.ts
const HEAD = /^#(\d+) matchedBy=(\S+)(?: score=([\d.]+))? (.+):(\d+)-(\d+)$/;
const TRACE = /^trace: .*?:\s*(.*?); fused/;
function parseTrace(text) {
	const lines = text.split("\n");
	const first = lines.find((l) => l.trim() !== "") ?? "";
	if (first.startsWith("Error:")) return {
		hits: [],
		error: first.slice(6).trim()
	};
	const hits = [];
	let cur = null;
	for (const line of lines) {
		const h = HEAD.exec(line);
		if (h) {
			cur = {
				path: h[4],
				start_line: +h[5],
				end_line: +h[6],
				heading: "",
				scope: "",
				score: h[3] ? +h[3] : null,
				matched_by: normalizeMatched(h[2]),
				ranks: {
					fts: null,
					vector: null
				}
			};
			hits.push(cur);
			continue;
		}
		if (!cur) continue;
		if (line.startsWith("heading: ")) cur.heading = line.slice(9);
		else if (line.startsWith("scope: ")) cur.scope = line.slice(7).split("::").pop() ?? "";
		else {
			const t = TRACE.exec(line);
			if (t) for (const part of t[1].split(",")) {
				const m = /(fts|vector) #(\d+)/.exec(part);
				if (m) cur.ranks[m[1]] = +m[2];
			}
		}
	}
	return {
		hits,
		error: null
	};
}
function normalizeMatched(s) {
	const set = new Set(s.split("+"));
	return set.has("fts") && set.has("vector") ? "fts+vector" : set.has("fts") ? "fts" : "vector";
}
// src/host/date-globs.ts
const RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = (n) => String(n).padStart(2, "0");
const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const key = (a) => a.y * 1e4 + a.m * 100 + a.d;
function parseDay(s) {
	const m = RE.exec(s.trim());
	if (!m) return null;
	const day = {
		y: +m[1],
		m: +m[2],
		d: +m[3]
	};
	const dt = new Date(Date.UTC(day.y, day.m - 1, day.d));
	return dt.getUTCFullYear() === day.y && dt.getUTCMonth() === day.m - 1 && dt.getUTCDate() === day.d ? day : null;
}
/** 月内 [d1, d2] 按日十位分段：整段写 d*，不满写 d[x-y]* */
function monthDays(y, m, d1, d2) {
	const out = [];
	const last = daysIn(y, m);
	if (d1 === 1 && d2 === last) return [`**/${y}-${pad(m)}-*`];
	for (let tens = Math.floor(d1 / 10); tens <= Math.floor(d2 / 10); tens++) {
		const segLo = Math.max(tens === 0 ? 1 : tens * 10, 1);
		const segHi = Math.min(tens * 10 + 9, last);
		const lo = Math.max(d1, segLo);
		const hi = Math.min(d2, segHi);
		if (lo > hi) continue;
		out.push(lo === segLo && hi === segHi ? `**/${y}-${pad(m)}-${tens}*` : `**/${y}-${pad(m)}-${tens}[${lo % 10}-${hi % 10}]*`);
	}
	return out;
}
/** [s, e] → 规则列表：整年 → YYYY-*，整月 → YYYY-MM-*，其余按日段。 */
function dateGlobs(s, e) {
	const out = [];
	for (let y = s.y; y <= e.y; y++) {
		const m1 = y === s.y ? s.m : 1;
		const m2 = y === e.y ? e.m : 12;
		if (m1 === 1 && m2 === 12 && (y !== s.y || s.d === 1) && (y !== e.y || e.d === 31)) {
			out.push(`**/${y}-*`);
			continue;
		}
		for (let m = m1; m <= m2; m++) {
			const d1 = y === s.y && m === s.m ? s.d : 1;
			const d2 = y === e.y && m === e.m ? e.d : daysIn(y, m);
			out.push(...monthDays(y, m, d1, d2));
		}
	}
	return out;
}
/** 工具参数入口：缺起点取 2000-01-01，缺终点取今天（上海时区）。 */
function resolveDateRange(start, end, today = shanghaiToday()) {
	if (!start && !end) return null;
	const s = start ? parseDay(start) : {
		y: 2e3,
		m: 1,
		d: 1
	};
	const e = end ? parseDay(end) : today;
	if (s === null) return {
		ok: false,
		message: `start_date 格式应为 YYYY-MM-DD：${start}`
	};
	if (e === null) return {
		ok: false,
		message: `end_date 格式应为 YYYY-MM-DD：${end}`
	};
	if (key(s) > key(e)) return {
		ok: false,
		message: `start_date ${start} 晚于 end_date ${end ?? "今天"}`
	};
	return {
		ok: true,
		globs: dateGlobs(s, e)
	};
}
function shanghaiToday(now = /* @__PURE__ */ new Date()) {
	const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Shanghai",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(now).split("-").map(Number);
	return {
		y,
		m,
		d
	};
}
// src/host/outlinks.ts
/** 命中文件内的相对 Markdown 链接 → 相对记忆库根的路径；外链、锚点、绝对路径跳过；最多 max 条。 */
const LINK = /\]\((<[^>]+>|[^)\s]+)\)/g;
async function outlinks(root, relPath, max = 10) {
	let text;
	try {
		text = await readFile(join(root, relPath), "utf8");
	} catch {
		return [];
	}
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const m of text.matchAll(LINK)) {
		let target = m[1].replace(/^</, "").replace(/>$/, "").split("#")[0];
		if (!target || /^[a-z]+:/i.test(target) || isAbsolute(target)) continue;
		try {
			target = decodeURI(target);
		} catch {}
		const rel = normalize(relative(root, join(root, dirname(relPath), target)));
		if (rel.startsWith("..") || seen.has(rel)) continue;
		seen.add(rel);
		const exists = await stat(join(root, rel)).then(() => true, () => false);
		out.push(exists ? rel : `${rel} (missing)`);
		if (out.length >= max) break;
	}
	return out;
}
// src/host/tool.ts
/** zvec-memory-search 工具定义与执行。 */
function buildQueryArgs(a, cfg, transport = "auto") {
	const limit = Math.min(50, Math.max(1, Math.trunc(a.limit ?? cfg.semanticLimit)));
	const argv = [
		...cfg.queryMode === "fts" ? ["--fts", a.query] : cfg.queryMode === "vector" ? ["--vector", a.query] : [a.query],
		"--mode",
		transport,
		"--trace",
		"--limit",
		String(limit),
		"--preview",
		a.preview ?? cfg.preview
	];
	const range = resolveDateRange(a.start_date, a.end_date);
	if (range && !range.ok) return {
		ok: false,
		message: range.message
	};
	if (range?.ok) for (const g of range.globs) argv.push("-g", g);
	if (a.modified_after) argv.push("--modified-after", a.modified_after);
	if (a.modified_before) argv.push("--modified-before", a.modified_before);
	return {
		ok: true,
		argv,
		dateFiltered: Boolean(range?.ok),
		mtimeFiltered: Boolean(a.modified_after || a.modified_before)
	};
}
/**
* 一次检索的完整执行链：工具 execute 与配置卡 /search 共用。
* elapsedMs 计入状态检查与 zg 查询，便于卡片显示真实耗时。
*/
async function runSearch(args, cfg) {
	const t0 = Date.now();
	return {
		...await runSearchInner(args, cfg),
		elapsedMs: Date.now() - t0
	};
}
async function runSearchInner(args, cfg) {
	if (!cfg.memoryRoot) return {
		status: "not_ready",
		message: "请在插件配置卡填写记忆库根目录",
		counts: {
			fts: 0,
			vector: 0,
			returned: 0
		},
		results: []
	};
	try {
		await stat(join(cfg.memoryRoot));
	} catch {
		return {
			status: "error",
			message: `记忆库根不存在：${cfg.memoryRoot}`,
			counts: {
				fts: 0,
				vector: 0,
				returned: 0
			},
			results: []
		};
	}
	const zg = await detectZg(cfg.zgPath);
	if (!zg) return {
		status: "not_ready",
		message: "未检测到 zg，请在插件配置卡安装",
		counts: {
			fts: 0,
			vector: 0,
			returned: 0
		},
		results: []
	};
	const [st, server] = await Promise.all([readStatus(zg, cfg.memoryRoot), readServer(zg)]);
	if (st.state === "busy") return {
		status: "error",
		message: `另一个 zg 任务正在写索引（pid ${st.ownerPid ?? "?"}），稍后再试`,
		counts: {
			fts: 0,
			vector: 0,
			returned: 0
		},
		results: []
	};
	if (!searchable(st)) return {
		status: "not_ready",
		message: "索引未建，请在插件配置卡建立索引",
		counts: {
			fts: 0,
			vector: 0,
			returned: 0
		},
		results: []
	};
	const built = buildQueryArgs(args, cfg, server === "running" ? "server" : "auto");
	if (!built.ok) return {
		status: "error",
		message: built.message,
		counts: {
			fts: 0,
			vector: 0,
			returned: 0
		},
		results: []
	};
	const { stdout, stderr, code } = await zgQuery(zg, cfg.memoryRoot, built.argv);
	const parsed = parseTrace(stdout);
	if (parsed.error) return {
		status: "error",
		message: parsed.error,
		counts: {
			fts: 0,
			vector: 0,
			returned: 0
		},
		results: []
	};
	if (code !== 0) return {
		status: "error",
		message: stderr.split("\n")[0] || `zg exit ${code}`,
		counts: {
			fts: 0,
			vector: 0,
			returned: 0
		},
		results: []
	};
	const results = await Promise.all(parsed.hits.map(async (h) => ({
		path: h.path,
		start_line: h.start_line,
		end_line: h.end_line,
		heading: h.heading,
		scope: h.scope,
		score: h.score,
		matched_by: h.matched_by,
		ranks: h.ranks,
		time_basis: built.dateFiltered ? "path" : built.mtimeFiltered ? "mtime" : "none",
		outlinks: await outlinks(cfg.memoryRoot, h.path)
	})));
	const fts = results.filter((r) => r.ranks.fts !== null).length;
	const vector = results.filter((r) => r.ranks.vector !== null).length;
	return {
		status: "ready",
		root: cfg.memoryRoot,
		counts: {
			fts,
			vector,
			returned: results.length
		},
		results
	};
}
function createTool(defineTool, getCfg) {
	return defineTool({
		name: "zvec-memory-search",
		description: "本地记忆库混合检索（关键词+语义）。回忆过往项目、决策、用户偏好、某天做了什么时使用。",
		parameters: {
			query: {
				type: "string",
				required: true,
				description: "自然语言检索意图"
			},
			start_date: {
				type: "string",
				description: "业务时间下限（YYYY-MM-DD）；只影响文件名以日期开头的文件"
			},
			end_date: {
				type: "string",
				description: "业务时间上限（YYYY-MM-DD）"
			},
			modified_after: {
				type: "string",
				description: "文件修改时间下限（YYYY-MM-DD 或毫秒时间戳）"
			},
			modified_before: {
				type: "string",
				description: "文件修改时间上限（YYYY-MM-DD 或毫秒时间戳）"
			},
			limit: {
				type: "integer",
				description: "通常不传：默认返回条数取插件设置（默认 8）。仅在默认条数明显不够时传更大的值（上限 50）"
			},
			preview: {
				type: "string",
				enum: [
					"none",
					"short",
					"full"
				],
				description: "摘要详略（默认取设置 preview）"
			}
		},
		output: {
			schema: { type: "json" },
			render: (_args, v) => {
				const r = v;
				if (r?.status !== "ready") return [{
					type: "text",
					text: `zvec-memory-search ${r?.status ?? "error"}: ${r?.message ?? "未实现"}`
				}];
				const results = r.results ?? [];
				if (results.length === 0) return [{
					type: "text",
					text: `zvec-memory-search ready（${r.counts?.returned ?? 0}）`
				}];
				const lines = results.map((h, i) => [
					`#${i + 1} ${h.matched_by} ${h.path}:${h.start_line}-${h.end_line}  [${h.heading}]  score=${h.score ?? 0}  time_basis=${h.time_basis}`,
					`  scope: ${h.scope}`,
					h.outlinks?.length ? `  outlinks: ${h.outlinks.join(", ")}` : void 0
				]).flat().filter(Boolean);
				return [{
					type: "text",
					text: `zvec-memory-search ready（${r.counts?.returned ?? 0}）\n${lines.join("\n")}`
				}];
			}
		},
		execute: (args) => runSearch(args, getCfg())
	});
}
// src/host/inject.ts
/**
* 注入：每步生成期望消息；会话里已有同 kind 同内容 → 跳过；否则插入。
* 不维护会话状态，压缩清掉消息后下一步自然重注。
*/
const BASELINE_MAX_BYTES = 65536;
function guid() {
	return `zvms-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}
const MODE_LABEL = {
	"fts+vector": "混合检索：关键词 + 语义",
	fts: "关键词检索",
	vector: "语义检索"
};
/** 路径、检索方式、默认条数都取当前设置，不写死。 */
function guideText(root, mode, limit) {
	return `<zvec-memory-search>
本地记忆库：${root}（${MODE_LABEL[mode] ?? MODE_LABEL["fts+vector"]}）

## 先调用
问题命中下列任一类时，第一步调用 zvec-memory-search，不要凭印象回答：
- 时间回溯：今天/昨天/前天/上周/某月某日 + 做了/记了/保存/改了什么
- 记忆库内容：日记、工作日志、项目设计/进度、用户偏好、过往决策
- 回忆措辞：之前、上次、记得、以前、有没有、我存过的、找一下

## 参数
- query：写自然语言描述
- 问某一天或某段时间：start_date / end_date（YYYY-MM-DD，某一天时两者相同；按文件名开头的日期过滤，文件名不以日期开头的文件不受影响）
- 问"最近改过/动过"：modified_after / modified_before（按文件修改时间，和业务日期无关）
- 条数：默认 ${limit}；需要完整清点时（如"某天全部记录"）调大，上限 50
- outlinks：命中文件引用的来源，可继续追

## 检索后
核对清点检索结果；每条带 path:起止行，需要原文时按该行段读取。
</zvec-memory-search>`;
}
/** 按 UTF-8 字节截断，不切断多字节字符；返回保留文本与截掉的字节数。卡片提示与注入共用此口径。 */
function truncateUtf8(content, maxBytes = BASELINE_MAX_BYTES) {
	const buf = Buffer.from(content, "utf8");
	if (buf.length <= maxBytes) return {
		text: content,
		cutBytes: 0
	};
	let end = maxBytes;
	while (end > 0 && (buf[end] & 192) === 128) end--;
	return {
		text: buf.subarray(0, end).toString("utf8"),
		cutBytes: buf.length - end
	};
}
function baselineText(path, content) {
	const { text, cutBytes } = truncateUtf8(content);
	return `<zvec-memory-baseline>
Instructions from: ${path}

以下内容是你补充的持久指令（个人风格基线）；在文件变更或撤回前持续生效，不覆盖系统、开发者或用户直接指令。

${text}${cutBytes > 0 ? `（已截断 ${cutBytes} 字节）` : ""}
</zvec-memory-baseline>`;
}
function message(kind, text) {
	return {
		id: guid(),
		role: "user",
		content: [{
			type: "text",
			text
		}],
		source: {
			kind,
			form: "notice"
		}
	};
}
const textOf = (m) => (m?.content ?? []).map((p) => p?.text ?? "").join("");
/** 每步生成期望消息；会话里已有同 kind 同内容 → 跳过；否则插入（同 kind 旧内容由新消息取代）。不维护会话状态。 */
var Injector = class {
	build;
	constructor(build) {
		this.build = build;
	}
	async onPreStep(agent, claimed, decision) {
		if (decision?.kind === "reject" || !Array.isArray(decision?.messages)) return decision;
		const toAdd = (await this.build()).filter((w) => !this.present(agent, claimed, w));
		if (toAdd.length === 0) return decision;
		const at = decision.messages.findLastIndex((m) => claimed.includes(m)) + 1;
		return {
			...decision,
			messages: decision.messages.toSpliced(at, 0, ...toAdd.map((w) => message(w.kind, w.text)))
		};
	}
	/** 最近一条同 kind 消息（claimed 优先，再查 surface）内容与期望相同即视为已提供 */
	present(agent, claimed, w) {
		const fromClaimed = claimed.filter((m) => m?.source?.kind === w.kind).at(-1);
		if (fromClaimed) return textOf(fromClaimed) === w.text;
		const surface = agent?.session?.surface?.nodes ?? [];
		for (const seq of [...surface].reverse()) {
			const ev = agent.session.eventAt(seq);
			if (ev?.type === "user/message" && ev.data?.source?.kind === w.kind) return textOf(ev.data) === w.text;
		}
		return false;
	}
};
// src/host/zg-meta.ts
/** 配置卡只读信息：zg 版本、索引体积、.zgignore 读写。 */
const run = promisify(execFile);
let versionCache = null;
/** `zg --version` 首行（如 0.2.2）；按 zg 路径缓存，进程内只跑一次。 */
async function zgVersion(zg) {
	if (versionCache?.zg === zg) return versionCache.version;
	let version = null;
	try {
		version = (await run(zg, ["--version"], { timeout: 5e3 })).stdout.trim().split("\n")[0] || null;
	} catch {}
	versionCache = {
		zg,
		version
	};
	return version;
}
/** 递归求目录总字节；目录不存在返回 null。 */
async function dirBytes(dir) {
	if (!existsSync(dir)) return null;
	let total = 0;
	const walk = async (d) => {
		for (const e of await readdir(d, { withFileTypes: true })) {
			const p = join(d, e.name);
			if (e.isDirectory()) await walk(p);
			else if (e.isFile()) total += (await stat(p)).size;
		}
	};
	await walk(dir);
	return total;
}
/** 读 .zgignore；不存在时返回默认规则供预填，exists=false。 */
async function readIgnore(root) {
	const p = join(root, ".zgignore");
	if (!existsSync(p)) return {
		exists: false,
		content: DEFAULT_IGNORE.join("\n")
	};
	return {
		exists: true,
		content: await readFile(p, "utf8")
	};
}
/** 写 .zgignore；去掉首尾空白，非空时末尾补换行。 */
async function writeIgnore(root, content) {
	const body = content.replace(/\r\n/g, "\n").trim();
	await writeFile(join(root, ".zgignore"), body ? `${body}\n` : "", "utf8");
	return body ? body.split("\n").filter((l) => l.trim()).length : 0;
}
// src/host/index-history.ts
/** 上次建索引记录：build（建立/重建）与 update（增量）各保留最近一条。存于插件目录，不写 .zvec-grep。 */
const HISTORY_PATH = join(homedir(), ".dsh", "dsh-zvec-memory-search", "last-index.json");
/**
* 解析 zg index 输出尾部。真实格式（zg 0.2.2）：
*   files	557 scanned, 557 added, 0 modified, 0 retried, 0 unchanged, 0 deleted, 0 failed
*   entities	14577
*   duration	30m 36s (1836453ms)
* 失败时有 `Error: …` 与 `Code: ZVEC_GREP.…`，错误码优先。
*/
function parseIndexSummary(lines) {
	const text = lines.join("\n");
	const files = /^files\s+(.*)$/m.exec(text)?.[1] ?? "";
	const f = (k) => {
		const m = new RegExp(`(\\d+) ${k}`).exec(files);
		return m ? Number(m[1]) : null;
	};
	const ent = /^entities\s+(\d+)/m.exec(text);
	const dur = /^duration\s+.*\((\d+)ms\)/m.exec(text);
	return {
		scanned: f("scanned"),
		added: f("added"),
		modified: f("modified"),
		unchanged: f("unchanged"),
		deleted: f("deleted"),
		failed: f("failed"),
		entities: ent ? Number(ent[1]) : null,
		durationMs: dur ? Number(dur[1]) : null,
		error: /^Code:\s*(\S+)/m.exec(text)?.[1] ?? /^Error:\s*(.+)$/m.exec(text)?.[1] ?? null
	};
}
function readHistory(path = HISTORY_PATH) {
	try {
		const h = JSON.parse(readFileSync(path, "utf8"));
		return h && typeof h === "object" && !Array.isArray(h) ? h : {};
	} catch {
		return {};
	}
}
/** 原子写：先写临时文件再 rename，避免半截 JSON。 */
function writeRun(run, path = HISTORY_PATH) {
	const h = readHistory(path);
	h[run.kind] = run;
	mkdirSync(dirname(path), { recursive: true });
	const tmp = `${path}.tmp`;
	writeFileSync(tmp, JSON.stringify(h, null, 2), "utf8");
	renameSync(tmp, path);
}
/** 任务结束信息 → 记录。exitCode 非 0 或解析到错误码即失败。 */
function toRun(kind, job) {
	const s = parseIndexSummary(job.tail);
	return {
		kind,
		root: job.root,
		startedAt: job.startedAt,
		finishedAt: job.finishedAt,
		durationMs: s.durationMs ?? job.finishedAt - job.startedAt,
		scanned: s.scanned,
		added: s.added,
		modified: s.modified,
		unchanged: s.unchanged,
		deleted: s.deleted,
		failed: s.failed,
		entities: s.entities,
		ok: job.exitCode === 0 && s.error === null,
		error: s.error ?? (job.exitCode === 0 ? null : `exit ${job.exitCode}`)
	};
}
// src/host/zg-models.ts
/**
* zg 本地向量模型清单：列表与大小取自 zg 安装目录的 catalog.js；语言标签由本表补充。
* zg 清单无语言字段，语言依据 zg 文档 docs/07-embedding.md「Quick selection」；
* qwen3-embedding-0.6b 文档表未列语言，按模型本身为多语言；bge-small-en-v1.5 未列入文档表，按名称为英文。
*/
const LANG = {
	"local/qwen3-embedding-0.6b": "multilingual",
	"local/embeddinggemma-300m": "multilingual",
	"local/multilingual-e5-small": "multilingual",
	"local/potion-multilingual-128m": "multilingual",
	"local/jina-embeddings-v2-base-code": "code-multilingual",
	"local/potion-code-16m-v2": "code",
	"local/potion-retrieval-32m": "english",
	"local/all-minilm-l6-v2": "english",
	"local/bge-small-en-v1.5": "english",
	"local/gte-modernbert-base": "english",
	"local/nomic-embed-text-v1.5": "english"
};
function modelLang(ref) {
	return LANG[ref] ?? "unknown";
}
/** zg 清单读取失败时的降级列表（仅名称，无大小）；与 zg 0.2.2 本地模型一致。 */
const FALLBACK_MODELS = Object.keys(LANG);
/**
* zg 可执行文件（软链 → dist/cli/index.js）推出 dist/engine/models/catalog.js。
* zg 无「列出模型」命令，只能读内部模块；路径或导出变化时由调用方降级。
*/
function catalogPath(zg) {
	return resolve(dirname(realpathSync(zg)), "..", "engine", "models", "catalog.js");
}
/** zg 模型缓存根：ZVEC_GREP_MODEL_CACHE，否则 ZVEC_GREP_HOME 或 ~/.zvec-grep 下的 models（dist/engine/utils/path.js）。 */
function modelCacheRoot(env = process.env) {
	if (env.ZVEC_GREP_MODEL_CACHE) return env.ZVEC_GREP_MODEL_CACHE;
	return join(env.ZVEC_GREP_HOME || join(homedir(), ".zvec-grep"), "models");
}
function dirSize(dir) {
	let total = 0;
	let names;
	try {
		names = readdirSync(dir);
	} catch {
		return 0;
	}
	for (const n of names) {
		const p = join(dir, n);
		try {
			const st = statSync(p);
			total += st.isDirectory() ? dirSize(p) : st.size;
		} catch {}
	}
	return total;
}
/**
* 某模型已在缓存中的字节数（含下载中的 .part-* 临时文件，实测其原地增长，可用于进度）。
* zg 缓存按来源与后端分层（如 modelscope/llama-cpp/Qwen--Qwen3-Embedding-0.6B-GGUF，HF 来源另有一层），
* 在缓存根 3 层内找名为 repo（/ 换成 --，忽略大小写）的目录，取其中最大者（同一模型可能有多个来源目录）。
* 规则按本机实际缓存推出（zg 无接口）；结构变化时返回 0，只会多一句下载提示。
*/
function downloadedBytes(repo, modelsDir = modelCacheRoot()) {
	if (!repo) return 0;
	const want = repo.replace(/\//g, "--").toLowerCase();
	let best = 0;
	const walk = (dir, depth) => {
		let names;
		try {
			names = readdirSync(dir);
		} catch {
			return;
		}
		for (const n of names) {
			const p = join(dir, n);
			let isDir = false;
			try {
				isDir = statSync(p).isDirectory();
			} catch {
				continue;
			}
			if (!isDir) continue;
			if (n.toLowerCase() === want) best = Math.max(best, dirSize(p));
			else if (depth > 0) walk(p, depth - 1);
		}
	};
	walk(modelsDir, 2);
	return best;
}
/** 读 zg 清单，只留本地模型；失败返回降级列表（fallback: true）。modelsDir 可传入供测试。 */
async function listLocalModels(zg, modelsDir) {
	try {
		if (!zg) throw new Error("zg 不可用");
		const mod = await import(pathToFileURL(catalogPath(zg)).href);
		const models = (typeof mod.listEmbeddingModels === "function" ? mod.listEmbeddingModels() : []).filter((e) => e?.provider === "local" && typeof e.reference === "string").map((e) => {
			const sources = e.sources ?? {};
			const repo = e.repo ?? sources.huggingFace?.repo ?? sources.modelScope?.repo;
			const bytes = Array.isArray(e.artifacts) ? e.artifacts.reduce((sum, a) => sum + (Number(a?.size) || 0), 0) : 0;
			const have = downloadedBytes(repo, modelsDir);
			return {
				ref: e.reference,
				lang: modelLang(e.reference),
				dimension: Number(e.dimension) || null,
				maxInputTokens: Number(e.maxInputTokens) || null,
				backend: e.backend ?? null,
				bytes: bytes || null,
				downloadedBytes: have,
				downloaded: bytes > 0 && have >= bytes * .98
			};
		});
		if (models.length === 0) throw new Error("清单为空");
		return {
			models,
			fallback: false
		};
	} catch {
		return {
			models: FALLBACK_MODELS.map((ref) => ({
				ref,
				lang: modelLang(ref),
				dimension: null,
				maxInputTokens: null,
				backend: null,
				bytes: null,
				downloadedBytes: 0,
				downloaded: false
			})),
			fallback: true
		};
	}
}
// src/host/index-health.ts
/**
* 索引可用性（只读记忆库 .zvec-grep/manifest.json，不改写）。
* zg 打开索引只校验 indexVersion 与模型规格，不比对路径；manifest 的 rootPaths 为写入时的绝对路径，
* 换机后路径不同则检索结果指向旧路径文件（实测），视为不可用。
*/
/** 统一为真实路径并去掉末尾斜杠；路径不存在时按原值去斜杠比较。 */
function norm(p) {
	let r = p;
	try {
		r = realpathSync(p);
	} catch {}
	return r.replace(/\/+$/, "");
}
function readIndexHealth(memoryRoot, localRefs) {
	let m;
	try {
		m = JSON.parse(readFileSync(join(memoryRoot, ".zvec-grep", "manifest.json"), "utf8"));
	} catch {
		return { kind: "none" };
	}
	const e = m?.embedding;
	if (!e || e.provider !== "local" || typeof e.model !== "string") return {
		kind: "model-unknown",
		model: String(e?.model ?? "")
	};
	const model = `local/${e.model}`;
	const roots = Array.isArray(m.rootPaths) ? m.rootPaths.map((r) => String(r?.absolutePath ?? "")).filter(Boolean) : [];
	const want = norm(memoryRoot);
	if (roots.length > 0 && !roots.some((r) => norm(r) === want)) return {
		kind: "path-mismatch",
		model,
		indexedRoot: roots[0]
	};
	if (!localRefs.includes(model)) return {
		kind: "model-unknown",
		model
	};
	return {
		kind: "ok",
		model
	};
}
// src/host/server-owner.ts
/**
* 本插件启动的 zg server 归属记录。
* zg server on 会把 server 守护化（父进程为 launchd），与 DSH 无父子关系，插件卸载不会带走它；
* 只有配置卡在「启动前为 stopped」时启动的 server 才记录 PID，卸载时据此只停自己启动的那个。
*/
const OWNER_PATH = process.env.ZVMS_OWNER_PATH || join(homedir(), ".dsh", "dsh-zvec-memory-search", "server-owner.json");
/** 缺失、损坏或字段不合法一律返回 null（按「无记录」处理，退化为不停止）。 */
function readOwner(path = OWNER_PATH) {
	try {
		const v = JSON.parse(readFileSync(path, "utf8"));
		return Number.isInteger(v?.pid) && v.pid > 0 ? {
			pid: v.pid,
			startedAt: Number(v.startedAt) || 0
		} : null;
	} catch {
		return null;
	}
}
/** 原子写：临时文件 + rename，避免卸载与写入并发时留下半截 JSON。 */
function writeOwner(owner, path = OWNER_PATH) {
	mkdirSync(dirname(path), { recursive: true });
	const tmp = `${path}.tmp`;
	writeFileSync(tmp, JSON.stringify(owner) + "\n", "utf8");
	renameSync(tmp, path);
}
function clearOwner(path = OWNER_PATH) {
	rmSync(path, { force: true });
}
/**
* 卸载时调用：有归属记录才动作。以 detached + stdio:ignore 启动独立 node 子进程并 unref，
* 卸载流程不等待；DSH 退出后子进程仍能跑完。子进程内先读当前 PID，与记录一致才 server off，
* 不一致说明 server 已被他人重启，只删记录不停止。返回是否发起了子进程（供测试）。
*/
function stopOwnedServer(zg, path = OWNER_PATH) {
	const owner = readOwner(path);
	if (!owner || !zg) return false;
	spawn(process.execPath, [
		"-e",
		`
    const { execFileSync } = require('node:child_process');
    const { rmSync } = require('node:fs');
    const [zg, pid, file] = process.argv.slice(1);
    try {
      const out = execFileSync(zg, ['server', 'status'], { encoding: 'utf8', timeout: 5000 });
      const m = /^PID:\\s*(\\d+)\\s*$/m.exec(out);
      if (m && m[1] === pid) execFileSync(zg, ['server', 'off'], { timeout: 15000 });
    } catch {}
    rmSync(file, { force: true });
  `,
		zg,
		String(owner.pid),
		path
	], {
		detached: true,
		stdio: "ignore"
	}).unref();
	return true;
}
// src/host/routes.ts
/**
* 冷启动路由：/api/dsh-zvec-memory-search/*
* 照 adapter 用 connection.fetch.register 注册，请求体 buffered JSON。
*/
const NS = "/api/dsh-zvec-memory-search";
const jobs = new JobRunner();
setStatusPause((root) => jobs.activeRoot() === root);
/** 建立/重建记 build，增量记 update；安装 zg 不记。 */
const recordAs = (kind) => (job) => writeRun(toRun(kind, job));
/** 建立索引 / 重建 / 增量的 zg 参数。增量不传 --embedding：zg 对已有索引换模型会报 EMBEDDING_MODEL_MISMATCH。 */
function indexArgs(kind, c) {
	const ignore = ["--ignore-file", join(c.memoryRoot, ".zgignore")];
	if (kind === "build") return [
		"index",
		c.memoryRoot,
		"--embedding",
		c.embeddingModel,
		...ignore
	];
	if (kind === "rebuild") return [
		"index",
		c.memoryRoot,
		"--rebuild",
		"--embedding",
		c.embeddingModel
	];
	return ["index", c.memoryRoot];
}
function route(path, fetch) {
	return {
		path: `${NS}${path}`,
		methods: ["POST"],
		requestBody: "buffered",
		fetch
	};
}
function registerRoutes(ctx, getCfg) {
	const routes = [
		route("/detect", async () => {
			const c = getCfg();
			const zg = c.zgPath ? await detectZg(c.zgPath) : await detectZg("");
			const root = c.memoryRoot;
			let rootExists = false;
			if (root) try {
				await stat(root);
				rootExists = true;
			} catch {
				rootExists = false;
			}
			let status = null;
			let server = "unknown";
			let ignoreLines = 0;
			if (zg && root && rootExists) [status, server] = await Promise.all([readStatus(zg, root), readServer(zg)]);
			const igPath = root ? join(root, ".zgignore") : "";
			if (igPath && existsSync(igPath)) ignoreLines = readFileSync(igPath, "utf8").split("\n").filter((l) => l.trim()).length;
			let baseline = {
				path: c.baselineFile || "",
				exists: false,
				bytes: 0,
				truncatedBytes: 0
			};
			if (c.baselineFile) try {
				const s = statSync(c.baselineFile);
				const truncatedBytes = s.size > 1048576 ? Math.max(0, s.size - BASELINE_MAX_BYTES) : truncateUtf8(readFileSync(c.baselineFile, "utf8")).cutBytes;
				baseline = {
					path: c.baselineFile,
					exists: true,
					bytes: s.size,
					truncatedBytes
				};
			} catch {
				baseline = {
					path: c.baselineFile,
					exists: false,
					bytes: 0,
					truncatedBytes: 0
				};
			}
			const ready = Boolean(zg && root && rootExists);
			const [zgVer, indexBytes, catalog] = await Promise.all([
				zg ? zgVersion(zg) : Promise.resolve(null),
				ready ? dirBytes(join(root, ".zvec-grep")) : Promise.resolve(null),
				ready ? listLocalModels(zg) : Promise.resolve(null)
			]);
			const indexHealth = ready && catalog ? readIndexHealth(root, catalog.models.map((m) => m.ref)) : null;
			const im = indexHealth?.kind === "ok" ? catalog?.models.find((m) => m.ref === indexHealth.model) : void 0;
			const indexModel = im ? {
				ref: im.ref,
				bytes: im.bytes,
				downloadedBytes: im.downloadedBytes,
				downloaded: im.downloaded
			} : null;
			return Response.json({
				zg: zg ?? null,
				zgVersion: zgVer,
				memoryRoot: root,
				rootExists,
				status,
				server,
				updatedTime: root && rootExists ? readUpdatedTime(root) : null,
				zgPathValid: c.zgPath ? zg === c.zgPath : null,
				ignoreFile: igPath || null,
				ignoreLines,
				indexBytes,
				baselineFile: baseline,
				job: jobs.snapshot(),
				history: readHistory(),
				indexHealth,
				indexModel
			}, { headers: { "cache-control": "no-store" } });
		}),
		route("/models", async () => {
			const c = getCfg();
			const zg = c.zgPath ? await detectZg(c.zgPath) : await detectZg("");
			return Response.json({
				...await listLocalModels(zg),
				current: c.embeddingModel
			});
		}),
		route("/download-model", async () => {
			const c = getCfg();
			const zg = c.zgPath ? await detectZg(c.zgPath) : await detectZg("");
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			if (!c.memoryRoot) return Response.json({ error: "memoryRoot 未设置" }, { status: 400 });
			if (jobs.snapshot()) return Response.json({ busy: true }, { status: 200 });
			if (await readServer(zg) === "running") return Response.json({ error: "server 运行中，先停止 server" }, { status: 409 });
			const p = jobs.start("download", zg, [
				"query",
				"--vector",
				"zvec",
				"--mode",
				"direct",
				"--limit",
				"1",
				"--preview",
				"none"
			], c.memoryRoot);
			return Response.json(p);
		}),
		route("/install-zg", async () => {
			getCfg();
			if (jobs.snapshot()) return Response.json({ busy: true }, { status: 200 });
			const p = jobs.start("install", "npm", [
				"install",
				"-g",
				"@zvec/zvec-grep"
			], homedir());
			return Response.json(p);
		}),
		route("/build-index", async () => {
			const c = getCfg();
			if (!c.memoryRoot) return Response.json({ error: "memoryRoot 未设置" }, { status: 400 });
			const zg = c.zgPath ? await detectZg(c.zgPath) : await detectZg("");
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			ensureIgnore(c.memoryRoot);
			if (jobs.snapshot()) return Response.json({ busy: true }, { status: 200 });
			const p = jobs.start("build", zg, indexArgs("build", c), c.memoryRoot, recordAs("build"));
			return Response.json(p);
		}),
		route("/update-index", async () => {
			const c = getCfg();
			const zg = c.zgPath ? await detectZg(c.zgPath) : await detectZg("");
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			if (jobs.snapshot()) return Response.json({ busy: true }, { status: 200 });
			const p = jobs.start("update", zg, indexArgs("update", c), c.memoryRoot, recordAs("update"));
			return Response.json(p);
		}),
		route("/rebuild-index", async () => {
			const c = getCfg();
			const zg = c.zgPath ? await detectZg(c.zgPath) : await detectZg("");
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			if (jobs.snapshot()) return Response.json({ busy: true }, { status: 200 });
			const p = jobs.start("rebuild", zg, indexArgs("rebuild", c), c.memoryRoot, recordAs("build"));
			return Response.json(p);
		}),
		route("/server-on", async () => {
			const c = getCfg();
			const zg = await detectZg(c.zgPath);
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			try {
				const wasStopped = await readServer(zg) === "stopped";
				const { stdout } = await promisify(execFile)(zg, ["server", "on"], {
					encoding: "utf8",
					timeout: 15e3
				});
				if (wasStopped) {
					const pid = parseServerPid((await promisify(execFile)(zg, ["server", "status"], {
						encoding: "utf8",
						timeout: 5e3
					}).catch((e) => ({ stdout: String(e?.stdout ?? "") }))).stdout);
					if (pid !== null) writeOwner({
						pid,
						startedAt: Date.now()
					});
				}
				const watching = c.memoryRoot ? await attachWatcher(zg, c.memoryRoot) : false;
				return Response.json({
					ok: true,
					output: stdout,
					watching
				});
			} catch (e) {
				return Response.json({
					ok: false,
					output: e?.message ?? ""
				});
			}
		}),
		route("/server-off", async () => {
			const zg = await detectZg(getCfg().zgPath);
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			try {
				const { stdout } = await promisify(execFile)(zg, ["server", "off"], {
					encoding: "utf8",
					timeout: 15e3
				});
				clearOwner();
				return Response.json({
					ok: true,
					output: stdout
				});
			} catch (e) {
				return Response.json({
					ok: false,
					output: e?.message ?? ""
				});
			}
		}),
		route("/search", async (req) => {
			const body = await req.json().catch(() => ({}));
			const query = String(body?.query ?? "").trim();
			if (!query) return Response.json({ error: "query 为空" }, { status: 400 });
			const mode = body?.mode;
			if (mode !== "fts+vector" && mode !== "fts" && mode !== "vector") return Response.json({ error: "mode 无效" }, { status: 400 });
			const n = Number(body?.limit);
			const limit = Math.min(50, Math.max(1, Number.isFinite(n) ? Math.round(n) : 5));
			return Response.json(await runSearch({
				query,
				limit,
				preview: "none"
			}, {
				...getCfg(),
				queryMode: mode
			}));
		}),
		route("/zgignore", async (req) => {
			const c = getCfg();
			if (!c.memoryRoot) return Response.json({ error: "memoryRoot 未设置" }, { status: 400 });
			const body = await req.json().catch(() => ({}));
			if (body?.op === "write") {
				if (jobs.snapshot()?.running) return Response.json({ error: "busy" }, { status: 409 });
				const lines = await writeIgnore(c.memoryRoot, String(body?.content ?? ""));
				return Response.json({
					ok: true,
					lines
				});
			}
			return Response.json(await readIgnore(c.memoryRoot));
		})
	];
	ctx.inject(["connection"], (c) => {
		const conn = c.get("connection");
		const reg = typeof conn?.fetch?.register === "function" ? conn.fetch.register.bind(conn.fetch) : void 0;
		if (reg === void 0) return;
		for (const r of routes) c.effect(() => reg(r, `dsh-zvec-memory-search: ${r.path}`));
	});
}
function stopJobs() {
	jobs.stop();
}
// src/host/index.ts
/**
* dsh-zvec-memory-search — host half
*
* 订阅 DSH cordis 事件：agent/pre-step 注入检索引导与用户补充文件；
* 注册 zvec-memory-search 工具；注册 /api/dsh-zvec-memory-search/* 冷启动路由。
*/
const name = "dsh-zvec-memory-search";
const inject = ["tools"];
const defaultDeps = {
	indexSearchable: async (c) => {
		const zg = await detectZg(c.zgPath);
		return zg !== null && searchable(await readStatus(zg, c.memoryRoot));
	},
	readText: (p) => readFile(p, "utf8")
};
/** 本步期望注入的消息；两个开关分别控制两条，互不影响。 */
async function buildWanted(c, deps = defaultDeps) {
	const msgs = [];
	if (c.injectGuide && c.memoryRoot) try {
		if (await deps.indexSearchable(c)) msgs.push({
			kind: "dsh-zvec-memory-search",
			text: guideText(c.memoryRoot, c.queryMode, c.semanticLimit)
		});
	} catch {}
	if (c.injectBaseline && c.baselineFile) try {
		msgs.push({
			kind: "dsh-zvec-memory-search/baseline",
			text: baselineText(c.baselineFile, await deps.readText(c.baselineFile))
		});
	} catch {}
	return msgs;
}
function apply(ctx, config) {
	const cfg = () => resolve$1(config);
	const defineTool = loadDefineTool();
	if (defineTool !== null) {
		const tool = createTool(defineTool, cfg);
		ctx.effect(() => ctx.tools.register(tool), "dsh-zvec-memory-search: tool");
	} else ctx.logger?.warn?.("dsh-zvec-memory-search: 内核 defineTool 不可用，跳过工具注册");
	const injector = new Injector(() => buildWanted(cfg()));
	ctx.on("agent/pre-step", async ({ agent, messages }, next) => {
		const decision = await next();
		return injector.onPreStep(agent, messages, decision);
	});
	registerRoutes(ctx, cfg);
	ctx.effect(() => () => {
		stopJobs();
		detectZg(cfg().zgPath).then((zg) => stopOwnedServer(zg)).catch(() => {});
	}, "dsh-zvec-memory-search: cleanup");
}
export { Config, apply, buildWanted, inject, name };
