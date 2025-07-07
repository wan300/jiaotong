// =================================================================
// 文件: /backend/api/config_controller.js
// 描述: 提供前端所需的配置信息，例如API密钥。
// =================================================================
const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/config/amap-js-key
 * @desc    提供前端使用的高德地图JS API Key
 * @access  Public
 */
router.get('/amap-js-key', (req, res) => {
  // 从环境变量中读取前端专用的JS API Key
  if (process.env.AMAP_JS_KEY) {
    res.json({ key: process.env.AMAP_JS_KEY });
  } else {
    // 如果服务器没有配置这个Key，返回错误
    console.error('错误: 环境变量 AMAP_JS_KEY 未设置。');
    res.status(500).json({ msg: '服务器未配置高德地图JS API Key' });
  }
});

module.exports = router;
