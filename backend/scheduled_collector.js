// =================================================================
// 文件: /backend/scheduled_collector.js
// 描述: 一个带定时任务的数据采集脚本，用于按不同频率采集数据。
// 更新: 优化了 collectRoadTraffic 函数，以正确处理不包含 roads 字段的API响应。
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

// --- 已更新：定义七个区的代表性矩形区域 ---
const TARGET_AREAS = [
    { district: '东城区', rectangle: '116.39,39.92;116.42,39.90' }, // 王府井/天安门区域
    { district: '西城区', rectangle: '116.35,39.92;116.38,39.90' }, // 西单/金融街区域
    { district: '朝阳区', rectangle: '116.45,39.92;116.48,39.90' }, // CBD/国贸区域
    { district: '海淀区', rectangle: '116.30,39.99;116.33,39.97' }, // 中关村/北大区域
    { district: '丰台区', rectangle: '116.36,39.87;116.39,39.85' }, // 北京南站区域
    { district: '通州区', rectangle: '116.65,39.91;116.68,39.89' }, // 行政副中心区域
    { district: '顺义区', rectangle: '116.58,40.08;116.61,40.06' }  // 首都机场区域
];

const POI_CATEGORIES = [
    { name: '购物', keyword: '商场|购物中心|超市' },
    { name: '教育', keyword: '大学|中学|小学' },
    { name: '医疗', keyword: '医院|诊所' },
    { name: '交通', keyword: '地铁站|公交站' },
    { name: '餐饮', keyword: '餐厅|饭店|美食' },
    { name: '公司', keyword: '公司|企业|科技园' }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// --- 各类数据的采集函数 ---

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
                                address: poi.address || '',
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
            if (error.name === 'SequelizeDatabaseError') {
                 console.error(`  - 采集 [${category.name}] 分类时发生数据库错误:`, error.message);
            } else {
                 console.error(`  - 采集 [${category.name}] 分类时出错:`, error.message);
            }
        }
    }
}

async function collectRoadTraffic() {
    console.log(`[${new Date().toLocaleString()}] --- 开始采集实时交通态势 ---`);
    // --- 已更新：循环采集每个预设区域 ---
    for (const area of TARGET_AREAS) {
        try {
            console.log(`  - 正在采集 [${area.district}] 的交通态势...`);
            const response = await axios.get(`${AMAP_API_BASE_URL}/traffic/status/rectangle`, {
                params: { key: AMAP_KEY, rectangle: area.rectangle, output: 'json' }
            });

            if (response.data.status === '1' && response.data.trafficinfo) {
                const { description, evaluation } = response.data.trafficinfo;
                const roads = response.data.trafficinfo.roads || []; 

                const [p1, p2] = area.rectangle.split(';');
                const [lng1, lat1] = p1.split(',');
                const [lng2, lat2] = p2.split(',');

                await RoadTraffic.create({
                    description: description,
                    evaluation: evaluation, 
                    roads: roads,
                    // 在description字段中加入区名，方便后续查询
                    description: `[${area.district}] ${description}`,
                    area: {
                        type: 'Polygon',
                        coordinates: [[
                            [parseFloat(lng1), parseFloat(lat1)], [parseFloat(lng2), parseFloat(lat1)],
                            [parseFloat(lng2), parseFloat(lat2)], [parseFloat(lng1), parseFloat(lat2)],
                            [parseFloat(lng1), parseFloat(lat1)]
                        ]]
                    }
                });
                console.log(`    - [${area.district}] 数据采集成功。`);
            } else {
                console.log(`    - [${area.district}] 无任何交通信息，跳过。`);
            }
            // 在每次区域请求后增加延迟
            await delay(500); 
        } catch (error) {
            console.error(`  - 采集 [${area.district}] 时出错:`, error.message);
        }
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
    
    try {
        await db.authenticate();
        console.log('数据库连接成功。');
        await db.sync({ alter: true }); // 使用 alter: true 尝试安全地更新表结构
        console.log('数据库模型同步完成。');
    } catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1);
    }

    cron.schedule('*/10 * * * *', async () => {
        console.log('\n===== 执行10分钟任务 =====');
        await collectPois();
        await collectRoadTraffic();
        console.log('===== 10分钟任务执行完毕 =====');
    });
    console.log('已设定任务：每10分钟采集一次POI和交通态势。');

    cron.schedule('*/30 * * * *', async () => {
        console.log('\n===== 执行30分钟任务 =====');
        await collectWeather();
        console.log('===== 30分钟任务执行完毕 =====');
    });
    console.log('已设定任务：每30分钟采集一次天气数据。');
    
    console.log('服务启动，立即执行一次所有采集任务...');
    await collectPois();
    await collectRoadTraffic();
    await collectWeather();
}

main();
