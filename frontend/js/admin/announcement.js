/**
 * 公告管理页面 - Word风格富文本编辑器
 */

class AnnouncementEditor {
    constructor() {
        this.token = localStorage.getItem('admin_token');
        
        // 检查登录状态
        if (!this.token) {
            window.location.href = '/admin/login';
            return;
        }

        this.initElements();
        this.bindEvents();
        this.loadAnnouncement();
    }

    initElements() {
        this.editor = document.getElementById('rich-editor');
        this.saveBtn = document.getElementById('save-btn');
        this.previewBtn = document.getElementById('preview-btn');
        this.backBtn = document.getElementById('back-btn');
        this.statusSelect = document.getElementById('announcement-status');
        this.statusMessage = document.getElementById('status-message');
    }

    bindEvents() {
        this.saveBtn.addEventListener('click', () => this.saveAnnouncement());
        this.previewBtn.addEventListener('click', () => this.previewAnnouncement());
        this.backBtn.addEventListener('click', () => window.location.href = '/admin');
        
        // 图片拖拽上传
        this.editor.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.editor.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.editor.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 粘贴图片
        this.editor.addEventListener('paste', (e) => this.handlePaste(e));
        
        // 点击图片删除
        this.editor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                if (confirm('删除这张图片？')) {
                    e.target.remove();
                }
            }
        });
    }

    async loadAnnouncement() {
        try {
            const response = await fetch('/api/announcement/admin', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderContent(data.items || []);
                this.statusSelect.value = data.status || 'published';
            }
        } catch (error) {
            console.error('加载公告失败:', error);
            this.showMessage('加载公告失败', 'error');
        }
    }

    renderContent(items) {
        this.editor.innerHTML = '';
        
        items.forEach(item => {
            if (item.type === 'text') {
                // 按行分割文字，每行创建一个段落
                const lines = item.content.split('\n');
                lines.forEach(line => {
                    const p = document.createElement('p');
                    p.textContent = line || '\u00A0'; // 空行用不换行空格
                    this.editor.appendChild(p);
                });
            } else if (item.type === 'image') {
                const img = document.createElement('img');
                img.src = item.content;
                img.alt = '公告图片';
                img.dataset.uploaded = 'true'; // 标记已上传
                this.editor.appendChild(img);
            }
        });
        
        // 如果编辑器为空，添加一个空段落
        if (this.editor.childNodes.length === 0) {
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            this.editor.appendChild(p);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.editor.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.editor.classList.remove('drag-over');
    }

    async handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.editor.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length === 0) return;
        
        // 只处理图片文件
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            alert('请拖拽图片文件');
            return;
        }
        
        // 上传所有图片
        for (const file of imageFiles) {
            await this.uploadAndInsertImage(file);
        }
    }

    async handlePaste(e) {
        const items = e.clipboardData.items;
        
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                await this.uploadAndInsertImage(file);
            }
        }
    }

    async uploadAndInsertImage(file) {
        try {
            // 显示加载提示
            const loadingImg = document.createElement('img');
            loadingImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50" font-size="12">上传中...</text></svg>';
            loadingImg.style.opacity = '0.5';
            this.editor.appendChild(loadingImg);
            
            // 上传图片
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('上传失败');
            }

            const result = await response.json();
            
            // 替换加载图片为实际图片
            loadingImg.src = result.url;
            loadingImg.style.opacity = '1';
            loadingImg.dataset.uploaded = 'true';
            
        } catch (error) {
            console.error('图片上传失败:', error);
            alert('图片上传失败: ' + error.message);
        }
    }

    parseEditorContent() {
        const items = [];
        const children = this.editor.childNodes;
        
        let textBuffer = [];
        
        const flushText = () => {
            if (textBuffer.length > 0) {
                items.push({
                    type: 'text',
                    content: textBuffer.join('\n')
                });
                textBuffer = [];
            }
        };
        
        children.forEach(node => {
            if (node.tagName === 'IMG') {
                // 先保存之前的文字
                flushText();
                // 添加图片
                items.push({
                    type: 'image',
                    content: node.src
                });
            } else if (node.tagName === 'P' || node.tagName === 'DIV') {
                // 提取文字
                const text = node.textContent.trim();
                textBuffer.push(text);
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    textBuffer.push(text);
                }
            }
        });
        
        // 保存剩余的文字
        flushText();
        
        return items;
    }

    async saveAnnouncement() {
        const items = this.parseEditorContent();
        
        if (items.length === 0) {
            this.showMessage('公告内容不能为空', 'error');
            return;
        }

        this.saveBtn.disabled = true;
        this.saveBtn.textContent = '保存中...';

        try {
            const response = await fetch('/api/announcement', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    items: items,
                    status: this.statusSelect.value
                })
            });

            if (response.ok) {
                this.showMessage('公告保存成功！', 'success');
            } else if (response.status === 401) {
                this.showMessage('登录已过期，请重新登录', 'error');
                setTimeout(() => {
                    localStorage.removeItem('admin_token');
                    window.location.href = '/admin/login';
                }, 2000);
            } else {
                const error = await response.json();
                this.showMessage('保存失败：' + (error.detail || '未知错误'), 'error');
            }
        } catch (error) {
            console.error('保存失败:', error);
            this.showMessage('保存失败：' + error.message, 'error');
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.textContent = '保存公告';
        }
    }

    previewAnnouncement() {
        window.open('/', '_blank');
    }

    showMessage(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        
        setTimeout(() => {
            this.statusMessage.className = 'status-message';
        }, 3000);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new AnnouncementEditor();
});

export default AnnouncementEditor;