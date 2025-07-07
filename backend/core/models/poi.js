// =================================================================
// 文件: /backend/core/models/poi.js
// 描述: 定义POI(兴趣点)数据模型
// 更新: 将 address 字段的类型从 VARCHAR(255) 修改为 TEXT，以支持更长的地址。
// =================================================================
const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const POI = db.define('POI', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  poiId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
  },
  address: {
    // --- 已更新 ---
    // 将类型从 VARCHAR(255) 改为 TEXT，以存储可能非常长的地址信息
    type: DataTypes.TEXT,
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = POI;
