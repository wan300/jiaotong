// =================================================================
// 文件: /backend/api/traffic_controller.js
// 描述: 用于处理和代理高德地图交通数据请求的控制器。
// 更新: 移除了获取POI数据的 /api/traffic/poi 路由。
// =================================================================
const express = require('express');
const router = express.Router();
const axios = require('axios');

const AMAP_API_BASE_URL = 'https://restapi.amap.com/v3';

/**
 * @route   GET /api/traffic/road
 * @desc    获取指定矩形区域内的道路交通态势
 * @access  Public
 */
router.get('/road', async (req, res) => {
    const { rectangle, level } = req.query;
    if (!rectangle) {
        return res.status(400).json({ msg: '缺少 rectangle 查询参数' });
    }
    try {
        const amapResponse = await axios.get(`${AMAP_API_BASE_URL}/traffic/status/rectangle`, {
            params: {
                key: process.env.AMAP_KEY,
                rectangle: rectangle,
                level: level || 16,
                output: 'json'
            }
        });
        res.json(amapResponse.data);
    } catch (error) {
        console.error('请求高德交通态势API失败:', error.response ? error.response.data : error.message);
        res.status(500).send('获取交通数据失败');
    }
});

// 已移除 /api/traffic/poi 路由，因为它与兴趣点和热力图功能相关。

module.exports = router;
