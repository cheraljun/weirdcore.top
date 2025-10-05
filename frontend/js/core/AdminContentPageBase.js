/**
 * 管理后台内容页面基类
 * 统一管理所有内容类型的 CRUD 操作
 */
import { api } from '../utils/apiClient.js';
import { ContentCard } from '../components/ContentCard.js';
import { EmptyState } from '../components/EmptyState.js';
import { HtmlHelpers } from '../utils/htmlHelpers.js';
import { ImageUploader } from '../components/ImageUploader.js';

export class AdminContentPageBase {
    constructor(config) {
        this.config = config;
        this.token = localStorage.getItem('admin_token');
        this.currentType = this.getTypeFromUrl() || config.defaultType || 'research';
        this.posts = [];
        this.editingPostId = null;
        this.imageUploader = null;

        // 检查登录状态
        if (!this.token) {
            window.location.href = '/admin/login';
            return;
        }

        api.setToken(this.token);
        
        this.initElements();
        this.bindEvents();
        this.initImageUploader();
        this.updateUI();
        this.loadContent();
    }

    /**
     * 从 URL 获取类型参数
     */
    getTypeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('type');
    }

    /**
     * 初始化 DOM 元素
     */
    initElements() {
        // 菜单
        this.menuItems = document.querySelectorAll('.menu-item[data-type]');
        
        // 按钮
        this.addBtn = document.getElementById('add-btn');
        this.saveBtn = document.getElementById('save-btn');
        
        // 容器
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

    /**
     * 绑定事件
     */
    bindEvents() {
        // 菜单切换
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                this.switchType(type);
            });
        });

        // 新建按钮
        this.addBtn?.addEventListener('click', () => {
            this.openEditor();
        });

        // 保存按钮
        this.saveBtn?.addEventListener('click', () => {
            this.saveContent();
        });

        // 编辑器背景点击关闭
        this.editorOverlay?.addEventListener('click', (e) => {
            if (e.target === this.editorOverlay) {
                this.closeEditor();
            }
        });

        // 表单提交
        this.contentForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContent();
        });
    }

    /**
     * 更新 UI（标题、菜单状态）
     */
    updateUI() {
        // 更新菜单激活状态
        this.menuItems.forEach(item => {
            item.classList.toggle('active', item.dataset.type === this.currentType);
        });
        
        // 更新页面标题
        const config = this.config.types[this.currentType];
        if (config && this.pageTitle) {
            this.pageTitle.textContent = config.title;
            if (this.pageSubtitle) {
                this.pageSubtitle.textContent = config.subtitle;
            }
        }
    }

    /**
     * 切换内容类型
     */
    switchType(type) {
        window.location.href = `/admin/content?type=${type}`;
    }

    /**
     * 加载内容
     */
    async loadContent() {
        this.showLoading(true);
        this.hideError();
        
        try {
            this.posts = await api.get(`/admin/${this.currentType}`, { auth: true });
            this.render();
        } catch (error) {
            console.error('加载内容失败:', error);
            
            if (error.message.includes('401')) {
                // Token 过期
                localStorage.removeItem('admin_token');
                window.location.href = '/admin/login';
            } else {
                this.showError('加载内容失败，请刷新重试');
            }
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 渲染内容列表
     */
    render() {
        if (this.posts.length === 0) {
            const emptyState = new EmptyState({
                icon: '📝',
                title: '暂无内容',
                message: '点击"新建内容"按钮开始创建'
            });
            this.contentList.innerHTML = emptyState.render();
            return;
        }

        this.contentList.innerHTML = this.posts
            .map(post => this.renderPost(post))
            .join('');
    }

    /**
     * 渲染单个文章
     */
    renderPost(post) {
        const card = new ContentCard(post, { showActions: true, truncate: true });
        return card.render();
    }

    /**
     * 初始化图片上传器
     */
    initImageUploader() {
        this.imageUploader = new ImageUploader({
            multiple: true,
            maxFiles: 20
        });
        
        // 插入到编辑器中
        const uploaderContainer = document.getElementById('image-uploader-container');
        if (uploaderContainer) {
            uploaderContainer.appendChild(this.imageUploader.render());
        }
    }

    /**
     * 打开编辑器
     */
    openEditor(post = null) {
        this.editingPostId = post ? post.id : null;
        
        if (post) {
            // 编辑模式
            this.editorTitle.textContent = '编辑内容';
            this.postId.value = post.id;
            this.postTitle.value = post.title || '';
            this.postContent.value = post.content;
            this.postStatus.value = post.status;
            
            // 设置已有图片
            if (post.images && post.images.length > 0) {
                this.imageUploader.setImages(post.images);
            } else {
                this.imageUploader.clear();
            }
        } else {
            // 新建模式
            this.editorTitle.textContent = '新建内容';
            this.contentForm.reset();
            this.postId.value = '';
            this.imageUploader.clear();
        }
        
        this.editorOverlay.classList.add('show');
        this.postContent.focus();
    }

    /**
     * 关闭编辑器
     */
    closeEditor() {
        this.editorOverlay.classList.remove('show');
        this.contentForm.reset();
        this.editingPostId = null;
    }

    /**
     * 保存内容
     */
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
                images: this.imageUploader.getUploadedImages(), // 获取上传的图片
                links: [],
                status: status
            };

            if (this.editingPostId) {
                // 更新
                await api.put(`/admin/${this.currentType}/${this.editingPostId}`, data, { auth: true });
            } else {
                // 创建
                await api.post(`/admin/${this.currentType}`, data, { auth: true });
            }

            this.closeEditor();
            this.loadContent();
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败: ' + error.message);
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.textContent = '保存';
        }
    }

    /**
     * 编辑文章
     */
    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            this.openEditor(post);
        }
    }

    /**
     * 删除文章
     */
    async deletePost(postId) {
        if (!confirm('确定要删除这条内容吗？此操作无法撤销。')) {
            return;
        }

        try {
            await api.delete(`/admin/${this.currentType}/${postId}`, { auth: true });
            this.loadContent();
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败，请重试');
        }
    }

    /**
     * 显示/隐藏加载状态
     */
    showLoading(show) {
        if (this.loading) {
            this.loading.style.display = show ? 'block' : 'none';
        }
        if (this.contentList) {
            this.contentList.style.display = show ? 'none' : 'flex';
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `
                <div class="error-message">${HtmlHelpers.escapeHtml(message)}</div>
            `;
        }
    }

    /**
     * 隐藏错误信息
     */
    hideError() {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = '';
        }
    }
}
