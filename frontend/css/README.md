# CSS 架构说明

## 统一间距系统

为了保证全站样式一致性，我们在 `style.css` 中定义了统一的 CSS 变量：

### 间距变量 (定义在 `:root`)

```css
--content-padding: 0.7rem;      /* 内容区域统一内边距 */
--content-gap: 0.57rem;         /* 元素之间的间隙 */
--section-gap: 1.07rem;         /* 大区块之间的间隙 */
```

### 使用场景

#### `--content-padding` (0.7rem)
用于所有主要内容区域的内边距，确保对齐一致：
- 搜索框容器 (`.left-header`)
- 公告栏内容 (`.announcement-content`)
- 搜索结果容器 (`#search-results-container`)
- 其他内容区域

#### `--content-gap` (0.57rem)
用于相邻元素之间的小间隙：
- 输入框的 padding
- 按钮之间的间距
- 小标题与内容的间隔

#### `--section-gap` (1.07rem)
用于大区块之间的间隔：
- 不同章节之间
- 大标题与内容的间隔

## 如何使用

### 在 CSS 文件中
```css
.my-element {
    padding: var(--content-padding);
    margin-bottom: var(--section-gap);
}
```

### 在 HTML 内联样式中
```html
<div style="padding: var(--content-padding); margin: var(--content-gap);">
    内容
</div>
```

## 修改全局间距

如果需要调整全局间距，只需要修改 `frontend/css/style.css` 中的变量值：

```css
:root {
    --content-padding: 0.7rem;  /* 修改这里 */
    --content-gap: 0.57rem;     /* 修改这里 */
    --section-gap: 1.07rem;     /* 修改这里 */
}
```

所有使用这些变量的地方会自动更新！

## 颜色变量

同样，颜色也使用统一的 CSS 变量：
- `--win98-gray`: 窗口背景
- `--win98-blue`: 标题栏
- `--win98-black`: 文字
- `--win98-white`: 白色/高光
- `--win98-dark-gray`: 阴影

详见 `style.css` 的 `:root` 定义。
