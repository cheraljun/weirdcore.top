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
        this.pollInterval = null; // 轮询定时器
        
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
        
        // 开始轮询新消息（每3秒检查一次）
        this.startPolling();
    }

    handleLogout() {
        if (this.currentUser) {
            this.addSystemMessage(`${this.currentUser} 离开了聊天室`);
        }
        
        this.currentUser = null;
        this.showLoginView();
        
        // 停止轮询
        this.stopPolling();
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

    async sendMessage() {
        const text = this.messageInput.value.trim();
        
        if (!text || !this.currentUser) {
            return;
        }

        const message = {
            user: this.currentUser,
            text: text,
            timestamp: new Date().toISOString()
        };

        try {
            // 发送到服务器
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                throw new Error('发送失败');
            }

            // 立即显示消息
            this.addMessage(message);
            this.messageInput.value = '';
            this.messageInput.focus();
        } catch (error) {
            console.error('发送消息失败:', error);
            alert('发送失败，请重试');
        }
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

    // 服务器消息相关
    async loadMessages() {
        try {
            const response = await fetch('/api/chat/messages');
            const data = await response.json();
            
            this.messages = data.messages || [];
            
            // 清空容器
            this.messagesContainer.innerHTML = '';
            
            // 渲染所有消息
            this.messages.forEach(msg => {
                this.renderMessage(msg);
            });
            
            this.scrollToBottom();
        } catch (e) {
            console.error('加载消息失败:', e);
        }
    }

    startPolling() {
        // 每3秒检查新消息
        this.pollInterval = setInterval(() => {
            this.checkNewMessages();
        }, 3000);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    async checkNewMessages() {
        try {
            const response = await fetch('/api/chat/messages');
            const data = await response.json();
            
            const serverMessages = data.messages || [];
            
            // 检查是否有新消息
            if (serverMessages.length > this.messages.length) {
                // 只渲染新消息
                const newMessages = serverMessages.slice(this.messages.length);
                newMessages.forEach(msg => {
                    this.renderMessage(msg);
                });
                this.messages = serverMessages;
                this.scrollToBottom();
            }
        } catch (e) {
            console.error('检查新消息失败:', e);
        }
    }
}

// 初始化聊天应用
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

export default ChatApp;
