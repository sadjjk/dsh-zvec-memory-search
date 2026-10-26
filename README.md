# dsh-zvec-memory-search

DSH 记忆库混合检索（zvec-grep）：`zvec-memory-search` 工具、配置卡冷启动、检索引导与用户补充文件注入。

## 安装

```bash
# 开发态（本地仓库）
pnpm build && bash scripts/register.sh desktop dev

# 发布态（github）
pnpm release && pnpm publish
```

## 配置卡

插件管理页 `dsh-zvec-memory-search` bundle 行下：

| 状态 | 显示 | 操作 |
|------|------|------|
| ① 未装 zg | 未检测到 zg | 「安装 zg」：确认后 `npm install -g @zvec/zvec-grep` |
| ② 未填根目录 | `memoryRoot` 文本框 | 手填绝对路径 |
| ③ 未建索引 | 未建索引 | 「建立索引」：写 `.zgignore`（默认排除规则）后 `zg index --ignore-file` |
| ④ 就绪 | 文件数/实体数/模型/server 状态 | 「增量更新」「重建」「启动/停止 server」「追加排除」 |

## 工具

`zvec-memory-search` — 本地记忆库混合检索（关键词+语义）。

| 参数 | 必填 | 说明 |
|------|------|------|
| `query` | 是 | 自然语言检索意图 |
| `start_date` | 否 | `YYYY-MM-DD` 业务日期下限（文件名以日期开头的文件） |
| `end_date` | 否 | `YYYY-MM-DD` 业务日期上限 |
| `modified_after` | 否 | `YYYY-MM-DD` 或毫秒，文件 mtime 下限 |
| `modified_before` | 否 | `YYYY-MM-DD` 或毫秒，文件 mtime 上限 |
| `limit` | 否 | 1–50，默认取 `semanticLimit` |
| `preview` | 否 | `none`/`short`/`full`，默认取设置 |

返回：`status`（`ready`/`not_ready`/`error`）、`counts`、`results[]`（`path`、`start_line`、`end_line`、`heading`、`scope`、`score`、`matched_by`、`ranks`、`time_basis`、`outlinks`）。

## 注入

- `<zvec-memory-search>`：索引就绪后每会话首次注入检索引导。
- `<zvec-memory-baseline>`：`baselineFile` 已设且文件可读时注入；内容变化即替换。
- 超 64KB 截断并在末尾注明截断字节数。

## 隐私

- 只用本地向量模型（`local/qwen3-embedding-0.6b` 等），绝不传 `--allow-remote`、`--api-key`。

## 旧工具

`memory_index_search`、`memory_vec_search` 已删除。改用 `zvec-memory-search`。
