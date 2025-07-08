document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('loggedInUsername');
    const userInfoContainer = document.querySelector('.user-info-container');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const roadHazardDetectionCard = document.getElementById('roadHazardDetectionCard');
    const cityTrafficVisualizationCard = document.getElementById('cityTrafficVisualizationCard');

    // 假设用户名在登录成功后保存在 localStorage 或 sessionStorage 中
    // 在实际后端系统中，这通常是一个JWT token或session ID
    const loggedInUser = localStorage.getItem('loggedInUser') || '访客'; // 从存储中获取用户名，如果不存在则显示“访客”
    usernameDisplay.textContent = loggedInUser;

    // 鼠标移入/移出用户名区域，显示/隐藏下拉菜单
    userInfoContainer.addEventListener('mouseenter', () => {
        userDropdown.classList.add('show');
    });

    userInfoContainer.addEventListener('mouseleave', () => {
        userDropdown.classList.remove('show');
    });

    // 点击退出登录按钮
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault(); // 阻止默认的链接跳转行为
        alert('您已退出登录！');
        localStorage.removeItem('loggedInUser'); // 清除保存的用户名（如果存在）
        // 跳转回登录页面
        window.location.href = 'index.html';
    });

    // 点击“路面危害检测”卡片
    roadHazardDetectionCard.addEventListener('click', () => {
        alert('即将跳转到路面危害检测界面...');
        window.location.href = 'road_hazard_detection.html'; // 跳转到路面危害检测页面
    });

    // 点击“城市交通特征”卡片
    cityTrafficVisualizationCard.addEventListener('click', () => {
        alert('即将跳转到城市交通特征可视化大屏...');
        window.location.href = 'city_traffic_visualization.html'; // 跳转到城市交通特征可视化页面
    });
});