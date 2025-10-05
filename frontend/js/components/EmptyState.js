/**
 * 空状态组件
 */

export class EmptyState {
    constructor(options = {}) {
        this.options = {
            icon: '📝',
            title: '暂无内容',
            message: '点击"新建内容"按钮开始创建',
            ...options
        };
    }

    render() {
        const { icon, title, message } = this.options;
        
        return `
            <div class="empty-state">
                <p style="font-size: 48px; margin: 0;">${icon}</p>
                <p style="font-size: 18px; font-weight: bold;">${title}</p>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * 预定义的空状态
     */
    static noContent() {
        return new EmptyState({
            icon: '📝',
            title: '暂无内容',
            message: '内容将通过管理后台添加'
        });
    }

    static error() {
        return new EmptyState({
            icon: '⚠️',
            title: '加载失败',
            message: '请刷新页面重试'
        });
    }

    static loading() {
        return new EmptyState({
            icon: '⏳',
            title: '加载中...',
            message: ''
        });
    }
}
