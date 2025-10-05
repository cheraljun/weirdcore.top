/**
 * 主入口文件
 * 处理全局功能
 */

// 时钟功能（如果需要）
function startTime() {
    const today = new Date();
    const h = today.getHours();
    const m = today.getMinutes();
    const s = today.getSeconds();
    document.getElementById('clock')?.innerHTML = 
        `${checkTime(h)}:${checkTime(m)}:${checkTime(s)}`;
    setTimeout(startTime, 1000);
}

function checkTime(i) {
    return i < 10 ? "0" + i : i;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('weirdcore store 已就绪！');
    
    // 如果有时钟元素，启动时钟
    if (document.getElementById('clock')) {
        startTime();
    }
});

export { startTime };

