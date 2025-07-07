// =================================================================
// 文件: /backend/api/route_controller.js
// 描述: 提供路径规划服务，目前支持驾车路线。
// 更新: 增加了对途经点(waypoints)的支持。
// =================================================================
const express = require('express');
const router = express.Router();
const axios = require('axios');

const AMAP_API_BASE_URL = 'https://restapi.amap.com/v3';

/**
 * @route   GET /api/route/driving
 * @desc    获取驾车路径规划
 * @access  Public
 * @query   origin - 起点坐标, 格式为 "lng,lat"
 * @query   destination - 终点坐标, 格式为 "lng,lat"
 * @query   waypoints - 途经点坐标, 格式为 "lng,lat;lng,lat;..." (可选)
 */
router.get('/driving', async (req, res) => {
    const { origin, destination, waypoints } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ msg: '缺少 origin 或 destination 查询参数' });
    }

    try {
        const amapResponse = await axios.get(`${AMAP_API_BASE_URL}/direction/driving`, {
            params: {
                key: process.env.AMAP_KEY,
                origin: origin,
                destination: destination,
                waypoints: waypoints || '', // 如果没有途经点，则传空字符串
                extensions: 'base',
                output: 'json'
            }
        });

        if (amapResponse.data.status === '1' && amapResponse.data.route.paths.length > 0) {
            const path = amapResponse.data.route.paths[0];
            
            const fullPolyline = path.steps.map(step => step.polyline).join(';');

            res.json({
                status: '1',
                distance: path.distance,
                duration: path.duration,
                polyline: fullPolyline
            });
        } else {
            res.status(404).json({ msg: '未找到可行的驾车路线', reason: amapResponse.data.info });
        }

    } catch (error) {
        console.error(`请求驾车路径规划时出错:`, error.message);
        res.status(500).send('获取路径规划数据失败');
    }
});

module.exports = router;
