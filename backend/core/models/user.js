// =================================================================
// 文件: /backend/core/models/user.js
// 描述: 使用 Sequelize 定义的用户模型 (文件名已更新为小写)。
// =================================================================
const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const User = db.define('User', {
  // 模型属性会自动映射到数据库的列
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  faceData: {
    type: DataTypes.TEXT, // 使用 TEXT 类型存储更长的字符串，如加密后的数据
    allowNull: true,
  },
});

module.exports = User;

