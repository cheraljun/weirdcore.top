/**
 * 内容管理页面逻辑
 */

class ContentManager {
    constructor() {
        this.token = localStorage.getItem('admin_token');
        
        // 从 URL 参数获取类型，默认为 research
        const urlParams = new URLSearchParams(window.location.search);
        this.currentType = urlParams.get('type') || 'research';
        
        this.posts = [];
        this.editingPostId = null;

        // 检查登录状态
        if (!this.token) {
            window.location.href = '/admin/login';
            return;
        }

        this.initElements();
        this.bindEvents();
        this.updateUIForType();
        this.loadContent();
    }

    updateUIForType() {
        // 更新菜单激活状态
        this.menuItems.forEach(item => {
            item.classList.toggle('active', item.dataset.type === this.currentType);
        });
        
        // 更新页面标题
        const titles = {
            'research': { title: '研究文章管理', subtitle: '管理您的研究文章内容' },
            'media': { title: '媒体内容管理', subtitle: '管理您的媒体内容' },
            'activity': { title: '活动记录管理', subtitle: '管理您的活动记录' },
            'shop': { title: '商店商品管理', subtitle: '管理您的商店商品' }
        };
        
        const config = titles[this.currentType];
        this.pageTitle.textContent = config.title;
        this.pageSubtitle.textContent = config.subtitle;
    }

    initElements() {
        // 菜单
        this.menuItems = document.querySelectorAll('.menu-item[data-type]');
        
        // 按钮
        this.addBtn = document.getElementById('add-btn');
        this.saveBtn = document.getElementById('save-btn');
        
        // 列表和加载状态
        this.contentList = document.getElementById('content-list');
        this.loading = document.getElementById('loading');
        this.errorContainer = document.getElementById('error-container');
        
        // 编辑器
        this.editorOverlay = document.getElementById('editor-overlay');
        this.editorTitle = document.getElementById('editor-title');
        this.contentForm = document.getElementById('content-form');
        
        // 表单字段
        this.postId = document.getElementById('post-id');
        this.postTitle = document.getElementById('post-title');
        this.postContent = document.getElementById('post-content');
        this.postStatus = document.getElementById('post-status');
        
        // 页面标题
        this.pageTitle = document.getElementById('page-title');
        this.pageSubtitle = document.getElementById('page-subtitle');
    }

    bindEvents() {
        // 菜单切换
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                this.switchType(type);
            });
        });

        // 新建按钮
        this.addBtn.addEventListener('click', () => {
            this.openEditor();
        });

        // 保存按钮
        this.saveBtn.addEventListener('click', () => {
            this.saveContent();
        });

        // 编辑器背景点击关闭
        this.editorOverlay.addEventListener('click', (e) => {
            if (e.target === this.editorOverlay) {
                this.closeEditor();
            }
        });

        // 表单提交
        this.contentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContent();
        });
    }

    switchType(type) {
        // 通过 URL 跳转，保持类型参数
        window.location.href = `/admin/content?type=${type}`;
    }

    async loadContent() {
        this.showLoading(true);
        this.hideError();
        
        try {
            const response = await fetch(`/api/admin/${this.currentType}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.posts = await response.json();
                this.renderContent();
            } else if (response.status === 401) {
                // Token 过期
                localStorage.removeItem('admin_token');
                window.location.href = '/admin/login';
            } else {
                throw new Error('加载失败');
            }
        } catch (error) {
            console.error('加载内容失败:', error);
            this.showError('加载内容失败，请刷新重试');
        } finally {
            this.showLoading(false);
        }
    }

    renderContent() {
        if (this.posts.length === 0) {
            this.contentList.innerHTML = `
                <div class="empty-state">
                    <p style="font-size: 48px; margin: 0;">📝</p>
                    <p style="font-size: 18px; font-weight: bold;">暂无内容</p>
                    <p>点击"新建内容"按钮开始创建</p>
                </div>
            `;
            return;
        }

        this.contentList.innerHTML = this.posts.map(post => `
            <div class="content-item" data-id="${post.id}">
                <div class="content-item-header">
                    <div>
                        ${post.title ? `<div class="content-item-title">${this.escapeHtml(post.title)}</div>` : ''}
                        <div class="content-item-meta">
                            ${this.formatDate(post.created_at)} 
                            ${post.status === 'draft' ? '· <span style="color: orange;">草稿</span>' : ''}
                        </div>
                    </div>
                    <div class="content-item-actions">
                        <button class="btn btn-sm" onclick="contentManager.editPost('${post.id}')">
                            编辑
                        </button>
                        <button class="btn btn-sm" onclick="contentManager.deletePost('${post.id}')" 
                                style="background: #c00; color: white;">
                            删除
                        </button>
                    </div>
                </div>
                <div class="content-item-text">
                    ${this.formatContent(post.content)}
                </div>
            </div>
        `).join('');
    }

    formatContent(content) {
        // 转义 HTML
        let text = this.escapeHtml(content);
        
        // 自动识别链接并转换
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank" style="color: blue; text-decoration: underline;">$1</a>');
        
        // 限制显示长度
        if (text.length > 200) {
            text = text.substring(0, 200) + '...';
        }
        
        // 保留换行
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    openEditor(post = null) {
        this.editingPostId = post ? post.id : null;
        
        if (post) {
            // 编辑模式
            this.editorTitle.textContent = '编辑内容';
            this.postId.value = post.id;
            this.postTitle.value = post.title || '';
            this.postContent.value = post.content;
            this.postStatus.value = post.status;
        } else {
            // 新建模式
            this.editorTitle.textContent = '新建内容';
            this.contentForm.reset();
            this.postId.value = '';
        }
        
        this.editorOverlay.classList.add('show');
        this.postContent.focus();
    }

    closeEditor() {
        this.editorOverlay.classList.remove('show');
        this.contentForm.reset();
        this.editingPostId = null;
    }

    async saveContent() {
        const title = this.postTitle.value.trim();
        const content = this.postContent.value.trim();
        const status = this.postStatus.value;

        if (!content) {
            alert('请输入内容');
            return;
        }

        this.saveBtn.disabled = true;
        this.saveBtn.textContent = '保存中...';

        try {
            const data = {
                title: title || null,
                content: content,
                images: [],
                links: [],
                status: status
            };

            let response;
            if (this.editingPostId) {
                // 更新
                response = await fetch(`/api/admin/${this.currentType}/${this.editingPostId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            } else {
                // 创建
                response = await fetch(`/api/admin/${this.currentType}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }

            if (response.ok) {
                this.closeEditor();
                this.loadContent();
            } else {
                const error = await response.json();
                alert('保存失败: ' + (error.detail || '未知错误'));
            }
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败，请重试');
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.textContent = '保存';
        }
    }

    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            this.openEditor(post);
        }
    }

    async deletePost(postId) {
        if (!confirm('确定要删除这条内容吗？此操作无法撤销。')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/${this.currentType}/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.loadContent();
            } else {
                alert('删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败，请重试');
        }
    }

    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
        this.contentList.style.display = show ? 'none' : 'flex';
    }

    showError(message) {
        this.errorContainer.innerHTML = `
            <div class="error-message">${message}</div>
        `;
    }

    hideError() {
        this.errorContainer.innerHTML = '';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 全局变量，供 HTML 中的 onclick 调用
let contentManager;

// 全局函数
window.closeEditor = function() {
    if (contentManager) {
        contentManager.closeEditor();
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    contentManager = new ContentManager();
});

export default ContentManager;
