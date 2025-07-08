// =================================================================
// 文件: /backend/app.js
// 描述: 应用主入口文件，调整为与 Sequelize 配合。
// 更新: 1. 修改静态文件路径，以指向Vue项目构建后生成的 `dist` 目录。
//       2. 更新主页路由，以发送 `dist` 目录中的 `index.html`。
// =================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- 确保 path 模块已导入
const db = require('./config/database');

// 导入路由
const authRoutes = require('./api/auth_controller');
const trafficRoutes = require('./api/traffic_controller');
const districtRoutes = require('./api/district_controller');
const configRoutes = require('./api/config_controller');
const routeRoutes = require('./api/route_controller');

// 测试数据库连接
db.authenticate()
  .then(() => console.log('MySQL 数据库已成功连接'))
  .catch(err => console.error('数据库连接失败:', err));

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// --- 更新：计算并打印Vue前端构建产物的绝对路径 ---
const frontendDistPath = path.join(__dirname, '../frontend/dist');
console.log(`[信息] 服务器将从以下路径提供前端应用: ${frontendDistPath}`);

// --- 更新：托管Vue构建后的静态文件 ---
app.use(express.static(frontendDistPath));

// --- API 路由 ---
// 所有 /api/* 的请求会在这里被处理
app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/district', districtRoutes);
app.use('/api/config', configRoutes);
app.use('/api/route', routeRoutes);

// --- 主页面路由 ---
// 所有非API请求都将返回Vue应用的index.html，由Vue Router接管后续路由
app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  } else {
    res.status(404).send('API endpoint not found.');
  }
});


// 同步数据库模型
db.sync()
  .then(() => {
    console.log('数据库模型已同步');
    const PORT = 3000;
    app.listen(PORT, () => console.log(`服务器已在端口 ${PORT} 上启动, 请访问 http://localhost:${PORT}`));
  })
  .catch(err => console.error('模型同步失败:', err));
