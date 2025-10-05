/**
 * 实时搜索页面
 */
import { api } from '../utils/apiClient.js';
import { formatDate, formatContent, escapeHtml } from '../utils/htmlHelpers.js';

class SearchPage {
    constructor() {
        this.keyword = '';
        this.allResults = {
            research: [],
            media: [],
            activity: [],
            shop: []
        };
        this.currentCategory = 'research';
        this.searchTimeout = null;
        this.init();
    }

    init() {
        // 获取初始搜索关键词
        this.keyword = sessionStorage.getItem('searchKeyword') || '';
        
        const searchInput = document.getElementById('search-input-page');
        if (this.keyword) {
            searchInput.value = this.keyword;
            this.performSearch();
        }

        // 实时搜索
        searchInput.addEventListener('input', (e) => {
            this.keyword = e.target.value.trim();
            
            // 防抖：500ms后才搜索
            clearTimeout(this.searchTimeout);
            
            if (this.keyword) {
                this.searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            } else {
                this.showEmptyState();
            }
        });

        this.renderCategoryNav();
    }

    async performSearch() {
        this.showLoading();

        try {
            // 并发搜索所有类型
            const types = ['research', 'media', 'activity', 'shop'];
            const promises = types.map(type => this.searchContent(type));
            const results = await Promise.all(promises);

            // 保存结果
            types.forEach((type, index) => {
                this.allResults[type] = results[index];
            });

            // 更新界面
            this.updateStats();
            this.renderCategoryNav();
            this.renderDetail();

        } catch (error) {
            console.error('搜索失败:', error);
            this.showError();
        }
    }

    async searchContent(type) {
        try {
            const response = await api.get(`/api/public/${type}`);
            
            // 过滤并排序
            return response
                .filter(item => this.matchKeyword(item))
                .sort((a, b) => {
                    // 按相关度排序
                    const aScore = this.calculateRelevance(a);
                    const bScore = this.calculateRelevance(b);
                    if (aScore !== bScore) return bScore - aScore;
                    // 按时间排序
                    return new Date(b.created_at) - new Date(a.created_at);
                });
        } catch (error) {
            console.error(`搜索 ${type} 失败:`, error);
            return [];
        }
    }

    matchKeyword(item) {
        if (!this.keyword) return false;
        
        const keyword = this.keyword.toLowerCase();
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        
        return title.includes(keyword) || content.includes(keyword);
    }

    calculateRelevance(item) {
        const keyword = this.keyword.toLowerCase();
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        
        let score = 0;
        
        if (title === keyword) score += 10;
        else if (title.includes(keyword)) score += 5;
        if (content.includes(keyword)) score += 1;
        
        const titleCount = (title.match(new RegExp(keyword, 'g')) || []).length;
        const contentCount = (content.match(new RegExp(keyword, 'g')) || []).length;
        score += titleCount * 2 + contentCount * 0.5;
        
        return score;
    }

    updateStats() {
        const total = Object.values(this.allResults).reduce((sum, arr) => sum + arr.length, 0);
        const statsEl = document.getElementById('search-stats');
        
        if (total > 0) {
            statsEl.textContent = `找到 ${total} 条结果`;
            statsEl.style.color = '#4caf50';
        } else {
            statsEl.textContent = '没有找到匹配的内容';
            statsEl.style.color = '#999';
        }
    }

