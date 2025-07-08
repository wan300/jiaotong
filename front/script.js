document.addEventListener('DOMContentLoaded', () => {
    const passwordLoginBtn = document.getElementById('passwordLoginBtn');
    const faceLoginBtn = document.getElementById('faceLoginBtn');
    const passwordLoginForm = document.getElementById('passwordLoginForm');
    const faceRecognitionForm = document.getElementById('faceRecognitionForm');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const registerBtn = document.getElementById('registerBtn');
    const usernameEmailInput = document.getElementById('usernameEmail');
    const passwordInput = document.getElementById('password');
    const faceLoginSubmitBtn = document.getElementById('faceLoginSubmitBtn');
    const startFaceRecognitionBtn = document.getElementById('startFaceRecognition');
    const faceRecognitionStatus = document.getElementById('faceRecognitionStatus');

    // 默认显示密码/邮箱登录界面
    passwordLoginBtn.classList.add('active');
    passwordLoginForm.classList.add('active');

    // 切换到密码/邮箱登录
    passwordLoginBtn.addEventListener('click', () => {
        passwordLoginBtn.classList.add('active');
        faceLoginBtn.classList.remove('active');
        passwordLoginForm.classList.add('active');
        faceRecognitionForm.classList.remove('active');
    });

    // 切换到人脸识别登录
    faceLoginBtn.addEventListener('click', () => {
        faceLoginBtn.classList.add('active');
        passwordLoginBtn.classList.remove('active');
        faceRecognitionForm.classList.add('active');
        passwordLoginForm.classList.remove('active');
    });

    // 模拟密码/邮箱登录逻辑
    loginSubmitBtn.addEventListener('click', () => {
        const usernameEmail = usernameEmailInput.value;
        const password = passwordInput.value;

        // 简单的模拟验证：
        // 假设数据库中有一条记录：用户名为 "testuser"，密码为 "password123"
        // 或者邮箱为 "test@example.com"，密码为 "password123"
        const validUser = "testuser";
        const validEmail = "test@example.com";
        const validPassword = "password123";

        if ((usernameEmail === validUser || usernameEmail === validEmail) && password === validPassword) {
            alert('登录成功！即将跳转...');
            // **新增：保存用户名到 localStorage**
            localStorage.setItem('loggedInUser', usernameEmail); 
            // 模拟跳转到空白的主页
            window.location.href = 'dashboard.html'; // 确保跳转到 dashboard.html
        } else {
            alert('登录失败：用户名/邮箱或密码错误。');
        }
    });

    // 模拟注册跳转
    registerBtn.addEventListener('click', () => {
        alert('即将跳转到注册页面...');
        window.location.href = 'register.html'; // 假设注册页是 register.html
    });

    // 模拟人脸识别登录流程 (前端模拟，无实际识别功能)
    startFaceRecognitionBtn.addEventListener('click', () => {
        faceRecognitionStatus.textContent = '摄像头已启动，正在进行人脸检测...';
        startFaceRecognitionBtn.disabled = true; // 禁用按钮防止重复点击

        // 模拟人脸识别过程
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% 成功率
            if (success) {
                faceRecognitionStatus.textContent = '人脸识别成功！请点击人脸登录按钮。';
                faceLoginSubmitBtn.disabled = false; // 识别成功后启用登录按钮
            } else {
                faceRecognitionStatus.textContent = '人脸识别失败，请重试。';
                startFaceRecognitionBtn.disabled = false; // 失败后重新启用启动按钮
            }
        }, 3000); // 模拟3秒识别时间
    });

    // 模拟人脸登录按钮点击 (需先模拟识别成功)
    faceLoginSubmitBtn.addEventListener('click', () => {
        if (faceRecognitionStatus.textContent === '人脸识别成功！请点击人脸登录按钮。') {
            alert('人脸登录成功！即将跳转...');
            // **新增：保存用户名到 localStorage (模拟人脸登录后的用户名)**
            localStorage.setItem('loggedInUser', '人脸识别用户'); // 或者可以模拟从后端获取实际用户名
            window.location.href = 'dashboard.html'; // 确保跳转到 dashboard.html
        } else {
            alert('请先成功完成人脸识别！');
        }
    });
});