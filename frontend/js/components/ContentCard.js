/**
 * 内容卡片组件
 */
import { HtmlHelpers } from '../utils/htmlHelpers.js';

export class ContentCard {
    constructor(post, options = {}) {
        this.post = post;
        this.options = {
            showActions: false,
            truncate: false,
            ...options
        };
    }

    /**
     * 渲染卡片
     */
    render() {
        const { post, options } = this;
        
        let content = HtmlHelpers.formatContent(post.content);
        if (options.truncate) {
            content = HtmlHelpers.truncate(content, 200);
        }

        return `
            <div class="content-item" data-id="${post.id}">
                ${this.renderHeader()}
                <div class="content-item-body">
                    ${post.title ? `<h3 class="content-item-title">${HtmlHelpers.escapeHtml(post.title)}</h3>` : ''}
                    <div class="content-item-text">${content}</div>
                    ${this.renderImages()}
                </div>
            </div>
        `;
    }

    /**
     * 渲染图片
     */
    renderImages() {
        const { post } = this;
        
        if (!post.images || post.images.length === 0) {
            return '';
        }

        return `
            <div class="content-images">
                ${post.images.map(img => `
                    <img src="${img}" alt="图片" class="content-image">
                `).join('')}
            </div>
        `;
    }

    /**
     * 渲染头部（包含元信息和操作按钮）
     */
    renderHeader() {
        const { post, options } = this;
        
        return `
            <div class="content-item-header">
                <div class="content-item-meta">
                    ${HtmlHelpers.formatDate(post.created_at)}
                    ${post.status === 'draft' ? ' · <span style="color: orange;">草稿</span>' : ''}
                </div>
                ${options.showActions ? this.renderActions() : ''}
            </div>
        `;
    }

    /**
     * 渲染操作按钮
     */
    renderActions() {
        return `
            <div class="content-item-actions">
                <button class="btn btn-sm" onclick="contentManager.editPost('${this.post.id}')">
                    编辑
                </button>
                <button class="btn btn-sm" onclick="contentManager.deletePost('${this.post.id}')" 
                        style="background: #c00; color: white;">
                    删除
                </button>
            </div>
        `;
    }

    /**
     * 渲染简单样式（用于用户端）
     */
    renderSimple() {
        const { post } = this;
        
        return `
            <div class="post">
                <div class="post-info">
                    <div class="info">
                        <div class="name">${HtmlHelpers.escapeHtml(post.author || 'Admin')}</div>
                        <div class="date">${HtmlHelpers.formatDate(post.created_at)}</div>
                    </div>
                </div>
                <div class="post-content">
                    ${post.title ? `<h3 style="margin: 0 0 10px 0;">${HtmlHelpers.escapeHtml(post.title)}</h3>` : ''}
                    ${HtmlHelpers.formatContent(post.content)}
                    ${this.renderImagesSimple()}
                </div>
            </div>
        `;
    }

    /**
     * 渲染图片（简单样式）
     */
    renderImagesSimple() {
        const { post } = this;
        
        if (!post.images || post.images.length === 0) {
            return '';
        }

        return `
            <div class="post-img" style="margin-top: 15px;">
                ${post.images.map(img => `
                    <img src="${img}" alt="图片" style="max-width: 100%; height: auto; margin-bottom: 10px; opacity: 0; transition: opacity 0.25s;" onload="this.style.opacity=1">
                `).join('')}
            </div>
        `;
    }
}
