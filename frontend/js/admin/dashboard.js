/**
 * 管理后台仪表板逻辑
 */

class AdminDashboard {
    constructor() {
        this.token = localStorage.getItem('admin_token');
        this.username = localStorage.getItem('admin_username');
        
        // 检查登录状态
        if (!this.token) {
            window.location.href = '/admin/login';
            return;
        }

        this.initElements();
        this.bindEvents();
        this.loadDashboardData();
        this.displayUsername();
    }

    initElements() {
        this.logoutBtn = document.getElementById('logout-btn');
        this.menuItems = document.querySelectorAll('.menu-item');
        
        // 统计数据元素
        this.researchCount = document.getElementById('research-count');
        this.mediaCount = document.getElementById('media-count');
        this.activityCount = document.getElementById('activity-count');
        this.shopCount = document.getElementById('shop-count');
    }

    bindEvents() {
        // 登出
        this.logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });

        // 菜单项点击
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.handleMenuClick(page, item);
            });
        });
    }

    displayUsername() {
        const usernameEl = document.getElementById('username');
        if (usernameEl && this.username) {
            usernameEl.textContent = this.username;
        }
    }

    async loadDashboardData() {
        try {
            // 加载各个类型的内容数量
            const types = ['research', 'media', 'activity', 'shop'];
            
            for (const type of types) {
                const count = await this.getContentCount(type);
                this.updateCount(type, count);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
        }
    }

    async getContentCount(type) {
        try {
            const response = await fetch(`/api/draft/${type}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.posts ? data.posts.length : 0;
            } else if (response.status === 401) {
                // Token 过期
                this.handleLogout();
            }
        } catch (error) {
            console.error(`加载 ${type} 数据失败:`, error);
        }
        return 0;
    }

    updateCount(type, count) {
        const countEl = document.getElementById(`${type}-count`);
        if (countEl) {
            countEl.textContent = count;
        }
    }

    handleMenuClick(page, menuItem) {
        // 更新菜单激活状态
        this.menuItems.forEach(item => item.classList.remove('active'));
        menuItem.classList.add('active');

        // 根据页面类型进行导航
        if (page === 'dashboard') {
            // 刷新仪表板
            window.location.reload();
        } else if (page === 'announcement') {
            // 跳转到公告管理页面
            window.location.href = '/admin/announcement';
        } else if (page === 'chat') {
            alert('聊天记录功能开发中...');
        } else {
            // 跳转到内容管理页面，并通过 URL 参数传递类型
            window.location.href = `/admin/content?type=${page}`;
        }
    }

    getPageTitle(page) {
        const titles = {
            'research': '研究管理',
            'media': '媒体管理',
            'activity': '活动管理',
            'shop': '商店管理',
            'chat': '聊天记录'
        };
        return titles[page] || page;
    }

    handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_username');
            window.location.href = '/admin/login';
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});

export default AdminDashboard;
