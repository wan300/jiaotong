// =================================================================
// 文件: /backend/api/district_controller.js
// 描述: 提供行政区划查询功能，主要用于获取区域边界。
// 更新: 优化了错误处理。现在即使高德API未找到数据，后端也返回200状态码，
//       但在JSON体中明确指出失败状态，并增加了详细日志。
// =================================================================
const express = require('express');
const router = express.Router();
const axios = require('axios');

const AMAP_API_BASE_URL = 'https://restapi.amap.com/v3';

/**
 * @route   GET /api/district/bounds
 * @desc    获取指定行政区的边界坐标
 * @access  Public
 * @query   district - 查询的区名, 如 "海淀区"
 */
router.get('/bounds', async (req, res) => {
    const { district } = req.query;

    if (!district) {
        return res.status(400).json({ msg: '缺少 district 查询参数' });
    }

    try {
        const amapResponse = await axios.get(`${AMAP_API_BASE_URL}/config/district`, {
            params: {
                key: process.env.AMAP_KEY,
                keywords: district,
                subdistrict: 0, // 不返回下级行政区
                extensions: 'all', // 返回完整的边界坐标
                output: 'json'
            }
        });
        
        // 增加日志，方便调试
        console.log(`高德API返回 [${district}] 的数据:`, JSON.stringify(amapResponse.data));

        // 检查并返回边界数据
        if (amapResponse.data.status === '1' && amapResponse.data.districts.length > 0 && amapResponse.data.districts[0].polyline) {
            // 成功找到数据，返回status '1'
            res.json({
                status: '1',
                polyline: amapResponse.data.districts[0].polyline
            });
        } else {
            // 未找到数据，同样返回200 OK，但在body中指明status '0'
            res.json({ 
                status: '0', 
                msg: `高德API未返回 [${district}] 的有效边界数据`,
                reason: amapResponse.data.info 
            });
        }

    } catch (error) {
        console.error(`请求 [${district}] 边界数据时发生严重错误:`, error.message);
        // 服务器内部错误，返回500
        res.status(500).json({ status: '0', msg: '获取行政区划数据时服务器出错' });
    }
});

module.exports = router;
