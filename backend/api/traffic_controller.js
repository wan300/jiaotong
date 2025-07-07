// =================================================================
// 文件: /backend/api/traffic_controller.js
// 描述: 用于处理和代理高德地图交通数据请求的控制器。
// 更新: 现在会并发获取10页POI数据并合并返回。
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

/**
 * @route   GET /api/traffic/poi
 * @desc    获取指定城市和类型的POI(兴趣点)数据, 用于热力图
 * @access  Public
 */
router.get('/poi', async (req, res) => {
    const { city, keywords } = req.query;
    if (!city || !keywords) {
        return res.status(400).json({ msg: '缺少 city 或 keywords 查询参数' });
    }

    try {
        // --- 更新：并发请求10页数据 ---
        const pagePromises = [];
        for (let page = 1; page <= 10; page++) {
            const promise = axios.get(`${AMAP_API_BASE_URL}/place/text`, {
                params: {
                    key: process.env.AMAP_KEY,
                    keywords: keywords,
                    city: city,
                    output: 'json',
                    page_size: 25,
                    page_num: page
                }
            });
            pagePromises.push(promise);
        }

        // 等待所有请求完成
        const responses = await Promise.all(pagePromises);
        
        // 合并所有页的POI结果
        let allPois = [];
        for (const response of responses) {
            if (response.data.status === '1' && response.data.pois && response.data.pois.length > 0) {
                allPois = allPois.concat(response.data.pois);
            }
        }

        // 返回一个聚合后的、成功的响应
        res.json({
            status: '1',
            count: allPois.length.toString(),
            info: 'OK',
            infocode: '10000',
            pois: allPois
        });
        // --- 更新结束 ---

    } catch (error) {
        console.error('请求高德POI API失败:', error.response ? error.response.data : error.message);
        res.status(500).send('获取POI数据失败');
    }
});

module.exports = router;
