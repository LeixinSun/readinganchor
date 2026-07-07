# Reading Anchors

`Reading Anchors` 是一个面向 Chrome / Edge 的 Manifest V3 浏览器扩展。

它会在英文网页中高亮一部分“结构词”和“信息词”，例如转折、因果、论证强度、方法、证据等线索，帮助读者更快扫出段落结构，适合英文阅读、论文浏览和信息密集型文章场景。

## 功能

- 点击扩展图标即可对当前页面启用或关闭标记
- 为转折、因果、论证、方法、证据等关键词添加视觉锚点
- 提供浮动控制面板，可调整强度和模式
- 设置保存在 `chrome.storage.local`
- 所有文本处理都在本地浏览器内完成，不依赖远程服务

## 安装

1. 打开 `chrome://extensions` 或 `edge://extensions`
2. 开启 `Developer mode`
3. 点击 `Load unpacked`
4. 选择当前项目目录

## 使用

1. 打开任意英文文章页
2. 点击浏览器工具栏中的 `Reading Anchors`
3. 观察页面中的结构词是否被标记
4. 再点一次图标可恢复原文
5. 需要时可用浮动面板切换 `Low / Medium / High` 和不同模式

## 项目结构

- `manifest.json`：扩展清单
- `background.js`：点击图标后注入脚本和样式
- `content.js`：页面文本扫描、匹配、包裹与恢复逻辑
- `styles.css`：高亮样式和浮动面板样式
- `icons/`：扩展图标
- `release/`：打包产物

## 手动验证

- 在新闻页、博客页或 Wikipedia 页面启用扩展
- 确认 `however`、`because`、`therefore` 等词会被标记
- 确认链接仍可点击
- 确认 `code`、`pre` 等区域不会被污染
- 确认关闭扩展后页面文本能完整恢复

## 打包

项目中已经包含一个示例打包文件：

- `release/reading-anchors-extension.zip`

如需重新打包，可在项目根目录执行：

```bash
mkdir -p release
zip -r release/reading-anchors-extension.zip manifest.json background.js content.js styles.css README.md icons
```

## 说明

这是一个本地处理型扩展。它只在用户主动点击扩展时作用于当前页面，不会把页面内容发送到外部服务器。
