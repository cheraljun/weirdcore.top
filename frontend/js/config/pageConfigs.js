/**
 * 页面配置
 * 统一管理所有页面的配置信息
 */

/**
 * 用户端页面配置
 */
export const USER_PAGE_CONFIGS = {
    research: {
        type: 'research',
        containerId: 'posts-container',
        emptyIcon: '📝',
        emptyTitle: '暂无文章',
        emptyMessage: ''
    },
    media: {
        type: 'media',
        containerId: 'media-container',
        emptyIcon: '🎬',
        emptyTitle: '暂无内容',
        emptyMessage: ''
    },
    activity: {
        type: 'activity',
        containerId: 'activity-container',
        emptyIcon: '📅',
        emptyTitle: '暂无活动记录',
        emptyMessage: ''
    },
    shop: {
        type: 'shop',
        containerId: 'shop-container',
        emptyIcon: '🛒',
        emptyTitle: '暂无商品',
        emptyMessage: ''
    }
};

/**
 * 管理后台页面配置
 */
export const ADMIN_PAGE_CONFIG = {
    defaultType: 'research',
    types: {
        research: {
            title: '研究文章管理',
            subtitle: '管理您的研究文章内容',
            icon: '📝'
        },
        media: {
            title: '媒体内容管理',
            subtitle: '管理您的媒体内容',
            icon: '🎬'
        },
        activity: {
            title: '活动记录管理',
            subtitle: '管理您的活动记录',
            icon: '📅'
        },
        shop: {
            title: '商店商品管理',
            subtitle: '管理您的商店商品',
            icon: '🛒'
        }
    }
};

/**
 * 导航图标配置
 * 支持多种格式，优先级：gif > png
 */
export const NAV_ICON_CONFIG = {
    research: {
        name: 'nav-research',
        alt: '研究',
        formats: ['gif', 'png']
    },
    media: {
        name: 'nav-media',
        alt: '媒体',
        formats: ['gif', 'png']
    },
    activity: {
        name: 'nav-activity',
        alt: '活动',
        formats: ['gif', 'png']
    },
    shop: {
        name: 'nav-shop',
        alt: '商店',
        formats: ['gif', 'png']
    },
    chat: {
        name: 'nav-chat',
        alt: '留言',
        formats: ['gif', 'png']
    }
};