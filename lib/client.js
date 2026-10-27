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
		// src/host/zg-status.ts
		/**
		* 索引是否已建（可检索）。updating/stale/failed/cancelled 都只是「最近一次更新」的状态，
		* 旧索引仍在、可查；只有 none / disabled / busy / unknown 视为不可用。客户端与 host 共用。
		*/
		function isBuilt(state) {
			return state === "ready" || state === "updating" || state === "stale" || state === "failed" || state === "cancelled";
		}
		// src/client/dict.ts
		/** 配置卡中英文字典；locale/zh.json、locale/en.json 与此同源（单测校验键一致）。 */
		const DICT_ZH = {
			"card.title": "zvec 记忆检索",
			"card.loading": "加载中…",
			"card.readOnly": "当前环境为只读，设置不可修改",
			"group.status": "状态",
			"group.actions": "操作",
			"group.memory": "记忆库",
			"group.search": "检索",
			"group.test": "检索测试",
			"status.zg": "zg",
			"status.zgMissing": "未检测到 zg",
			"status.zgPathInvalid": "设置的 zg 路径不可执行，已改用自动探测：{path}",
			"status.index": "索引",
			"status.entities": "实体",
			"status.model": "模型",
			"status.dims": "{n} 维",
			"status.device": "设备",
			"status.size": "索引体积",
			"status.ignore": "排除规则",
			"status.ignoreCount": "{n} 条",
			"status.ignoreNone": "无 .zgignore",
			"status.server": "server",
			"status.serverRunning": "运行中",
			"status.serverStopped": "已停止",
			"status.lastRun": "上次建索引",
			"status.lastRunNone": "暂无记录",
			"state.ready": "就绪 · {indexed} / {total} 文件",
			"state.stale": "需更新 · {indexed} / {total} 文件（{changes}）",
			"state.auto": "自动更新 · {indexed} / {total} 文件",
			"state.autoPending": "自动更新 · {indexed} / {total} 文件 · 处理中",
			"state.none": "未建",
			"state.updating": "更新中 · {indexed} / {total} 文件（旧索引仍可检索）",
			"state.failed": "最近一次更新失败 · {indexed} / {total} 文件（旧索引仍可检索）",
			"state.cancelled": "最近一次更新已取消 · {indexed} / {total} 文件",
			"state.disabled": "索引已停用",
			"state.busy": "忙 · 另一个 zg 任务正在写（pid {pid}）",
			"state.unknown": "状态未知",
			"state.noRoot": "未设置记忆库根目录",
			"state.rootMissing": "记忆库根目录不存在",
			"state.updated": "上次更新 {time}",
			"changes.added": "{n} 新增",
			"changes.modified": "{n} 修改",
			"changes.deleted": "{n} 删除",
			"run.build": "全量",
			"run.update": "增量更新",
			"run.ok": "{kind} · {time} 完成 · 耗时 {dur} · {scanned} 扫描 / {changed} / {failed} 失败",
			"run.changedBuild": "{n} 新增",
			"run.changedUpdate": "{n} 修改",
			"run.fail": "{kind}失败 · {time} · {error}",
			"act.install": "安装 zg",
			"act.installConfirm": "将执行：npm install -g @zvec/zvec-grep\n\n确认？",
			"act.build": "建立索引",
			"act.buildHint": "首次会下载模型（约 600MB）",
			"act.update": "增量更新",
			"act.rebuild": "重建",
			"act.rebuildConfirm": "将重新向量化约 {files} 个文件；上次全量耗时 {dur}（{time}）。继续？",
			"act.rebuildConfirmNoHistory": "将重新向量化约 {files} 个文件，耗时可能较长。继续？",
			"act.serverOn": "启动 server",
			"act.serverOff": "停止 server",
			"act.serverHint": "server 运行时监听记忆库变化并自动增量更新",
			"act.editIgnore": "编辑排除规则",
			"act.save": "保存",
			"act.cancel": "取消",
			"act.savedIgnore": "已保存 {n} 条；需增量更新才生效",
			"act.clearIgnoreConfirm": "排除规则为空，将索引全部文件。继续？",
			"act.busyIgnore": "有任务运行中，暂不能保存",
			"act.running": "{kind}运行中 · {done} / {total}",
			"act.runningNoProgress": "{kind}运行中…",
			"act.failed": "请求失败：{msg}",
			"kind.install": "安装 zg",
			"kind.build": "建立索引",
			"kind.update": "增量更新",
			"kind.rebuild": "重建",
			"mem.root": "记忆库根目录",
			"mem.rootDesc": "绝对路径；检索与建索引都以此为根",
			"mem.rootMissing": "目录不存在",
			"mem.checking": "检查中…",
			"mem.baseline": "补充提示词文件",
			"mem.baselineDesc": "超过 64KB 只注入前 64KB；留空不注入",
			"mem.baselineSize": "当前 {size}",
			"mem.baselineCut": "{size} · 截掉 {n} 字节",
			"mem.baselineMissing": "文件不存在，不注入",
			"mem.injectGuide": "注入检索引导",
			"mem.injectGuideDesc": "关闭后不注入引导，工具仍可用",
			"mem.injectBaseline": "注入补充提示词文件",
			"mem.injectBaselineDesc": "关闭后不注入上面的文件",
			"search.mode": "检索方式",
			"search.modeDesc": "工具默认使用的检索方式",
			"mode.fts+vector": "fts+vector 混合（默认）",
			"mode.fts": "fts 纯关键词",
			"mode.vector": "vector 纯语义",
			"seg.fts+vector": "混合",
			"seg.fts": "关键词",
			"seg.vector": "语义",
			"search.limit": "默认条数",
			"search.limitDesc": "检索默认返回条数（1–50）",
			"search.preview": "摘要详略",
			"search.previewDesc": "工具返回的段落摘要长度",
			"preview.none": "无",
			"preview.short": "简短",
			"preview.full": "完整",
			"test.placeholder": "输入一个回忆类问题，回车检索",
			"test.run": "检索",
			"test.limit": "条数",
			"test.head": "{n} 条 · {sec}s · {mode}",
			"test.untitled": "无标题",
			"test.copied": "已复制",
			"test.copyHint": "点击复制 path:行号",
			"test.notBuilt": "先建立索引",
			"test.staleHint": "索引不是最新的，结果可能缺 {n} 个文件",
			"test.empty": "换个说法或切到语义",
			"test.running": "检索中…"
		};
		const DICT_EN = {
			"card.title": "Zvec Memory Search",
			"card.loading": "Loading…",
			"card.readOnly": "Read-only environment; settings cannot be changed",
			"group.status": "Status",
			"group.actions": "Actions",
			"group.memory": "Memory",
			"group.search": "Search",
			"group.test": "Search test",
			"status.zg": "zg",
			"status.zgMissing": "zg not found",
			"status.zgPathInvalid": "Configured zg path is not executable; using auto-detected: {path}",
			"status.index": "Index",
			"status.entities": "Entities",
			"status.model": "Model",
			"status.dims": "{n} dims",
			"status.device": "Device",
			"status.size": "Index size",
			"status.ignore": "Ignore rules",
			"status.ignoreCount": "{n} rules",
			"status.ignoreNone": "No .zgignore",
			"status.server": "Server",
			"status.serverRunning": "running",
			"status.serverStopped": "stopped",
			"status.lastRun": "Last index run",
			"status.lastRunNone": "No record yet",
			"state.ready": "Ready · {indexed} / {total} files",
			"state.stale": "Needs update · {indexed} / {total} files ({changes})",
			"state.auto": "Auto-updating · {indexed} / {total} files",
			"state.autoPending": "Auto-updating · {indexed} / {total} files · processing",
			"state.none": "Not built",
			"state.updating": "Updating · {indexed} / {total} files (previous index still searchable)",
			"state.failed": "Last update failed · {indexed} / {total} files (previous index still searchable)",
			"state.cancelled": "Last update cancelled · {indexed} / {total} files",
			"state.disabled": "Indexing disabled",
			"state.busy": "Busy · another zg task is writing (pid {pid})",
			"state.unknown": "Unknown status",
			"state.noRoot": "Memory root not set",
			"state.rootMissing": "Memory root does not exist",
			"state.updated": "updated {time}",
			"changes.added": "{n} added",
			"changes.modified": "{n} modified",
			"changes.deleted": "{n} deleted",
			"run.build": "full build",
			"run.update": "incremental",
			"run.ok": "{kind} · finished {time} · {dur} · {scanned} scanned / {changed} / {failed} failed",
			"run.changedBuild": "{n} added",
			"run.changedUpdate": "{n} modified",
			"run.fail": "{kind} failed · {time} · {error}",
			"act.install": "Install zg",
			"act.installConfirm": "Will run: npm install -g @zvec/zvec-grep\n\nContinue?",
			"act.build": "Build index",
			"act.buildHint": "First build downloads the model (~600MB)",
			"act.update": "Update",
			"act.rebuild": "Rebuild",
			"act.rebuildConfirm": "Re-embed about {files} files; last full build took {dur} ({time}). Continue?",
			"act.rebuildConfirmNoHistory": "Re-embed about {files} files; this may take a long time. Continue?",
			"act.serverOn": "Start server",
			"act.serverOff": "Stop server",
			"act.serverHint": "While running, the server watches the memory root and updates the index automatically",
			"act.editIgnore": "Edit ignore rules",
			"act.save": "Save",
			"act.cancel": "Cancel",
			"act.savedIgnore": "Saved {n} rules; run Update to apply",
			"act.clearIgnoreConfirm": "Ignore rules are empty; all files will be indexed. Continue?",
			"act.busyIgnore": "A task is running; cannot save now",
			"act.running": "{kind} running · {done} / {total}",
			"act.runningNoProgress": "{kind} running…",
			"act.failed": "Request failed: {msg}",
			"kind.install": "Install zg",
			"kind.build": "Build index",
			"kind.update": "Update",
			"kind.rebuild": "Rebuild",
			"mem.root": "Memory root",
			"mem.rootDesc": "Absolute path; search and indexing use it as the root",
			"mem.rootMissing": "Directory does not exist",
			"mem.checking": "Checking…",
			"mem.baseline": "Baseline prompt file",
			"mem.baselineDesc": "Only the first 64KB is injected; leave empty to skip",
			"mem.baselineSize": "Current {size}",
			"mem.baselineCut": "{size} · {n} bytes cut",
			"mem.baselineMissing": "File not found; not injected",
			"mem.injectGuide": "Inject search guide",
			"mem.injectGuideDesc": "When off, the guide is not injected; the tool stays available",
			"mem.injectBaseline": "Inject baseline file",
			"mem.injectBaselineDesc": "When off, the file above is not injected",
			"search.mode": "Search mode",
			"search.modeDesc": "Default mode used by the tool",
			"mode.fts+vector": "fts+vector hybrid (default)",
			"mode.fts": "fts keyword only",
			"mode.vector": "vector semantic only",
			"seg.fts+vector": "Hybrid",
			"seg.fts": "Keyword",
			"seg.vector": "Semantic",
			"search.limit": "Default limit",
			"search.limitDesc": "Results returned by default (1–50)",
			"search.preview": "Preview",
			"search.previewDesc": "Snippet length returned by the tool",
			"preview.none": "none",
			"preview.short": "short",
			"preview.full": "full",
			"test.placeholder": "Ask a recall question, press Enter",
			"test.run": "Search",
			"test.limit": "Limit",
			"test.head": "{n} results · {sec}s · {mode}",
			"test.untitled": "Untitled",
			"test.copied": "Copied",
			"test.copyHint": "Click to copy path:lines",
			"test.notBuilt": "Build the index first",
			"test.staleHint": "Index is not up to date; results may miss {n} files",
			"test.empty": "Try rephrasing or switch to Semantic",
			"test.running": "Searching…"
		};
		/** `{name}` 占位替换；缺失参数保留原占位，便于发现漏传。 */
		function fmt(s, vars = {}) {
			return s.replace(/\{(\w+)\}/g, (m, k) => k in vars ? String(vars[k]) : m);
		}
		// src/client/styles.ts
		/**
		* 配置卡样式：注入一次 <style data-plugin-css>，颜色走内核 --dsw-alias-* 变量跟随明暗主题。
		* 类名前缀 dsh-zvms-，避免与 adapter 的 dsh-cmb-* 互相覆盖。
		*/
		const NS$1 = "dsh-zvec-memory-search";
		const CSS_TAG_ID = `${NS$1}/settings.css`;
		const L1 = "var(--dsw-alias-label-primary, inherit)";
		const L2 = "var(--dsw-alias-label-secondary, var(--dsw-alias-label-tertiary, #999))";
		const L3 = "var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary, #999))";
		const LINE = "rgba(127, 127, 127, 0.22)";
		const CSS = `
.dsh-zvms-prefs { display: flex; flex-direction: column; gap: 20px; }
.dsh-zvms-section { display: flex; flex-direction: column; gap: 10px; }
.dsh-zvms-group { font-size: 14px; font-weight: 600; letter-spacing: .02em; color: ${L1}; }
.dsh-zvms-note { margin: 0; font-size: 12px; line-height: 1.5; color: ${L3}; }
.dsh-zvms-warn { color: #c98a00; }
.dsh-zvms-error { color: #d14343; }
.dsh-zvms-ok { color: #2f9e62; }
.dsh-zvms-kv { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; min-width: 0; }
.dsh-zvms-kvkey { font-size: 13px; font-weight: 500; line-height: 1.4; color: ${L2}; flex: none; }
.dsh-zvms-kvval { font-size: 13px; line-height: 1.4; color: ${L2}; text-align: right; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-zvms-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.dsh-zvms-rows { display: flex; flex-direction: column; gap: 12px; }
.dsh-zvms-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.dsh-zvms-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dsh-zvms-label { font-size: 13px; font-weight: 500; line-height: 1.4; color: ${L1}; }
.dsh-zvms-desc { font-size: 12px; line-height: 1.5; color: ${L3}; }
.dsh-zvms-input, .dsh-zvms-select, .dsh-zvms-value-input {
  font-size: 13px; color: ${L1}; background: transparent;
  border: 1px solid ${LINE}; border-radius: 6px; padding: 4px 8px;
}
.dsh-zvms-input { flex: 1; min-width: 0; max-width: 340px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.dsh-zvms-input:focus, .dsh-zvms-select:focus, .dsh-zvms-textarea:focus { outline: none; border-color: ${L2}; }
.dsh-zvms-value-input { width: 56px; text-align: right; font-variant-numeric: tabular-nums; }
.dsh-zvms-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.dsh-zvms-btn {
  font-size: 12px; line-height: 1.4; padding: 4px 12px; cursor: pointer;
  color: ${L1}; background: transparent; border: 1px solid ${LINE}; border-radius: 6px;
}
.dsh-zvms-btn:hover:not(:disabled) { border-color: ${L2}; }
.dsh-zvms-btn:disabled { opacity: 0.45; cursor: default; }
.dsh-zvms-btn-primary { background: ${L1}; color: var(--dsw-alias-background-primary, #fff); border-color: transparent; }
.dsh-zvms-textarea {
  width: 100%; box-sizing: border-box; min-height: 160px; resize: vertical; padding: 8px;
  font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; color: ${L1};
  background: transparent; border: 1px solid ${LINE}; border-radius: 6px;
}
.dsh-zvms-log {
  margin: 0; padding: 8px; max-height: 160px; overflow: auto; white-space: pre-wrap; word-break: break-all;
  font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; color: ${L2};
  border: 1px solid ${LINE}; border-radius: 6px;
}
.dsh-zvms-progress { height: 4px; border-radius: 2px; background: ${LINE}; overflow: hidden; }
.dsh-zvms-progress > div { height: 100%; background: ${L2}; transition: width .3s; }
.dsh-zvms-seg { display: inline-flex; border: 1px solid ${LINE}; border-radius: 6px; overflow: hidden; }
.dsh-zvms-seg > button { font-size: 12px; padding: 4px 10px; border: none; background: transparent; color: ${L2}; cursor: pointer; }
.dsh-zvms-seg > button + button { border-left: 1px solid ${LINE}; }
.dsh-zvms-seg > button[aria-pressed="true"] { background: ${LINE}; color: ${L1}; font-weight: 600; }
.dsh-zvms-search { display: flex; gap: 8px; align-items: center; }
.dsh-zvms-search .dsh-zvms-input { max-width: none; font-family: inherit; }
.dsh-zvms-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.dsh-zvms-results { display: flex; flex-direction: column; gap: 8px; }
.dsh-zvms-result { display: flex; flex-direction: column; gap: 3px; padding: 8px 10px; border: 1px solid ${LINE}; border-radius: 8px; }
.dsh-zvms-result-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.dsh-zvms-result-title { font-size: 13px; font-weight: 600; color: ${L1}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-zvms-result-path {
  font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: ${L2};
  cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: none; border: none; padding: 0; text-align: left;
}
.dsh-zvms-result-path:hover { color: ${L1}; text-decoration: underline; }
.dsh-zvms-result-meta { font-size: 11px; color: ${L3}; font-variant-numeric: tabular-nums; }
.dsh-zvms-badge { flex: none; font-size: 11px; padding: 1px 6px; border-radius: 4px; background: ${L2}; color: var(--dsw-alias-background-primary, #fff); }
.dsh-zvms-badge-outline { background: transparent; color: ${L2}; border: 1px solid ${L2}; }
`;
		function injectStyles() {
			if (typeof document === "undefined") return;
			if (document.querySelector(`style[data-plugin-css="${CSS_TAG_ID}"]`) !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = NS$1;
			tag.dataset.pluginCss = CSS_TAG_ID;
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}
		// src/client/view.ts
		/** 配置卡纯展示逻辑（无 React），便于单测。t 为字典取词函数。 */
		function formatBytes(n) {
			if (n === null || n === void 0) return "—";
			if (n < 1024) return `${n}B`;
			if (n < 1048576) return `${(n / 1024).toFixed(1)}KB`;
			if (n < 1073741824) return `${(n / 1048576).toFixed(1)}M`;
			return `${(n / 1073741824).toFixed(2)}G`;
		}
		/** 毫秒 → `30m 36s` / `38s` / `1h 2m`，与 zg duration 行同风格。 */
		function formatDuration(ms) {
			if (ms === null || ms === void 0 || !Number.isFinite(ms)) return "—";
			const s = Math.round(ms / 1e3);
			if (s < 60) return `${s}s`;
			const m = Math.floor(s / 60);
			if (m < 60) return `${m}m ${s % 60}s`;
			return `${Math.floor(m / 60)}h ${m % 60}m`;
		}
		/** 本地时间 `YYYY-MM-DD HH:mm`。 */
		function formatTime(ms) {
			if (!ms) return "—";
			const d = new Date(ms);
			const p = (x) => String(x).padStart(2, "0");
			return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
		}
		const num = (n) => n === null || n === void 0 ? "—" : n.toLocaleString("en-US");
		function changesText(t, c) {
			if (!c) return "";
			const parts = [];
			if (c.added) parts.push(fmt(t("changes.added"), { n: c.added }));
			if (c.modified) parts.push(fmt(t("changes.modified"), { n: c.modified }));
			if (c.deleted) parts.push(fmt(t("changes.deleted"), { n: c.deleted }));
			return parts.join(" · ");
		}
		/**
		* 索引状态行。server 运行时显示「自动更新」（spec C2 方案 B：启动 server 时已挂监听，
		* 工具检索走 server 模式续期）；仍有 Changes 时追加「处理中」。
		*/
		function indexLine(t, d) {
			if (!d.memoryRoot) return {
				text: t("state.noRoot"),
				tone: "muted"
			};
			if (!d.rootExists) return {
				text: t("state.rootMissing"),
				tone: "error"
			};
			const s = d.status;
			if (!d.zg || !s) return {
				text: "—",
				tone: "muted"
			};
			const counts = {
				indexed: num(s.indexed),
				total: num(s.total)
			};
			const updated = d.updatedTime ? ` · ${fmt(t("state.updated"), { time: formatTime(d.updatedTime) })}` : "";
			const hasChanges = Boolean(s.changes && (s.changes.added || s.changes.modified || s.changes.deleted));
			switch (s.state) {
				case "busy": return {
					text: fmt(t("state.busy"), { pid: s.ownerPid ?? "?" }),
					tone: "warn"
				};
				case "none": return {
					text: t("state.none"),
					tone: "warn"
				};
				case "disabled": return {
					text: t("state.disabled"),
					tone: "warn"
				};
				case "updating": return {
					text: fmt(t("state.updating"), counts) + updated,
					tone: "ok"
				};
				case "ready":
				case "stale":
				case "failed":
				case "cancelled":
					if (d.server === "running" && s.state !== "failed") return {
						text: fmt(t(hasChanges || s.state !== "ready" ? "state.autoPending" : "state.auto"), counts) + updated,
						tone: "ok"
					};
					if (s.state === "ready") return {
						text: fmt(t("state.ready"), counts) + updated,
						tone: "ok"
					};
					if (s.state === "failed") return {
						text: fmt(t("state.failed"), counts) + updated,
						tone: "error"
					};
					if (s.state === "cancelled") return {
						text: fmt(t("state.cancelled"), counts) + updated,
						tone: "warn"
					};
					return {
						text: fmt(t("state.stale"), {
							...counts,
							changes: changesText(t, s.changes)
						}) + updated,
						tone: "warn"
					};
				default: return {
					text: t("state.unknown"),
					tone: "muted"
				};
			}
		}
		/** 上次建索引：取 build / update 中较新的一条。 */
		function lastRunLine(t, history) {
			const runs = [history?.build, history?.update].filter(Boolean);
			if (runs.length === 0) return {
				text: t("status.lastRunNone"),
				tone: "muted"
			};
			const r = runs.sort((a, b) => b.finishedAt - a.finishedAt)[0];
			const kind = t(r.kind === "build" ? "run.build" : "run.update");
			if (!r.ok) return {
				text: fmt(t("run.fail"), {
					kind,
					time: formatTime(r.finishedAt),
					error: r.error ?? "—"
				}),
				tone: "error"
			};
			const changed = r.kind === "build" ? fmt(t("run.changedBuild"), { n: num(r.added) }) : fmt(t("run.changedUpdate"), { n: num(r.modified) });
			return {
				text: fmt(t("run.ok"), {
					kind,
					time: formatTime(r.finishedAt),
					dur: formatDuration(r.durationMs),
					scanned: num(r.scanned),
					changed,
					failed: num(r.failed)
				}),
				tone: "muted"
			};
		}
		/** 重建确认文案：读 build 记录（spec C4 方案 A）；无记录时不带耗时。 */
		function rebuildConfirm(t, d) {
			const files = num(d.status?.total);
			const b = d.history?.build;
			if (!b || !b.ok) return fmt(t("act.rebuildConfirmNoHistory"), { files });
			return fmt(t("act.rebuildConfirm"), {
				files,
				dur: formatDuration(b.durationMs),
				time: formatTime(b.startedAt)
			});
		}
		/** 中间目录折叠为 `…`：保留首段与末两段。 */
		function foldPath(p) {
			const parts = p.split("/");
			if (parts.length <= 3) return p;
			return [
				parts[0],
				"…",
				...parts.slice(-2)
			].join("/");
		}
		function clampLimit(raw, current) {
			const n = Number(raw);
			if (raw.trim() === "" || !Number.isFinite(n)) return current;
			return Math.min(50, Math.max(1, Math.round(n)));
		}
		// src/client/search-panel.ts
		/** 检索测试框（spec C6）：方式与条数仅作用于本次测试，不写回设置；复用 host /search（同工具执行链）。 */
		const API$1 = "/api/dsh-zvec-memory-search";
		const h$1 = react.createElement;
		const MODES = [
			"fts+vector",
			"fts",
			"vector"
		];
		/** 单条结果：标题 / 折叠路径（点击复制 path:行号）/ 排名与分数；右上角按命中方式出标签。 */
		function ResultItem(props) {
			const { t, r, index } = props;
			const [copied, setCopied] = react.useState(false);
			const loc = `${r.path}:${r.start_line}-${r.end_line}`;
			const copy = async () => {
				try {
					await navigator.clipboard.writeText(loc);
					setCopied(true);
					setTimeout(() => setCopied(false), 1200);
				} catch {}
			};
			const has = (v) => v !== null && v !== void 0;
			const meta = [
				has(r.ranks?.fts) ? `fts #${r.ranks.fts}` : null,
				has(r.ranks?.vector) ? `vector #${r.ranks.vector}` : null,
				has(r.score) ? `score ${Number(r.score).toFixed(4)}` : null
			].filter(Boolean).join(" · ");
			return h$1("div", { className: "dsh-zvms-result" }, h$1("div", { className: "dsh-zvms-result-head" }, h$1("span", { className: "dsh-zvms-result-title" }, `${index + 1}. ${r.heading || t("test.untitled")}`), h$1("span", { className: r.matched_by === "fts+vector" ? "dsh-zvms-badge" : "dsh-zvms-badge dsh-zvms-badge-outline" }, r.matched_by)), h$1("button", {
				className: "dsh-zvms-result-path",
				title: `${loc}\n${t("test.copyHint")}`,
				onClick: () => void copy()
			}, copied ? t("test.copied") : `${foldPath(r.path)}  :${r.start_line}-${r.end_line}`), meta ? h$1("span", { className: "dsh-zvms-result-meta" }, meta) : null);
		}
		function SearchPanel(props) {
			const { t, d } = props;
			const [query, setQuery] = react.useState("");
			const [mode, setMode] = react.useState(props.defaultMode);
			const [limit, setLimit] = react.useState(5);
			const [running, setRunning] = react.useState(false);
			const [res, setRes] = react.useState(null);
			react.useEffect(() => setMode(props.defaultMode), [props.defaultMode]);
			const st = d.status?.state;
			const built = isBuilt(st);
			const usable = Boolean(d.zg && d.memoryRoot && d.rootExists && built);
			const run = async () => {
				const q = query.trim();
				if (!q || !usable || running) return;
				setRunning(true);
				try {
					const r = await fetch(`${API$1}/search`, {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							query: q,
							mode,
							limit
						})
					});
					const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
					setRes({
						...j,
						mode
					});
				} catch (e) {
					setRes({
						error: String(e?.message ?? e),
						mode
					});
				} finally {
					setRunning(false);
				}
			};
			const missing = st === "stale" && typeof d.status?.total === "number" && typeof d.status?.indexed === "number" ? d.status.total - d.status.indexed : 0;
			let body = null;
			if (running) body = h$1("p", { className: "dsh-zvms-note" }, t("test.running"));
			else if (res?.error) body = h$1("p", { className: "dsh-zvms-note dsh-zvms-error" }, res.error);
			else if (res && res.status !== "ready") body = h$1("p", { className: "dsh-zvms-note dsh-zvms-error" }, res.message ?? res.status);
			else if (res) {
				const n = res.results?.length ?? 0;
				body = h$1("div", { className: "dsh-zvms-results" }, h$1("p", { className: "dsh-zvms-note" }, fmt(t("test.head"), {
					n,
					sec: ((res.elapsedMs ?? 0) / 1e3).toFixed(2),
					mode: res.mode
				})), missing > 0 ? h$1("p", { className: "dsh-zvms-note dsh-zvms-warn" }, fmt(t("test.staleHint"), { n: missing })) : null, n === 0 ? h$1("p", { className: "dsh-zvms-note" }, t("test.empty")) : null, (res.results ?? []).map((r, i) => h$1(ResultItem, {
					key: `${r.path}:${r.start_line}`,
					t,
					r,
					index: i
				})));
			}
			return h$1("div", { className: "dsh-zvms-section" }, h$1("div", { className: "dsh-zvms-group" }, t("group.test")), h$1("div", { className: "dsh-zvms-search" }, h$1("input", {
				className: "dsh-zvms-input",
				value: query,
				disabled: !usable,
				placeholder: usable ? t("test.placeholder") : t("test.notBuilt"),
				onChange: (e) => setQuery(e.target.value),
				onKeyDown: (e) => {
					if (e.key === "Enter" && !e.nativeEvent?.isComposing) run();
				}
			}), h$1("button", {
				className: "dsh-zvms-btn dsh-zvms-btn-primary",
				disabled: !usable || running || !query.trim(),
				onClick: () => void run()
			}, t("test.run"))), h$1("div", { className: "dsh-zvms-controls" }, h$1("div", {
				className: "dsh-zvms-seg",
				role: "group"
			}, MODES.map((m) => h$1("button", {
				key: m,
				type: "button",
				"aria-pressed": mode === m ? "true" : "false",
				onClick: () => setMode(m)
			}, t(`seg.${m}`)))), h$1("span", { className: "dsh-zvms-desc" }, t("test.limit")), h$1("input", {
				className: "dsh-zvms-value-input",
				type: "number",
				min: 1,
				max: 50,
				defaultValue: limit,
				onBlur: (e) => {
					const n = clampLimit(e.target.value, limit);
					e.target.value = String(n);
					setLimit(n);
				},
				onKeyDown: (e) => {
					if (e.key === "Enter") e.target.blur();
				}
			})), body);
		}
		// src/client/index.ts
		/**
		* dsh-zvec-memory-search — client half（0.2.0，插件管理页 bundle 行下配置卡）
		*
		* 四组常驻：状态（只读）/ 操作 / 记忆库 / 检索；冷启动阶段只影响状态值与可用按钮，不隐藏分组。
		* 状态流：createSettings 本地 store ← attach(configForms bound scope)；组件经 seat 的
		* useZvecSettings hook 读状态、props.set 写回。样式见 styles.ts，开关用内核 primitives 的 Switch。
		*/
		const NS = "dsh-zvec-memory-search";
		const API = "/api/dsh-zvec-memory-search";
		const h = react.createElement;
		const INITIAL = {
			status: "loading",
			writable: false,
			memoryRoot: "",
			baselineFile: "",
			semanticLimit: 8,
			preview: "short",
			queryMode: "fts+vector",
			injectGuide: true,
			injectBaseline: true,
			zgPath: "",
			embeddingModel: "local/qwen3-embedding-0.6b",
			device: "auto"
		};
		function createSettings() {
			let state = INITIAL;
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
						queryMode: unwrap(raw.queryMode) ?? "fts+vector",
						injectGuide: unwrap(raw.injectGuide) !== false,
						injectBaseline: unwrap(raw.injectBaseline) !== false,
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
		async function post(path, body) {
			const r = await fetch(`${API}${path}`, {
				method: "POST",
				...body === void 0 ? {} : {
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body)
				}
			});
			const j = await r.json().catch(() => ({}));
			if (!r.ok && !j?.error) j.error = `HTTP ${r.status}`;
			return j;
		}
		/** 轮询 /detect：任务运行中 2s，否则 10s；refresh() 立即重取。 */
		function useDetect() {
			const [data, setData] = react.useState(null);
			const [error, setError] = react.useState("");
			const kick = react.useRef(() => {});
			react.useEffect(() => {
				let alive = true;
				let timer;
				const tick = async () => {
					if (timer) clearTimeout(timer);
					let next = 1e4;
					try {
						const r = await fetch(`${API}/detect`, { method: "POST" });
						if (r.ok) {
							const j = await r.json();
							if (alive) {
								setData(j);
								setError("");
							}
							if (j?.job?.running) next = 2e3;
						} else if (alive) setError(`detect HTTP ${r.status}`);
					} catch (e) {
						if (alive) setError(`detect: ${e?.message ?? e}`);
					}
					if (alive) timer = setTimeout(tick, next);
				};
				kick.current = () => void tick();
				tick();
				return () => {
					alive = false;
					if (timer) clearTimeout(timer);
				};
			}, []);
			return {
				data,
				error,
				refresh: () => kick.current()
			};
		}
		const toneClass = (tone) => tone === "error" ? " dsh-zvms-error" : tone === "warn" ? " dsh-zvms-warn" : tone === "ok" ? " dsh-zvms-ok" : "";
		function Group(props) {
			return h("div", { className: "dsh-zvms-section" }, h("div", { className: "dsh-zvms-group" }, props.title), props.children);
		}
		function KV(props) {
			return h("div", { className: "dsh-zvms-kv" }, h("span", { className: "dsh-zvms-kvkey" }, props.k), h("span", {
				className: `dsh-zvms-kvval${props.mono ? " dsh-zvms-mono" : ""}${toneClass(props.tone ?? "muted")}`,
				title: props.title ?? (typeof props.v === "string" ? props.v : void 0)
			}, props.v));
		}
		function Row(props) {
			return h("div", { className: "dsh-zvms-row" }, h("div", { className: "dsh-zvms-text" }, h("span", { className: "dsh-zvms-label" }, props.label), props.desc ? h("span", { className: "dsh-zvms-desc" }, props.desc) : null), props.children);
		}
		/** 文本设置：失焦或回车提交，去首尾空白；外部值变化时同步显示。 */
		function TextInput(props) {
			const [v, setV] = react.useState(props.value);
			react.useEffect(() => setV(props.value), [props.value]);
			const commit = () => {
				const x = v.trim();
				if (x !== props.value) props.onCommit(x);
			};
			return h("input", {
				className: "dsh-zvms-input",
				value: v,
				placeholder: props.placeholder,
				disabled: props.disabled,
				onChange: (e) => setV(e.target.value),
				onBlur: commit,
				onKeyDown: (e) => {
					if (e.key === "Enter") e.target.blur();
				}
			});
		}
		function Toggle(props) {
			if (props.Switch) return h(props.Switch, {
				checked: props.checked,
				disabled: props.disabled,
				label: props.label,
				onChange: props.onChange
			});
			return h("input", {
				type: "checkbox",
				checked: props.checked,
				disabled: props.disabled,
				"aria-label": props.label,
				onChange: (e) => props.onChange(e.target.checked)
			});
		}
		function StatusGroup(props) {
			const { t, d, state } = props;
			const s = d.status;
			const idx = indexLine(t, d);
			const run = lastRunLine(t, d.history);
			const zgText = d.zg ? `${d.zg}${d.zgVersion ? ` · ${d.zgVersion}` : ""}` : t("status.zgMissing");
			const ignoreText = d.ignoreFile && d.ignoreLines ? fmt(t("status.ignoreCount"), { n: d.ignoreLines }) : t("status.ignoreNone");
			return h(Group, { title: t("group.status") }, h(KV, {
				k: t("status.zg"),
				v: zgText,
				mono: true,
				tone: d.zg ? "muted" : "error"
			}), d.zgPathValid === false ? h("p", { className: "dsh-zvms-note dsh-zvms-warn" }, fmt(t("status.zgPathInvalid"), { path: d.zg ?? "—" })) : null, h(KV, {
				k: t("status.index"),
				v: idx.text,
				tone: idx.tone
			}), h(KV, {
				k: t("status.entities"),
				v: s?.entities !== null && s?.entities !== void 0 ? s.entities.toLocaleString("en-US") : "—"
			}), h(KV, {
				k: t("status.model"),
				v: s?.model ? `${s.model}${s.dimensions ? ` · ${fmt(t("status.dims"), { n: s.dimensions.toLocaleString("en-US") })}` : ""}` : state.embeddingModel,
				mono: true
			}), h(KV, {
				k: t("status.device"),
				v: state.device,
				mono: true
			}), h(KV, {
				k: t("status.size"),
				v: formatBytes(d.indexBytes)
			}), h(KV, {
				k: t("status.ignore"),
				v: ignoreText
			}), h(KV, {
				k: t("status.server"),
				v: t(d.server === "running" ? "status.serverRunning" : "status.serverStopped"),
				tone: d.server === "running" ? "ok" : "muted"
			}), h(KV, {
				k: t("status.lastRun"),
				v: run.text,
				tone: run.tone
			}));
		}
		function IgnoreEditor(props) {
			const { t } = props;
			const [text, setText] = react.useState(null);
			const [err, setErr] = react.useState("");
			react.useEffect(() => {
				post("/zgignore", { op: "read" }).then((j) => j.error ? setErr(j.error) : setText(j.content ?? ""));
			}, []);
			const save = async () => {
				if (text === null) return;
				if (!text.trim() && !window.confirm(t("act.clearIgnoreConfirm"))) return;
				const j = await post("/zgignore", {
					op: "write",
					content: text
				});
				if (j.error === "busy") setErr(t("act.busyIgnore"));
				else if (j.error) setErr(fmt(t("act.failed"), { msg: j.error }));
				else props.onDone(fmt(t("act.savedIgnore"), { n: j.lines }));
			};
			return h("div", { className: "dsh-zvms-section" }, h("textarea", {
				className: "dsh-zvms-textarea",
				value: text ?? "",
				disabled: text === null,
				spellCheck: false,
				onChange: (e) => setText(e.target.value)
			}), err ? h("p", { className: "dsh-zvms-note dsh-zvms-error" }, err) : null, h("div", { className: "dsh-zvms-btns" }, h("button", {
				className: "dsh-zvms-btn dsh-zvms-btn-primary",
				disabled: text === null || props.busy,
				onClick: () => void save()
			}, t("act.save")), h("button", {
				className: "dsh-zvms-btn",
				onClick: props.onCancel
			}, t("act.cancel"))));
		}
		function ActionsGroup(props) {
			const { t, d, refresh } = props;
			const [editing, setEditing] = react.useState(false);
			const [msg, setMsg] = react.useState(null);
			const job = d.job?.running ? d.job : null;
			const state = d.status?.state;
			const built = isBuilt(state);
			const rootOk = Boolean(d.memoryRoot && d.rootExists);
			const off = props.disabled || Boolean(job);
			const act = async (path, confirmText) => {
				if (confirmText && !window.confirm(confirmText)) return;
				setMsg(null);
				const j = await post(path);
				if (j.error) setMsg({
					text: fmt(t("act.failed"), { msg: j.error }),
					tone: "error"
				});
				else if (j.ok === false) setMsg({
					text: fmt(t("act.failed"), { msg: String(j.output ?? "").split("\n")[0] }),
					tone: "error"
				});
				refresh();
			};
			const btn = (label, onClick, primary = false, disabled = off) => h("button", {
				className: `dsh-zvms-btn${primary ? " dsh-zvms-btn-primary" : ""}`,
				disabled,
				onClick
			}, label);
			const kind = job ? t(`kind.${job.kind}`) : "";
			return h(Group, { title: t("group.actions") }, h("div", { className: "dsh-zvms-btns" }, !d.zg ? btn(t("act.install"), () => void act("/install-zg", t("act.installConfirm")), true) : null, d.zg && rootOk && state === "none" ? btn(t("act.build"), () => void act("/build-index"), true) : null, d.zg && rootOk && built ? btn(t("act.update"), () => void act("/update-index"), state === "stale" && d.server !== "running") : null, d.zg && rootOk && built ? btn(t("act.rebuild"), () => void act("/rebuild-index", rebuildConfirm(t, d))) : null, d.zg ? btn(t(d.server === "running" ? "act.serverOff" : "act.serverOn"), () => void act(d.server === "running" ? "/server-off" : "/server-on"), false, props.disabled) : null, rootOk ? btn(t("act.editIgnore"), () => {
				setMsg(null);
				setEditing(true);
			}, false, props.disabled || editing) : null), d.zg && rootOk && state === "none" ? h("p", { className: "dsh-zvms-note" }, t("act.buildHint")) : null, d.zg ? h("p", { className: "dsh-zvms-note" }, t("act.serverHint")) : null, job ? h("div", { className: "dsh-zvms-section" }, h("p", { className: "dsh-zvms-note" }, job.total ? fmt(t("act.running"), {
				kind,
				done: job.done,
				total: job.total
			}) : fmt(t("act.runningNoProgress"), { kind })), job.total ? h("div", { className: "dsh-zvms-progress" }, h("div", { style: { width: `${Math.round(job.done / job.total * 100)}%` } })) : null, h("pre", { className: "dsh-zvms-log" }, (job.tail ?? []).slice(-10).join("\n"))) : null, editing ? h(IgnoreEditor, {
				t,
				busy: Boolean(job),
				onDone: (text) => {
					setEditing(false);
					setMsg({
						text,
						tone: "ok"
					});
					refresh();
				},
				onCancel: () => setEditing(false)
			}) : null, msg ? h("p", { className: `dsh-zvms-note${toneClass(msg.tone)}` }, msg.text) : null);
		}
		function MemoryGroup(props) {
			const { t, d, state, disabled, set, Switch, refresh } = props;
			const rootChecked = (d.memoryRoot ?? "") === state.memoryRoot;
			const b = d.baselineFile ?? {};
			const baselineChecked = (b.path ?? "") === state.baselineFile;
			const commit = (field, v) => {
				set(field, v);
				setTimeout(refresh, 300);
			};
			let baselineDesc = t("mem.baselineDesc");
			if (state.baselineFile) {
				const extra = !baselineChecked ? h("span", null, t("mem.checking")) : !b.exists ? h("span", { className: "dsh-zvms-error" }, t("mem.baselineMissing")) : b.truncatedBytes > 0 ? h("span", { className: "dsh-zvms-warn" }, fmt(t("mem.baselineCut"), {
					size: formatBytes(b.bytes),
					n: b.truncatedBytes.toLocaleString("en-US")
				})) : h("span", null, fmt(t("mem.baselineSize"), { size: formatBytes(b.bytes) }));
				baselineDesc = h(react.Fragment, null, `${t("mem.baselineDesc")} · `, extra);
			}
			const rootDesc = !state.memoryRoot ? t("mem.rootDesc") : !rootChecked ? t("mem.checking") : !d.rootExists ? h("span", { className: "dsh-zvms-error" }, t("mem.rootMissing")) : t("mem.rootDesc");
			return h(Group, { title: t("group.memory") }, h("div", { className: "dsh-zvms-rows" }, h(Row, {
				label: t("mem.root"),
				desc: rootDesc
			}, h(TextInput, {
				value: state.memoryRoot,
				placeholder: "/path/to/memory",
				disabled,
				onCommit: (v) => commit("memoryRoot", v)
			})), h(Row, {
				label: t("mem.baseline"),
				desc: baselineDesc
			}, h(TextInput, {
				value: state.baselineFile,
				placeholder: "/path/to/style.md",
				disabled,
				onCommit: (v) => commit("baselineFile", v)
			})), h(Row, {
				label: t("mem.injectGuide"),
				desc: t("mem.injectGuideDesc")
			}, h(Toggle, {
				Switch,
				label: t("mem.injectGuide"),
				checked: state.injectGuide,
				disabled,
				onChange: (v) => set("injectGuide", v)
			})), h(Row, {
				label: t("mem.injectBaseline"),
				desc: t("mem.injectBaselineDesc")
			}, h(Toggle, {
				Switch,
				label: t("mem.injectBaseline"),
				checked: state.injectBaseline,
				disabled,
				onChange: (v) => set("injectBaseline", v)
			}))));
		}
		/** 默认条数：uncontrolled，失焦提交（clamp 1–50，非法回落当前值），Enter 同失焦。 */
		function LimitInput(props) {
			const ref = react.useRef(null);
			react.useEffect(() => {
				if (ref.current) ref.current.value = String(props.value);
			}, [props.value]);
			return h("input", {
				ref,
				className: "dsh-zvms-value-input",
				type: "number",
				min: 1,
				max: 50,
				defaultValue: props.value,
				disabled: props.disabled,
				onBlur: (e) => {
					const n = clampLimit(e.target.value, props.value);
					e.target.value = String(n);
					if (n !== props.value) props.onCommit(n);
				},
				onKeyDown: (e) => {
					if (e.key === "Enter") e.target.blur();
				}
			});
		}
		function SearchGroup(props) {
			const { t, state, disabled, set } = props;
			const select = (field, value, options, prefix) => h("select", {
				className: "dsh-zvms-select",
				value,
				disabled,
				onChange: (e) => set(field, e.target.value)
			}, options.map((o) => h("option", {
				key: o,
				value: o
			}, t(`${prefix}${o}`))));
			return h(Group, { title: t("group.search") }, h("div", { className: "dsh-zvms-rows" }, h(Row, {
				label: t("search.mode"),
				desc: t("search.modeDesc")
			}, select("queryMode", state.queryMode, [
				"fts+vector",
				"fts",
				"vector"
			], "mode.")), h(Row, {
				label: t("search.limit"),
				desc: t("search.limitDesc")
			}, h(LimitInput, {
				value: state.semanticLimit,
				disabled,
				onCommit: (n) => set("semanticLimit", n)
			})), h(Row, {
				label: t("search.preview"),
				desc: t("search.previewDesc")
			}, select("preview", state.preview, [
				"none",
				"short",
				"full"
			], "preview."))));
		}
		function CardBody(props) {
			const { t, Switch, state, set } = props;
			const { data, error, refresh } = useDetect();
			const disabled = state.status !== "ready" || !state.writable;
			if (!data) return h("p", { className: `dsh-zvms-note${error ? " dsh-zvms-error" : ""}` }, error || t("card.loading"));
			return h("div", { className: "dsh-zvms-prefs" }, !state.writable && state.status === "ready" ? h("p", {
				className: "dsh-zvms-note",
				role: "status"
			}, t("card.readOnly")) : null, error ? h("p", { className: "dsh-zvms-note dsh-zvms-error" }, error) : null, h(StatusGroup, {
				t,
				d: data,
				state
			}), h(ActionsGroup, {
				t,
				d: data,
				disabled,
				refresh
			}), h(MemoryGroup, {
				t,
				d: data,
				state,
				disabled,
				set,
				Switch,
				refresh
			}), h(SearchGroup, {
				t,
				state,
				disabled,
				set
			}), h(SearchPanel, {
				t,
				d: data,
				defaultMode: state.queryMode
			}));
		}
		function PluginConfigCard(props) {
			const state = typeof props.useZvecSettings === "function" ? props.useZvecSettings((s) => s) : void 0;
			if (state === void 0 || state.status === "unavailable") return null;
			return h(CardBody, {
				t: props.t,
				Switch: props.Switch,
				state,
				set: props.set
			});
		}
		const name = NS;
		const inject = ["slots", "locale"];
		function apply(ctx) {
			injectStyles();
			ctx.effect?.(() => ctx.locale?.register(NS, {
				zh: DICT_ZH,
				en: DICT_EN
			}), "zvms: dictionaries");
			const t = ctx.locale?.bind?.(NS) ?? ((key) => DICT_ZH[key] ?? key);
			let Switch;
			try {
				Switch = require("@deepseek-ai/dsh-client-ui-primitives")?.Switch;
			} catch {
				Switch = void 0;
			}
			const settings = createSettings();
			const face = () => ({
				hooks: { zvecSettings: settings.store },
				t,
				Switch,
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