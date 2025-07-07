// =================================================================
// 文件: /backend/app.js
// 描述: 应用主入口文件，调整为与 Sequelize 配合。
// 更新: 新增了路径规划服务(route_controller)的路由。
// =================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// 导入路由
const authRoutes = require('./api/auth_controller');
const trafficRoutes = require('./api/traffic_controller'); // 确保交通态势路由存在
const districtRoutes = require('./api/district_controller');
const configRoutes = require('./api/config_controller');
const routeRoutes = require('./api/route_controller'); // <-- 新增：导入路径规划路由

// 测试数据库连接
db.authenticate()
  .then(() => console.log('MySQL 数据库已成功连接'))
  .catch(err => console.error('数据库连接失败:', err));

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 定义API路由
app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes); // 确保交通态势路由存在
app.use('/api/district', districtRoutes);
app.use('/api/config', configRoutes);
app.use('/api/route', routeRoutes); // <-- 新增：使用路径规划路由

// 根路由
app.get('/', (req, res) => {
  res.send('后端服务正在运行 (MySQL版)...');
});

// 同步数据库模型 (在开发阶段，可以设置为 force: true 来重建表)
db.sync()
  .then(() => {
    console.log('数据库模型已同步');
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`服务器已在端口 ${PORT} 上启动`));
  })
  .catch(err => console.error('模型同步失败:', err));
