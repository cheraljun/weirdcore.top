/**
 * 管理后台内容管理页面（新版）
 */
import { AdminContentPageBase } from '../core/AdminContentPageBase.js';
import { ADMIN_PAGE_CONFIG } from '../config/pageConfigs.js';

// 全局变量，供 HTML 中的 onclick 调用
let contentManager;

// 全局函数
window.closeEditor = function() {
    if (contentManager) {
        contentManager.closeEditor();
    }
};

// 暴露 contentManager 到全局作用域
window.contentManager = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    contentManager = new AdminContentPageBase(ADMIN_PAGE_CONFIG);
    // 同时设置到 window 对象上
    window.contentManager = contentManager;
});

export default AdminContentPageBase;
