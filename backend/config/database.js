// =================================================================
// 文件: /backend/config/database.js
// 描述: 使用 Sequelize 进行 MySQL 数据库连接配置。
// =================================================================
const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // 在生产环境中可以关闭日志
  }
);