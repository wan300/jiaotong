document.addEventListener('DOMContentLoaded', () => {
    // --- 头部用户和退出登录功能 ---
    const usernameDisplay = document.getElementById('loggedInUsername');
    const userInfoContainer = document.querySelector('.user-info-container');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToDashboardBtn = document.querySelector('.back-to-dashboard');

    const loggedInUser = localStorage.getItem('loggedInUser') || '访客';
    usernameDisplay.textContent = loggedInUser;

    userInfoContainer.addEventListener('mouseenter', () => {
        userDropdown.classList.add('show');
    });

    userInfoContainer.addEventListener('mouseleave', () => {
        userDropdown.classList.remove('show');
    });

    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        alert('您已退出登录！');
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });

    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'dashboard.html';
        });
    }

    // --- 侧边栏导航和内容切换 ---
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const visualizationImage = document.getElementById('visualizationImage');
    const imagePlaceholder = document.getElementById('imagePlaceholder');

    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止默认的链接跳转

            // 移除所有导航项的 active 类
            navItems.forEach(nav => nav.classList.remove('active'));
            // 添加当前点击项的 active 类
            item.classList.add('active');

            // 隐藏所有内容区域
            contentSections.forEach(section => section.classList.remove('active'));

            // 显示对应的内容区域
            const targetContentId = item.dataset.contentId;
            const targetContent = document.getElementById(targetContentId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // 切换内容区域时，清空图片输出区域
            clearImageOutput();
        });
    });

    // --- 首页查询功能 ---
    const utcTimeInput = document.getElementById('utcTimeInput');
    const vehicleGpsInput = document.getElementById('vehicleGpsInput');
    const vehicleTrajectoryInput = document.getElementById('vehicleTrajectoryInput');
    const queryButtons = document.querySelectorAll('.query-button');

    queryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const queryType = button.dataset.queryType;
            let queryValue = '';

            // 根据查询类型获取对应的输入值
            switch (queryType) {
                case 'utcTime':
                    queryValue = utcTimeInput.value;
                    handleUtcTimeQuery(queryValue);
                    break;
                case 'vehicleGps':
                    queryValue = vehicleGpsInput.value;
                    handleVehicleGpsQuery(queryValue);
                    break;
                case 'vehicleTrajectory':
                    queryValue = vehicleTrajectoryInput.value;
                    handleVehicleTrajectoryQuery(queryValue);
                    break;
                default:
                    console.warn('未知查询类型:', queryType);
            }
            console.log(`执行 ${queryType} 查询，输入内容: "${queryValue}"`);
            // 在这里可以调用后端API，并处理返回结果（如显示图片）
        });
    });

    // --- 查询方法（目前为空，待后端集成） ---
    function handleUtcTimeQuery(value) {
        if (value.trim() === '') {
            alert('请输入UTC时间！');
            return;
        }
        alert(`模拟查询UTC时间: ${value}`);
        // 模拟显示一张图片
        displayVisualizationImage('https://via.placeholder.com/600x400?text=UTC_Time_Visualization');
    }

    function handleVehicleGpsQuery(value) {
        if (value.trim() === '') {
            alert('请输入车辆ID或GPS信息！');
            return;
        }
        alert(`模拟查询车辆GPS: ${value}`);
        // 模拟显示一张图片
        displayVisualizationImage('https://via.placeholder.com/600x400?text=Vehicle_GPS_Visualization');
    }

    function handleVehicleTrajectoryQuery(value) {
        if (value.trim() === '') {
            alert('请输入车辆ID或时间范围！');
            return;
        }
        alert(`模拟查询车辆轨迹: ${value}`);
        // 模拟显示一张图片
        displayVisualizationImage('https://via.placeholder.com/600x400?text=Vehicle_Trajectory_Visualization');
    }

    // --- 图片输出区域相关方法 ---
    function displayVisualizationImage(imageUrl) {
        visualizationImage.src = imageUrl;
        visualizationImage.style.display = 'block';
        imagePlaceholder.style.display = 'none';
    }

    function clearImageOutput() {
        visualizationImage.src = '';
        visualizationImage.style.display = 'none';
        imagePlaceholder.style.display = 'block';
    }
});