// =================================================================
// 文件: /backend/core/models/weather.js
// 描述: 定义天气数据模型
// =================================================================
const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const Weather = db.define('Weather', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adcode: { // 城市编码
    type: DataTypes.STRING,
    allowNull: false,
  },
  weather: { // 天气现象
    type: DataTypes.STRING,
  },
  temperature: {
    type: DataTypes.FLOAT,
  },
  windDirection: {
    type: DataTypes.STRING,
  },
  windPower: {
    type: DataTypes.STRING,
  },
  humidity: {
    type: DataTypes.FLOAT,
  },
  reportTime: { // 数据发布时间
    type: DataTypes.DATE,
  }
}, {
  timestamps: true,
});

module.exports = Weather;
