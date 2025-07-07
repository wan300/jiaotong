// =================================================================
// 文件: /backend/scheduled_collector.js
// 描述: 一个带定时任务的数据采集脚本，用于按不同频率采集数据。
// 使用方法: 在 backend 目录下运行 `node scheduled_collector.js`，此脚本会持续运行。
// =================================================================
require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');
const db = require('./config/database');

// 导入所有模型
const POI = require('./core/models/poi');
const RoadTraffic = require('./core/models/road_traffic');
const Weather = require('./core/models/weather');

// 高德Web服务API的Key
const AMAP_KEY = process.env.AMAP_KEY;
const AMAP_API_BASE_URL = 'https://restapi.amap.com/v3';

// --- 配置采集参数 ---
const TARGET_CITY = '北京';
const TARGET_ADCODE = '110000'; // 北京的adcode
const TARGET_RECTANGLE = '116.354,39.923;116.384,39.893'; 

const POI_CATEGORIES = [
    { name: '购物', keyword: '商场|购物中心|超市' },
    { name: '教育', keyword: '大学|中学|小学' },
    { name: '医疗', keyword: '医院|诊所' },
    { name: '交通', keyword: '地铁站|公交站' },
    { name: '餐饮', keyword: '餐厅|饭店|美食' },
    { name: '公司', keyword: '公司|企业|科技园' }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// --- 各类数据的采集函数 (与之前类似，但不再处理数据库连接) ---

async function collectPois() {
    console.log(`[${new Date().toLocaleString()}] --- 开始采集POI数据 ---`);
    for (const category of POI_CATEGORIES) {
        try {
            let totalCollected = 0;
            for (let page = 1; page <= 10; page++) {
                const response = await axios.get(`${AMAP_API_BASE_URL}/place/text`, {
                    params: {
                        key: AMAP_KEY, keywords: category.keyword, city: TARGET_CITY,
                        output: 'json', page_size: 25, page_num: page
                    }
                });
                if (response.data.status === '1' && response.data.pois.length > 0) {
                    for (const poi of response.data.pois) {
                        if (!poi.location || typeof poi.location !== 'string' || !poi.location.includes(',')) continue;
                        const [lng, lat] = poi.location.split(',');
                        await POI.findOrCreate({
                            where: { poiId: poi.id },
                            defaults: {
                                poiId: poi.id, name: poi.name, category: category.name, type: poi.type,
                                address: poi.address,
                                location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                                city: TARGET_CITY,
                            }
                        });
                    }
                    totalCollected += response.data.pois.length;
                } else {
                    break;
                }
                await delay(500);
            }
            console.log(`  - [${category.name}] 分类采集完成，共处理 ${totalCollected} 条。`);
        } catch (error) {
            console.error(`  - 采集 [${category.name}] 分类时出错:`, error.message);
        }
    }
}

async function collectRoadTraffic() {
    console.log(`[${new Date().toLocaleString()}] --- 开始采集实时交通态势 ---`);
    try {
        const response = await axios.get(`${AMAP_API_BASE_URL}/traffic/status/rectangle`, {
            params: { key: AMAP_KEY, rectangle: TARGET_RECTANGLE, output: 'json' }
        });
        // --- 已更新：增加更严格的判断 ---
        // 确保 trafficinfo 对象和它内部的 roads 属性都存在
        if (response.data.status === '1' && response.data.trafficinfo && response.data.trafficinfo.roads) {
            const { evaluation, roads } = response.data.trafficinfo;
            const [p1, p2] = TARGET_RECTANGLE.split(';');
            const [lng1, lat1] = p1.split(',');
            const [lng2, lat2] = p2.split(',');
            await RoadTraffic.create({
                evaluation: evaluation, roads: roads,
                area: {
                    type: 'Polygon',
                    coordinates: [[
                        [parseFloat(lng1), parseFloat(lat1)], [parseFloat(lng2), parseFloat(lat1)],
                        [parseFloat(lng2), parseFloat(lat2)], [parseFloat(lng1), parseFloat(lat2)],
                        [parseFloat(lng1), parseFloat(lat1)]
                    ]]
                }
            });
            console.log('  - 实时交通态势数据采集成功。');
        } else {
            // 如果 trafficinfo 为空或不包含 roads，则记录日志，不执行数据库操作
            console.log('  - 当前区域无实时交通态势数据，跳过本次采集。');
        }
    } catch (error) {
        console.error('  - 采集实时交通态势时出错:', error.message);
    }
}

async function collectWeather() {
    console.log(`[${new Date().toLocaleString()}] --- 开始采集天气数据 ---`);
    try {
        const response = await axios.get(`${AMAP_API_BASE_URL}/weather/weatherInfo`, {
            params: { key: AMAP_KEY, city: TARGET_ADCODE, output: 'json' }
        });
        if (response.data.status === '1' && response.data.lives.length > 0) {
            const liveWeather = response.data.lives[0];
            await Weather.create({
                city: liveWeather.city, adcode: liveWeather.adcode, weather: liveWeather.weather,
                temperature: parseFloat(liveWeather.temperature),
                windDirection: liveWeather.winddirection, windPower: liveWeather.windpower,
                humidity: parseFloat(liveWeather.humidity), reportTime: liveWeather.reporttime,
            });
            console.log('  - 天气数据采集成功。');
        }
    } catch (error) {
        console.error('  - 采集天气数据时出错:', error.message);
    }
}

/**
 * 主执行函数
 */
async function main() {
    console.log('定时采集服务启动...');
    
    // 1. 初始化数据库连接
    try {
        await db.authenticate();
        console.log('数据库连接成功。');
        await db.sync();
        console.log('数据库模型同步完成。');
    } catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1); // 初始化失败，直接退出进程
    }

    // 2. 设置定时任务
    // 任务1: 每10分钟执行一次POI和交通态势的采集
    // Cron 语法: '*/10 * * * *' 表示 "每10分钟"
    cron.schedule('*/10 * * * *', async () => {
        console.log('\n===== 执行10分钟任务 =====');
        await collectPois();
        await collectRoadTraffic();
        console.log('===== 10分钟任务执行完毕 =====');
    });
    console.log('已设定任务：每10分钟采集一次POI和交通态势。');

    // 任务2: 每30分钟执行一次天气采集
    // Cron 语法: '*/30 * * * *' 表示 "每30分钟"
    cron.schedule('*/30 * * * *', async () => {
        console.log('\n===== 执行30分钟任务 =====');
        await collectWeather();
        console.log('===== 30分钟任务执行完毕 =====');
    });
    console.log('已设定任务：每30分钟采集一次天气数据。');
    
    // 服务启动后，立即执行一次所有采集任务
    console.log('服务启动，立即执行一次所有采集任务...');
 
    await collectRoadTraffic();
  
}

// 执行主函数
main();