    renderCategoryNav() {
        const nav = document.getElementById('category-nav');
        
        const categories = {
            research: '研究',
            media: '媒体',
            activity: '活动',
            shop: '商店'
        };

        const html = Object.entries(categories).map(([key, name]) => {
            const count = this.allResults[key].length;
            const isActive = this.currentCategory === key;
            
            return `
                <div class="category-item ${isActive ? 'active' : ''}" 
                     data-category="${key}"
                     style="
                         padding: 15px 20px;
                         border-bottom: 1px solid var(--darkbrown);
                         cursor: pointer;
                         display: flex;
                         justify-content: space-between;
                         align-items: center;
                         background: ${isActive ? 'var(--darkbrown)' : 'var(--white)'};
                         color: ${isActive ? 'var(--white)' : 'var(--darkbrown)'};
                         transition: 0.2s;
                     ">
                    <span style="font-weight: ${isActive ? 'bold' : 'normal'};">${name}</span>
                    <span style="
                        background: ${isActive ? 'var(--white)' : '#e0e0e0'};
                        color: ${isActive ? 'var(--darkbrown)' : '#666'};
                        padding: 2px 8px;
                        border-radius: 10px;
                        font-size: 12px;
                    ">${count}</span>
                </div>
            `;
        }).join('');

        nav.innerHTML = html;

        // 绑定点击事件
        nav.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentCategory = item.dataset.category;
                this.renderCategoryNav();
                this.renderDetail();
            });

            // 悬停效果
            if (!item.classList.contains('active')) {
                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f0f0f0';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'var(--white)';
                });
            }
        });
    }

    renderDetail() {
        const panel = document.getElementById('detail-panel');
        const results = this.allResults[this.currentCategory];

        if (!this.keyword) {
            panel.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #999;">
                    请输入关键词开始搜索
                </div>
            `;
            return;
        }

        if (results.length === 0) {
            panel.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #999;">
                    该分类下没有匹配的内容
                </div>
            `;
            return;
        }

        const categoryNames = {
            research: '研究',
            media: '媒体',
            activity: '活动',
            shop: '商店'
        };

        const html = `
            <div style="padding: 20px;">
                <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid var(--darkbrown);">
                    <h3 style="margin: 0; color: var(--darkbrown);">
                        ${categoryNames[this.currentCategory]} 
                        <span style="color: #999; font-size: 14px; font-weight: normal;">
                            (${results.length} 条)
                        </span>
                    </h3>
                </div>
                
                ${results.map(item => this.renderItem(item)).join('')}
            </div>
        `;

        panel.innerHTML = html;
        panel.scrollTop = 0;
    }

    renderItem(item) {
        const highlightedTitle = item.title ? this.highlightText(item.title) : '无标题';
        const highlightedContent = this.getHighlightedExcerpt(item.content || '');
        
        return `
            <div style="
                background: var(--white);
                border: 1px solid var(--darkbrown);
                margin-bottom: 15px;
                padding: 15px;
                transition: 0.2s;
            " onmouseover="this.style.boxShadow='2px 2px 0 var(--darkbrown)'" 
               onmouseout="this.style.boxShadow='none'">
                
                ${item.title ? `
                    <h4 style="margin: 0 0 10px 0; font-size: 16px; color: var(--darkbrown);">
                        ${highlightedTitle}
                    </h4>
                ` : ''}
                
                <div style="color: #666; line-height: 1.8; margin-bottom: 10px; font-size: 14px;">
                    ${highlightedContent}
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #999;">
                    <span>📅 ${formatDate(item.created_at)}</span>
                    ${item.images && item.images.length > 0 ? `
                        <span>🖼️ ${item.images.length} 张图片</span>
                    ` : ''}
                </div>
                
                ${item.images && item.images.length > 0 ? `
                    <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                        ${item.images.slice(0, 4).map(img => `
                            <img src="${img}" alt="图片" 
                                 style="width: 80px; height: 80px; object-fit: cover; border: 1px solid #ddd; cursor: pointer;"
                                 onclick="window.open('${img}', '_blank')">
                        `).join('')}
                        ${item.images.length > 4 ? `
                            <div style="width: 80px; height: 80px; background: #f0f0f0; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; color: #666;">
                                +${item.images.length - 4}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    getHighlightedExcerpt(content) {
        if (!content) return '';
        
        const keyword = this.keyword.toLowerCase();
        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(keyword);
        
        let excerpt;
        if (index === -1) {
            // 没有关键词，显示开头
            excerpt = content.substring(0, 200);
        } else {
            // 截取关键词前后的内容
            const start = Math.max(0, index - 80);
            const end = Math.min(content.length, index + keyword.length + 80);
            excerpt = content.substring(start, end);
            
            if (start > 0) excerpt = '...' + excerpt;
            if (end < content.length) excerpt = excerpt + '...';
        }
        
        return this.highlightText(excerpt);
    }

    highlightText(text) {
        if (!this.keyword) return escapeHtml(text);
        
        const escapedText = escapeHtml(text);
        const keyword = this.escapeRegex(this.keyword);
        const regex = new RegExp(`(${keyword})`, 'gi');
        
        return escapedText.replace(regex, '<mark style="background: #ffeb3b; padding: 1px 3px; font-weight: bold;">$1</mark>');
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    showLoading() {
        document.getElementById('detail-panel').innerHTML = `
            <div style="padding: 30px; text-align: center; color: #999;">
                🔍 搜索中...
            </div>
        `;
    }

    showEmptyState() {
        document.getElementById('search-stats').textContent = '';
        this.allResults = { research: [], media: [], activity: [], shop: [] };
        this.renderCategoryNav();
        document.getElementById('detail-panel').innerHTML = `
            <div style="padding: 30px; text-align: center; color: #999;">
                请输入关键词开始搜索
            </div>
        `;
    }

    showError() {
        document.getElementById('detail-panel').innerHTML = `
            <div style="padding: 30px; text-align: center; color: #f44336;">
                ⚠️ 搜索失败，请稍后再试
            </div>
        `;
    }
}

// 初始化搜索页面
new SearchPage();