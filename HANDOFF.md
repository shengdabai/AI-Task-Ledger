# AI 单任务投入账本交接

## 最终位置与入口

根 Agent 已集成到 `~/Desktop/01-项目开发/53-AI单任务投入账本`。双击 `单文件入口.html` 可直接使用，原源码入口为 `index.html`。根 Agent 已检查单文件在断网下的示例、刷新恢复、JSON 导出和 1440/768/390 无溢出，无外部请求或页面错误。

修改源文件后用 `~/Codex/2026-10-29/product-upgrade-bundle.py` 重新生成单文件。换入口或移动文件前先导出 JSON，浏览器可能按文件地址隔离存储。iCloud 当前返回账户不可访问，尚不能确认新文件上传；见中央升级记录。

## 已完成

纯客户端账本已可用。核心边界是：未知 API 费用保持未知；API、人工估算和订阅额度分开；额度重置或窗口不可比时不计算差值；同类任务比较只使用验收通过样本并显示样本数。

## 运行与验证

双击 `index.html`。开发验收命令：

```bash
node --check core.js && node --check app.js && node --check sample-data.js
node --test tests/core.test.cjs
node tests/ui-test.cjs
```

2026-10-29 当前结果：核心 22/22；浏览器 E2E 通过；1440/768/390 的 `scrollWidth` 分别等于视口宽度；最小可见按钮高度 44 像素。默认 Playwright 浏览器不可用，测试按约定回退到 `~/.local/bin/chrome-headless-shell`。

E2E 还覆盖：混合示例身份不污染本人指标、`tasks:[null]` 原子拒绝、CSV 控制字符后公式注入、损坏 localStorage 原文先归档再覆盖、归档失败时保留原值并分别下载原始文本和当前有效内存、存储失败时不宣称已保存。

三张完整页面截图已人工查看：桌面信息层级清楚，390px 手机端表单单列、按钮可点、任务卡和汇总无截断。截图在 `screenshots/ledger-1440.png`、`ledger-768.png`、`ledger-390.png`。

关键文件 SHA-256：`core.js` `b01479846a55bdbd52cc70d9d3d69aecae987887db1fc64c6f95638008b3ba5d`；`app.js` `4d28cce9c2579bd3942c1175c15bdbfa5a74bbc343404455d4e564dc504f7a40`；`index.html` `7ce20cc545e1e3e7bd2cb54aebc25213e07920d953adc7f9c2734e6564b2f878`。

## 恢复与后续

这是新目录，没有覆盖既有文件。删除该目录即可撤回本轮新产品；使用者数据另存在浏览器 `localStorage`，撤回源码不会自动删除数据。

下一步只做真实使用：连续记录 6 个任务，核对时间填写是否可持续、未知费用数量是否下降、同类任务是否至少有 3 个通过样本。没有基线前不新增“节省率”。

## 限制

没有真实使用记录、付款证据或商业需求证明。没有读取任何模型账号、账单或凭据，也没有联网、发布或推送。

