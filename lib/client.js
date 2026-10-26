window.__ModuleLoader__.load({
	id: "dsh-zvec-memory-search",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		// \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		let react = require("react");
		react = __toESM(react, 1);
		// src/client/index.ts
		/**
		* dsh-zvec-memory-search — client half（0.2.0，插件管理页 bundle 行下配置卡）
		*/
		const NS = "dsh-zvec-memory-search";
		const h = react.createElement;
		const DICT_ZH = {
			"card.title": "zvec 记忆检索",
			"card.notInstalled": "未检测到 zg",
			"card.installBtn": "安装 zg",
			"card.installConfirm": "将执行：npm install -g @zvec/zvec-grep\n\n确认？",
			"card.memoryRoot": "记忆库根目录",
			"card.rootMissing": "目录不存在",
			"card.notBuilt": "未建索引",
			"card.buildBtn": "建立索引",
			"card.model": "模型",
			"card.device": "设备",
			"card.firstBuild": "首次会下载模型（约 600MB）",
			"card.ready": "就绪",
			"card.files": "文件",
			"card.entities": "实体",
			"card.server": "server",
			"card.ignore": "排除规则",
			"card.update": "增量更新",
			"card.rebuild": "重建",
			"card.serverOn": "启动 server",
			"card.serverOff": "停止 server",
			"card.ignoreAdd": "追加排除",
			"card.ignorePlaceholder": "输入 glob，如 AgentSessionMd/",
			"card.baselineFile": "补充提示词文件",
			"card.baselineHint": "超过 64KB 只注入前 64KB",
			"card.semanticLimit": "默认条数",
			"card.preview": "摘要详略",
			"card.zgPath": "zg 路径（留空自动探测）",
			"card.running": "运行中…"
		};
		const DICT_EN = { "card.title": "Zvec Memory Search" };
		function createSettings() {
			let state = {
				status: "loading",
				writable: false,
				memoryRoot: "",
				baselineFile: "",
				semanticLimit: 8,
				preview: "short",
				zgPath: "",
				embeddingModel: "local/qwen3-embedding-0.6b",
				device: "auto"
			};
			let scope = null;
			const listeners = /* @__PURE__ */ new Set();
			const unwrap = (v) => typeof v === "object" && v !== null && "get" in v ? v.get() : v;
			const sync = (bound) => {
				try {
					const snap = bound.getSnapshot();
					const raw = snap?.value ?? {};
					const next = {
						status: snap?.status === "ready" || snap?.status === "unavailable" ? snap.status : "loading",
						writable: Boolean(snap?.writable),
						memoryRoot: String(unwrap(raw.memoryRoot) ?? ""),
						baselineFile: String(unwrap(raw.baselineFile) ?? ""),
						semanticLimit: Number(unwrap(raw.semanticLimit)) || 8,
						preview: unwrap(raw.preview) ?? "short",
						zgPath: String(unwrap(raw.zgPath) ?? ""),
						embeddingModel: String(unwrap(raw.embeddingModel) ?? "local/qwen3-embedding-0.6b"),
						device: unwrap(raw.device) ?? "auto"
					};
					if (JSON.stringify(next) !== JSON.stringify(state)) {
						state = next;
						for (const l of listeners) l();
					}
				} catch {}
			};
			return {
				store: {
					subscribe(l) {
						listeners.add(l);
						return () => {
							listeners.delete(l);
						};
					},
					getSnapshot: () => state
				},
				attach(bound) {
					if (!bound) return () => {};
					scope = bound;
					sync(bound);
					try {
						return bound.subscribe(() => sync(bound));
					} catch {
						return () => {};
					}
				},
				set(field, value) {
					try {
						scope?.set?.(field, value);
					} catch {}
				}
			};
		}
		function useDetect() {
			const [data, setData] = react.useState(null);
			react.useEffect(() => {
				let alive = true, t;
				const tick = async () => {
					try {
						const r = await fetch("/api/dsh-zvec-memory-search/detect", {
							method: "POST",
							headers: { "content-type": "application/json" },
							body: "{}"
						});
						if (r.ok) {
							const j = await r.json();
							if (alive) setData(j);
						}
					} catch {}
					t = setTimeout(tick, 1e4);
				};
				tick();
				return () => {
					alive = false;
					if (t) clearTimeout(t);
				};
			}, []);
			return data;
		}
		function CardBody(props) {
			const { t, state, set, data } = props;
			if (!data) return h("p", { className: "dsh-cmb-note" }, "加载中…");
			const d = data;
			const stage = !d.zg ? 1 : !d.memoryRoot || !d.rootExists ? 2 : !d.indexReady ? 3 : 4;
			const post = (path) => fetch(`/api/dsh-zvec-memory-search${path}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: "{}"
			});
			return h("div", { style: {
				display: "flex",
				flexDirection: "column",
				gap: 12
			} }, h("div", { style: {
				fontSize: 14,
				fontWeight: 600
			} }, t("card.title")), stage === 1 && h("div", null, h("div", null, t("card.notInstalled")), h("button", { onClick: () => {
				if (window.confirm(t("card.installConfirm"))) post("/install-zg");
			} }, t("card.installBtn"))), stage === 2 && h("div", null, h("div", null, `${t("card.memoryRoot")}: ${state.memoryRoot || "未设置"}`), state.memoryRoot && !d.rootExists && h("div", { style: { color: "red" } }, t("card.rootMissing")), h("input", {
				placeholder: "/path/to/memory",
				defaultValue: state.memoryRoot,
				onBlur: (e) => set("memoryRoot", e.target.value.trim())
			})), stage === 3 && h("div", null, h("div", null, t("card.notBuilt")), h("button", { onClick: () => void post("/build-index") }, t("card.buildBtn"))), stage === 4 && h("div", null, h("div", null, `${t("card.files")}: ${d.zgStatus?.files ?? 0}  ${t("card.entities")}: ${d.zgStatus?.entities ?? 0}`), h("div", null, `${t("card.server")}: ${d.zgStatus?.server ?? "stopped"}`), h("button", { onClick: () => void post("/update-index") }, t("card.update")), h("button", { onClick: () => void post("/rebuild-index") }, t("card.rebuild")), h("button", { onClick: () => void post(d.zgStatus?.server === "running" ? "/server-off" : "/server-on") }, d.zgStatus?.server === "running" ? t("card.serverOff") : t("card.serverOn"))));
		}
		function PluginConfigCard(props) {
			const state = typeof props.useZvecSettings === "function" ? props.useZvecSettings((s) => s) : void 0;
			if (state === void 0 || state.status === "unavailable") return null;
			const t = props.t;
			const data = useDetect();
			return h(CardBody, {
				t,
				state,
				set: props.set,
				data
			});
		}
		const name = NS;
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect?.(() => ctx.locale?.register(NS, {
				zh: DICT_ZH,
				en: DICT_EN
			}), "zvms: dictionaries");
			const t = ctx.locale?.bind?.(NS) ?? ((key) => DICT_ZH[key] ?? key);
			const settings = createSettings();
			const face = () => ({
				hooks: { zvecSettings: settings.store },
				t,
				set: (field, value) => settings.set(field, value)
			});
			ctx.inject?.(["configForms"], (raw) => {
				const forms = raw.configForms;
				if (forms === void 0 || typeof forms.get !== "function" || typeof forms.whileServed !== "function") return;
				raw.effect?.(() => settings.attach(forms.get(NS)), "zvms: config forms");
				raw.effect?.(() => forms.whileServed([NS], () => raw.slots.inject("plugins.bundle.config", () => raw.slots.register({
					name: "plugins.bundle.config",
					key: NS,
					locale: NS,
					inject: face
				}, (p) => h(PluginConfigCard, p)))), "zvms: plugins-page card");
			});
		}
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map