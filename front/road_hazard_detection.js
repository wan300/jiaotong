document.addEventListener('DOMContentLoaded', () => {
    // --- 头部用户和退出登录功能 ---
    const usernameDisplay = document.getElementById('loggedInUsername');
    const userInfoContainer = document.querySelector('.user-info-container');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const backToDashboardBtn = document.querySelector('.back-to-dashboard'); // 获取返回主页按钮

    // 假设用户名在登录成功后保存在 localStorage 或 sessionStorage 中
    const loggedInUser = localStorage.getItem('loggedInUser') || '访客';
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
        window.location.href = 'index.html'; // 跳转回登录页面
    });

    // 点击返回主页按钮
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止默认的链接跳转行为
            window.location.href = 'dashboard.html'; // 跳转回主页
        });
    }


    // --- 路面危害检测页面特定功能 ---
    const videoUploadInput = document.getElementById('videoUploadInput');
    const uploadButton = document.getElementById('uploadButton');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const uploadedVideoPlayer = document.getElementById('uploadedVideoPlayer');
    const videoPlaceholderText = document.getElementById('videoPlaceholderText');
    const detectionStatus = document.getElementById('detectionStatus');

    // 损害计数显示元素
    const longitudinalCrackCount = document.getElementById('longitudinalCrackCount');
    const transverseCrackCount = document.getElementById('transverseCrackCount');
    const alligatorCrackCount = document.getElementById('alligatorCrackCount');
    const potholeCount = document.getElementById('potholeCount');


    // 点击“选择视频附件”按钮触发文件选择
    uploadButton.addEventListener('click', () => {
        videoUploadInput.click();
    });

    // 文件选择后处理
    videoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // 显示文件名称
            fileNameDisplay.textContent = `已选择文件: ${file.name}`;

            // 检查文件类型是否为视频
            if (file.type.startsWith('video/')) {
                const fileURL = URL.createObjectURL(file);
                uploadedVideoPlayer.src = fileURL;
                uploadedVideoPlayer.style.display = 'block'; // 显示视频播放器
                videoPlaceholderText.style.display = 'none'; // 隐藏占位符

                detectionStatus.textContent = '视频已上传，等待后端检测...';

                // 模拟后端检测过程和结果更新
                simulateDetection(file.name);

            } else {
                alert('请选择一个视频文件！');
                fileNameDisplay.textContent = '未选择文件';
                uploadedVideoPlayer.style.display = 'none';
                videoPlaceholderText.style.display = 'block';
                uploadedVideoPlayer.src = '';
                resetDamageCounts();
                detectionStatus.textContent = '请上传视频进行检测...';
            }
        } else {
            fileNameDisplay.textContent = '未选择文件';
            uploadedVideoPlayer.style.display = 'none';
            videoPlaceholderText.style.display = 'block';
            uploadedVideoPlayer.src = '';
            resetDamageCounts();
            detectionStatus.textContent = '请上传视频进行检测...';
        }
    });

    // 重置损伤计数显示
    function resetDamageCounts() {
        longitudinalCrackCount.textContent = '0';
        transverseCrackCount.textContent = '0';
        alligatorCrackCount.textContent = '0';
        potholeCount.textContent = '0';
    }

    // 模拟后端检测函数
    function simulateDetection(fileName) {
        // 模拟检测耗时
        detectionStatus.textContent = '正在分析视频，请稍候...';
        resetDamageCounts(); // 重置计数

        setTimeout(() => {
            // 根据文件名模拟不同的检测结果
            let longCracks = 0;
            let transCracks = 0;
            let alligatorCracks = 0;
            let potholes = 0;

            if (fileName.includes('裂缝')) { // 简单的关键字匹配模拟
                longCracks = Math.floor(Math.random() * 5) + 1; // 1-5处
                transCracks = Math.floor(Math.random() * 3) + 1; // 1-3处
            }
            if (fileName.includes('龟裂')) {
                alligatorCracks = Math.floor(Math.random() * 2) + 1; // 1-2处
            }
            if (fileName.includes('坑洼')) {
                potholes = Math.floor(Math.random() * 4) + 1; // 1-4处
            }
            // 如果文件名不包含特定关键字，随机生成一些结果
            if (!fileName.includes('裂缝') && !fileName.includes('龟裂') && !fileName.includes('坑洼')) {
                 longCracks = Math.floor(Math.random() * 3);
                 transCracks = Math.floor(Math.random() * 2);
                 alligatorCracks = Math.floor(Math.random() * 2);
                 potholes = Math.floor(Math.random() * 3);
            }


            // 更新显示
            longitudinalCrackCount.textContent = longCracks;
            transverseCrackCount.textContent = transCracks;
            alligatorCrackCount.textContent = alligatorCracks;
            potholeCount.textContent = potholes;

            detectionStatus.textContent = '视频检测完成！';

            // 可以在这里模拟告警逻辑，但目前需求未提及
            // if (potholes > 0 || longCracks > 0) {
            //     alert('检测到严重病害，已触发告警！');
            // }

        }, 3000); // 模拟3秒的检测时间
    }
});