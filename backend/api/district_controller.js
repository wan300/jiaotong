// =================================================================
// 文件: /backend/api/district_controller.js
// 描述: 提供行政区划查询功能，主要用于获取区域边界。
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

        // 检查并返回边界数据
        if (amapResponse.data.status === '1' && amapResponse.data.districts.length > 0) {
            // 返回第一个匹配区域的边界线坐标串
            res.json({
                status: '1',
                polyline: amapResponse.data.districts[0].polyline
            });
        } else {
            res.status(404).json({ msg: `未找到 [${district}] 的边界数据` });
        }

    } catch (error) {
        console.error(`请求 [${district}] 边界数据时出错:`, error.message);
        res.status(500).send('获取行政区划数据失败');
    }
});

module.exports = router;
