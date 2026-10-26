import { createRequire } from "node:module";
import { dirname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { access, constants, readFile, stat } from "node:fs/promises";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
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
const Config = Schema.object({
	memoryRoot: Schema.string().default("").volatile().description("记忆库根目录（绝对路径）"),
	baselineFile: Schema.string().default("").volatile().description("用户补充提示词文件的绝对路径（如用户偏好文件）；留空不注入；超过 64KB 只注入前 64KB"),
	semanticLimit: Schema.number().step(1).min(1).max(50).default(8).volatile().description("默认返回条数"),
	preview: Schema.union([
		"none",
		"short",
		"full"
	]).default("short").volatile().description("默认摘要详略"),
	zgPath: Schema.string().default("").volatile().description("zg 可执行文件路径；留空自动探测"),
	embeddingModel: Schema.union([
		"local/qwen3-embedding-0.6b",
		"local/multilingual-e5-small",
		"local/potion-multilingual-128m"
	]).default("local/qwen3-embedding-0.6b").volatile().description("新建索引使用的本地向量模型"),
	device: Schema.union([
		"auto",
		"metal",
		"cpu"
	]).default("auto").volatile().description("本地向量设备")
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
		zgPath: String(read(bag.zgPath, "")).trim(),
		embeddingModel: String(read(bag.embeddingModel, "local/qwen3-embedding-0.6b")),
		device: read(bag.device, "auto")
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
// src/host/zg.ts
/**
* zg CLI 交互：探测可执行文件、判断索引就绪、跑查询。子进程一律 execFile/spawn 参数数组，不拼 shell。
*/
const run = promisify(execFile);
/** 探测顺序：设置 → which → npm 全局 bin → 常见路径。 */
async function detectZg(configured) {
	const candidates = [];
	if (configured) candidates.push(configured);
	try {
		candidates.push((await run("which", ["zg"])).stdout.trim());
	} catch {}
	try {
		candidates.push(join((await run("npm", [
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
/** 索引就绪判定：zg status --check-ready 退出码 0；索引未建时 exit 1。 */
async function indexReady(zg, root) {
	try {
		await run(zg, [
			"status",
			root,
			"--check-ready"
		], { cwd: root });
		return true;
	} catch {
		return false;
	}
}
/** 记忆库索引状态详情（就绪/未建/覆盖度）。 */
async function zgStatus(zg, root) {
	try {
		const { stdout } = await run(zg, ["status", root], { cwd: root });
		const files = /(\d+)\s+files/i.exec(stdout)?.[1];
		const entities = /(\d+)\s+entities/i.exec(stdout)?.[1];
		const model = /model[:\s]+(\S+)/i.exec(stdout)?.[1];
		const server = /server[:\s]+(\w+)/i.exec(stdout)?.[1];
		return files || entities || model || server ? {
			files: files ? +files : 0,
			entities: entities ? +entities : 0,
			model: model ?? "",
			server: server ?? "stopped"
		} : null;
	} catch {
		return null;
	}
}
/** 跑 zg query；exit code、stdout/stderr 带回。 */
async function zgQuery(zg, root, args) {
	try {
		const { stdout, stderr } = await run(zg, ["query", ...args], {
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
function appendIgnore(root, glob) {
	const p = join(root, ".zgignore");
	const existing = existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean) : [];
	if (existing.includes(glob)) return;
	writeFileSync(p, [...existing, glob].join("\n") + "\n", "utf8");
}
/** 同一根目录同时只允许一个 zg 任务；DSH 退出时清理。 */
var JobRunner = class {
	current = null;
	start(kind, cmd, argv, cwd) {
		if (this.current) return { busy: true };
		const job = {
			kind,
			proc: spawn(cmd, argv, { cwd }),
			root: cwd,
			done: 0,
			total: 0,
			tail: [],
			exitCode: null,
			startedAt: Date.now(),
			finishedAt: null
		};
		job.proc.stdout?.on("data", (d) => {
			for (const line of d.toString("utf8").split("\n")) {
				if (line.trim()) job.tail.push(line.trimEnd());
				const m = /Indexing files: (\d+)\/(\d+)/.exec(line);
				if (m) {
					job.done = +m[1];
					job.total = +m[2];
				}
			}
			if (job.tail.length > 200) job.tail.splice(0, job.tail.length - 200);
		});
		job.proc.stderr?.on("data", (d) => {
			for (const line of d.toString("utf8").split("\n")) if (line.trim()) job.tail.push(line.trimEnd());
			if (job.tail.length > 200) job.tail.splice(0, job.tail.length - 200);
		});
		job.proc.on("exit", (code) => {
			job.exitCode = code;
			job.finishedAt = Date.now();
			if (this.current === job) this.current = null;
		});
		this.current = job;
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
			exitCode: j.exitCode,
			startedAt: j.startedAt,
			finishedAt: j.finishedAt
		};
	}
	stop() {
		if (this.current?.proc) this.current.proc.kill("SIGTERM");
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
function buildQueryArgs(a, cfg) {
	const limit = Math.min(50, Math.max(1, Math.trunc(a.limit ?? cfg.semanticLimit)));
	const argv = [
		a.query,
		"--mode",
		"auto",
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
function createTool(defineTool, getCfg) {
	return defineTool({
		name: "zvec-memory-search",
		description: "本地记忆库混合检索（关键词+语义）。回忆过往项目、决策、用户偏好、某天做了什么时使用；返回段落定位 path:start-end 与所属标题，细节用 read 读取。",
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
				description: "返回条数（1–50，默认取设置 semanticLimit）"
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
		async execute(args) {
			const cfg = getCfg();
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
			if (!await indexReady(zg, cfg.memoryRoot)) return {
				status: "not_ready",
				message: "索引未建，请在插件配置卡建立索引",
				counts: {
					fts: 0,
					vector: 0,
					returned: 0
				},
				results: []
			};
			const built = buildQueryArgs(args, cfg);
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
function guideText(root, model) {
	return `<zvec-memory-search>
本地记忆库 <${root}> 已建混合检索索引（zvec-grep + ${model}）。

何时用
- 回忆过往项目、决策、用户偏好、某天做了什么 → 先调 zvec-memory-search，不要凭印象回答。
- query 写自然语言描述。
- 命中带 path:start-end 与所属标题，要细节用 read 读该行段；outlinks 是该文件引用的来源，可继续追。

时间过滤（两组，可分开用，也可叠加）
- start_date / end_date：业务时间，取文件名开头的日期（YYYY-MM-DD）。
  适合按“天”组织的记忆文件（文件名以日期开头的文档）。
  文件名不以日期开头的文件不受这组影响。
- modified_after / modified_before：文件修改时间（mtime）。
  适合“今天改过”“最近几天动过”这类问题，和业务时间无关。

结果里 time_basis 的取值
- path：被业务日期过滤命中；
- mtime：按修改时间过滤命中；
- none：文件没有日期信息，或这次没加时间过滤。
</zvec-memory-search>`;
}
function baselineText(path, content) {
	const truncated = content.length > 65536 ? content.slice(0, BASELINE_MAX_BYTES) : content;
	return `<zvec-memory-baseline>
Instructions from: ${path}

以下内容是你补充的持久指令（个人风格基线）；在文件变更或撤回前持续生效，不覆盖系统、开发者或用户直接指令。

${truncated}${truncated.length < content.length ? `（已截断 ${content.length - BASELINE_MAX_BYTES} 字节）` : ""}
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
// src/host/routes.ts
/**
* 冷启动路由：/api/dsh-zvec-memory-search/*
* 照 adapter 用 connection.fetch.register 注册，请求体 buffered JSON。
*/
const NS = "/api/dsh-zvec-memory-search";
const jobs = new JobRunner();
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
			let index = false;
			let zgInfo = null;
			let ignoreLines = 0;
			if (zg && root && rootExists) {
				index = await indexReady(zg, root);
				zgInfo = await zgStatus(zg, root);
			}
			const igPath = root ? join(root, ".zgignore") : "";
			if (igPath && existsSync(igPath)) ignoreLines = readFileSync(igPath, "utf8").split("\n").filter(Boolean).length;
			let baseline = {
				path: c.baselineFile || "",
				exists: false,
				bytes: 0,
				truncatedBytes: 0
			};
			if (c.baselineFile) try {
				const s = statSync(c.baselineFile);
				baseline = {
					path: c.baselineFile,
					exists: true,
					bytes: s.size,
					truncatedBytes: Math.max(0, s.size - BASELINE_MAX_BYTES)
				};
			} catch {
				baseline = {
					path: c.baselineFile,
					exists: false,
					bytes: 0,
					truncatedBytes: 0
				};
			}
			return Response.json({
				zg: zg ?? null,
				memoryRoot: root,
				rootExists,
				indexReady: index,
				zgStatus: zgInfo,
				ignoreFile: igPath || null,
				ignoreLines,
				baselineFile: baseline,
				job: jobs.snapshot()
			}, { headers: { "cache-control": "no-store" } });
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
			const p = jobs.start("build", zg, [
				"index",
				c.memoryRoot,
				"--embedding",
				c.embeddingModel,
				"--device",
				c.device,
				"--ignore-file",
				join(c.memoryRoot, ".zgignore")
			], c.memoryRoot);
			return Response.json(p);
		}),
		route("/update-index", async () => {
			const c = getCfg();
			const zg = c.zgPath ? await detectZg(c.zgPath) : await detectZg("");
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			if (jobs.snapshot()) return Response.json({ busy: true }, { status: 200 });
			const p = jobs.start("update", zg, ["index", c.memoryRoot], c.memoryRoot);
			return Response.json(p);
		}),
		route("/rebuild-index", async () => {
			const c = getCfg();
			const zg = c.zgPath ? await detectZg(c.zgPath) : await detectZg("");
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			if (jobs.snapshot()) return Response.json({ busy: true }, { status: 200 });
			const p = jobs.start("rebuild", zg, [
				"index",
				c.memoryRoot,
				"--rebuild"
			], c.memoryRoot);
			return Response.json(p);
		}),
		route("/server-on", async () => {
			const zg = await detectZg(getCfg().zgPath);
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			try {
				const { stdout } = await promisify(execFile)(zg, ["server", "on"], {
					encoding: "utf8",
					timeout: 15e3
				});
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
		route("/server-off", async () => {
			const zg = await detectZg(getCfg().zgPath);
			if (!zg) return Response.json({ error: "未检测到 zg" }, { status: 400 });
			try {
				const { stdout } = await promisify(execFile)(zg, ["server", "off"], {
					encoding: "utf8",
					timeout: 15e3
				});
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
		route("/add-ignore", async (req) => {
			const c = getCfg();
			const body = await req.json().catch(() => ({}));
			const glob = String(body?.glob ?? "").trim();
			if (!glob) return Response.json({ error: "glob 为空" }, { status: 400 });
			appendIgnore(c.memoryRoot, glob);
			return Response.json({
				ok: true,
				lines: readFileSync(join(c.memoryRoot, ".zgignore"), "utf8").split("\n").filter(Boolean).length
			});
		})
	];
	ctx.inject(["connection"], (c) => {
		const reg = c.get("connection")?.fetch?.register;
		if (typeof reg !== "function") return;
		c.effect(() => reg(routes.map((r) => ({
			...r,
			fetch: r.fetch
		})), "dsh-zvec-memory-search routes"));
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
function apply(ctx, config) {
	const cfg = () => resolve$1(config);
	const defineTool = loadDefineTool();
	if (defineTool !== null) {
		const tool = createTool(defineTool, cfg);
		ctx.effect(() => ctx.tools.register(tool), "dsh-zvec-memory-search: tool");
	} else ctx.logger?.warn?.("dsh-zvec-memory-search: 内核 defineTool 不可用，跳过工具注册");
	const injector = new Injector(async () => {
		const c = cfg();
		const msgs = [];
		if (c.memoryRoot) try {
			const zg = await detectZg(c.zgPath);
			if (zg && await indexReady(zg, c.memoryRoot)) msgs.push({
				kind: "dsh-zvec-memory-search",
				text: guideText(c.memoryRoot, c.embeddingModel)
			});
		} catch {}
		if (c.baselineFile) try {
			const { readFile } = await import("node:fs/promises");
			const content = await readFile(c.baselineFile, "utf8");
			msgs.push({
				kind: "dsh-zvec-memory-search/baseline",
				text: baselineText(c.baselineFile, content)
			});
		} catch {}
		return msgs;
	});
	ctx.on("agent/pre-step", async ({ agent, messages }, next) => {
		const decision = await next();
		return injector.onPreStep(agent, messages, decision);
	});
	registerRoutes(ctx, cfg);
	ctx.effect(() => () => stopJobs(), "dsh-zvec-memory-search: cleanup");
}
export { Config, apply, inject, name };
