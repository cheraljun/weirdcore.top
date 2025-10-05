/**
 * Windows 98 风格窗口管理器
 */

class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndexCounter = 1000;
        this.activeWindow = null;
    }

    createWindow(title, content, options = {}) {
        // 检查是否已存在相同标题的窗口
        const existingWindow = this.windows.find(w => w.title === title);
        if (existingWindow) {
            // 如果窗口被最小化，恢复它
            if (existingWindow.config.minimized) {
                this.restoreWindow(existingWindow.id);
            }
            // 置顶窗口
            this.focusWindow(existingWindow);
            return existingWindow;
        }

        const windowId = 'window-' + Date.now();
        const defaultOptions = {
            width: 600,
            height: 400,
            x: 50 + (this.windows.length * 30),
            y: 50 + (this.windows.length * 30),
            minimized: false,
            maximized: false
        };
        const config = { ...defaultOptions, ...options };

        const windowEl = document.createElement('div');
        windowEl.className = 'win98-window';
        windowEl.id = windowId;
        windowEl.style.cssText = `
            left: ${config.x}px;
            top: ${config.y}px;
            width: ${config.width}px;
            height: ${config.height}px;
            z-index: ${++this.zIndexCounter};
        `;

        windowEl.innerHTML = `
            <div class="win98-titlebar">
                <span class="win98-title">${title}</span>
                <div class="win98-controls">
                    <button class="win98-btn win98-minimize" title="最小化">_</button>
                    <button class="win98-btn win98-maximize" title="最大化">□</button>
                    <button class="win98-btn win98-close" title="关闭">×</button>
                </div>
            </div>
            <div class="win98-content">
                ${content}
            </div>
            <div class="win98-resize-handle"></div>
        `;

        document.body.appendChild(windowEl);

        const windowObj = {
            id: windowId,
            element: windowEl,
            title: title,
            config: config,
            originalSize: { width: config.width, height: config.height },
            originalPos: { x: config.x, y: config.y }
        };

        this.windows.push(windowObj);
        this.setupWindowEvents(windowObj);
        this.focusWindow(windowObj);

        return windowObj;
    }

    setupWindowEvents(windowObj) {
        const { element } = windowObj;
        const titlebar = element.querySelector('.win98-titlebar');
        const closeBtn = element.querySelector('.win98-close');
        const minimizeBtn = element.querySelector('.win98-minimize');
        const maximizeBtn = element.querySelector('.win98-maximize');
        const resizeHandle = element.querySelector('.win98-resize-handle');

        // 拖动窗口
        this.makeDraggable(element, titlebar);

        // 调整大小
        this.makeResizable(element, resizeHandle);

        // 关闭
        closeBtn.onclick = () => this.closeWindow(windowObj);

        // 最小化
        minimizeBtn.onclick = () => this.minimizeWindow(windowObj);

        // 最大化
        maximizeBtn.onclick = () => this.toggleMaximize(windowObj);

        // 点击激活
        element.onclick = () => this.focusWindow(windowObj);
    }

    makeDraggable(element, handle) {
        let isDragging = false;
        let initialX;
        let initialY;

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const currentX = e.clientX - initialX;
            const currentY = e.clientY - initialY;
            element.style.left = currentX + 'px';
            element.style.top = Math.max(0, currentY) + 'px';
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            // 恢复 iframe 鼠标事件
            this.enableIframePointerEvents();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        handle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('win98-btn')) return;
            
            isDragging = true;
            initialX = e.clientX - element.offsetLeft;
            initialY = e.clientY - element.offsetTop;
            
            // 禁用 iframe 鼠标事件，防止拖动时粘滞
            this.disableIframePointerEvents();
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    makeResizable(element, handle) {
        let isResizing = false;
        let originalWidth;
        let originalHeight;
        let originalX;
        let originalY;

        const onMouseMove = (e) => {
            if (!isResizing) return;
            e.preventDefault();
            const width = originalWidth + (e.clientX - originalX);
            const height = originalHeight + (e.clientY - originalY);
            element.style.width = Math.max(300, width) + 'px';
            element.style.height = Math.max(200, height) + 'px';
        };

        const onMouseUp = () => {
            if (!isResizing) return;
            isResizing = false;
            // 恢复 iframe 鼠标事件
            this.enableIframePointerEvents();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            originalWidth = element.offsetWidth;
            originalHeight = element.offsetHeight;
            originalX = e.clientX;
            originalY = e.clientY;

            // 禁用 iframe 鼠标事件，防止缩放时粘滞
            this.disableIframePointerEvents();

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    focusWindow(windowObj) {
        if (this.activeWindow) {
            this.activeWindow.element.classList.remove('win98-active');
        }
        windowObj.element.classList.add('win98-active');
        windowObj.element.style.zIndex = ++this.zIndexCounter;
        this.activeWindow = windowObj;
    }

    closeWindow(windowObj) {
        windowObj.element.remove();
        this.windows = this.windows.filter(w => w.id !== windowObj.id);
    }

    minimizeWindow(windowObj) {
        windowObj.element.style.display = 'none';
        windowObj.config.minimized = true;
    }

    toggleMaximize(windowObj) {
        const { element, config, originalSize, originalPos } = windowObj;
        
        if (config.maximized) {
            // 恢复原始大小
            element.style.width = originalSize.width + 'px';
            element.style.height = originalSize.height + 'px';
            element.style.left = originalPos.x + 'px';
            element.style.top = originalPos.y + 'px';
            config.maximized = false;
        } else {
            // 最大化（在内容区域内）
            const contentArea = document.querySelector('.content') || document.body;
            const rect = contentArea.getBoundingClientRect();
            
            originalSize.width = element.offsetWidth;
            originalSize.height = element.offsetHeight;
            originalPos.x = element.offsetLeft;
            originalPos.y = element.offsetTop;
            
            element.style.width = (rect.width - 40) + 'px';
            element.style.height = (window.innerHeight - rect.top - 40) + 'px';
            element.style.left = '20px';
            element.style.top = rect.top + 'px';
            config.maximized = true;
        }
    }

    restoreWindow(windowId) {
        const windowObj = this.windows.find(w => w.id === windowId);
        if (windowObj && windowObj.config.minimized) {
            windowObj.element.style.display = 'block';
            windowObj.config.minimized = false;
            this.focusWindow(windowObj);
        }
    }

    /**
     * 禁用所有 iframe 的鼠标事件
     * 防止拖动/缩放时 iframe 捕获鼠标事件导致粘滞
     */
    disableIframePointerEvents() {
        document.querySelectorAll('iframe').forEach(iframe => {
            iframe.style.pointerEvents = 'none';
        });
    }

    /**
     * 恢复所有 iframe 的鼠标事件
     */
    enableIframePointerEvents() {
        document.querySelectorAll('iframe').forEach(iframe => {
            iframe.style.pointerEvents = 'auto';
        });
    }
}

// 创建全局窗口管理器实例
window.windowManager = new WindowManager();

export default WindowManager;

