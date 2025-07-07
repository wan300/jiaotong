// =================================================================
// 文件: /backend/core/models/road_traffic.js
// 描述: 定义道路交通态势数据模型
// 更新: 1. 允许 roads 字段为空。 2. 新增 description 字段。
// =================================================================
const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const RoadTraffic = db.define('RoadTraffic', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  description: { // 新增：存储交通态势的文字描述
    type: DataTypes.TEXT,
    allowNull: true,
  },
  evaluation: { // 区域整体路况评价，如：畅通、拥堵
    type: DataTypes.JSON,
    allowNull: true,
  },
  roads: { // 区域内各条道路的具体路况信息
    type: DataTypes.JSON,
    allowNull: true, // --- 已更新：允许为空 ---
  },
  capturedAt: { // 数据捕获时间
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  area: { // 记录查询的矩形区域
    type: DataTypes.GEOMETRY('POLYGON'),
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = RoadTraffic;
