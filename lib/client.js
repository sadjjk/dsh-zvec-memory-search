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
			"intro.title": "zvec-grep（zg）· 本地优先检索",
			"intro.desc": "内置即用。面向应用的嵌入式检索，面向开发者和 AI Agent 的本地工作区搜索。",
			"intro.more": "了解更多：",
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
			"act.buildHint": "首次会下载模型（约 {size}）",
			"act.serverAutoHint": "server 运行中，自动补索引；增量更新与重建需先停止 server",
			"act.update": "增量更新",
			"act.rebuild": "重建",
			"act.rebuildConfirm": "将重新向量化约 {files} 个文件；上次全量耗时 {dur}（{time}）。继续？",
			"act.rebuildConfirmNoHistory": "将重新向量化约 {files} 个文件，耗时可能较长。继续？",
			"act.serverOn": "启动 server",
			"act.serverOff": "停止 server",
			"act.starting": "启动中…",
			"act.stopping": "停止中…",
			"act.working": "处理中…",
			"model.title": "选择向量模型",
			"model.loading": "读取模型列表…",
			"model.fallback": "无法读取 zg 模型清单，大小未知",
			"model.downloaded": "已下载",
			"model.notDownloaded": "未下载",
			"model.downloading": "下载中 {percent}%",
			"restore.hint": "索引已存在，下载模型后即可继续使用，无需重建",
			"restore.download": "下载模型（约 {size}）",
			"restore.downloadNoSize": "下载模型",
			"restore.stopServerFirst": "server 运行中，停止 server 后再下载模型",
			"restore.pathMismatch": "索引建立于 {root}，与当前记忆库路径不一致，需重建",
			"restore.modelUnknown": "索引使用的模型 {model} 在当前 zg 中不可用，需重建",
			"restore.searchHint": "关键词检索可用；向量检索会先下载模型",
			"server.needIndex": "先建立索引再启动 server",
			"server.needModel": "先下载模型再启动 server",
			"server.indexInvalid": "索引不可用，重建后再启动 server",
			"model.download": "下载 {size}",
			"model.dims": "{n} 维",
			"model.confirmBuild": "建立索引",
			"model.confirmRebuild": "重建",
			"model.cancel": "取消",
			"model.mismatch": "设置为 {model}，需重建生效",
			"model.lang.multilingual": "多语言·含中文",
			"model.lang.code-multilingual": "代码·多语言",
			"model.lang.code": "代码",
			"model.lang.english": "英文",
			"model.lang.unknown": "语言未知",
			"act.serverHint": "server 运行时监听记忆库变化并自动增量更新",
			"act.editIgnore": "编辑排除规则",
			"act.save": "保存",
			"act.cancel": "取消",
			"act.savedIgnore": "已保存 {n} 条；需增量更新才生效",
			"act.clearIgnoreConfirm": "排除规则为空，将索引全部文件。继续？",
			"act.busyIgnore": "有任务运行中，暂不能保存",
			"act.running": "{kind} 运行中 · {done} / {total}",
			"act.runningNoProgress": "{kind} 运行中 · 已用 {elapsed}",
			"act.preparingModel": "准备模型 {model}…",
			"act.downloadingModel": "下载模型 {percent}% · {done} / {total}",
			"act.downloadingModelNoTotal": "下载模型 · 已下载 {done}",
			"act.failed": "请求失败：{msg}",
			"kind.install": "安装 zg",
			"kind.download": "下载模型",
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
			"intro.title": "zvec-grep (zg) · Local-first search",
			"intro.desc": "Built in and ready to use. Embedded retrieval for applications, and local workspace search for developers and AI agents.",
			"intro.more": "Learn more: ",
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
			"act.buildHint": "First build downloads the model (~{size})",
			"act.serverAutoHint": "Server is running and updates the index automatically; stop it to run Update or Rebuild",
			"act.update": "Update",
			"act.rebuild": "Rebuild",
			"act.rebuildConfirm": "Re-embed about {files} files; last full build took {dur} ({time}). Continue?",
			"act.rebuildConfirmNoHistory": "Re-embed about {files} files; this may take a long time. Continue?",
			"act.serverOn": "Start server",
			"act.serverOff": "Stop server",
			"act.starting": "Starting…",
			"act.stopping": "Stopping…",
			"act.working": "Working…",
			"model.title": "Choose embedding model",
			"model.loading": "Loading models…",
			"model.fallback": "Cannot read the zg model catalog; sizes unknown",
			"model.downloaded": "Downloaded",
			"model.notDownloaded": "Not downloaded",
			"model.downloading": "Downloading {percent}%",
			"restore.hint": "The index exists; download the model to keep using it — no rebuild needed",
			"restore.download": "Download model (~{size})",
			"restore.downloadNoSize": "Download model",
			"restore.stopServerFirst": "Server is running; stop it before downloading the model",
			"restore.pathMismatch": "The index was built at {root}, which differs from the current memory root; rebuild required",
			"restore.modelUnknown": "The index model {model} is not available in this zg; rebuild required",
			"restore.searchHint": "Keyword search works; vector search will download the model first",
			"server.needIndex": "Build the index before starting the server",
			"server.needModel": "Download the model before starting the server",
			"server.indexInvalid": "The index is unusable; rebuild before starting the server",
			"model.download": "Download {size}",
			"model.dims": "{n} dims",
			"model.confirmBuild": "Build index",
			"model.confirmRebuild": "Rebuild",
			"model.cancel": "Cancel",
			"model.mismatch": "Set to {model}; rebuild to apply",
			"model.lang.multilingual": "Multilingual (incl. Chinese)",
			"model.lang.code-multilingual": "Code · multilingual",
			"model.lang.code": "Code",
			"model.lang.english": "English",
			"model.lang.unknown": "Language unknown",
			"act.serverHint": "While running, the server watches the memory root and updates the index automatically",
			"act.editIgnore": "Edit ignore rules",
			"act.save": "Save",
			"act.cancel": "Cancel",
			"act.savedIgnore": "Saved {n} rules; run Update to apply",
			"act.clearIgnoreConfirm": "Ignore rules are empty; all files will be indexed. Continue?",
			"act.busyIgnore": "A task is running; cannot save now",
			"act.running": "{kind} running · {done} / {total}",
			"act.runningNoProgress": "{kind} running · {elapsed} elapsed",
			"act.preparingModel": "Preparing model {model}…",
			"act.downloadingModel": "Downloading model {percent}% · {done} / {total}",
			"act.downloadingModelNoTotal": "Downloading model · {done} downloaded",
			"act.failed": "Request failed: {msg}",
			"kind.install": "Install zg",
			"kind.download": "Download model",
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
.dsh-zvms-intro { display: flex; flex-direction: column; gap: 2px; }
/* 简介紧接 DSH 卡片头的插件描述：上移贴近描述；与「状态」组之间由 20px 组间距收窄到 8px */
.dsh-zvms-prefs > .dsh-zvms-intro { margin-top: -8px; margin-bottom: -12px; }
.dsh-zvms-intro-title { margin: 0; font-size: 13px; color: ${L1}; }
.dsh-zvms-link { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
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
.dsh-zvms-btns { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
/* 角标说明：包住按钮的定位容器，图标贴按钮右上角；图标是按钮的兄弟节点，悬停不触发按钮、按钮禁用时也能看提示 */
.dsh-zvms-btn-wrap { position: relative; display: inline-flex; }
.dsh-zvms-hint { position: absolute; top: -5px; right: -5px; display: inline-flex; align-items: center; justify-content: center;
  width: 12px; height: 12px; border-radius: 50%; border: 1px solid ${LINE}; color: ${L3};
  background: var(--dsw-alias-background-primary, #fff); font-size: 8px; font-weight: 600; line-height: 1;
  cursor: help; user-select: none; }
.dsh-zvms-hint:hover, .dsh-zvms-hint:focus-visible { color: ${L1}; border-color: ${L2}; outline: none; }
/* 气泡：hover / 键盘聚焦时在图标上方显示 data-tip（纯 CSS，无 JS 状态） */
.dsh-zvms-hint::after { content: attr(data-tip); position: absolute; bottom: calc(100% + 6px); left: 50%;
  transform: translateX(-50%); width: max-content; max-width: 260px; padding: 6px 8px; border-radius: 6px;
  font-size: 12px; font-weight: 400; line-height: 1.5; white-space: normal; color: var(--dsw-alias-background-primary, #fff);
  background: ${L1}; opacity: 0; pointer-events: none; transition: opacity .15s; z-index: 10; }
.dsh-zvms-hint:hover::after, .dsh-zvms-hint:focus-visible::after { opacity: 1; }
.dsh-zvms-btn {
  font-size: 12px; line-height: 1.4; padding: 4px 12px; cursor: pointer;
  color: ${L1}; background: transparent; border: 1px solid ${LINE}; border-radius: 6px;
}
.dsh-zvms-btn:hover:not(:disabled) { border-color: ${L2}; }
.dsh-zvms-btn:disabled { opacity: 0.45; cursor: default; }
.dsh-zvms-btn-primary { background: ${L1}; color: var(--dsw-alias-background-primary, #fff); border-color: transparent; }
/* 进行中：原文案(ghost)与进行中文案(live)叠在同一格，宽度取较大者，按钮不变宽变窄 */
.dsh-zvms-btn-pending { display: inline-grid; }
.dsh-zvms-btn-pending:disabled { opacity: 0.7; }
.dsh-zvms-btn-ghost, .dsh-zvms-btn-live { grid-area: 1 / 1; }
.dsh-zvms-btn-ghost { visibility: hidden; }
.dsh-zvms-btn-live { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.dsh-zvms-spinner {
  width: 10px; height: 10px; box-sizing: border-box; border-radius: 50%;
  border: 1.5px solid currentColor; border-right-color: transparent;
  animation: dsh-zvms-spin 0.8s linear infinite;
}
@keyframes dsh-zvms-spin { to { transform: rotate(360deg); } }
.dsh-zvms-picker { display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid ${LINE}; border-radius: 8px; }
.dsh-zvms-picker-title { margin: 0; font-size: 13px; color: ${L1}; }
.dsh-zvms-picker-list { display: flex; flex-direction: column; gap: 2px; max-height: 280px; overflow-y: auto; }
.dsh-zvms-picker-item { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 6px; cursor: pointer; font-size: 12px; }
.dsh-zvms-picker-item:hover { background: color-mix(in srgb, ${L1} 6%, transparent); }
.dsh-zvms-picker-on { background: color-mix(in srgb, ${L1} 10%, transparent); }
.dsh-zvms-picker-name { color: ${L1}; min-width: 200px; }
.dsh-zvms-picker-meta { color: ${L3}; }
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
		/**
		* 增量更新 / 重建按钮的可用性。
		* server 运行时它会自动补索引，手动写索引只会与其抢写锁（重试耗尽后报 LOCK.BUSY），故两者都禁用；
		* 增量更新另需确有待补变更（stale）才可点。高亮与禁用分开返回，避免把条件传错参数位。
		*/
		function indexActions(d, busy) {
			const serverRunning = d.server === "running";
			const stale = d.status?.state === "stale";
			return {
				update: {
					disabled: busy || serverRunning || !stale,
					primary: stale && !serverRunning
				},
				rebuild: { disabled: busy || serverRunning }
			};
		}
		/** 操作路由 → 进行中文案的字典键。启停 server 有专用文案，其余统一「处理中…」。 */
		const PENDING_KEY = {
			"/server-on": "act.starting",
			"/server-off": "act.stopping"
		};
		/**
		* 按钮在某操作请求进行中时的显示：被点的按钮换成进行中文案并转圈，所有操作按钮禁用（防重复点击）。
		* 请求返回前 /detect 不会反映新状态，故以客户端 pending 为准。
		*/
		function pendingView(t, pending, path, label) {
			if (!pending) return {
				label,
				spinning: false,
				locked: false
			};
			if (pending !== path) return {
				label,
				spinning: false,
				locked: true
			};
			return {
				label: t(PENDING_KEY[path] ?? "act.working"),
				spinning: true,
				locked: true
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
		/**
		* 只采用最新一次请求结果的序号门：begin() 取号；isLatest(n) 判断该号是否仍是最后发出的。
		* 用于 /detect 轮询与手动刷新并发时，丢弃「早发晚到」的旧状态，避免按钮跳回旧文案。
		*/
		function createLatestGate() {
			let seq = 0;
			return {
				begin: () => ++seq,
				isLatest: (n) => n === seq
			};
		}
		/** 下载提示：模型已下载或大小未知（降级列表）时不提示；否则按实际大小。 */
		function downloadHint(t, m) {
			if (!m || m.downloaded || !m.bytes) return null;
			return fmt(t("act.buildHint"), { size: formatBytes(m.bytes) });
		}
		/** 选择面板默认选中：设置值在列表中则选它，否则选列表第一项。 */
		function defaultPick(models, current) {
			return models.some((m) => m.ref === current) ? current : models[0]?.ref ?? current;
		}
		/** 设置模型与索引模型不一致（已建索引时）：返回提示文案，否则 null。 */
		function modelMismatch(t, d, setting) {
			const indexed = d?.status?.model;
			if (!indexed || !setting || indexed === setting) return null;
			return fmt(t("model.mismatch"), { model: setting });
		}
		/** 语言标签文案键。 */
		const langKey = (lang) => `model.lang.${lang}`;
		/**
		* 任务进度区：下载阶段优先（准备 / 下载中），其余回到文件进度；percent 为 null 时不显示进度条。
		* 模型就绪（stage=ready）后回到文件进度。
		*/
		function jobProgress(t, job, kind, now = Date.now(), d) {
			const im = d?.indexModel;
			if (job?.kind === "download" && im?.bytes) {
				const pct = Math.min(99, Math.max(0, Math.round(im.downloadedBytes / im.bytes * 100)));
				return {
					text: fmt(t("act.downloadingModel"), {
						percent: pct,
						done: formatBytes(im.downloadedBytes),
						total: formatBytes(im.bytes)
					}),
					percent: pct
				};
			}
			const m = job?.model;
			if (m?.stage === "preparing") return {
				text: fmt(t("act.preparingModel"), { model: m.model }),
				percent: null
			};
			if (m?.stage === "downloading") {
				if (m.percent !== null && m.total) return {
					text: fmt(t("act.downloadingModel"), {
						percent: m.percent,
						done: m.downloaded,
						total: m.total
					}),
					percent: m.percent
				};
				return {
					text: fmt(t("act.downloadingModelNoTotal"), { done: m.downloaded ?? "—" }),
					percent: null
				};
			}
			if (job?.total) return {
				text: fmt(t("act.running"), {
					kind,
					done: job.done,
					total: job.total
				}),
				percent: Math.round(job.done / job.total * 100)
			};
			return {
				text: fmt(t("act.runningNoProgress"), {
					kind,
					elapsed: formatDuration(Math.max(0, now - (job?.startedAt ?? now)))
				}),
				percent: null
			};
		}
		/**
		* 配置卡状态（model-restore spec 状态定义）：S0 未装 zg / S1 无索引 / S2 缺模型 / S2x 索引不可用 / S3 正常 / S4 进行中。
		* indexHealth / indexModel 缺失（旧 host 或读取失败）时按 S3 处理，与现状一致、不阻断操作。
		*/
		function cardState(d) {
			if (d?.job?.running) return "S4";
			if (!d?.zg) return "S0";
			if (!isBuilt(d?.status?.state)) return "S1";
			const h = d?.indexHealth;
			if (h?.kind === "model-unknown" || h?.kind === "path-mismatch") return "S2x";
			if (h?.kind === "ok" && d?.indexModel && d.indexModel.downloaded === false) return "S2";
			return "S3";
		}
		/** server 按钮：运行中始终可停；未运行时仅 S3 可启动，S1 / S2 / S2x 给出原因键，S4 锁定。 */
		function serverAction(d, st) {
			if (d?.server === "running") return {
				path: "/server-off",
				disabled: false,
				reason: null
			};
			const reason = st === "S1" ? "server.needIndex" : st === "S2" ? "server.needModel" : st === "S2x" ? "server.indexInvalid" : null;
			return {
				path: "/server-on",
				disabled: st === "S4" || reason !== null,
				reason
			};
		}
		/** 模型行后缀：已下载 / 未下载 / 下载中 n%；无索引模型信息时为空。 */
		function modelLine(t, d) {
			const m = d?.indexModel;
			if (!m) return "";
			if (m.downloaded) return ` · ${t("model.downloaded")}`;
			if (d?.job?.running && d.job.kind === "download" && m.bytes) return ` · ${fmt(t("model.downloading"), { percent: Math.min(99, Math.round(m.downloadedBytes / m.bytes * 100)) })}`;
			return ` · ${t("model.notDownloaded")}`;
		}
		/** S2x 提示：路径不一致带索引记录的路径，模型不可用带模型名；其余为 null。 */
		function invalidHint(t, d) {
			const h = d?.indexHealth;
			if (h?.kind === "path-mismatch") return fmt(t("restore.pathMismatch"), { root: h.indexedRoot });
			if (h?.kind === "model-unknown") return fmt(t("restore.modelUnknown"), { model: h.model || "—" });
			return null;
		}
		/** 说明图标的元素属性：可聚焦（键盘可见提示）、data-tip 供 CSS 气泡、aria-label 供读屏。 */
		function hintIconProps(text) {
			return {
				className: "dsh-zvms-hint",
				tabIndex: 0,
				role: "img",
				"data-tip": text,
				"aria-label": text
			};
		}
		// src/client/search-panel.ts
		/** 检索测试框（spec C6）：方式与条数仅作用于本次测试，不写回设置；复用 host /search（同工具执行链）。 */
		const API$2 = "/api/dsh-zvec-memory-search";
		const h$2 = react.createElement;
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
			return h$2("div", { className: "dsh-zvms-result" }, h$2("div", { className: "dsh-zvms-result-head" }, h$2("span", { className: "dsh-zvms-result-title" }, `${index + 1}. ${r.heading || t("test.untitled")}`), h$2("span", { className: r.matched_by === "fts+vector" ? "dsh-zvms-badge" : "dsh-zvms-badge dsh-zvms-badge-outline" }, r.matched_by)), h$2("button", {
				className: "dsh-zvms-result-path",
				title: `${loc}\n${t("test.copyHint")}`,
				onClick: () => void copy()
			}, copied ? t("test.copied") : `${foldPath(r.path)}  :${r.start_line}-${r.end_line}`), meta ? h$2("span", { className: "dsh-zvms-result-meta" }, meta) : null);
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
					const r = await fetch(`${API$2}/search`, {
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
			if (running) body = h$2("p", { className: "dsh-zvms-note" }, t("test.running"));
			else if (res?.error) body = h$2("p", { className: "dsh-zvms-note dsh-zvms-error" }, res.error);
			else if (res && res.status !== "ready") body = h$2("p", { className: "dsh-zvms-note dsh-zvms-error" }, res.message ?? res.status);
			else if (res) {
				const n = res.results?.length ?? 0;
				body = h$2("div", { className: "dsh-zvms-results" }, h$2("p", { className: "dsh-zvms-note" }, fmt(t("test.head"), {
					n,
					sec: ((res.elapsedMs ?? 0) / 1e3).toFixed(2),
					mode: res.mode
				})), missing > 0 ? h$2("p", { className: "dsh-zvms-note dsh-zvms-warn" }, fmt(t("test.staleHint"), { n: missing })) : null, n === 0 ? h$2("p", { className: "dsh-zvms-note" }, t("test.empty")) : null, (res.results ?? []).map((r, i) => h$2(ResultItem, {
					key: `${r.path}:${r.start_line}`,
					t,
					r,
					index: i
				})));
			}
			return h$2("div", { className: "dsh-zvms-section" }, h$2("div", { className: "dsh-zvms-group" }, t("group.test")), h$2("div", { className: "dsh-zvms-search" }, h$2("input", {
				className: "dsh-zvms-input",
				value: query,
				disabled: !usable,
				placeholder: usable ? t("test.placeholder") : t("test.notBuilt"),
				onChange: (e) => setQuery(e.target.value),
				onKeyDown: (e) => {
					if (e.key === "Enter" && !e.nativeEvent?.isComposing) run();
				}
			}), h$2("button", {
				className: "dsh-zvms-btn dsh-zvms-btn-primary",
				disabled: !usable || running || !query.trim(),
				onClick: () => void run()
			}, t("test.run"))), h$2("div", { className: "dsh-zvms-controls" }, h$2("div", {
				className: "dsh-zvms-seg",
				role: "group"
			}, MODES.map((m) => h$2("button", {
				key: m,
				type: "button",
				"aria-pressed": mode === m ? "true" : "false",
				onClick: () => setMode(m)
			}, t(`seg.${m}`)))), h$2("span", { className: "dsh-zvms-desc" }, t("test.limit")), h$2("input", {
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
			})), props.cardState === "S2" ? h$2("p", { className: "dsh-zvms-note dsh-zvms-warn" }, t("restore.searchHint")) : null, body);
		}
		// src/client/model-picker.ts
		/**
		* 建立索引 / 重建前的向量模型选择面板（spec C4）。
		* 列表来自 host /models（zg 本地模型清单 + 语言标签 + 是否已下载）；确认后由调用方写入设置并发起任务。
		*/
		const API$1 = "/api/dsh-zvec-memory-search";
		const h$1 = react.createElement;
		function ModelPicker(props) {
			const { t } = props;
			const [list, setList] = react.useState(null);
			const [picked, setPicked] = react.useState(props.current);
			react.useEffect(() => {
				let alive = true;
				(async () => {
					try {
						const j = await (await fetch(`${API$1}/models`, { method: "POST" })).json();
						if (!alive) return;
						const models = Array.isArray(j?.models) ? j.models : [];
						setList({
							models,
							fallback: Boolean(j?.fallback)
						});
						setPicked(defaultPick(models, props.current));
					} catch {
						if (alive) setList({
							models: [],
							fallback: true
						});
					}
				})();
				return () => {
					alive = false;
				};
			}, []);
			const hint = downloadHint(t, list?.models.find((m) => m.ref === picked) ?? null);
			return h$1("div", {
				className: "dsh-zvms-picker",
				role: "dialog",
				"aria-label": t("model.title")
			}, h$1("p", { className: "dsh-zvms-picker-title" }, t("model.title")), !list ? h$1("p", { className: "dsh-zvms-note" }, t("model.loading")) : null, list?.fallback ? h$1("p", { className: "dsh-zvms-note dsh-zvms-warn" }, t("model.fallback")) : null, list ? h$1("div", {
				className: "dsh-zvms-picker-list",
				role: "radiogroup"
			}, ...list.models.map((m) => h$1("label", {
				key: m.ref,
				className: `dsh-zvms-picker-item${m.ref === picked ? " dsh-zvms-picker-on" : ""}`
			}, h$1("input", {
				type: "radio",
				name: "zvms-model",
				checked: m.ref === picked,
				onChange: () => setPicked(m.ref)
			}), h$1("span", { className: "dsh-zvms-picker-name dsh-zvms-mono" }, m.ref.replace(/^local\//, "")), h$1("span", { className: "dsh-zvms-picker-meta" }, [
				t(langKey(m.lang)),
				m.downloaded ? t("model.downloaded") : m.bytes ? fmt(t("model.download"), { size: formatBytes(m.bytes) }) : null,
				m.dimension ? fmt(t("model.dims"), { n: m.dimension }) : null
			].filter(Boolean).join(" · "))))) : null, props.confirmText ? h$1("p", { className: "dsh-zvms-note" }, props.confirmText) : null, hint ? h$1("p", { className: "dsh-zvms-note" }, hint) : null, h$1("div", { className: "dsh-zvms-btns" }, h$1("button", {
				className: "dsh-zvms-btn dsh-zvms-btn-primary",
				disabled: !list || list.models.length === 0,
				onClick: () => props.onConfirm(picked)
			}, t(props.kind === "build" ? "model.confirmBuild" : "model.confirmRebuild")), h$1("button", {
				className: "dsh-zvms-btn",
				onClick: props.onCancel
			}, t("model.cancel"))));
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
		const INTRO_URL = "https://zvec.org/zh/";
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
			embeddingModel: "local/qwen3-embedding-0.6b"
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
						embeddingModel: String(unwrap(raw.embeddingModel) ?? "local/qwen3-embedding-0.6b")
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
		/** 轮询 /detect：任务运行中 2s，否则 10s；refresh() 立即重取并在新结果写入后 resolve。 */
		function useDetect() {
			const [data, setData] = react.useState(null);
			const [error, setError] = react.useState("");
			const kick = react.useRef(async () => {});
			react.useEffect(() => {
				let alive = true;
				let timer;
				const gate = createLatestGate();
				const tick = async () => {
					if (timer) clearTimeout(timer);
					const n = gate.begin();
					let next = 1e4;
					try {
						const r = await fetch(`${API}/detect`, { method: "POST" });
						if (!gate.isLatest(n)) return;
						if (r.ok) {
							const j = await r.json();
							if (!gate.isLatest(n)) return;
							if (alive) {
								setData(j);
								setError("");
							}
							if (j?.job?.running) next = 2e3;
						} else if (alive) setError(`detect HTTP ${r.status}`);
					} catch (e) {
						if (!gate.isLatest(n)) return;
						if (alive) setError(`detect: ${e?.message ?? e}`);
					}
					if (alive) timer = setTimeout(tick, next);
				};
				kick.current = tick;
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
		/** 按钮角标说明图标：放在 .dsh-zvms-btn-wrap 内贴右上角，hover / 聚焦时显示 text（纯 CSS 气泡）；aria-label 供读屏。 */
		function HintIcon(props) {
			return h("span", hintIconProps(props.text), "i");
		}
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
				v: s?.model ? `${s.model}${s.dimensions ? ` · ${fmt(t("status.dims"), { n: s.dimensions.toLocaleString("en-US") })}` : ""}${modelLine(t, d)}` : state.embeddingModel,
				mono: true
			}), cardState(d) === "S2" ? h("p", { className: "dsh-zvms-note" }, t("restore.hint")) : null, invalidHint(t, d) ? h("p", { className: "dsh-zvms-note dsh-zvms-warn" }, invalidHint(t, d)) : null, modelMismatch(t, d, state.embeddingModel) ? h("p", { className: "dsh-zvms-note dsh-zvms-warn" }, modelMismatch(t, d, state.embeddingModel)) : null, h(KV, {
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
			const [picking, setPicking] = react.useState(null);
			const [msg, setMsg] = react.useState(null);
			const job = d.job?.running ? d.job : null;
			const state = d.status?.state;
			const built = isBuilt(state);
			const rootOk = Boolean(d.memoryRoot && d.rootExists);
			const off = props.disabled || Boolean(job);
			const [pending, setPending] = react.useState(null);
			const act = async (path, confirmText) => {
				if (confirmText && !window.confirm(confirmText)) return;
				setMsg(null);
				setPending(path);
				try {
					const j = await post(path);
					if (j.error) setMsg({
						text: fmt(t("act.failed"), { msg: j.error }),
						tone: "error"
					});
					else if (j.ok === false) setMsg({
						text: fmt(t("act.failed"), { msg: String(j.output ?? "").split("\n")[0] }),
						tone: "error"
					});
				} finally {
					await refresh().catch(() => {});
					setPending(null);
				}
			};
			const btn = (label, onClick, primary = false, disabled = off, path = "") => {
				const v = pendingView(t, pending, path, label);
				return h("button", {
					className: `dsh-zvms-btn${primary ? " dsh-zvms-btn-primary" : ""}${v.spinning ? " dsh-zvms-btn-pending" : ""}`,
					disabled: disabled || v.locked,
					onClick,
					"aria-busy": v.spinning || void 0
				}, v.spinning ? [h("span", {
					key: "ghost",
					className: "dsh-zvms-btn-ghost",
					"aria-hidden": true
				}, label), h("span", {
					key: "live",
					className: "dsh-zvms-btn-live"
				}, h("span", {
					className: "dsh-zvms-spinner",
					"aria-hidden": true
				}), v.label)] : label);
			};
			const kind = job ? t(`kind.${job.kind}`) : "";
			const progress = job ? jobProgress(t, job, kind, Date.now(), d) : null;
			const ia = indexActions(d, off);
			const st = cardState(d);
			const sa = serverAction(d, st);
			const serverRunning = d.server === "running";
			const dlLabel = d.indexModel?.bytes ? fmt(t("restore.download"), { size: formatBytes(d.indexModel.bytes) }) : t("restore.downloadNoSize");
			return h(Group, { title: t("group.actions") }, h("div", { className: "dsh-zvms-btns" }, !d.zg ? btn(t("act.install"), () => void act("/install-zg", t("act.installConfirm")), true, off, "/install-zg") : null, d.zg && rootOk && state === "none" ? btn(t("act.build"), () => {
				setMsg(null);
				setPicking("build");
			}, true, off || picking !== null, "/build-index") : null, d.zg && rootOk && st === "S2" ? btn(dlLabel, () => void act("/download-model"), true, off || serverRunning, "/download-model") : null, d.zg && rootOk && built ? btn(t("act.update"), () => void act("/update-index"), ia.update.primary && st === "S3", ia.update.disabled || st === "S2x", "/update-index") : null, d.zg && rootOk && built ? btn(t("act.rebuild"), () => {
				setMsg(null);
				setPicking("rebuild");
			}, st === "S2x", ia.rebuild.disabled || picking !== null, "/rebuild-index") : null, d.zg ? h("span", { className: "dsh-zvms-btn-wrap" }, btn(t(serverRunning ? "act.serverOff" : "act.serverOn"), () => void act(sa.path), false, props.disabled || sa.disabled, sa.path), h(HintIcon, { text: t("act.serverHint") })) : null, rootOk ? btn(t("act.editIgnore"), () => {
				setMsg(null);
				setEditing(true);
			}, false, props.disabled || editing) : null), d.zg && rootOk && st === "S2" && serverRunning ? h("p", { className: "dsh-zvms-note dsh-zvms-warn" }, t("restore.stopServerFirst")) : null, d.zg && rootOk && !serverRunning && sa.reason ? h("p", { className: "dsh-zvms-note" }, t(sa.reason)) : null, d.zg && rootOk && built && serverRunning ? h("p", { className: "dsh-zvms-note" }, t("act.serverAutoHint")) : null, job ? h("div", { className: "dsh-zvms-section" }, h("p", { className: "dsh-zvms-note" }, progress.text), progress.percent !== null ? h("div", { className: "dsh-zvms-progress" }, h("div", { style: { width: `${progress.percent}%` } })) : null, h("pre", { className: "dsh-zvms-log" }, (job.tail ?? []).slice(-10).join("\n"))) : null, picking ? h(ModelPicker, {
				t,
				kind: picking,
				current: props.model,
				confirmText: picking === "rebuild" ? rebuildConfirm(t, d) : void 0,
				onCancel: () => setPicking(null),
				onConfirm: (ref) => {
					const kind = picking;
					setPicking(null);
					props.set("embeddingModel", ref);
					setTimeout(() => void act(kind === "build" ? "/build-index" : "/rebuild-index"), 300);
				}
			}) : null, editing ? h(IgnoreEditor, {
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
		/** 卡片顶部的 zg 简介：首次使用（尤其冷启动只见「安装 zg」时）说明 zg 是什么、去哪了解。 */
		function Intro(props) {
			const { t } = props;
			return h("div", { className: "dsh-zvms-intro" }, h("p", { className: "dsh-zvms-intro-title" }, t("intro.title")), h("p", { className: "dsh-zvms-note" }, t("intro.desc")), h("p", { className: "dsh-zvms-note" }, t("intro.more"), h("a", {
				href: INTRO_URL,
				target: "_blank",
				rel: "noopener noreferrer",
				className: "dsh-zvms-link"
			}, INTRO_URL)));
		}
		function CardBody(props) {
			const { t, Switch, state, set } = props;
			const { data, error, refresh } = useDetect();
			const disabled = state.status !== "ready" || !state.writable;
			if (!data) return h("p", { className: `dsh-zvms-note${error ? " dsh-zvms-error" : ""}` }, error || t("card.loading"));
			return h("div", { className: "dsh-zvms-prefs" }, !state.writable && state.status === "ready" ? h("p", {
				className: "dsh-zvms-note",
				role: "status"
			}, t("card.readOnly")) : null, error ? h("p", { className: "dsh-zvms-note dsh-zvms-error" }, error) : null, h(Intro, { t }), h(StatusGroup, {
				t,
				d: data,
				state
			}), h(ActionsGroup, {
				t,
				d: data,
				disabled,
				refresh,
				set,
				model: state.embeddingModel
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
				defaultMode: state.queryMode,
				cardState: cardState(data)
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