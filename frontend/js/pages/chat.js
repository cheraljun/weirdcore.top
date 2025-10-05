/**
 * 聊天页面逻辑
 */

class ChatApp {
    constructor() {
        this.currentUser = null;
        this.messages = [];
        this.userColors = new Map(); // 存储用户颜色映射
        this.colorIndex = 1;
        this.maxColors = 6;
        
        this.initElements();
        this.bindEvents();
        this.loadMessages();
    }

    initElements() {
        // 视图元素
        this.loginView = document.getElementById('login-view');
        this.chatView = document.getElementById('chat-view');
        
        // 登录相关
        this.loginForm = document.getElementById('login-form');
        this.usernameInput = document.getElementById('username-input');
        this.logoutBtn = document.getElementById('logout-btn');
        
        // 聊天相关
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.chatStatus = document.getElementById('chat-status');
        
        // 标签页
        this.tabs = document.querySelectorAll('.chat-tab');
    }

    bindEvents() {
        // 登录
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // 登出
        this.logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });

        // 发送消息
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 标签页切换（仅UI效果）
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    handleLogin() {
        const username = this.usernameInput.value.trim();
        
        if (!username) {
            alert('请输入用户名');
            return;
        }

        if (username.length < 2) {
            alert('用户名至少需要2个字符');
            return;
        }

        this.currentUser = username;
        this.showChatView();
        this.addSystemMessage(`${username} 加入了聊天室`);
        
        // 保存到 localStorage
        localStorage.setItem('chatUsername', username);
    }

    handleLogout() {
        if (this.currentUser) {
            this.addSystemMessage(`${this.currentUser} 离开了聊天室`);
        }
        
        this.currentUser = null;
        this.showLoginView();
        
        // 清除 localStorage
        localStorage.removeItem('chatUsername');
    }

    showLoginView() {
        this.loginView.classList.remove('hidden');
        this.chatView.classList.add('hidden');
        this.logoutBtn.style.display = 'none';
        this.chatStatus.textContent = 'Log in to chat';
        this.chatStatus.className = 'chat-status';
        this.usernameInput.value = '';
        this.usernameInput.focus();
    }

    showChatView() {
        this.loginView.classList.add('hidden');
        this.chatView.classList.remove('hidden');
        this.logoutBtn.style.display = 'inline-block';
        this.chatStatus.textContent = `已登录: ${this.currentUser}`;
        this.chatStatus.className = 'chat-status online';
        this.messageInput.focus();
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        
        if (!text || !this.currentUser) {
            return;
        }

        const message = {
            user: this.currentUser,
            text: text,
            timestamp: new Date()
        };

        this.addMessage(message);
        this.messageInput.value = '';
        this.messageInput.focus();
        
        // 保存消息
        this.saveMessages();
    }

    addMessage(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    addSystemMessage(text) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message message-system';
        messageEl.textContent = `*** ${text} ***`;
        
        this.messagesContainer.appendChild(messageEl);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        
        const time = this.formatTime(message.timestamp);
        const color = this.getUserColor(message.user);
        
        messageEl.innerHTML = `
            <span class="message-time">[${time}]</span>
            <span class="message-user color-${color}">&lt;${this.escapeHtml(message.user)}&gt;</span>
            <span class="message-text">${this.escapeHtml(message.text)}</span>
        `;
        
        this.messagesContainer.appendChild(messageEl);
    }

    getUserColor(username) {
        if (!this.userColors.has(username)) {
            this.userColors.set(username, this.colorIndex);
            this.colorIndex = (this.colorIndex % this.maxColors) + 1;
        }
        return this.userColors.get(username);
    }

    formatTime(date) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    // 本地存储相关
    saveMessages() {
        try {
            // 只保存最近50条消息
            const recentMessages = this.messages.slice(-50);
            localStorage.setItem('chatMessages', JSON.stringify(recentMessages));
        } catch (e) {
            console.error('保存消息失败:', e);
        }
    }

    loadMessages() {
        try {
            // 加载保存的消息
            const saved = localStorage.getItem('chatMessages');
            if (saved) {
                this.messages = JSON.parse(saved);
                this.messages.forEach(msg => {
                    msg.timestamp = new Date(msg.timestamp);
                    this.renderMessage(msg);
                });
            }

            // 检查是否有保存的用户名
            const savedUsername = localStorage.getItem('chatUsername');
            if (savedUsername) {
                this.usernameInput.value = savedUsername;
            }
        } catch (e) {
            console.error('加载消息失败:', e);
        }
    }
}

// 初始化聊天应用
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

export default ChatApp;
